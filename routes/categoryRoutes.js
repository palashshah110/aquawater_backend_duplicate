const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  updateProductsCounts,
} = require('../controllers/categoryController');
const authenticateToken = require('../middlewares/authenticateToken');

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Admin routes (in production, add auth middleware)
router.post('/', authenticateToken, createCategory);
router.put('/reorder', authenticateToken, reorderCategories);
router.put('/update-counts', authenticateToken, updateProductsCounts);
router.put('/:id', authenticateToken, updateCategory);
router.delete('/:id', authenticateToken, deleteCategory);

module.exports = router;
