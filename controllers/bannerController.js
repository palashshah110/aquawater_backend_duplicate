const Banner = require('../models/Banner');
const { deleteImage } = require('../config/cloudinary');

// @desc    Get all active banners
// @route   GET /api/banners
// @access  Public
const getBanners = async (req, res) => {
  try {
    const { active = 'true' } = req.query;

    const query = {};

    if (active === 'true') {
      query.isActive = true;
      // Check date range if set
      const now = new Date();
      query.$or = [
        { startDate: { $exists: false }, endDate: { $exists: false } },
        { startDate: { $lte: now }, endDate: { $exists: false } },
        { startDate: { $exists: false }, endDate: { $gte: now } },
        { startDate: { $lte: now }, endDate: { $gte: now } },
      ];
    }

    const banners = await Banner.find(query).sort({ order: 1 });

    res.json({
      success: true,
      data: banners,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching banners',
      error: error.message,
    });
  }
};

// @desc    Get all banners (admin)
// @route   GET /api/banners/all
// @access  Private/Admin
const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1 });

    res.json({
      success: true,
      data: banners,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching banners',
      error: error.message,
    });
  }
};

// @desc    Get single banner
// @route   GET /api/banners/:id
// @access  Public
const getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found',
      });
    }

    res.json({
      success: true,
      data: banner,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching banner',
      error: error.message,
    });
  }
};

// @desc    Create banner
// @route   POST /api/banners
// @access  Private/Admin
const createBanner = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      description,
      buttonText,
      buttonLink,
      badge,
      order,
      isActive,
      startDate,
      endDate,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Banner image is required',
      });
    }

    const banner = await Banner.create({
      title,
      subtitle,
      description,
      image: {
        url: req.file.path,
        publicId: req.file.filename,
      },
      buttonText,
      buttonLink,
      badge,
      order: Number(order) || 0,
      isActive: isActive === 'true' || isActive === true,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    res.status(201).json({
      success: true,
      message: 'Banner created successfully',
      data: banner,
    });
  } catch (error) {
    // Delete uploaded image if banner creation fails
    if (req.file) {
      await deleteImage(req.file.filename);
    }

    res.status(500).json({
      success: false,
      message: 'Error creating banner',
      error: error.message,
    });
  }
};

// @desc    Update banner
// @route   PUT /api/banners/:id
// @access  Private/Admin
const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found',
      });
    }

    const {
      title,
      subtitle,
      description,
      buttonText,
      buttonLink,
      badge,
      order,
      isActive,
      startDate,
      endDate,
    } = req.body;

    // Handle image update
    if (req.file) {
      // Delete old image
      await deleteImage(banner.image.publicId);

      banner.image = {
        url: req.file.path,
        publicId: req.file.filename,
      };
    }

    // Update fields
    if (title) banner.title = title;
    if (subtitle !== undefined) banner.subtitle = subtitle;
    if (description !== undefined) banner.description = description;
    if (buttonText !== undefined) banner.buttonText = buttonText;
    if (buttonLink !== undefined) banner.buttonLink = buttonLink;
    if (badge !== undefined) banner.badge = badge;
    if (order !== undefined) banner.order = Number(order);
    if (isActive !== undefined) banner.isActive = isActive === 'true' || isActive === true;
    if (startDate !== undefined) {
      banner.startDate = startDate ? new Date(startDate) : undefined;
    }
    if (endDate !== undefined) {
      banner.endDate = endDate ? new Date(endDate) : undefined;
    }

    await banner.save();

    res.json({
      success: true,
      message: 'Banner updated successfully',
      data: banner,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating banner',
      error: error.message,
    });
  }
};

// @desc    Delete banner
// @route   DELETE /api/banners/:id
// @access  Private/Admin
const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found',
      });
    }

    // Delete image from Cloudinary
    await deleteImage(banner.image.publicId);

    await banner.deleteOne();

    res.json({
      success: true,
      message: 'Banner deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting banner',
      error: error.message,
    });
  }
};

// @desc    Reorder banners
// @route   PUT /api/banners/reorder
// @access  Private/Admin
const reorderBanners = async (req, res) => {
  try {
    const { banners } = req.body; // Array of { id, order }

    if (!Array.isArray(banners)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid data format',
      });
    }

    for (const item of banners) {
      await Banner.findByIdAndUpdate(item.id, { order: item.order });
    }

    const updatedBanners = await Banner.find().sort({ order: 1 });

    res.json({
      success: true,
      message: 'Banners reordered successfully',
      data: updatedBanners,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error reordering banners',
      error: error.message,
    });
  }
};

module.exports = {
  getBanners,
  getAllBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  reorderBanners,
};
