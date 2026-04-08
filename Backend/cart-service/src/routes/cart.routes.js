const express = require("express");
const router = express.Router();

const {
  addToCart,
  getCart,
  removeFromCart,
  clearCart,
} = require("../controllers/cart.controller");

const authMiddleware = require("../middlewares/auth.middleware");

// Add item to cart
router.post("/add",authMiddleware, addToCart);

// Get user cart
router.get("/", authMiddleware, getCart);

// Remove item from cart
router.delete("/remove", authMiddleware, removeFromCart);

// Clear entire cart
router.delete("/clear", authMiddleware, clearCart);

module.exports = router;