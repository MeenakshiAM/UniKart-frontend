const razorpay = require('../config/razorpay');
const Payment = require('../models/payment');
const Order = require('../models/order');
const crypto = require('crypto');
const { RAZORPAY } = require('../config/environment');

class PaymentService {
  
  // Create Razorpay order
  async createOrder(orderData) {
    try {
      const { orderId, userId, amount, currency = 'INR', type = 'order' } = orderData;

      console.log('PaymentService.createOrder called with:', { orderId, userId, amount, currency, type });

      // Skip order validation for test orders
      if (orderId && !orderId.startsWith('order_')) {
        const order = await Order.findById(orderId);
        if (!order) {
          throw new Error('Order not found');
        }
      }

      const finalUserId = userId || 'test-user-123';

      const options = {
        amount: amount * 100,
        currency,
        receipt: orderId || `receipt_${Date.now()}`,
        payment_capture: 1,
        notes: {
          orderId: orderId || 'temp',
          userId: finalUserId,
          type: type
        }
      };

      console.log('Creating Razorpay order with options:', options);
      const razorpayOrder = await razorpay.orders.create(options);
      console.log('Razorpay order created:', razorpayOrder.id);

      // Save payment record
      const payment = new Payment({
        orderId: orderId && !orderId.startsWith('order_') ? orderId : null,
        userId: finalUserId,
        razorpayOrderId: razorpayOrder.id,
        amount,
        currency,
        status: 'created'
      });

      console.log('Saving payment to database...');
      await payment.save();
      console.log('Payment saved with ID:', payment._id);

      return {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        paymentId: payment._id
      };
    } catch (error) {
      console.error('PaymentService error:', error);
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }

  // Verify payment signature
  verifyPaymentSignature(paymentData) {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = paymentData;
    
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY.KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    return expectedSignature === razorpaySignature;
  }

  // Confirm payment
  async confirmPayment(paymentData) {
    try {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = paymentData;

      // Find payment record
      const payment = await Payment.findOne({ razorpayOrderId });
      if (!payment) {
        throw new Error('Payment record not found');
      }

      // Verify signature
      const isValid = this.verifyPaymentSignature(paymentData);
      if (!isValid) {
        payment.status = 'failed';
        payment.failureReason = 'Invalid signature';
        await payment.save();
        throw new Error('Payment verification failed');
      }

      // Update payment record
      payment.razorpayPaymentId = razorpayPaymentId;
      payment.razorpaySignature = razorpaySignature;
      payment.status = 'paid';
      await payment.save();

      // Update order status
      await Order.findByIdAndUpdate(payment.orderId, {
        paymentStatus: 'paid',
        status: 'confirmed'
      });

      return payment;
    } catch (error) {
      throw new Error(`Failed to confirm payment: ${error.message}`);
    }
  }

  // Handle webhook
  async handleWebhook(payload, signature) {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY.WEBHOOK_SECRET)
        .update(JSON.stringify(payload))
        .digest('hex');

      if (expectedSignature !== signature) {
        throw new Error('Invalid webhook signature');
      }

      const event = payload.event;
      const paymentEntity = payload.payload.payment.entity;

      switch (event) {
        case 'payment.captured':
          await this.handlePaymentCaptured(paymentEntity);
          break;
        case 'payment.failed':
          await this.handlePaymentFailed(paymentEntity);
          break;
        default:
          console.log(`Unhandled webhook event: ${event}`);
      }

      return true;
    } catch (error) {
      throw new Error(`Webhook handling failed: ${error.message}`);
    }
  }

  // Handle payment captured event
  async handlePaymentCaptured(paymentEntity) {
    const payment = await Payment.findOne({ 
      razorpayOrderId: paymentEntity.order_id 
    });
    
    if (payment) {
      payment.status = 'paid';
      payment.razorpayPaymentId = paymentEntity.id;
      payment.paymentMethod = paymentEntity.method;
      await payment.save();

      await Order.findByIdAndUpdate(payment.orderId, {
        paymentStatus: 'paid',
        status: 'confirmed'
      });
    }
  }

  // Handle payment failed event
  async handlePaymentFailed(paymentEntity) {
    const payment = await Payment.findOne({ 
      razorpayOrderId: paymentEntity.order_id 
    });
    
    if (payment) {
      payment.status = 'failed';
      payment.failureReason = paymentEntity.error_description;
      await payment.save();
    }
  }

  // Initiate refund
  async initiateRefund(paymentId, amount = null) {
    try {
      const payment = await Payment.findById(paymentId);
      if (!payment || payment.status !== 'paid') {
        throw new Error('Payment not found or not eligible for refund');
      }

      const refundAmount = amount ? amount * 100 : payment.amount * 100;
      
      const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
        amount: refundAmount
      });

      payment.status = 'refunded';
      payment.refundId = refund.id;
      await payment.save();

      return refund;
    } catch (error) {
      throw new Error(`Refund failed: ${error.message}`);
    }
  }
}

module.exports = new PaymentService();
