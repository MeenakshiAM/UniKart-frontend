const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateUser } = require('../middlewares/auth');
const { 
  validateCreateOrder, 
  validatePaymentConfirmation 
} = require('../middlewares/validation');

// Create payment order
router.post('/create-order', 
  // authenticateUser,  // ← Commented out for testing
  // validateCreateOrder,  // ← TEMPORARILY DISABLED
  paymentController.createOrder
);

// Confirm payment
router.post('/confirm', 
  // authenticateUser,  // ← Commented out for testing
  // validatePaymentConfirmation,  // ← TEMPORARILY DISABLED
  paymentController.confirmPayment
);

// Webhook endpoint (no auth required)
router.post('/webhook', paymentController.handleWebhook);

// Get payment details
router.get('/:paymentId', 
  // authenticateUser, 
  paymentController.getPaymentDetails
);

// Get user payments
router.get('/', 
  // authenticateUser, 
  paymentController.getUserPayments
);

// Initiate refund
router.post('/:paymentId/refund', 
  authenticateUser, 
  paymentController.initiateRefund
);

module.exports = router;