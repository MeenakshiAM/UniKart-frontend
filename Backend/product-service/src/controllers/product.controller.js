const productService = require("../services/product.service");
const {
  createProduct,
  getMyProducts,
  getAllActiveProducts,
  getProductsBySellerId,
  getProductById,
  updateProduct,
  deleteProduct,
  hideProduct,
  unhideProduct,
  getMyDrafts,
  getDraftById,
  getMyRejectedProducts,
  getMyHiddenProducts,
  getMyOutOfStock,
  resubmitProductService, // <--- add this
  reduceProductStock, // adjust names if needed
  restoreProductStock,
  adminHideProduct,
  approveProduct,
  rejectProduct
} = require("../services/product.service");
// Create Product
exports.createProduct = async (req, res) => {
  try {
//console.log("hey im inside the catch error of contoller 111 !!")
    const sellerId = req.user?.userId || req.body.userId;

    const images = req.files
      ? req.files.map(file =>({
      url: file.path,
      public_id: file.filename
    }))
  : [];
//console.log("hey im inside the catch error of contoller !!")
    const productData = {
      ...req.body,
      images
    };
    console.log("hey im gonna enter the service  !!")
    const result = await productService.createProductService(productData, sellerId);
    console.log("hey outside the service  !!")
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: result.product
    });

  } catch (error) {
    console.log("hey im inside the catch error of contoller !!")
    console.error("CREATE PRODUCT ERROR:");
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// Get single product by ID - Public
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductByIdService(id);

    res.status(200).json({ success: true, product });

  } catch (error) {
    console.log("GET PRODUCT BY ID ERROR:", error.message);
    const status = error.message.includes("Invalid") ? 400
      : error.message.includes("not found") ? 404
      : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

// Seller dashboard - own products
exports.getMyProducts = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    const products = await productService.getMyProductsService(sellerId);

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
   
  } catch (error) {
    console.log("hey im inside the catch error of contoller !!")
    console.log("GET MY PRODUCTS ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Marketplace - Active only with search/filter
exports.getAllActiveProducts = async (req, res) => {
  try {
    const result = await productService.getAllActiveProductsService(req.query);

    res.status(200).json({
      success: true,
      ...result  // gives you products, total, page, totalPages
    });

  } catch (error) {
    console.log("GET ACTIVE PRODUCTS ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
// Public - Seller profile view
exports.getProductsBySellerId = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const products = await productService.getProductsBySellerIdService(sellerId);

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });

  } catch (error) {
    console.log("GET SELLER PRODUCTS ERROR:", error.message);
    const status = error.message.includes("Invalid") ? 400 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

// Update Product
const cloudinary = require("../config/cloudinary");

exports.updateProduct = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    const { id } = req.params;

    // prepare new images if uploaded
    const newImages = req.files
      ? req.files.map(file => ({ url: file.path, public_id: file.filename }))
      : undefined;

    if (newImages) {
      // fetch old product to delete images
      const oldProduct = await productService.getProductByIdService(id);

      if (oldProduct.images && oldProduct.images.length > 0) {
        for (const img of oldProduct.images) {
          await cloudinary.uploader.destroy(img.public_id);
        }
      }
    }

    const updatedProductData = {
      ...req.body,
      ...(newImages && { images: newImages })
    };

    const updatedProduct = await productService.updateProductService(
      id,
      sellerId,
      updatedProductData
    );

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct
    });

  } catch (error) {
    console.log("UPDATE PRODUCT ERROR:", error.message);
    const status = error.message.includes("not found") ? 404
      : error.message.includes("rejected") ? 400
      : error.message.includes("Invalid") ? 400
      : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

// Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    const { id } = req.params;

    // fetch product to delete images
    const product = await productService.getProductByIdService(id);
    if (product.images && product.images.length > 0) {
      for (const img of product.images) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    }

    await productService.deleteProductService(id, sellerId);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    });

  } catch (error) {
    console.log("DELETE PRODUCT ERROR:", error.message);
    const status = error.message.includes("Invalid") ? 400
      : error.message.includes("not found") ? 404
      : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};
// Hide Product
exports.hideProduct = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    const { id } = req.params;
    const product = await productService.hideProductService(id, sellerId);

    res.status(200).json({
      success: true,
      message: "Product hidden",
      product
    });

  } catch (error) {
    console.log("HIDE PRODUCT ERROR:", error.message);
    const status = error.message.includes("Invalid") ? 400
      : error.message.includes("not found") ? 404
      : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

// Unhide Product
exports.unhideProduct = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    const { id } = req.params;
    const product = await productService.unhideProductService(id, sellerId);

    res.status(200).json({
      success: true,
      message: "Product is now active",
      product
    });

  } catch (error) {
    console.log("UNHIDE PRODUCT ERROR:", error.message);
    const status = error.message.includes("Invalid") ? 400
      : error.message.includes("not found") ? 404
      : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

// Get my drafts
exports.getMyDrafts = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    const products = await productService.getMyDraftsService(sellerId);

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });

  } catch (error) {
    console.log("GET MY DRAFTS ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get draft by ID
exports.getDraftById = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    const { id } = req.params;
    const product = await productService.getDraftByIdService(id, sellerId);

    res.status(200).json({ success: true, product });

  } catch (error) {
    console.log("GET DRAFT BY ID ERROR:", error.message);
    const status = error.message.includes("Invalid") ? 400
      : error.message.includes("not found") ? 404
      : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

// Get my rejected products
exports.getMyRejectedProducts = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    const products = await productService.getMyRejectedProductsService(sellerId);

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });

  } catch (error) {
    console.log("GET REJECTED PRODUCTS ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get my hidden products
exports.getMyHiddenProducts = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    const products = await productService.getMyHiddenProductsService(sellerId);

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });

  } catch (error) {
    console.log("GET HIDDEN PRODUCTS ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.resubmitProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const sellerId = req.user._id;

    const product = await resubmitProductService(id, sellerId, updateData);

    res.status(200).json({
      success: true,
      message: "Product resubmitted for admin approval",
      product
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};
// Reduce stock - called internally by order service
exports.reduceStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const product = await productService.reduceProductStock(id, quantity);

    res.status(200).json({
      success: true,
      message: "Stock updated",
      remainingStock: product.quantity
    });

  } catch (error) {
    console.log("REDUCE STOCK ERROR:", error.message);
    const status = error.message.includes("Invalid") ? 400
      : error.message.includes("not found") ? 404
      : error.message.includes("Insufficient") ? 400
      : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

// Restore stock - called internally when order is cancelled
exports.restoreStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const product = await productService.restoreProductStock(id, quantity);

    res.status(200).json({
      success: true,
      message: "Stock restored",
      remainingStock: product.quantity
    });

  } catch (error) {
    console.log("RESTORE STOCK ERROR:", error.message);
    const status = error.message.includes("Invalid") ? 400
      : error.message.includes("not found") ? 404
      : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

// Admin hide — called internally by report automation
exports.adminHideProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productService.adminHideProductService(id);

    res.status(200).json({
      success: true,
      message: "Product hidden by admin",
      product
    });

  } catch (error) {
    console.log("ADMIN HIDE ERROR:", error.message);
    const status = error.message.includes("not found") ? 404 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

// Get my out of stock products
exports.getMyOutOfStock = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    const products = await productService.getMyOutOfStockService(sellerId);

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });

  } catch (error) {
    console.log("GET OUT OF STOCK ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
exports.getProductByIdForSellerService = async (productId, sellerId) => {

  validateObjectId(productId, "product ID");

  const product = await Product.findOne({
    _id: productId,
    sellerId
  });

  if (!product) {
    throw new Error("Product not found or unauthorized");
  }

  return product;
};


// ─── Approve product ───────────────────────────────
exports.approveProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productService.approveProductService(id);
    res.status(200).json({
      success: true,
      message: "Product approved successfully",
      product
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── Reject product ───────────────────────────────
exports.rejectProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const product = await productService.rejectProductService(id, reason);
    res.status(200).json({
      success: true,
      message: "Product rejected successfully",
      product
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};