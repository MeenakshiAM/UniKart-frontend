const mongoose = require("mongoose");

const timeSlotSchema = new mongoose.Schema({
  startTime: {
    type: String,
    required: true
  },

  endTime: {
    type: String,
    required: true
  },

  status: {
    type: String,
    enum: ["available", "booked", "blocked","full"],
    default: "available",
    index: true
  },

  bookingIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking"
    }
  ],

  capacity: {
    max: {
      type: Number,
      default: 1
    },

    booked: {
      type: Number,
      default: 0
    }
  }

}, { _id: true });


const slotSchema = new mongoose.Schema({

  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true,
    index: true
  },

  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  date: {
    type: Date,
    required: true,
    index: true
  },

  timeSlots: [timeSlotSchema],

  isRecurring: {
    type: Boolean,
    default: false
  },

  recurringPattern: {

    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "none"],
      default: "none"
    },

    endDate: Date,

    daysOfWeek: [Number]
  },

  isActive: {
    type: Boolean,
    default: true
  }

}, {
  timestamps: true
});


// ================= INDEXES =================

slotSchema.index({ serviceId: 1, date: 1 });
slotSchema.index({ providerId: 1, date: 1 });
slotSchema.index({ date: 1, "timeSlots.status": 1 });


// ================= SAFE SLOT BOOKING =================

slotSchema.statics.bookTimeSlot = async function (
  slotId,
  timeSlotId,
  bookingId,
  participants = 1
) {

  const slot = await this.findOneAndUpdate(
    {
      _id: slotId,
      timeSlots: {
        $elemMatch: {
          _id: timeSlotId,
          status: "available",
          "capacity.booked": { $lt: "$capacity.max" } // (we'll recheck after)
        }
      }
    },
    {
      $inc: { "timeSlots.$.capacity.booked": participants },
      $addToSet: { "timeSlots.$.bookingIds": bookingId }
    },
    { new: true }
  );

  if (!slot) {
    throw new Error("Slot already booked or unavailable");
  }

  const timeSlot = slot.timeSlots.id(timeSlotId);

  // 🔥 FINAL SAFE CHECK
  if (timeSlot.capacity.booked >= timeSlot.capacity.max) {
    timeSlot.status = "booked";
    await slot.save();
  }

  return slot;
};

// ================= RELEASE SLOT =================
slotSchema.statics.releaseTimeSlot = async function (
  slotId,
  timeSlotId,
  bookingId,
  participants = 1
) {

  const slot = await this.findById(slotId);

  if (!slot) {
    throw new Error("Slot not found");
  }

  const timeSlot = slot.timeSlots.id(timeSlotId);

  if (!timeSlot) {
    throw new Error("Time slot not found");
  }

  // 🔥 Prevent negative
  timeSlot.capacity.booked = Math.max(
    0,
    timeSlot.capacity.booked - participants
  );

  // remove booking
  timeSlot.bookingIds = timeSlot.bookingIds.filter(
    id => id.toString() !== bookingId.toString()
  );

  // 🔥 Correct status logic
  if (timeSlot.capacity.booked < timeSlot.capacity.max) {
    timeSlot.status = "available";
  }

  await slot.save();

  return slot;
};

// ================= GET AVAILABLE SLOTS =================

slotSchema.methods.getAvailableSlots = function () {

  return this.timeSlots.filter(
    slot => slot.capacity.booked < slot.capacity.max &&
            slot.status === "available"
  );

};


// ================= FIND AVAILABLE SLOTS =================

slotSchema.statics.findAvailableSlots = function (
  serviceId,
  startDate,
  endDate
) {

  return this.find({
    serviceId,
    date: { $gte: startDate, $lte: endDate },
    isActive: true,
    "timeSlots.status": "available"
  }).sort({ date: 1 });

};


module.exports = mongoose.model("Slot", slotSchema);