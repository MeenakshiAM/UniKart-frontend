const cartService = require("../services/cart.service");

// ================= ADD TO CART =================
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { productId, quantity, priceAtTime } = req.body;

    // 🔍 Validation
    if (!productId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Product ID and quantity are required"
      });
    }

    const cart = await cartService.addToCart(
      userId,
      productId,
      quantity,
      priceAtTime
    );

    return res.status(200).json({
      success: true,
      message: "Item added to cart",
      data: cart
    });

  } catch (error) {
    console.error("❌ addToCart error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ================= GET CART =================
exports.getCart = async (req, res) => {
  try {
    const userId = req.user?.userId;

    const cart = await cartService.getCart(userId);

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: cart
    });

  } catch (error) {
    console.error("❌ getCart error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ================= REMOVE FROM CART =================
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required"
      });
    }

    const cart = await cartService.removeFromCart(userId, productId);

    return res.status(200).json({
      success: true,
      message: "Item removed from cart",
      data: cart
    });

  } catch (error) {
    console.error("❌ removeFromCart error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ================= CLEAR CART =================
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user?.userId;

    const cart = await cartService.clearCart(userId);

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: cart
    });

  } catch (error) {
    console.error("❌ clearCart error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
