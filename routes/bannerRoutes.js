const express = require('express');
const router = express.Router();
const {
  getBanners,
  getAllBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  reorderBanners,
} = require('../controllers/bannerController');
const { uploadBannerImage } = require('../config/cloudinary');

// Multer error handler middleware
const handleMulterError = (err, req, res, next) => {
  if (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 10MB',
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  next();
};

// Public routes
router.get('/', getBanners);
router.get('/:id', getBannerById);

// Admin routes (add authentication middleware in production)
router.get('/admin/all', getAllBanners);
router.post('/', uploadBannerImage, handleMulterError, createBanner);
router.put('/reorder', reorderBanners);
router.put('/:id', uploadBannerImage, handleMulterError, updateBanner);
router.delete('/:id', deleteBanner);

module.exports = router;
