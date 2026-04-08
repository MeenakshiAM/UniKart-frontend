const User = require("../models/user.model");

exports.createUser = async (userData) => {
  const user = new User(userData);
  return await user.save();
};

exports.findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

exports.getAllUsers = async () => {
  return await User.find();
};
exports.getUserById = async (userId) => {
    return await User.findById(userId);
};

exports.updateUserById = async (userId, updateData) => {
  return await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true } // return updated document
  );
};
// ✅ ADD THIS FUNCTION
exports.findUserByVerificationToken = (token) => {
  return User.findOne({
    emailVerificationToken: token
  });
};
