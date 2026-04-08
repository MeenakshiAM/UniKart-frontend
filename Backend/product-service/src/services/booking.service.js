const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Slot = require('../models/Slot');
const mongoose = require('mongoose');
const axios = require("axios"); // for calling User Service

class BookingService {

  // ================= BOOKING CREATION =================
async createBooking(bookingData) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { serviceId, slotId, timeSlotId, participants = 1, userId, specialRequests } = bookingData;

    // 1️⃣ Fetch service
    const service = await Service.findById(serviceId).session(session);
    if (!service || service.status?.toLowerCase() !== "active") {
      throw new Error("Service not available");
    }

    // 2️⃣ Fetch slot
    const slot = await Slot.findById(slotId).session(session);
    if (!slot || !slot.isActive) {
    throw new Error("Slot not found or inactive");
}

    const timeSlot = slot.timeSlots.id(timeSlotId);
    if (!timeSlot) {
      throw new Error("Time slot not found");
    }

    // 3️⃣ Check time slot availability and capacity
    if (timeSlot.status !== "available") {
      throw new Error("Time slot is not available");
    }

    const currentBooked = timeSlot.capacity.booked || 0;
    const maxCapacity = timeSlot.capacity.max || 1;

    if (currentBooked + participants > maxCapacity) {
      throw new Error(
        `Not enough capacity. Available: ${maxCapacity - currentBooked}, Requested: ${participants}`
      );
    }
console.log("💡 BookingService trying to fetch userId:", userId);
    // 4️⃣ Fetch user info from User Service using decoded userId
    // 4️⃣ Fetch user info from User Service
let user;

try {
  console.log(`💡 BookingService trying to fetch userId: ${userId}`);

  const url = `${process.env.USER_SERVICE_URL || 'http://localhost:4001'}/api/auth/users/${userId}`;
  console.log(`📞 Calling User Service at: ${url}`);

  const response = await axios.get(url, {
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  console.log('📨 Response received from User Service:', response.status, response.data);

  if (!response.data || !response.data.success) {
    throw new Error("Invalid response from User Service");
  }

  user = response.data.data || response.data.user;

  if (!user) {
    throw new Error("User not found in User Service");
  }

  console.log(`✅ User fetched successfully: ${user.name || user.username} (${user.email})`);

} catch (err) {
  console.error("❌ User Service Error:", err.message);

  if (err.code === 'ECONNREFUSED') {
    console.error("🚫 Could not connect to User Service (Connection refused)");
    throw new Error("User Service is unavailable. Please try again later.");
  }

  if (err.response) {
    console.error("📌 Response status:", err.response.status);
    console.error("📌 Response data:", err.response.data);
  }

  throw new Error(`Failed to fetch user: ${err.message}`);
}

    if (!user.email) {
      throw new Error("Invalid user data received from User Service");
    }

    // 5️⃣ Calculate pricing
    const basePrice = service.pricing?.basePrice || 0;
    const serviceFee = this.calculateServiceFee(basePrice);
    const tax = this.calculateTaxes(basePrice);
    const discount = 0;
    const totalAmount = (basePrice + serviceFee + tax - discount) * participants;

    // 6️⃣ Prepare post-booking details
    let postBookingDetails = {};
    if (service.serviceType === "online") {
      postBookingDetails = {
        meetingLink: service.postBookingDetails?.meetingLink || "",
        instructions: service.postBookingDetails?.instructions || ""
      };
    } else if (service.serviceType === "offline" || service.serviceType === "venue") {
      postBookingDetails = {
        whatsappGroupLink: service.postBookingDetails?.whatsappGroupLink || "",
        instructions: service.postBookingDetails?.instructions || ""
      };
    }

    // 7️⃣ Create booking
    const booking = new Booking({
      serviceId,
      slotId,
      timeSlotId,
      bookingDate: slot.date,
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,

      // ✅ Use decoded userId directly
      userId: userId,
      userName: user.name || user.username || "Unknown",
      userEmail: user.email,
      userPhone: user.phone || user.mobile || "",

      providerId: service.providerId,
      providerName: service.providerName || "Provider",

      participants,
      specialRequests: specialRequests || "",
      pricing: { basePrice, serviceFee, tax, discount, totalAmount },
      payment: { status: "pending", method: null, transactionId: null },
      status: "pending",
      postBookingDetailsRevealed: false,
      revealedDetails: {
        whatsappGroupLink: postBookingDetails.whatsappGroupLink || "",
        meetingLink: postBookingDetails.meetingLink || "",
        instructions: postBookingDetails.instructions || "",
        revealedAt: null
      },
      review: { hasReviewed: false, reviewId: null }
    });

    // 8️⃣ Save booking
    await booking.save({ session });

    // 9️⃣ Update timeSlot booked count and status
    timeSlot.capacity.booked = currentBooked + participants;
    timeSlot.bookingIds.push(booking._id);
    if (timeSlot.capacity.booked >= maxCapacity) {
      timeSlot.status = "full"; // mark fully booked
    }
    await slot.save({ session });

    // 🔟 Increment service bookings
    service.totalBookings = (service.totalBookings || 0) + 1;
    await service.save({ session });

    // 1️⃣1️⃣ Commit transaction
    await session.commitTransaction();
    console.log("✅ Booking created successfully:", booking._id);

    // 1️⃣2️⃣ Send notifications
    this.sendBookingNotifications(booking).catch(err => {
      console.error("❌ Notification failed:", err.message);
    });

    return booking;

  } catch (error) {
    await session.abortTransaction();
    console.error("❌ Booking transaction failed:", error.message);
    throw new Error(`Booking failed: ${error.message}`);
  } finally {
    session.endSession();
  }
}
  // ================= PAYMENT SUCCESS =================

  async markBookingPaid(bookingId, paymentData) {

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.paymentStatus === "paid") {
      return booking;
    }

    booking.paymentStatus = "paid";

    booking.payment = {
      transactionId: paymentData.transactionId,
      method: paymentData.method,
      paidAt: new Date()
    };

    booking.status = "confirmed";
    booking.confirmedAt = new Date();
    booking.confirmedBy = "payment_system";

    const service = await Service.findById(booking.serviceId);

    if (service?.postBookingDetails) {

      booking.postBookingDetailsRevealed = true;

      booking.revealedDetails = {
        ...service.postBookingDetails,
        revealedAt: new Date()
      };

    }

    await booking.save();

    await this.sendConfirmationNotification(booking);

    return booking;
  }

  // ================= PROVIDER CONFIRM =================

  async confirmBooking(bookingId, providerId) {

    const booking = await Booking.findOne({
      _id: bookingId,
      providerId
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.status !== 'pending_payment') {
      throw new Error('Booking cannot be confirmed yet');
    }

    booking.status = 'confirmed';
    booking.confirmedAt = new Date();
    booking.confirmedBy = providerId;

    await booking.save();

    await this.sendConfirmationNotification(booking);

    return booking;
  }

  // ================= CANCEL BOOKING =================

  async cancelBooking(bookingId, cancelledBy, reason = '') {

    const session = await mongoose.startSession();
    session.startTransaction();

    try {

      const booking = await Booking.findById(bookingId).session(session);

      if (!booking) {
        throw new Error('Booking not found');
      }

      if (!['pending_payment', 'confirmed'].includes(booking.status)) {
        throw new Error('Booking cannot be cancelled');
      }

      const isUser = cancelledBy.startsWith('user');

      booking.status = isUser
        ? 'cancelled_by_user'
        : 'cancelled_by_provider';

      booking.cancellation = {
        cancelledAt: new Date(),
        cancelledBy,
        reason
      };

      await booking.save({ session });

      await Slot.releaseTimeSlot(
        booking.slotId,
        booking.timeSlotId,
        booking._id,
        session
      );

      await session.commitTransaction();
      session.endSession();

      await this.sendCancellationNotification(booking);

      return booking;

    } catch (error) {

      await session.abortTransaction();
      session.endSession();

      throw new Error(`Failed to cancel booking: ${error.message}`);
    }
  }

  // ================= COMPLETE BOOKING =================

  async completeBooking(bookingId, providerId) {

    const booking = await Booking.findOne({
      _id: bookingId,
      providerId
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.status !== 'confirmed') {
      throw new Error('Booking not confirmed yet');
    }

    booking.status = 'completed';

    await booking.save();

    await Service.findByIdAndUpdate(
      booking.serviceId,
      { $inc: { completedBookings: 1 } }
    );

    return booking;
  }

  // ================= PRICING =================

  calculateServiceFee(price) {
    return Math.round(price * 0.05);
  }

  calculateTaxes(price) {
    return Math.round(price * 0.18);
  }

  // ================= NOTIFICATIONS =================

  async sendBookingNotifications(booking) {

    console.log('Booking created:', booking._id);

    booking.notifications = booking.notifications || [];

    booking.notifications.push({
      type: 'system',
      sentAt: new Date(),
      message: 'Booking created'
    });

    await booking.save();
  }

  async sendConfirmationNotification(booking) {

    console.log('Booking confirmed:', booking._id);

    booking.notifications = booking.notifications || [];

    booking.notifications.push({
      type: 'system',
      sentAt: new Date(),
      message: 'Booking confirmed'
    });

    await booking.save();
  }

  async sendCancellationNotification(booking) {

    console.log('Booking cancelled:', booking._id);

    booking.notifications = booking.notifications || [];

    booking.notifications.push({
      type: 'system',
      sentAt: new Date(),
      message: 'Booking cancelled'
    });

    await booking.save();
  }

}

module.exports = new BookingService();