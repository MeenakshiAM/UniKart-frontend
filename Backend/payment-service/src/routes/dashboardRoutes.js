const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboardController');
const { authenticateUser } = require('../middlewares/auth');

// ================= BUYER =================
router.get(
  '/orders/my',
  authenticateUser,
  dashboardController.getMyOrders
);

// ================= SELLER =================
router.get(
  '/seller/dashboard',
  authenticateUser,
  dashboardController.getSellerDashboard
);

module.exports = router;