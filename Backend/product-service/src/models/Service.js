const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  // Basic Info
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },

  description: {
    type: String,
    required: true,
    maxlength: 2000
  },

  category: {
    type: String,
    required: true,
    enum: [
      'tuition',
      'saree_draping',
      'mehandi',
      'hairstyling',
      'threading_plucking',
      'designing',
      'freelancing',
      'photography',
      'event_planning',
      'online_classes',
      'consulting',
      'other'
    ]
  },

  subCategory: {
    type: String,
    trim: true
  },

  // Provider Info (from User Service)
  providerId: {
    type: String,
    required: true,
    index: true
  },

  // Service Type
  serviceType: {
    type: String,
    enum: ['in_person', 'online', 'both'],
    required: true
  },

  location: {
  venue: {
    type: String, 
    trim: true
  },
  building: {
    type: String,
    trim: true
  },
  room: {
    type: String,
    trim: true
  }
},

  // Pricing
  pricing: {
    basePrice: {
      type: Number,
      required: true,
      min: 0
    },

    currency: {
      type: String,
      default: 'INR'
    },

    pricingType: {
      type: String,
      enum: ['per_session', 'per_hour', 'per_day', 'fixed', 'custom'],
      required: true
    },

    duration: {
      value: Number,
      unit: {
        type: String,
        enum: ['minutes', 'hours', 'days']
      }
    }
  },

  // Capacity (for group services)
  capacity: {
    enabled: {
      type: Boolean,
      default: false
    },

    maxParticipants: {
      type: Number,
      min: 1,
      default: 1
    }
  },

  // Media
  images: [
    {
      url: String,
      publicId: String,
      isPrimary: Boolean
    }
  ],

  videos: [
    {
      url: String,
      publicId: String
    }
  ],

  // Details revealed AFTER booking
  postBookingDetails: {
    contactLink: String,

    platform: {
      type: String,
      enum: ['whatsapp', 'zoom', 'google_meet', 'telegram', 'custom']
    },

    additionalInstructions: String,

    materialsRequired: [String]
  },

  // Requirements
  requirements: [String],

  prerequisites: [String],

  // Search tags
  tags: [String],

  // Ratings
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },

    count: {
      type: Number,
      default: 0
    }
  },

  // Moderation Status
  status: {
    type: String,
    enum: [
      'draft',
      'pending_approval',
      'active',
      'inactive',
      'rejected',
      'suspended'
    ],
    default: 'pending_approval',
    index: true
  },

  moderationNotes: String,

  rejectionReason: String,

  approvedBy: {
    adminId: String,
    adminName: String,
    approvedAt: Date
  },

  // Booking Rules
  bookingSettings: {
    advanceBookingDays: {
      type: Number,
      default: 30,
      min: 1
    },

    minNoticeHours: {
      type: Number,
      default: 24,
      min: 1
    },

    autoAcceptBooking: {
      type: Boolean,
      default: false
    },

    cancellationPolicy: {
      type: String,
      enum: ['flexible', 'moderate', 'strict'],
      default: 'moderate'
    }
  },

  // Analytics
  views: {
    type: Number,
    default: 0
  },

  totalBookings: {
    type: Number,
    default: 0
  },

  completedBookings: {
    type: Number,
    default: 0
  },

  deletedAt: {
    type: Date,
    default: null
  }

}, {
  timestamps: true
});


// INDEXES

serviceSchema.index({ providerId: 1, status: 1 });
serviceSchema.index({ category: 1, status: 1 });
serviceSchema.index({ 'location.coordinates': '2dsphere' });
serviceSchema.index({ tags: 1 });
serviceSchema.index({ createdAt: -1 });

// Text search
serviceSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text'
});


// Virtual relationship with Slot model
serviceSchema.virtual('slots', {
  ref: 'Slot',
  localField: '_id',
  foreignField: 'serviceId'
});


// METHODS

serviceSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

serviceSchema.methods.updateRatings = function (newRating) {
  const totalRating = this.ratings.average * this.ratings.count;

  this.ratings.count += 1;
  this.ratings.average =
    (totalRating + newRating) / this.ratings.count;

  return this.save();
};

serviceSchema.methods.incrementBooking = function () {
  this.totalBookings += 1;
  return this.save();
};

serviceSchema.methods.softDelete = function () {
  this.deletedAt = new Date();
  this.status = 'inactive';
  return this.save();
};


// STATIC METHODS

serviceSchema.statics.findActiveServices = function (filter = {}) {
  return this.find({
    ...filter,
    status: 'active',
    deletedAt: null
  });
};


module.exports = mongoose.model('Service', serviceSchema);