const Service = require('../models/Service');
const Slot = require('../models/Slot');
const cloudinary = require('../config/cloudinary');
const moderationService = require('./moderation.service');
const mongoose = require("mongoose");

class ServiceService {

  // ================= SERVICE CRUD =================

  async createServiceService(serviceData) {
  try {
    const { title, description, images, isDraft } = serviceData;

    // ---------- MODERATION CHECK ----------
    const { isAllowed, reason } = await moderationService.moderateContent(
      `${title} ${description}`
    );

    // ---------- DETERMINE STATUS ----------
    // Drafts stay as 'draft'
    // Moderated content goes 'pending_approval' if allowed, 'rejected' if not
    let status;
    if (isDraft === "true" || isDraft === true) {
      status = "draft";
    } else {
      status = isAllowed ? "pending_approval" : "rejected";
    }

    // ---------- CREATE SERVICE ----------
    const service = await Service.create({
      ...serviceData,
      images,
      status,
      moderationReason: isAllowed ? null : reason,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return service;
  } catch (error) {
    throw new Error(`Failed to create service: ${error.message}`);
  }
}

  // ================= GET SERVICE =================

  async getServiceById(serviceId, incrementView = false) {

    const service = await Service.findById(serviceId);

    if (!service || service.status !== "active") {
      throw new Error("Service not found");
    }

    if (incrementView && service.incrementViews) {
      await service.incrementViews();
    }

    return service;
  }

  // ================= UPDATE SERVICE =================

  async updateService(serviceId, providerId, updateData, files = []) {

    const service = await Service.findOne({
      _id: serviceId,
      providerId
    });

    if (!service) {
      throw new Error("Service not found or unauthorized");
    }

    // ---------- IMAGE UPDATE ----------
    if (files && files.length > 0) {

      for (const img of service.images) {
        if (img.publicId) {
          await cloudinary.uploader.destroy(img.publicId);
        }
      }

      const newImages = [];

      for (let i = 0; i < files.length; i++) {

        const result = await cloudinary.uploader.upload(files[i].path, {
          folder: "unikart/services"
        });

        newImages.push({
          url: result.secure_url,
          publicId: result.public_id,
          isPrimary: i === 0
        });
      }

      updateData.images = newImages;
    }

    // ---------- RE-MODERATE TEXT ----------
    if (updateData.title || updateData.description) {

      const textToModerate = `${updateData.title || service.title} ${updateData.description || service.description}`;

      const moderationResult = await moderationService.moderateContent(textToModerate);

      if (!moderationResult.isAllowed) {
        updateData.status = "rejected";
        updateData.rejectionReason = moderationResult.reason || "Content violates platform policy";
      } else {
        updateData.status = "pending_approval";
      }
    }

    Object.assign(service, updateData);

    await service.save();

    return service;
  }

  // ================= DELETE SERVICE =================

  async deleteService(serviceId, providerId) {

  const service = await Service.findOne({
    _id: serviceId,
    providerId
  });

  if (!service) {
    throw new Error("Service not found or unauthorized");
  }

  // 🔥 delete images from cloudinary
  for (const img of service.images) {
    if (img.publicId) {
      await cloudinary.uploader.destroy(img.publicId);
    }
  }

  // 🔥 HARD DELETE from DB
  await Service.deleteOne({ _id: serviceId });

  return { message: "Service deleted successfully" };
}

  // ================= SERVICE LISTING =================

  async listServices(filters = {}, page = 1, limit = 20) {
  const {
    category,
    serviceType,
    venue,
    minPrice,
    maxPrice,
    searchQuery,
    providerId,
    status  // 🔥 Don't default to "active" anymore
  } = filters;

  const query = {};

if (status) {
  query.status = status;
}

if (providerId) {
  query.providerId = providerId;
}


  if (category) query.category = category;
  if (serviceType) query.serviceType = serviceType;
  if (providerId) query.providerId = providerId; // ← String comparison

  if (venue) {
    query["location.venue"] = new RegExp(venue, "i");
  }

  if (minPrice || maxPrice) {
    query["pricing.basePrice"] = {};
    if (minPrice) query["pricing.basePrice"].$gte = minPrice;
    if (maxPrice) query["pricing.basePrice"].$lte = maxPrice;
  }

  if (searchQuery) {
    query.$or = [
      { title: new RegExp(searchQuery, "i") },
      { description: new RegExp(searchQuery, "i") }
    ];
  }

  console.log("🔎 Querying services with:", JSON.stringify(query, null, 2));

  const skip = (page - 1) * limit;

  const services = await Service.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Service.countDocuments(query);

  console.log("📊 Query results:", { found: services.length, total });

  return {
    services,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}
  // ================= ADMIN =================

  async approveService(serviceId, adminId, adminName) {

    const service = await Service.findById(serviceId);

    if (!service) {
      throw new Error("Service not found");
    }

    service.status = "active";
    //service.isActive=true;

    service.approvedBy = {
      adminId,
      adminName,
      approvedAt: new Date()
    };

    await service.save();

    return service;
  }

  async rejectService(serviceId, reason) {

    const service = await Service.findById(serviceId);

    if (!service) {
      throw new Error("Service not found");
    }

    service.status = "rejected";
    service.rejectionReason = reason;

    await service.save();

    return service;
  }

  // ================= SLOT MANAGEMENT =================

  async createSlot(serviceId, providerId, slotData) {

    const service = await Service.findOne({
      _id: serviceId,
      providerId
    });

    if (!service) {
      throw new Error("Service not found or unauthorized");
    }

    const slot = new Slot({
      serviceId,
      providerId,
      ...slotData
    });

    await slot.save();

    return slot;
  }

  async getServiceSlots(serviceId, startDate, endDate) {

  const start = new Date(startDate);
  const end = new Date(endDate);

  const slots = await Slot.find({
    serviceId,
    date: { $gte: start, $lte: end }
  }).sort({ date: 1 });

  return slots;
}

  async deleteSlot(slotId, providerId) {

    const slot = await Slot.findOne({
      _id: slotId,
      providerId
    });

    if (!slot) {
      throw new Error("Slot not found or unauthorized");
    }

    const hasBookings = slot.timeSlots.some(
      ts => ts.capacity.booked > 0
    );

    if (hasBookings) {
      throw new Error("Cannot delete slot with bookings");
    }

    await Slot.deleteOne({ _id: slotId });

    return { message: "Slot deleted successfully" };
  }

  // ================= PROVIDER STATS =================

  async getProviderStats(providerId) {

    const totalServices = await Service.countDocuments({ providerId });

    const activeServices = await Service.countDocuments({
      providerId,
      status: "active"
    });

    const pendingServices = await Service.countDocuments({
      providerId,
      status: "pending_approval"
    });

    const services = await Service.find({ providerId });

    const totalViews = services.reduce(
      (sum, s) => sum + (s.views || 0),
      0
    );

    return {
      totalServices,
      activeServices,
      pendingServices,
      totalViews
    };
  }
  async getPendingServices(page = 1, limit = 20) {
  const query = { status: "pending_approval" };
  const skip = (page - 1) * limit;

  const services = await Service.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Service.countDocuments(query);

  return {
    services,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}
// Approve service
async approveServiceService(serviceId) {
  if (!serviceId) throw new Error("Service ID is required");

  const service = await Service.findById(serviceId);
  if (!service) throw new Error("Service not found");

  if (service.status !== "pending_approval")
    throw new Error("Only pending services can be approved");

  service.status = "active";
  
  await service.save();

  return service;
}

// Reject service
async rejectServiceService(serviceId, reason) {
  if (!serviceId) throw new Error("Service ID is required");

  const service = await Service.findById(serviceId);
  if (!service) throw new Error("Service not found");

  if (service.status !== "pending_approval")
    throw new Error("Only pending services can be rejected");

  service.status = "rejected";
  service.moderationReason = reason || "Rejected by admin";
  await service.save();

  return service;
}
async updateSlot(slotId, providerId, updateData) {

  // 🔥 Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(slotId)) {
    throw new Error("Invalid slot ID");
  }

  if (!mongoose.Types.ObjectId.isValid(providerId)) {
    throw new Error("Invalid provider ID");
  }

  const slot = await Slot.findOne({
    _id: new mongoose.Types.ObjectId(slotId),
    providerId: new mongoose.Types.ObjectId(providerId)
  });

  if (!slot) {
    throw new Error("Slot not found or unauthorized");
  }

  // 🚫 Prevent editing if bookings exist
  const hasBookings = slot.timeSlots.some(
    ts => ts.capacity?.booked > 0
  );

  if (hasBookings) {
    throw new Error("Cannot update slot with existing bookings");
  }

  // 🔧 Update fields safely
  if (updateData.date) {
    slot.date = new Date(updateData.date);
  }

  if (updateData.timeSlots) {
    slot.timeSlots = updateData.timeSlots;
  }

  // optional future field
  if (updateData.isActive !== undefined) {
    slot.isActive = updateData.isActive;
  }

  await slot.save();

  return slot;
}
}

module.exports = new ServiceService();