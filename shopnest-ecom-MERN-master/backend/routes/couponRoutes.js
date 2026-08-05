const express = require('express');
const { validateCoupon, getCoupons, createCoupon, deleteCoupon } = require('../controllers/couponController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const router = express.Router();

router.post('/validate', protect, validateCoupon);
router.route('/')
  .get(protect, admin, getCoupons)
  .post(protect, admin, createCoupon);

router.route('/:id')
  .delete(protect, admin, deleteCoupon);

module.exports = router;
