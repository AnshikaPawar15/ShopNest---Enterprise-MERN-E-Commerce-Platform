const express = require('express');
const {
  addOrderItems,
  getMyOrders,
  getOrderById,
  getOrders,
  updateOrderStatus,
  cancelOrder,
  requestReturn
} = require('../controllers/orderController');
const { getInvoice } = require('../controllers/invoiceController');
const { protect } = require('../middleware/authMiddleware');
const { admin, authorizeRoles } = require('../middleware/adminMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, addOrderItems)
  .get(protect, authorizeRoles('admin', 'manager'), getOrders);

router.route('/myorders')
  .get(protect, getMyOrders);

router.route('/:id/invoice')
  .get(protect, getInvoice);

router.route('/:id')
  .get(protect, getOrderById);

router.route('/:id/cancel')
  .post(protect, cancelOrder);

router.route('/:id/return')
  .post(protect, requestReturn);

router.route('/:id/status')
  .put(protect, authorizeRoles('admin', 'manager'), updateOrderStatus);

module.exports = router;
