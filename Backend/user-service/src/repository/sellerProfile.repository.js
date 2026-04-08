const SellerProfile = require("../models/sellerProfile.model");

// CREATE
exports.createSellerProfile = async (profileData) => {
  const profile = new SellerProfile(profileData);
  return await profile.save();
};

// READ by userId
exports.getSellerByUserId = async (userId) => {
  return await SellerProfile.findOne({ userId });
};

// get seller by id
exports.getSellerById = (sellerId) => {
  return SellerProfile.findById(sellerId);
};

// UPDATE full seller profile
exports.updateSellerByUserId = async (userId, data) => {
  return await SellerProfile.findOneAndUpdate(
    { userId },
    data,
    { new: true }
  );
};
exports.updateSellerStatus = async (sellerId, status) => {
  return SellerProfile.findByIdAndUpdate(
    sellerId,
    { status },
    { new: true }
  );
};
// READ by sellerId
exports.getSellerById = async (sellerId) => {
  return await SellerProfile.findById(sellerId);
};

// read all the pending sellers to do it 
exports.getPendingSellers = async () => {
  return await SellerProfile.find({ status: "PENDING" });
};