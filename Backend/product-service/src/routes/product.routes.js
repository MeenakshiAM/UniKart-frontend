const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const {
  createProduct,
  getMyProducts,
  getAllActiveProducts,
  getProductsBySellerId,
  getProductById,
  updateProduct,
  deleteProduct,
  hideProduct,
  unhideProduct,
  getMyDrafts,
  getDraftById,
  getMyRejectedProducts,
  getMyHiddenProducts,
  getMyOutOfStock,
  resubmitProduct,
  reduceStock,
  restoreStock,
  adminHideProduct,
  approveProduct,
  rejectProduct
} = require("../controllers/product.controller");

const upload = require("../middlewares/upload.middleware");


// ─────────────────────────────────────────────
// SELLER CREATE PRODUCT
// ─────────────────────────────────────────────
router.post(
  "/create",
 // authMiddleware,
  //roleMiddleware("SELLER"),
  upload.array("images", 5),
  createProduct
);


// ─────────────────────────────────────────────
// PUBLIC ROUTES
// ─────────────────────────────────────────────
router.get("/", getAllActiveProducts);
router.get("/seller/:sellerId", getProductsBySellerId);


// ─────────────────────────────────────────────
// SELLER DASHBOARD ROUTES
// ─────────────────────────────────────────────
router.get("/my", authMiddleware, roleMiddleware("SELLER"), getMyProducts);

router.get("/my/drafts", authMiddleware, roleMiddleware("SELLER"), getMyDrafts);
router.get("/my/drafts/:id", authMiddleware, roleMiddleware("SELLER"), getDraftById);

router.get("/my/rejected", authMiddleware, roleMiddleware("SELLER"), getMyRejectedProducts);
router.get("/my/hidden", authMiddleware, roleMiddleware("SELLER"), getMyHiddenProducts);

router.get(
  "/my/out-of-stock",
  authMiddleware,
  roleMiddleware("SELLER"),
  getMyOutOfStock
);


// ─────────────────────────────────────────────
// SINGLE PRODUCT (PUBLIC)
// ─────────────────────────────────────────────
router.get("/:id", getProductById);


// ─────────────────────────────────────────────
// SELLER ACTIONS
// ─────────────────────────────────────────────
router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware("SELLER"),
  upload.array("images", 5),
  updateProduct
);

router.patch(
  "/:id/hide",
  authMiddleware,
  roleMiddleware("SELLER"),
  hideProduct
);

router.patch(
  "/:id/unhide",
  authMiddleware,
  roleMiddleware("SELLER"),
  unhideProduct
);

router.patch(
  "/:id/resubmit",
  authMiddleware,
  roleMiddleware("SELLER"),
  upload.array("images", 5),
  resubmitProduct
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("SELLER"),
  deleteProduct
);


// ─────────────────────────────────────────────
// INTERNAL SERVICE ROUTES (ORDER SERVICE)
// ─────────────────────────────────────────────
router.patch(
  "/:id/reduce-stock",
  authMiddleware,
  reduceStock
);

router.patch(
  "/:id/restore-stock",
  authMiddleware,
  restoreStock
);


// ─────────────────────────────────────────────
// INTERNAL REPORT AUTOMATION SERVICE
// ─────────────────────────────────────────────
router.patch(
  "/:id/admin-hide",
  adminHideProduct
);

router.patch("/approve/:id",authMiddleware,roleMiddleware("ADMIN"), approveProduct);
router.patch("/reject/:id",authMiddleware,roleMiddleware("ADMIN"), rejectProduct);
module.exports = router;