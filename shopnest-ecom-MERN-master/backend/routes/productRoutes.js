const express = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductReviews,
  createProductReview,
  updateProductReview,
  deleteProductReview,
  getRelatedProducts
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, admin, upload.single('image'), createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, admin, upload.single('image'), updateProduct)
  .delete(protect, admin, deleteProduct);

router.route('/:id/related')
  .get(getRelatedProducts);

router.route('/:id/reviews')
  .get(getProductReviews)
  .post(protect, createProductReview);

router.route('/:id/reviews/:reviewId')
  .put(protect, updateProductReview)
  .delete(protect, deleteProductReview);

module.exports = router;
