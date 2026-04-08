const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
  name: { 
    type: String, 
    required: true 
  },

  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true
  },

  password: { 
    type: String, 
    required: true 
  },

  registerNumber: { 
    type: String, 
    required: true,
    unique: true
  }, // college registration

  dateOfBirth: { 
    type: Date 
  },

  department: { 
    type: String 
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String
  },
  isSeller: { 
    type: Boolean, 
    default: false 
  },
  profileImage: {
  type: String
},
  role: {
    type: String,
    enum: ["BUYER", "SELLER", "ADMIN"],
    default: "BUYER"
  },

  // 🚨 Trust / Moderation fields
  violationCount: {
    type: Number,
    default: 0
  },

  suspensionCount: {
    type: Number,
    default: 0
  },

  isSuspended: {
    type: Boolean,
    default: false
  },

  suspensionEnd: {
    type: Date
  },
  

  isBanned: {
    type: Boolean,
    default: false
  }

},
{ timestamps: true }
);

module.exports = mongoose.model("User", userSchema);