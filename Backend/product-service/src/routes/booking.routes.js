const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const {
  createBooking,
  confirmBooking,
  cancelBooking,
  completeBooking,
  getMyBookings,
  getProviderBookings,
  getTodaySchedule,
  getBookingDetails
} = require("../controllers/booking.controller");


// ─────────────────────────────────────────────
// USER CREATE BOOKING
// ─────────────────────────────────────────────
router.post(
  "/",
  authMiddleware,
  roleMiddleware("BUYER"),
  createBooking
);


// ─────────────────────────────────────────────
// USER BOOKING ROUTES
// ─────────────────────────────────────────────
router.get(
  "/my-bookings",
  authMiddleware,
  getMyBookings
);

router.post(
  "/:bookingId/cancel",
  authMiddleware,
  cancelBooking
);


// ─────────────────────────────────────────────
// PROVIDER (SELLER) DASHBOARD ROUTES
// ─────────────────────────────────────────────
router.get(
  "/provider/bookings",
  authMiddleware,
  roleMiddleware("SELLER"),
  getProviderBookings
);

router.get(
  "/provider/today",
  authMiddleware,
  roleMiddleware("SELLER"),
  getTodaySchedule
);


// ─────────────────────────────────────────────
// PROVIDER ACTIONS
// ─────────────────────────────────────────────
router.post(
  "/:bookingId/confirm",
  authMiddleware,
  roleMiddleware("SELLER"),
  confirmBooking
);

router.post(
  "/:bookingId/complete",
  authMiddleware,
  roleMiddleware("SELLER"),
  completeBooking
);


// ─────────────────────────────────────────────
// SINGLE BOOKING DETAILS
// ─────────────────────────────────────────────
router.get(
  "/:bookingId",
  authMiddleware,
  getBookingDetails
);


module.exports = router;