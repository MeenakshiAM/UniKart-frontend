const axios = require("axios");
const Product = require("../models/Product");
const mongoose = require("mongoose");

// ================= Helper =================
const validateObjectId = (id, label = "ID") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(`Invalid ${label}`);
  }
};

// ================= Moderation =================
const moderateText = async (text) => {
  try {
    const response = await axios.post(
      "http://localhost:4003/api/moderation/analyze",
      { text }
    );
    return response.data;
  } catch (err) {
    return { isAllowed: true, reason: null };
  }
};

const moderateImages = async (images = []) => {
  if (!images.length) return { isAllowed: true, results: [] };

  try {
    const response = await axios.post(
      "http://localhost:4003/api/moderation/images",
      { images }
    );
    return response.data;
  } catch (err) {
    return { isAllowed: true, results: [] };
  }
};

// ================= CREATE =================
exports.createProductService = async (productData, sellerId) => {
  const {
    title,
    description,
    type,
    category,
    subCategory,
    images,
    isDraft,
  } = productData;

  const basePrice = Number(
    productData.basePrice || productData?.price?.basePrice
  );

  const quantity = Number(productData.quantity || 0);

  if (!basePrice || basePrice <= 0) {
    throw new Error("Valid base price is required");
  }

  const moderation = await moderateText(`${title} ${description}`);

  const status =
    isDraft === true || isDraft === "true"
      ? "DRAFT"
      : "PENDING_APPROVAL";

  const commissionPercent = 10;

  const product = await Product.create({
    title,
    description,
    type,
    category,
    subCategory,
    images,
    sellerId,
    status,
    quantity: type === "PRODUCT" ? quantity : undefined,
    moderationReason: moderation.isAllowed ? null : moderation.reason,
    price: {
      basePrice,
      commissionPercent,
      finalPrice: basePrice + (basePrice * commissionPercent) / 100,
    },
  });

  return { product };
};

// ================= GET SINGLE =================
exports.getProductByIdService = async (id) => {
  validateObjectId(id);
  return await Product.findById(id);
};

// ================= MY PRODUCTS =================
exports.getMyProductsService = async (sellerId) => {
  return await Product.find({ sellerId }).sort({ createdAt: -1 });
};

// ================= ACTIVE PRODUCTS =================
exports.getAllActiveProductsService = async (query) => {
  const filter = { status: "ACTIVE" };

  const products = await Product.find(filter);
  return {
    products,
    total: products.length,
    page: 1,
    totalPages: 1,
  };
};

// ================= SELLER PRODUCTS =================
exports.getProductsBySellerIdService = async (sellerId) => {
  validateObjectId(sellerId);

  return await Product.find({
    sellerId,
    status: "ACTIVE",
  });
};

// ================= UPDATE =================
exports.updateProductService = async (productId, sellerId, updateData) => {
  validateObjectId(productId);

  const product = await Product.findOne({
    _id: productId,
    sellerId,
  });

  if (!product) throw new Error("Product not found");

  Object.assign(product, updateData);
  await product.save();

  return product;
};

// ================= DELETE =================
exports.deleteProductService = async (productId, sellerId) => {
  validateObjectId(productId);

  const product = await Product.findOneAndDelete({
    _id: productId,
    sellerId,
  });

  if (!product) throw new Error("Product not found");

  return product;
};

// ================= HIDE / UNHIDE =================
exports.hideProductService = async (id, sellerId) => {
  return await Product.findOneAndUpdate(
    { _id: id, sellerId },
    { status: "HIDDEN" },
    { new: true }
  );
};

exports.unhideProductService = async (id, sellerId) => {
  return await Product.findOneAndUpdate(
    { _id: id, sellerId },
    { status: "ACTIVE" },
    { new: true }
  );
};

// ================= DRAFTS =================
exports.getMyDraftsService = async (sellerId) =>
  Product.find({ sellerId, status: "DRAFT" });

exports.getDraftByIdService = async (id, sellerId) =>
  Product.findOne({ _id: id, sellerId, status: "DRAFT" });

// ================= STATUS LISTS =================
exports.getMyRejectedProductsService = async (sellerId) =>
  Product.find({ sellerId, status: "REJECTED" });

exports.getMyHiddenProductsService = async (sellerId) =>
  Product.find({ sellerId, status: "HIDDEN" });

exports.getMyOutOfStockService = async (sellerId) =>
  Product.find({ sellerId, status: "OUT_OF_STOCK" });

// ================= ⭐ FIXED MISSING FUNCTIONS =================
exports.getMyPendingProducts = async (sellerId) =>
  Product.find({ sellerId, status: "PENDING_APPROVAL" });

exports.getPendingProducts = async () =>
  Product.find({ status: "PENDING_APPROVAL" });

exports.getRejectedProducts = async () =>
  Product.find({ status: "REJECTED" });

// ================= RESUBMIT =================
exports.resubmitProductService = async (id, sellerId, updateData) => {
  const product = await Product.findOne({
    _id: id,
    sellerId,
    status: "REJECTED",
  });

  if (!product) throw new Error("Not eligible");

  Object.assign(product, updateData);
  product.status = "PENDING_APPROVAL";

  await product.save();
  return product;
};

// ================= STOCK =================
exports.reduceProductStock = async (id, qty) => {
  const product = await Product.findById(id);
  if (!product) throw new Error("Not found");

  product.quantity -= qty;
  await product.save();

  return product;
};

exports.restoreProductStock = async (id, qty) => {
  const product = await Product.findById(id);
  if (!product) throw new Error("Not found");

  product.quantity += qty;
  await product.save();

  return product;
};

// ================= ADMIN =================
exports.approveProductService = async (id) => {
  return await Product.findByIdAndUpdate(
    id,
    { status: "ACTIVE" },
    { new: true }
  );
};

exports.rejectProductService = async (id, reason) => {
  return await Product.findByIdAndUpdate(
    id,
    { status: "REJECTED", moderationReason: reason },
    { new: true }
  );
};

exports.adminHideProductService = async (id) => {
  return await Product.findByIdAndUpdate(
    id,
    { status: "HIDDEN" },
    { new: true }
  );
};
exports.getPendingProductsService = async () => {
  return await Product.find({
    status: "PENDING_APPROVAL",
  }).sort({ createdAt: -1 });
};
exports.getRejectedProductsService = async () => {
  return await Product.find({
    status: "REJECTED",
  }).sort({ createdAt: -1 });
};