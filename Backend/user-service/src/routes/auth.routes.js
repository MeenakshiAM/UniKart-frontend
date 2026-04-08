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
  getMySellerProfile,
  getSellerByUserId
} = require("../controllers/auth.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const upload = require("../middlewares/upload.middleware");


// PUBLIC
router.post("/register", registerUser);
router.post("/login", login);


// ADMIN ONLY
router.get(
  "/users",
  authMiddleware,
  roleMiddleware("ADMIN"),
  getAllUsers
);

router.patch(
  "/approve-seller/:sellerId",
  authMiddleware,
  roleMiddleware("ADMIN"),
  approveSeller
);
// AUTH TEST
router.get(
  "/test",
  authMiddleware,
  testAuth
);

router.get("/users/:id", (req, res) => {
  console.log(" GET /users/:id called with ID:", req.params.id);
  getUserById(req, res);
});
// BUYER → SELLER
router.post(
  "/register-seller",
  authMiddleware,
  roleMiddleware("BUYER"),
  registerSeller
);
router.post("/resend-verification", resendVerificationEmail);

// PROFILE IMAGE
router.patch(
  "/profile-image",
  authMiddleware,
  upload.single("image"),
  uploadProfileImage
);

router.get(
  "/profile/:userId",
  getSellerByUserId
);

router.get("/verify-email", verifyEmail);

module.exports = router;