const Wishlist = require("../models/wishlist.model");

exports.toggleWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if already exists
    const existingItem = await Wishlist.findOne({ userId, productId });

    if (existingItem) {
      // 🔴 If exists → remove it
      await Wishlist.deleteOne({ userId, productId });
      return res.status(200).json({ message: "Removed from wishlist" });
    }

    // 🟢 If not exists → add it
    const newItem = new Wishlist({ userId, productId });
    await newItem.save();

    return res.status(201).json({ message: "Added to wishlist" });

  } catch (error) {
    console.error("Toggle Wishlist Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

exports.getWishlist = async (req, res) => {
  try {
   const userId = req.user.userId;

    const wishlist = await Wishlist.find({ userId });

    return res.status(200).json(wishlist);

  } catch (error) {
    console.error("Get Wishlist Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};