const Razorpay = require('razorpay');
const { RAZORPAY } = require('./environment');

const razorpay = new Razorpay({
  key_id: RAZORPAY.KEY_ID,
  key_secret: RAZORPAY.KEY_SECRET,
});

module.exports = razorpay;
