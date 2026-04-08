const express = require("express");
const router = express.Router();

const serviceController = require("../controllers/service.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const uploadMiddleware = require("../middlewares/uploadService.middleware");


// ── PUBLIC ROUTES ─────────────────────────────────────────

// List services
router.get("/", serviceController.listServices);

// Search nearby services
router.get("/search/nearby", serviceController.searchNearbyServices);

// Get service slots
router.get("/:serviceId/slots", serviceController.getServiceSlots);

// Get single service
router.get("/:serviceId", serviceController.getService);



// ── PROVIDER ROUTES ───────────────────────────────────────

// Create service
router.post(
  "/",
  authMiddleware,
  roleMiddleware("SELLER"),
  uploadMiddleware.array("images", 5),
  serviceController.createService
);

// Update service
router.put(
  "/:serviceId",
  authMiddleware,
  roleMiddleware("SELLER"),
  uploadMiddleware.array("images", 5),
  serviceController.updateService
);

// Delete service
router.delete(
  "/:serviceId",
  authMiddleware,
  roleMiddleware("SELLER"),
  serviceController.deleteService
);



// ── PROVIDER DASHBOARD ───────────────────────────────────

// My services
router.get(
  "/provider/my-services",
  authMiddleware,
  roleMiddleware("SELLER"),
  serviceController.getMyServices
);

// Provider stats
router.get(
  "/provider/stats",
  authMiddleware,
  roleMiddleware("SELLER"),
  serviceController.getProviderStats
);



// ── SLOT MANAGEMENT ──────────────────────────────────────

// Create slot
router.post(
  "/:serviceId/slots",
  authMiddleware,
  roleMiddleware("SELLER"),
  serviceController.createSlot
);

// Bulk create slots
router.post(
  "/:serviceId/slots/bulk",
  authMiddleware,
  roleMiddleware("SELLER"),
  serviceController.bulkCreateSlots
);
router.put(
  "/slots/:slotId",
  authMiddleware,
  roleMiddleware("SELLER"),
  serviceController.updateSlot
);
// Update slot
router.put(
  "/slots/:slotId",
  authMiddleware,
  roleMiddleware("SELLER"),
  serviceController.updateSlot
);

// Delete slot
router.delete(
  "/slots/:slotId",
  authMiddleware,
  roleMiddleware("SELLER"),
  serviceController.deleteSlot
);



// ── ADMIN ROUTES ─────────────────────────────────────────

// Pending services
router.get(
  "/admin/pending",
  authMiddleware,
  roleMiddleware("ADMIN"),
  serviceController.getPendingServices
);

// Approve service
router.post(
  "/admin/:serviceId/approve",
  authMiddleware,
  roleMiddleware("ADMIN"),
  serviceController.approveService
);

// Reject service
router.post(
  "/admin/:serviceId/reject",
  authMiddleware,
  roleMiddleware("ADMIN"),
  serviceController.rejectService
);

// Suspend service
router.post(
  "/admin/:serviceId/suspend",
  authMiddleware,
  roleMiddleware("ADMIN"),
  serviceController.suspendService
);

module.exports = router;