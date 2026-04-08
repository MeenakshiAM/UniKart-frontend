require('dotenv').config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT ,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  
  RAZORPAY: {
    KEY_ID: process.env.RAZORPAY_KEY_ID,
    KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET
  }
};
