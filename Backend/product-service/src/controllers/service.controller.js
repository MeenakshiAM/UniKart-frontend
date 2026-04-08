const serviceService = require('../services/service.service');
const mongoose = require("mongoose");
class ServiceController {

  // ================= SERVICE CRUD =================

  async createService(req, res) {
    try {
       console.log("req.user:", req.user)
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      // Map files to Cloudinary paths for service
      const images = req.files
        ? req.files.map(file => ({
            url: file.path || file.filename, // support multer-cloudinary-storage
            publicId: file.filename || file.originalname
          }))
        : [];

      const serviceData = {
        ...req.body,
        providerId: req.user.userId, // NOT req.user.id
        providerName: req.user.name,
        providerEmail: req.user.email,
        providerPhone: req.user.phone,
        images
      };

      const service = await serviceService.createServiceService(serviceData);

      return res.status(201).json({
        success: true,
        message: "Service created successfully. Pending admin approval.",
        data: service
      });
    } catch (error) {
      console.error("CREATE SERVICE ERROR:", error);

      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }


  async getService(req, res) {
    try {

      const { serviceId } = req.params;

      if (!serviceId) {
        return res.status(400).json({
          success: false,
          message: 'Service ID is required'
        });
      }

      const incrementView = req.query.view === 'true';

      const service = await serviceService.getServiceById(serviceId, incrementView);

      return res.status(200).json({
        success: true,
        data: service
      });

    } catch (error) {

      return res.status(404).json({
        success: false,
        message: error.message
      });

    }
  }


  async updateService(req, res) {
    try {

      const { serviceId } = req.params;

      if (!serviceId) {
        return res.status(400).json({
          success: false,
          message: 'Service ID required'
        });
      }

      const providerId = req.user.userId;
      const files = req.files || [];

      const service = await serviceService.updateService(
        serviceId,
        providerId,
        req.body,
        files
      );

      return res.status(200).json({
        success: true,
        message: 'Service updated successfully',
        data: service
      });

    } catch (error) {

      return res.status(400).json({
        success: false,
        message: error.message
      });

    }
  }


  async deleteService(req, res) {
    try {

      const { serviceId } = req.params;
      const providerId = req.user.userId;

      const result = await serviceService.deleteService(serviceId, providerId);

      return res.status(200).json({
        success: true,
        message: result.message
      });

    } catch (error) {

      return res.status(400).json({
        success: false,
        message: error.message
      });

    }
  }


  // ================= SERVICE LIST =================

  async listServices(req, res) {
    try {

      const filters = {
        category: req.query.category,
        serviceType: req.query.serviceType,
        city: req.query.city,
        searchQuery: req.query.search,
        status: req.query.status || 'active'
      };

      if (req.query.minPrice) filters.minPrice = Number(req.query.minPrice);
      if (req.query.maxPrice) filters.maxPrice = Number(req.query.maxPrice);

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;

      const result = await serviceService.listServices(filters, page, limit);

      return res.status(200).json({
        success: true,
        data: result.services,
        pagination: result.pagination
      });

    } catch (error) {

      return res.status(400).json({
        success: false,
        message: error.message
      });

    }
  }


 async getMyServices(req, res) {
  try {
    const providerId = req.user.userId;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const statusFilter = req.query.status;

    console.log("🔍 Get My Services Debug:");
    console.log("  Provider ID:", providerId);
    console.log("  Status filter:", statusFilter || "all");

    const filters = { providerId };
    
    if (statusFilter) {
      filters.status = statusFilter;
    }

    // ✅ USE serviceService.listServices() instead of Service.find()
    const result = await serviceService.listServices(
      filters,
      page,
      limit
    );

    console.log("  ✅ Found:", result.services.length, "services");

    return res.status(200).json({
      success: true,
      data: result.services,
      pagination: result.pagination
    });

  } catch (error) {
    console.error("❌ Get My Services Error:", error);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

  async searchNearbyServices(req, res) {
    try {

      const { latitude, longitude, radius, category } = req.query;

      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Latitude and longitude are required'
        });
      }

      const services = await serviceService.searchNearbyServices(
        Number(latitude),
        Number(longitude),
        radius ? Number(radius) : 10,
        category
      );

      return res.status(200).json({
        success: true,
        data: services
      });

    } catch (error) {

      return res.status(400).json({
        success: false,
        message: error.message
      });

    }
  }


  // ================= SLOT MANAGEMENT =================

  async createSlot(req, res) {
    try {

      const { serviceId } = req.params;
      const providerId = req.user.userId;

      const slot = await serviceService.createSlot(serviceId, providerId, req.body);

      return res.status(201).json({
        success: true,
        message: 'Slot created successfully',
        data: slot
      });

    } catch (error) {

      return res.status(400).json({
        success: false,
        message: error.message
      });

    }
  }


  async bulkCreateSlots(req, res) {
    try {

      const { serviceId } = req.params;
      const providerId = req.user.userId;

      const { slots } = req.body;

      if (!Array.isArray(slots) || slots.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Slots array is required'
        });
      }

      const createdSlots = await serviceService.bulkCreateSlots(
        serviceId,
        providerId,
        slots
      );

      return res.status(201).json({
        success: true,
        message: `${createdSlots.length} slots created successfully`,
        data: createdSlots
      });

    } catch (error) {

      return res.status(400).json({
        success: false,
        message: error.message
      });

    }
  }


  async getServiceSlots(req, res) {
    try {

      const { serviceId } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'startDate and endDate are required'
        });
      }

      const slots = await serviceService.getServiceSlots(serviceId, startDate, endDate);

      return res.status(200).json({
        success: true,
        data: slots
      });

    } catch (error) {

      return res.status(400).json({
        success: false,
        message: error.message
      });

    }
  }


  async updateSlot(req, res) {
    try {

      const { slotId } = req.params;
      const providerId = req.user.userId;

      const slot = await serviceService.updateSlot(slotId, providerId, req.body);

      return res.status(200).json({
        success: true,
        message: 'Slot updated successfully',
        data: slot
      });

    } catch (error) {

      return res.status(400).json({
        success: false,
        message: error.message
      });

    }
  }


  async deleteSlot(req, res) {
    try {

      const { slotId } = req.params;
      const providerId = req.user.userId;

      const result = await serviceService.deleteSlot(slotId, providerId);

      return res.status(200).json({
        success: true,
        message: result.message
      });

    } catch (error) {

      return res.status(400).json({
        success: false,
        message: error.message
      });

    }
  }


  // ================= ADMIN =================

  async getPendingServices(req, res) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const result = await serviceService.getPendingServices(page, limit);

    return res.status(200).json({
      success: true,
      message: "Pending services fetched successfully",
      data: result.services,
      pagination: result.pagination
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}


  async approveService(req, res) {
    try {

      const { serviceId } = req.params;

      const service = await serviceService.approveService(
        serviceId,
        req.user.id,
        req.user.name
      );

      return res.status(200).json({
        success: true,
        message: 'Service approved successfully',
        data: service
      });

    } catch (error) {

      return res.status(400).json({
        success: false,
        message: error.message
      });

    }
  }


  async rejectService(req, res) {
    try {

      const { serviceId } = req.params;
      const { reason, moderationNotes } = req.body;

      if (!reason) {
        return res.status(400).json({
          success: false,
          message: 'Rejection reason is required'
        });
      }

      const service = await serviceService.rejectService(
        serviceId,
        req.user.id,
        reason,
        moderationNotes
      );

      return res.status(200).json({
        success: true,
        message: 'Service rejected',
        data: service
      });

    } catch (error) {

      return res.status(400).json({
        success: false,
        message: error.message
      });

    }
  }


  async suspendService(req, res) {
    try {

      const { serviceId } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({
          success: false,
          message: 'Suspension reason required'
        });
      }

      const service = await serviceService.suspendService(
        serviceId,
        req.user.userId,
        reason
      );

      return res.status(200).json({
        success: true,
        message: 'Service suspended',
        data: service
      });

    } catch (error) {

      return res.status(400).json({
        success: false,
        message: error.message
      });

    }
  }


  // ================= ANALYTICS =================

  async getProviderStats(req, res) {
    try {

      const stats = await serviceService.getProviderStats(req.user.id);

      return res.status(200).json({
        success: true,
        data: stats
      });

    } catch (error) {

      return res.status(400).json({
        success: false,
        message: error.message
      });

    }
  }
  async updateSlot(req, res) {
  try {
    const { slotId } = req.params;

    // 🔥 FIX HERE
    const providerId = req.user.userId;

    const updateData = req.body;

    const updatedSlot = await serviceService.updateSlot(
      slotId,
      providerId,
      updateData
    );

    return res.status(200).json({
      success: true,
      message: "Slot updated successfully",
      data: updatedSlot
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}
}

module.exports = new ServiceController();