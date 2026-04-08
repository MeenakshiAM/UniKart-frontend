const paymentService = require('../services/paymentServices');
const Payment = require('../models/payment');

class PaymentController {
  // Create payment order
  // Create payment order
  async createOrder(req, res) {
    try {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📥 CREATE ORDER REQUEST');
      console.log('Body:', JSON.stringify(req.body, null, 2));
      
      const { orderId, amount, currency, userId, type = 'order' } = req.body;
      
      const userIdToUse = userId || req.user?.id || 'test-user-123';
      
      console.log('Calling paymentService...');

      const orderData = await paymentService.createOrder({
        orderId,
        userId: userIdToUse,
        amount,
        currency,
        type
      });

      console.log('✅ Success:', orderData);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      res.status(201).json({
        success: true,
        message: 'Payment order created successfully',
        data: {
          ...orderData,
          key: process.env.RAZORPAY_KEY_ID
        }
      });
    } catch (error) {
      console.error('❌ ERROR:', error.message);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
  // Confirm payment
  async confirmPayment(req, res) {
    try {
      const paymentData = req.body;
      const confirmedPayment = await paymentService.confirmPayment(paymentData);

      res.json({
        success: true,
        message: 'Payment confirmed successfully',
        data: {
          paymentId: confirmedPayment._id,
          status: confirmedPayment.status,
          orderId: confirmedPayment.orderId
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Handle webhook
  async handleWebhook(req, res) {
    try {
      const signature = req.get('X-Razorpay-Signature');
      const payload = req.body;

      await paymentService.handleWebhook(payload, signature);

      res.status(200).json({ 
        success: true,
        message: 'Webhook processed successfully'
      });
    } catch (error) {
      console.error('Webhook error:', error.message);
      res.status(400).json({
        success: false,
        message: 'Webhook processing failed'
      });
    }
  }

  // Get payment details
  async getPaymentDetails(req, res) {
    try {
      const { paymentId } = req.params;
      const userId = req.user.id;

      const payment = await Payment.findOne({ 
        _id: paymentId, 
        userId 
      }).populate('orderId');

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      res.json({
        success: true,
        data: payment
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get user payments
  async getUserPayments(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10, status } = req.query;

      const query = { userId };
      if (status) query.status = status;

      const payments = await Payment.find(query)
        .populate('orderId')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Payment.countDocuments(query);

      res.json({
        success: true,
        data: {
          payments,
          pagination: {
            current: page,
            pages: Math.ceil(total / limit),
            total
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Initiate refund
  async initiateRefund(req, res) {
    try {
      const { paymentId } = req.params;
      const { amount } = req.body;

      const refund = await paymentService.initiateRefund(paymentId, amount);

      res.json({
        success: true,
        message: 'Refund initiated successfully',
        data: refund
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new PaymentController();
