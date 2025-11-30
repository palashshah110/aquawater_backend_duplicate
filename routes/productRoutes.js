const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} = require('../controllers/productController');
const { uploadProductImages } = require('../config/cloudinary');
const authenticateToken = require('../middlewares/authenticateToken');
// Wrapper to handle multer errors properly
const handleProductUpload = (req, res, next) => {
  uploadProductImages(req, res, function (err) {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File size too large. Max 50MB allowed.",
        });
      }

      if (err.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({
          success: false,
          message: "Too many images uploaded.",
        });
      }

      return res.status(400).json({
        success: false,
        message: err.message || "File upload error",
      });
    }
    next(); // THIS will now be a function
  });
};



// Public routes
router.get('/', authenticateToken, getProducts);
router.get('/categories', authenticateToken, getCategories);
router.get('/slug/:slug', authenticateToken, getProductBySlug);
router.get('/:id', authenticateToken, getProductById);

router.post('/', authenticateToken,handleProductUpload, createProduct);
router.put('/:id', authenticateToken, handleProductUpload, updateProduct);
router.delete('/:id', authenticateToken, deleteProduct);

module.exports = router;
