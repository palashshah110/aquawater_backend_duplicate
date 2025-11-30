const express = require('express');
const router = express.Router();
const {
    getDeliveryCharges,
} = require('../controllers/shiprocketController.js');



// Public routes
router.post("/delivery-charges", getDeliveryCharges);
module.exports = router;
