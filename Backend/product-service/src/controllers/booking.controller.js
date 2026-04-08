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