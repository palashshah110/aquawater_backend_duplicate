const express = require('express');
const router = express.Router();
const { uploadArticleImage } = require('../config/cloudinary.js');
const {
  getArticles,
  getAllArticlesAdmin,
  getArticleById,
  getArticleCategories,
  getArticleTags,
  createArticle,
  updateArticle,
  deleteArticle,
  getRelatedArticles,
} = require('../controllers/articleController.js');
console.log('🚀 ARTICLES ROUTER FILE LOADED');

/* =========================
   ADMIN ROUTES (FIRST)
========================= */
router.get('/admin/all', getAllArticlesAdmin);

/* =========================
   STATIC ROUTES
========================= */
router.get('/categories', getArticleCategories);
router.get('/tags', getArticleTags);

/* =========================
   CRUD ROUTES
========================= */
router.post('/', uploadArticleImage, createArticle);
router.put('/:id', uploadArticleImage, updateArticle);
router.delete('/:id', deleteArticle);

/* =========================
   RELATED (MORE SPECIFIC)
========================= */
router.get('/:id/related', getRelatedArticles);

/* =========================
   GENERIC (LAST)
========================= */
router.get('/:idOrSlug', getArticleById);
router.get('/', getArticles);

module.exports = router;
