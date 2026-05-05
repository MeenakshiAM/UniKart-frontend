const productService = require("../services/product.service");
const cloudinary = require("../config/cloudinary");

// ===============================
// CREATE PRODUCT
// ===============================
exports.createProduct = async (req, res) => {
  try {
    const sellerId = req.user?.userId || req.body.userId;

    const images = req.files
      ? req.files.map(file => ({
          url: file.path,
          public_id: file.filename,
        }))
      : [];

    const productData = {
      ...req.body,
      images,
    };

    const result = await productService.createProductService(
      productData,
      sellerId
    );

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: result.product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// GET SINGLE PRODUCT
// ===============================
exports.getProductById = async (req, res) => {
  try {
    const product = await productService.getProductByIdService(req.params.id);

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// GET PRODUCT BY SELLER (PUBLIC)
// ===============================
exports.getProductsBySellerId = async (req, res) => {
  try {
    const products = await productService.getProductsBySellerIdService(
      req.params.sellerId
    );

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// GET MY PRODUCTS
// ===============================
exports.getMyProducts = async (req, res) => {
  try {
    const products = await productService.getMyProductsService(req.user.userId);

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// GET ACTIVE PRODUCTS
// ===============================
exports.getAllActiveProducts = async (req, res) => {
  try {
    const result = await productService.getAllActiveProductsService(req.query);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// UPDATE PRODUCT
// ===============================
exports.updateProduct = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    const { id } = req.params;

    const newImages = req.files
      ? req.files.map(file => ({
          url: file.path,
          public_id: file.filename,
        }))
      : undefined;

    if (newImages) {
      const oldProduct = await productService.getProductByIdService(id);

      if (oldProduct.images?.length) {
        for (const img of oldProduct.images) {
          await cloudinary.uploader.destroy(img.public_id);
        }
      }
    }

    const updatedData = {
      ...req.body,
      ...(newImages && { images: newImages }),
    };

    const updatedProduct = await productService.updateProductService(
      id,
      sellerId,
      updatedData
    );

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// DELETE PRODUCT
// ===============================
exports.deleteProduct = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    const { id } = req.params;

    const product = await productService.getProductByIdService(id);

    if (product.images?.length) {
      for (const img of product.images) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    }

    await productService.deleteProductService(id, sellerId);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// HIDE / UNHIDE
// ===============================
exports.hideProduct = async (req, res) => {
  try {
    const product = await productService.hideProductService(
      req.params.id,
      req.user.userId
    );

    res.json({ success: true, product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.unhideProduct = async (req, res) => {
  try {
    const product = await productService.unhideProductService(
      req.params.id,
      req.user.userId
    );

    res.json({ success: true, product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ===============================
// DRAFTS
// ===============================
exports.getMyDrafts = async (req, res) => {
  try {
    const products = await productService.getMyDraftsService(req.user.userId);

    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDraftById = async (req, res) => {
  try {
    const product = await productService.getDraftByIdService(
      req.params.id,
      req.user.userId
    );

    res.json({ success: true, product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ===============================
// REJECTED / HIDDEN / OUT OF STOCK
// ===============================
exports.getMyRejectedProducts = async (req, res) => {
  try {
    const products = await productService.getMyRejectedProductsService(
      req.user.userId
    );

    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

exports.getMyHiddenProducts = async (req, res) => {
  try {
    const products = await productService.getMyHiddenProductsService(
      req.user.userId
    );

    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

exports.getMyOutOfStock = async (req, res) => {
  try {
    const products = await productService.getMyOutOfStockService(
      req.user.userId
    );

    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// ===============================
// RESUBMIT
// ===============================
exports.resubmitProduct = async (req, res) => {
  try {
    const product = await productService.resubmitProductService(
      req.params.id,
      req.user.userId,
      req.body
    );

    res.json({
      success: true,
      message: "Product resubmitted successfully",
      product,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ===============================
// STOCK
// ===============================
exports.reduceStock = async (req, res) => {
  try {
    const product = await productService.reduceProductStock(
      req.params.id,
      req.body.quantity
    );

    res.json({
      success: true,
      remainingStock: product.quantity,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.restoreStock = async (req, res) => {
  try {
    const product = await productService.restoreProductStock(
      req.params.id,
      req.body.quantity
    );

    res.json({
      success: true,
      remainingStock: product.quantity,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ===============================
// ADMIN HIDE
// ===============================
exports.adminHideProduct = async (req, res) => {
  try {
    const product = await productService.adminHideProductService(req.params.id);

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ===============================
// ADMIN APPROVE / REJECT
// ===============================
exports.approveProduct = async (req, res) => {
  try {
    const product = await productService.approveProductService(req.params.id);

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.rejectProduct = async (req, res) => {
  try {
    const product = await productService.rejectProductService(
      req.params.id,
      req.body.reason
    );

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ===============================
// ADMIN LISTS
// ===============================
exports.getPendingProducts = async (req, res) => {
  try {
    const products = await productService.getPendingProductsService();

    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRejectedProducts = async (req, res) => {
  try {
    const products = await productService.getRejectedProductsService();

    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyPendingProducts = async (req, res) => {
  try {
    const products = await productService.getMyPendingProducts(req.user.userId);

    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};