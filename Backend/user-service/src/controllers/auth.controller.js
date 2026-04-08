const userService = require("../services/user.service");
const User = require("../models/user.model"); // make sure path is correct

// ---------- REGISTER USER ----------
exports.registerUser = async (req, res) => {
  try {
    const { age } = req.body;
    console.log("AGE:", age, typeof age);
    const result = await userService.registerUser(req.body);

    res.status(201).json(result);

  } catch (err) {

    res.status(400).json({
      message: err.message
    });

  }
};


// ---------- LOGIN ----------
exports.login = async (req, res) => {
  try {

    const { email, password } = req.body;

    const result = await userService.loginUser({ email, password });

    const user = result.user;

    // Suspension check
    if (user.isSuspended) {

      if (!user.suspensionEnd) {
        throw new Error("Account permanently banned");
      }

      if (user.suspensionEnd > new Date()) {
        throw new Error("Account temporarily suspended");
      }

    }

    res.status(200).json({
      message: "Login successful",
      token: result.token,
      user: result.user
    });

  } catch (error) {

    res.status(401).json({
      message: error.message
    });

  }
};


// ---------- REGISTER SELLER ----------
exports.registerSeller = async (req, res) => {
  try {

    const userId = req.user.userId;

    const seller = await userService.registerSeller({
      userId,
      ...req.body
    });

    res.status(201).json({
      message: "Seller profile created",
      seller
    });

  } catch (err) {

    res.status(400).json({
      message: err.message
    });

  }
};


// ---------- GET ALL USERS (ADMIN) ----------
exports.getAllUsers = async (req, res) => {
  try {

    const users = await userService.getAllUsers();

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });

  } catch (err) {

    res.status(500).json({
      message: err.message
    });

  }
};


// ---------- PROFILE IMAGE UPLOAD ----------
exports.uploadProfileImage = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        message: "No image uploaded"
      });
    }

    const imageUrl = req.file.path;

    const updatedUser = await userService.updateProfileImage(
      req.user.userId,
      imageUrl
    );

    res.status(200).json({
      message: "Profile image updated successfully",
      profileImage: updatedUser.profileImage
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};


// ---------- TEST AUTH ----------
exports.testAuth = (req, res) => {

  res.status(200).json({
    message: "Auth middleware working",
    user: req.user
  });

};


exports.verifyEmail = async (req, res) => {
  try {

    const { token } = req.query;

    await userService.verifyEmail(token);

    res.status(200).json({
      message: "Email verified successfully"
    });

  } catch (error) {

    res.status(400).json({
      message: error.message
    });

  }
};
exports.approveSeller = async (req, res) => {
  try {

    const { sellerId } = req.params;

    const seller = await userService.approveSeller(sellerId);

    res.status(200).json({
      message: "Seller approved successfully",
      seller
    });

  } catch (error) {

    res.status(400).json({
      message: error.message
    });

  }
};
exports.resendVerificationEmail = async (req, res) => {
  try {

    const { email } = req.body;

    const result = await userService.resendVerificationEmail(email);

    res.status(200).json(result);

  } catch (error) {

    res.status(400).json({
      message: error.message
    });

  }
};

// ================= GET USER BY ID =================
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log("imentering");
    const user = await User.findById(userId);
    console.log("imhere");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error("getUserById error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// ================= GET MY PROFILE =================
exports.getMySellerProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log("JWT USER:", req.user);
console.log("USER ID:", userId);
    const seller = await userService.getSellerByUserIds(userId);

    if (!seller) {
      return res.status(404).json({
        message: "Seller profile not found"
      });
    }

    res.status(200).json({
      success: true,
      seller
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};


// ================= GET SELLER BY USER ID =================
exports.getSellerByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const seller = await userService.getSellerByUserId(userId);

    if (!seller) {
      return res.status(404).json({
        message: "Seller not found"
      });
    }

    // 🔥 Optional: restrict sensitive data
    const publicSeller = {
      shopName: seller.shopName,
      shopDescription: seller.shopDescription,
      shopImage: seller.shopImage,
      shopBanner: seller.shopBanner,
      status: seller.status
    };

    res.status(200).json({
      success: true,
      seller: publicSeller
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};