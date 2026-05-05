const express = require("express");
const router = express.Router();

const {
  registerUser,
  registerSeller,
  getAllUsers,
  login,
  testAuth,
  uploadProfileImage,
  verifyEmail,
  approveSeller,
  getUserById,
  resendVerificationEmail,
  getSellerByUserId,
  getAllSellers
} = require("../controllers/auth.controller");

// ✅ FIX: THIS WAS MISSING / BROKEN
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const upload = require("../middlewares/upload.middleware");


// ================= PUBLIC =================
router.post("/register", registerUser);
router.post("/login", login);

router.get("/verify-email", verifyEmail);


// ================= AUTH TEST =================
router.get("/test", authMiddleware, testAuth);


// ================= USERS =================
router.get(
  "/users",
  authMiddleware,
  roleMiddleware("ADMIN"),
  getAllUsers
);

router.get("/users/:id", (req, res) => {
  console.log("GET /users/:id called with ID:", req.params.id);
  getUserById(req, res);
});


// ================= SELLER FLOW =================
router.post(
  "/register-seller",
  authMiddleware,
  roleMiddleware("BUYER"),
  registerSeller
);

router.patch(
  "/approve-seller/:sellerId",
  authMiddleware,
  roleMiddleware("ADMIN"),
  approveSeller
);

router.get(
  "/admin/sellers",
  authMiddleware,
  roleMiddleware("ADMIN"),
  getAllSellers
);

router.get("/profile/:userId", getSellerByUserId);


// ================= PROFILE =================
router.patch(
  "/profile-image",
  authMiddleware,
  upload.single("image"),
  uploadProfileImage
);


// ================= OTHER =================
router.post("/resend-verification", resendVerificationEmail);

module.exports = router;