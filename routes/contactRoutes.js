const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { sendContactEmail } = require('../controllers/contactController.js');
const { handleValidationErrors } = require('../middlewares/validate.js');

// Validation rules for contact form
const validateContact = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('phone')
    .optional()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit Indian phone number'),
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ max: 200 })
    .withMessage('Subject must be less than 200 characters'),
  handleValidationErrors,
];

// POST /api/contact - Send contact form email
router.post('/', validateContact, sendContactEmail);

module.exports = router;
