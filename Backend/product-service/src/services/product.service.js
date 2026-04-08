const axios = require("axios");
const Product = require("../models/Product");
const mongoose = require("mongoose");

// ----helper ..........
const validateObjectId = (id, label = "ID") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(`Invalid ${label}`);
  }
};

// ------ Moderation helper ---------
const moderateText = async (text) => {
  try {
    const response = await axios.post(
      "http://localhost:4003/api/moderation/analyze",
      { text }
    );
    return response.data; // { isAllowed, reason }
  } catch (err) {
    console.error("Moderation service unavailable:", err.message);
    // Throw so Product Service can return proper JSON
    throw new Error(`Moderation service unavailable: ${err.message}`);
  }
};

const moderateImages = async (images = []) => {
  if (!images.length) return { isAllowed: true, results: [] };

  try {
    const response = await axios.post(
      "http://localhost:4003/api/moderation/images",
      { images } // expects array of URLs or local paths handled by Moderation Service
    );
    // response: { isAllowed, results: [...] }
    return response.data;
  } catch (err) {
    console.error("Image moderation failed:", err.message);
    throw new Error(`Image moderation failed: ${err.message}`);
  }
};

exports.createProductService = async (productData, sellerId) => {
  const {
    title,
    description,
    type,
    category,
    subCategory,
    images,
    isDraft
  } = productData;

  const basePrice = Number(productData.basePrice || productData?.price?.basePrice);
  const quantity = productData.quantity ? Number(productData.quantity) : 0;

  if (isNaN(basePrice) || basePrice <= 0) {
    throw new Error("Valid base price is required");
  }

  // 1️⃣ Text moderation
  const { isAllowed: textAllowed, reason: textReason } = await moderateText(`${title} ${description}`);

  // 2️⃣ Image moderation
  const { isAllowed: imagesAllowed, results: imageResults } = await moderateImages(images);

  const finalAllowed = textAllowed && imagesAllowed;
  const moderationReason = finalAllowed ? null : `Text: ${textReason}; Images: ${imageResults.filter(r => !r.isAllowed).map(r => r.imageUrl).join(", ")}`;

  // 3️⃣ Determine status
  let status;
  if (isDraft === "true" || isDraft === true) status = "DRAFT";
  else status = "PENDING_APPROVAL";

  // 4️⃣ Price calculation
  const commissionPercent = 10;
  const finalPrice = basePrice + (basePrice * commissionPercent) / 100;

  // 5️⃣ Create product
  const product = await Product.create({
    title,
    description,
    type,
    category,
    subCategory,
    price: { basePrice, commissionPercent, finalPrice },
    quantity: type === "PRODUCT" ? quantity : undefined,
    images,
    sellerId,
    status,
    moderationReason,
  });

  return { product };
};


// ------- Get by ID ----------
exports.getProductByIdService = async (id) => {
  validateObjectId(id, "product ID");

  const product = await Product.findOne({ _id: id, status: "ACTIVE" });

  if (!product) throw new Error("Product not found");

  return product;
};

// ---------- Get my products (seller) -----------
exports.getMyProductsService = async (sellerId) => {
  const products = await Product.find({ sellerId }).sort({ createdAt: -1 });
  return products;
};



// ─── Get by seller ID (public profile) ─────────────────────
exports.getProductsBySellerIdService = async (sellerId) => {
  validateObjectId(sellerId, "seller ID");

  const products = await Product.find({
    sellerId,
    status: "ACTIVE"
  }).sort({ createdAt: -1 });

  return products;
};

// ─── Update ─────────────────────────────────────────────────
exports.updateProductService = async (productId, sellerId, updateData) => {
  validateObjectId(productId, "product ID");

  const product = await Product.findOne({ _id: productId, sellerId });

  if (!product) throw new Error("Product not found or unauthorized");

  if (updateData.type && updateData.type !== product.type) {
    throw new Error("Product type cannot be changed after creation");
  }

  if (updateData.title || updateData.description) {
    const textToModerate = `
      ${updateData.title || product.title}
      ${updateData.description || product.description}
    `;

    const { isAllowed, reason } = await moderateText(textToModerate);

    if (!isAllowed) {
      product.status = "REJECTED";
      product.moderationReason = reason;
      await product.save();
      throw new Error("Content rejected by moderation");
    }

    product.status = "ACTIVE";
    product.moderationReason = null;
    if (updateData.title) product.title = updateData.title;
    if (updateData.description) product.description = updateData.description;
  }

  if (updateData.price?.basePrice) {
    const commissionPercent = 10;
    const basePrice = updateData.price.basePrice;
    const finalPrice = basePrice + (basePrice * commissionPercent) / 100;
    product.price.basePrice = basePrice;
    product.price.commissionPercent = commissionPercent;
    product.price.finalPrice = finalPrice;
  }

  if (updateData.isDraft === false && product.status === "DRAFT") {
    product.status = "ACTIVE";
  }

  if (updateData.quantity !== undefined) product.quantity = updateData.quantity;
  if (updateData.images) product.images = updateData.images;
  if (updateData.category) product.category = updateData.category;
  if (updateData.subCategory) product.subCategory = updateData.subCategory;

  await product.save();
  return product;
};

// ─── Delete ─────────────────────────────────────────────────
exports.deleteProductService = async (productId, sellerId) => {
  validateObjectId(productId, "product ID");

  const product = await Product.findOneAndDelete({ _id: productId, sellerId });

  if (!product) throw new Error("Product not found or unauthorized");

  return product;
};

// ─── Hide ───────────────────────────────────────────────────
exports.hideProductService = async (productId, sellerId) => {
  validateObjectId(productId, "product ID");

  const product = await Product.findOneAndUpdate(
    { _id: productId, sellerId },
    { status: "HIDDEN" },
    { new: true }
  );

  if (!product) throw new Error("Product not found or unauthorized");

  return product;
};

// ─── Unhide ─────────────────────────────────────────────────
exports.unhideProductService = async (productId, sellerId) => {
  validateObjectId(productId, "product ID");

  const product = await Product.findOneAndUpdate(
    { _id: productId, sellerId, status: "HIDDEN" },
    { status: "ACTIVE" },
    { new: true }
  );

  if (!product) throw new Error("Product not found, unauthorized, or not hidden");

  return product;
};

// ─── Get my drafts ───────────────────────────────────────────
exports.getMyDraftsService = async (sellerId) => {
  const products = await Product.find({
    sellerId,
    status: "DRAFT"
  }).sort({ createdAt: -1 });

  return products;
};

// ─── Get draft by ID ─────────────────────────────────────────
exports.getDraftByIdService = async (productId, sellerId) => {
  validateObjectId(productId, "product ID");

  const product = await Product.findOne({
    _id: productId,
    sellerId,
    status: "DRAFT"
  });

  if (!product) throw new Error("Draft not found or unauthorized");

  return product;
};

// ─── Get my rejected products ────────────────────────────────
exports.getMyRejectedProductsService = async (sellerId) => {
  const products = await Product.find({
    sellerId,
    status: "REJECTED"
  }).sort({ createdAt: -1 });

  return products;
};

// ─── Get my hidden products ──────────────────────────────────
exports.getMyHiddenProductsService = async (sellerId) => {
  const products = await Product.find({
    sellerId,
    status: "HIDDEN"
  }).sort({ createdAt: -1 });

  return products;
};

// ─── Resubmit rejected product ───────────────────────────────
exports.resubmitProductService = async (productId, sellerId, updateData) => {
  validateObjectId(productId, "product ID");

  // Find only REJECTED products of this seller
  const product = await Product.findOne({
    _id: productId,
    sellerId,
    status: "REJECTED"
  });

  if (!product) throw new Error(
    "Product not found or not eligible for resubmission (must be REJECTED)"
  );

  // Must provide updated title or description
  if (!updateData.title && !updateData.description) {
    throw new Error("Provide updated title or description to resubmit");
  }

  const textToModerate = `
    ${updateData.title || product.title}
    ${updateData.description || product.description}
  `;

  const { isAllowed, reason } = await moderateText(textToModerate);

  // If moderation fails, keep REJECTED and update reason
  if (!isAllowed) {
    product.moderationReason = reason;
    await product.save();
    throw new Error(`Resubmission rejected by moderation: ${reason}`);
  }

  // Update fields if provided
  if (updateData.title) product.title = updateData.title;
  if (updateData.description) product.description = updateData.description;
  if (updateData.images) product.images = updateData.images;
  if (updateData.category) product.category = updateData.category;
  if (updateData.subCategory) product.subCategory = updateData.subCategory;
  if (updateData.price?.basePrice) {
    const basePrice = updateData.price.basePrice;
    const commissionPercent = 10;
    product.price.basePrice = basePrice;
    product.price.commissionPercent = commissionPercent;
    product.price.finalPrice = basePrice + (basePrice * commissionPercent) / 100;
  }

  // ✅ Set status to PENDING_APPROVAL for admin
  product.status = "PENDING_APPROVAL";
  product.moderationReason = null;

  await product.save();
  return product;
};
// ─── Get all active with pagination ─────────────────────────
exports.getAllActiveProductsService = async (query) => {
  const {
    category,
    type,
    minPrice,
    maxPrice,
    search,
    sort,
    page = 1,
    limit = 10
  } = query;

  const filter = { status: "ACTIVE" };

  if (category) filter.category = category;
  if (type) filter.type = type;
  if (search) filter.title = { $regex: search, $options: "i" };
  if (minPrice || maxPrice) {
    filter["price.finalPrice"] = {};
    if (minPrice) filter["price.finalPrice"].$gte = Number(minPrice);
    if (maxPrice) filter["price.finalPrice"].$lte = Number(maxPrice);
  }

  // ─── Sorting ────────────────────────────────────────────
  let sortOption = {};
  switch (sort) {
    case "price_low":
      sortOption = { "price.finalPrice": 1 };
      break;
    case "price_high":
      sortOption = { "price.finalPrice": -1 };
      break;
    case "rating":
      sortOption = { averageRating: -1 };
      break;
    case "newest":
    default:
      sortOption = { createdAt: -1 };
      break;
  }

  const total = await Product.countDocuments(filter);

  const products = await Product.find(filter)
    .sort(sortOption)
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  return {
    products,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit))
  };
};

// ─── Reduce Stock (called by Order Service) ──────────────────
exports.reduceProductStock = async (productId, quantity) => {
  validateObjectId(productId, "product ID");

  if (!quantity || quantity < 1) {
    throw new Error("Quantity must be at least 1");
  }

  const product = await Product.findById(productId);

  if (!product) throw new Error("Product not found");

  if (product.type === "SERVICE") {
    throw new Error("Stock reduction not applicable for services");
  }

  if (product.quantity < quantity) {
    throw new Error(`Insufficient stock. Available: ${product.quantity}`);
  }

  product.quantity -= quantity;

  // auto hide if stock hits 0
  if (product.quantity === 0) {
    product.status = "OUT_OF_STOCK";
  }

  await product.save();
  return product;
};

// ─── Restore Stock (if order is cancelled) ───────────────────
exports.restoreProductStock = async (productId, quantity) => {
  validateObjectId(productId, "product ID");

  const product = await Product.findById(productId);

  if (!product) throw new Error("Product not found");

  if (product.type === "SERVICE") return; // services don't have stock

  product.quantity += quantity;

  // if it was out of stock, make it active again
  if (product.status === "OUT_OF_STOCK") {
    product.status = "ACTIVE";
  }

  await product.save();
  return product;
};

// ─── Admin hide (called by report service) ───────────────────
exports.adminHideProductService = async (productId) => {
  validateObjectId(productId, "product ID");

  const product = await Product.findByIdAndUpdate(
    productId,
    { status: "HIDDEN", hiddenBy: "ADMIN" },
    { new: true }
  );

  if (!product) throw new Error("Product not found");
  return product;
};

// ─── Get my out of stock ─────────────────────────────────────
exports.getMyOutOfStockService = async (sellerId) => {
  const products = await Product.find({
    sellerId,
    status: "OUT_OF_STOCK"
  }).sort({ createdAt: -1 });

  return products;
};
// Approve product
exports.approveProductService = async (productId) => {
  validateObjectId(productId, "product ID");

  const product = await Product.findById(productId);
  if (!product) throw new Error("Product not found");

  if (product.status !== "PENDING_APPROVAL")
    throw new Error("Only pending products can be approved");

  product.status = "ACTIVE";
  await product.save();

  return product;
};

// Reject product
exports.rejectProductService = async (productId, reason) => {
  validateObjectId(productId, "product ID");

  const product = await Product.findById(productId);
  if (!product) throw new Error("Product not found");

  if (product.status !== "PENDING_APPROVAL")
    throw new Error("Only pending products can be rejected");

  product.status = "REJECTED";
  product.moderationReason = reason || "Rejected by admin";
  await product.save();

  return product;
};