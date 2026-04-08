const Joi = require('joi');

const validateCreateOrder = (req, res, next) => {
  const schema = Joi.object({
    orderId: Joi.string().allow('', null).optional(),
    bookingId: Joi.string().allow('', null).optional(),
    type: Joi.string().valid('order', 'booking').default('order'),
    amount: Joi.number().positive().required(),
    currency: Joi.string().default('INR'),
    userId: Joi.string().optional()
  }).unknown(true);

  const { error } = schema.validate(req.body);
  
  if (error) {
    console.log('❌ Validation error:', error.details[0].message);
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  next();
};

const validatePaymentConfirmation = (req, res, next) => {
  const schema = Joi.object({
    razorpayOrderId: Joi.string().required(),
    razorpayPaymentId: Joi.string().required(),
    razorpaySignature: Joi.string().required()
  }).unknown(true);

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  next();
};

module.exports = {
  validateCreateOrder,
  validatePaymentConfirmation
};