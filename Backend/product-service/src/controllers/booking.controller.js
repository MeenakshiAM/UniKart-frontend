const bookingService = require("../services/booking.service");

// ==================== CREATE BOOKING ====================
exports.createBooking = async (req, res) => {
  try {

    const bookingData = {
      ...req.body,
      userId: req.user.userId
    };

    const booking = await bookingService.createBooking(bookingData);

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message
    });

  }
};



// ==================== CONFIRM BOOKING ====================
exports.confirmBooking = async (req, res) => {
  try {

    const { bookingId } = req.params;
    const providerId = req.user.userId;

    const booking = await bookingService.confirmBooking(
      bookingId,
      providerId
    );

    return res.status(200).json({
      success: true,
      message: "Booking confirmed successfully",
      data: booking
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message
    });

  }
};



// ==================== CANCEL BOOKING ====================
exports.cancelBooking = async (req, res) => {
  try {

    const { bookingId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Cancellation reason is required"
      });
    }

    const cancelledBy = req.user.userId;

    const booking = await bookingService.cancelBooking(
      bookingId,
      cancelledBy,
      reason
    );

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message
    });

  }
};



// ==================== COMPLETE BOOKING ====================
exports.completeBooking = async (req, res) => {
  try {

    const { bookingId } = req.params;
    const providerId = req.user.userId;

    const booking = await bookingService.completeBooking(
      bookingId,
      providerId
    );

    return res.status(200).json({
      success: true,
      message: "Booking marked as completed",
      data: booking
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message
    });

  }
};



// ==================== USER BOOKINGS ====================
exports.getMyBookings = async (req, res) => {
  try {

    const userId = req.user.userId;

    const filters = {
      status: req.query.status,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20
    };

    const result = await bookingService.getUserBookings(userId, filters);

    return res.status(200).json({
      success: true,
      data: result.bookings,
      pagination: result.pagination
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message
    });

  }
};



// ==================== PROVIDER BOOKINGS ====================
exports.getProviderBookings = async (req, res) => {
  try {

    const providerId = req.user.userId;

    const filters = {
      status: req.query.status,
      date: req.query.date,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20
    };

    const result = await bookingService.getProviderBookings(
      providerId,
      filters
    );

    return res.status(200).json({
      success: true,
      data: result.bookings,
      pagination: result.pagination
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message
    });

  }
};



// ==================== TODAY SCHEDULE ====================
exports.getTodaySchedule = async (req, res) => {
  try {

    const providerId = req.user.userId;

    const bookings = await bookingService.getTodaySchedule(providerId);

    return res.status(200).json({
      success: true,
      data: bookings
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message
    });

  }
};



// ==================== BOOKING DETAILS ====================
exports.getBookingDetails = async (req, res) => {
  try {

    const { bookingId } = req.params;

    const userId = req.user.role === "BUYER" ? req.user.userId : null;
    const providerId = req.user.role === "SELLER" ? req.user.userId : null;

    const booking = await bookingService.getBookingById(
      bookingId,
      userId,
      providerId
    );

    return res.status(200).json({
      success: true,
      data: booking
    });

  } catch (error) {

    return res.status(404).json({
      success: false,
      message: error.message
    });

  }
};
const Booking = require("../models/Booking");

// ================= CONFIRM BOOKING =================
exports.confirmBooking = async (bookingId, providerId) => {
  const booking = await Booking.findOne({
    _id: bookingId,
    providerId
  });

  if (!booking) throw new Error("Booking not found");

  if (
    booking.status !== "pending_payment" &&
    booking.status !== "confirmed"
  ) {
    throw new Error("Booking cannot be confirmed");
  }

  booking.status = "confirmed";
  return booking.save();
};


// ================= TODAY SCHEDULE =================
exports.getTodaySchedule = async (providerId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  return Booking.find({
    providerId,
    bookingDate: { $gte: today, $lt: tomorrow }
  }).sort({ startTime: 1 });
};


// ================= PROVIDER BOOKINGS =================
exports.getProviderBookings = async (providerId, filters = {}) => {
  const query = { providerId };

  if (filters.status) {
    query.status = filters.status;
  }

  const page = filters.page || 1;
  const limit = filters.limit || 20;

  const bookings = await Booking.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    bookings,
    pagination: {
      page,
      limit,
      total: bookings.length
    }
  };
};


// ================= USER BOOKINGS =================
exports.getUserBookings = async (userId, filters = {}) => {
  const query = { userId };

  if (filters.status) {
    query.status = filters.status;
  }

  const page = filters.page || 1;
  const limit = filters.limit || 20;

  const bookings = await Booking.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    bookings,
    pagination: {
      page,
      limit,
      total: bookings.length
    }
  };
};


// ================= GET BOOKING BY ID =================
exports.getBookingById = async (bookingId, userId, role) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) throw new Error("Booking not found");

  const isOwner = booking.userId.toString() === userId;
  const isProvider = booking.providerId.toString() === userId;
  const isAdmin = role === "ADMIN";

  if (!isOwner && !isProvider && !isAdmin) {
    throw new Error("Not authorized to view this booking");
  }

  return booking;
};