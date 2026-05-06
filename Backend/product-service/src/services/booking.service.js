const Booking = require("../models/Booking");
const Service = require("../models/Service");
const Slot = require("../models/Slot");
const mongoose = require("mongoose");
const { sendEmail } = require("../utils/mailer");
const axios = require("axios");

class BookingService {

  // ================= CREATE BOOKING (PENDING PAYMENT) =================
  // ================= CREATE BOOKING (PENDING PAYMENT) =================
async createBooking(data) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      serviceId,
      slotId,
      timeSlotId,
      participants = 1,
      userId,
      specialRequests
    } = data;

    // 1. Validate service
    const service = await Service.findById(serviceId).session(session);
    if (!service || service.status?.toLowerCase() !== "active") {
      throw new Error("Service not available");
    }

    // 2. Validate slot
    const slot = await Slot.findById(slotId).session(session);
    if (!slot || !slot.isActive) {
      throw new Error("Slot not available");
    }

    const timeSlot = slot.timeSlots.id(timeSlotId);
    if (!timeSlot) {
      throw new Error("Time slot not found");
    }

    // 3. Check availability
    const booked = timeSlot.capacity.booked || 0;
    const max = timeSlot.capacity.max || 1;

    if (booked + participants > max) {
      throw new Error("Not enough capacity");
    }

    // 4. Fetch user
    const url = `${process.env.USER_SERVICE_URL || "http://localhost:4001"}/api/auth/users/${userId}`;
    const userRes = await axios.get(url);
    const user = userRes.data?.data;

    if (!user) throw new Error("User not found");

    // 5. Pricing
    const basePrice = service.pricing?.basePrice || 0;
    const serviceFee = Math.round(basePrice * 0.05);
    const tax = Math.round(basePrice * 0.18);
    const totalAmount = (basePrice + serviceFee + tax) * participants;

    // 6. CREATE BOOKING (IMPORTANT FIX HERE)
    const booking = new Booking({
      serviceId,
      slotId,
      timeSlotId,
      bookingDate: slot.date,
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,

      userId,
      userName: user.name,
      userEmail: user.email,

      providerId: service.providerId,

      participants,
      specialRequests,

      pricing: {
        basePrice,
        serviceFee,
        tax,
        totalAmount
      },

      payment: {
        status: "pending"        // ✅ correct enum
      },

      status: "pending_payment"  // ✅ MUST be explicitly set
    });

    // 🔍 DEBUG (optional but useful)
    console.log("DEBUG BOOKING:", {
      bookingStatus: booking.status,
      paymentStatus: booking.payment.status
    });
    
    await booking.save({ session });

await sendEmail({
  to: user.email,
  subject: "🎉 Booking Created Successfully",
  html: `
    <h2>Hello ${user.name}</h2>
    <p>Your booking has been created successfully.</p>

    <h3>Details:</h3>
    <ul>
      <li>Service: ${service.title}</li>
      <li>Date: ${slot.date}</li>
      <li>Time: ${timeSlot.startTime} - ${timeSlot.endTime}</li>
      <li>Status: Pending Payment</li>
    </ul>

    <p>Please complete payment to confirm your booking.</p>
  `
});

const providerRes = await axios.get(
  `${process.env.USER_SERVICE_URL || "http://localhost:4001"}/api/auth/users/${service.providerId}`
);
console.log(providerRes);
const provider = providerRes.data?.data;
await sendEmail({
  to: provider.email, 
  subject: "📌 New Booking Received",
  html: `
    <h2>New Booking Alert 🚨</h2>

    <p>A user just booked your service.</p>

    <p><b>Service:</b> ${service.title}</p>
    <p><b>User:</b> ${user.name}</p>
    <p><b>Email:</b> ${user.email}</p>
    <p><b>Date:</b> ${slot.date}</p>
    <p><b>Time:</b> ${timeSlot.startTime} - ${timeSlot.endTime}</p>

    <p>Please check your dashboard.</p>
  `
});

    // 7. TEMPORARY SLOT RESERVE
    timeSlot.capacity.booked += participants;
    timeSlot.bookingIds.push(booking._id);

    if (timeSlot.capacity.booked >= max) {
      timeSlot.status = "available";
    }

    await slot.save({ session });

    await session.commitTransaction();

    return booking;

  } catch (err) {
    await session.abortTransaction();
    throw new Error(`Booking failed: ${err.message}`);
  } finally {
    session.endSession();
  }
}
  // ================= PAYMENT SUCCESS =================
  async markBookingPaid(bookingId, paymentData) {

    const booking = await Booking.findById(bookingId);
    if (!booking) throw new Error("Booking not found");

    if (booking.payment.status === "paid") return booking;

    booking.payment = {
      status: "paid",
      transactionId: paymentData.transactionId,
      method: paymentData.method,
      paidAt: new Date()
    };

    booking.status = "confirmed";
    booking.confirmedAt = new Date();
 
    await booking.save();

    return booking;
  }

  // ================= CANCEL =================
  async cancelBooking(bookingId, userId, reason = "") {

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const booking = await Booking.findById(bookingId).session(session);
      if (!booking) throw new Error("Booking not found");

      if (!["pending_payment", "confirmed"].includes(booking.status)) {
        throw new Error("Cannot cancel");
      }

      booking.status = "cancelled";
      booking.cancellation = {
        reason,
        cancelledAt: new Date(),
        cancelledBy: userId
      };

      await booking.save({ session });

      await session.commitTransaction();
      return booking;

    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  // ================= COMPLETE =================
  async completeBooking(bookingId, providerId) {

    const booking = await Booking.findOne({
      _id: bookingId,
      providerId
    });

    if (!booking) throw new Error("Booking not found");

    if (booking.status !== "confirmed") {
      throw new Error("Not confirmed yet");
    }

    booking.status = "completed";
    await booking.save();

    return booking;
  }
}

module.exports = new BookingService();