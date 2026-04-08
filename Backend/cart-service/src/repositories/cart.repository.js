const Cart = require("../models/cart.model");

exports.findByUserId = (userId) => {
  return Cart.findOne({ userId });
};

exports.createCart = (data) => {
  return Cart.create(data);
};

exports.saveCart = (cart) => {
  return cart.save();
};