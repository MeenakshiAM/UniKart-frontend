const Order = require('../models/order');
const Product = require('../models/product'); // adjust path if needed

class DashboardController {

  // ================= BUYER ORDERS =================
  async getMyOrders(req, res) {
    try {
      const userId = req.user.id;

      const orders = await Order.find({ userId })
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: orders
      });
    } catch (error) {
      console.error("getMyOrders error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch orders"
      });
    }
  }

  // ================= SELLER DASHBOARD =================
  async getSellerDashboard(req, res) {
    try {
      const sellerId = req.user.id;

      // Get seller products
      const products = await Product.find({ sellerId });
      const productIds = products.map(p => p._id);

      // Get orders containing seller products
      const orders = await Order.find({
        "items.productId": { $in: productIds },
        paymentStatus: "paid"
      });

      let totalRevenue = 0;
      let totalSoldItems = 0;

      orders.forEach(order => {
        order.items.forEach(item => {
          if (productIds.some(id => id.toString() === item.productId.toString())) {
            totalRevenue += item.price * item.quantity;
            totalSoldItems += item.quantity;
          }
        });
      });

      res.status(200).json({
        success: true,
        data: {
          totalProducts: products.length,
          totalOrders: orders.length,
          totalRevenue,
          totalSoldItems
        }
      });

    } catch (error) {
      console.error("getSellerDashboard error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch seller dashboard"
      });
    }
  }
}

module.exports = new DashboardController();