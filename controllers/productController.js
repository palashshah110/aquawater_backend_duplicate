const Product = require('../models/Product.js');
const { deleteImage } = require('../config/cloudinary.js');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
// Parse JSON array safely

const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      minPrice,
      maxPrice,
      sort,
      search,
      featured,
      active,
      admin,
    } = req.query;

    // Build query
    const query = {};

    if (category) {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    if (active !== 'false') {
      query.isActive = true;
    }
    if (admin === 'true') {
      delete query.isActive;
      delete query.isFeatured;
    }

    // Build sort
    let sortOption = { createdAt: -1 };
    if (sort === 'price-low') sortOption = { price: 1 };
    if (sort === 'price-high') sortOption = { price: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };
    if (sort === 'reviews') sortOption = { reviews: -1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const products = await Product.find(query)
      .sort(sortOption)
      .populate('category')
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message,
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message,
    });
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      price,
      discountPrice,
      description,
      shortDescription,
      features,
      specs,
      stock,
      sku,
      isFeatured,
      tags,
    } = req.body;

    // Images
    const images = req.files
      ? req.files.map((file) => ({
          url: file.path,
          publicId: file.filename,
        }))
      : [];

    // Helper to safely parse JSON fields
    const safeJsonParse = (value, fallback) => {
      if (!value) return fallback;
      if (Array.isArray(value)) return value;
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : fallback;
      } catch {
        return value
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean);
      }
    };

    const parsedFeatures = safeJsonParse(features, []);
    const parsedTags = safeJsonParse(tags, []);

    // Parse specs (object)
    let parsedSpecs = specs;
    if (typeof specs === "string") {
      try {
        parsedSpecs = JSON.parse(specs);
      } catch (e) {
        parsedSpecs = {};
      }
    }

    const product = await Product.create({
      name,
      category,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      images,
      description,
      shortDescription,
      features: parsedFeatures,
      specs: parsedSpecs,
      stock: Number(stock) || 0,
      sku,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      tags: parsedTags,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    if (req.files) {
      for (const file of req.files) {
        await deleteImage(file.filename);
      }
    }

    res.status(500).json({
      success: false,
      message: "Error creating product",
      error: error.message,
    });
  }
};


// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const {
      name,
      category,
      price,
      discountPrice,
      description,
      shortDescription,
      features,
      specs,
      stock,
      sku,
      isActive,
      isFeatured,
      tags,
      removeImages,
    } = req.body;

    // ---------- Helper: parse JSON arrays safely ----------
    const safeJsonArray = (value, fallback = []) => {
      if (!value) return fallback;
      if (Array.isArray(value)) return value; // already an array
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : fallback;
      } catch {
        return value.split(",").map((v) => v.trim()).filter(Boolean);
      }
    };

    // ---------- Helper: parse JSON object safely ----------
    const safeJsonObject = (value, fallback = {}) => {
      if (!value) return fallback;
      if (typeof value === "object") return value;
      try {
        return JSON.parse(value);
      } catch {
        return fallback;
      }
    };

    // ---------- Remove Images ----------
    if (removeImages) {
      const arr = Array.isArray(removeImages) ? removeImages : [removeImages];
      for (const publicId of arr) {
        await deleteImage(publicId);
        product.images = product.images.filter((img) => img.publicId !== publicId);
      }
    }

    // ---------- Add New Images ----------
    if (req.files?.length) {
      const newImages = req.files.map((file) => ({
        url: file.path,
        publicId: file.filename,
      }));
      product.images.push(...newImages);
    }

    // ---------- Update Fields ----------
    if (name) product.name = name;
    if (category) product.category = category;
    if (price !== undefined) product.price = Number(price);
    if (discountPrice !== undefined)
      product.discountPrice = discountPrice ? Number(discountPrice) : undefined;
    if (description !== undefined) product.description = description;
    if (shortDescription !== undefined) product.shortDescription = shortDescription;

    // Features fix
    if (features !== undefined) {
      product.features = safeJsonArray(features);
    }

    // Specs fix
    if (specs !== undefined) {
      product.specs = safeJsonObject(specs);
    }

    if (stock !== undefined) product.stock = Number(stock);
    if (sku !== undefined) product.sku = sku;

    if (isActive !== undefined)
      product.isActive = isActive === "true" || isActive === true;

    if (isFeatured !== undefined)
      product.isFeatured = isFeatured === "true" || isFeatured === true;

    // Tags fix
    if (tags !== undefined) {
      product.tags = safeJsonArray(tags);
    }

    await product.save();

    res.json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating product",
      error: error.message,
    });
  }
};


// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Delete images from Cloudinary
    for (const image of product.images) {
      await deleteImage(image.publicId);
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message,
    });
  }
};

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message,
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
};
