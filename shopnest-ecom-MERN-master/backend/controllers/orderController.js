const Order = require('../models/Order');
const Product = require('../models/Product');
const sendEmail = require('../utils/sendEmail');

const addOrderItems = async (req, res) => {
  try {
    const { items, totalAmount, discount, tax, shipping, couponCode, address, paymentMethod, paymentId } = req.body;
    
    if (items && items.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    const order = new Order({
      userId: req.user._id,
      items,
      totalAmount,
      discount: discount || 0,
      tax: tax || 0,
      shipping: shipping || 0,
      couponCode,
      address,
      paymentMethod: paymentMethod || 'Razorpay',
      paymentId
    });

    const createdOrder = await order.save();

    // Reduce stocks
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.qty }
      });
    }

    // Real-time notifications
    const io = req.app.get('socketio');
    if (io) {
      io.emit('adminNotification', {
        title: 'New Order Received',
        message: `Order ID: ${createdOrder._id} was placed by ${req.user.name}.`,
        createdAt: new Date()
      });
      io.to(req.user._id.toString()).emit('notification', {
        title: 'Order Placed Successfully',
        message: `Your order ID ${createdOrder._id} is now being processed.`,
        createdAt: new Date()
      });
    }

    // Send confirmation email
    const message = `
      <h2>Order Confirmation - ShopNest</h2>
      <p>Dear ${req.user.name},</p>
      <p>Your order was successfully placed! Order ID: <strong>${createdOrder._id}</strong></p>
      <p>Subtotal: $${(totalAmount + (discount || 0) - (tax || 0) - (shipping || 0)).toFixed(2)}</p>
      <p>Discount: -$${(discount || 0).toFixed(2)}</p>
      <p>Tax: $${(tax || 0).toFixed(2)}</p>
      <p>Shipping: $${(shipping || 0).toFixed(2)}</p>
      <p><strong>Total Amount: $${totalAmount.toFixed(2)}</strong></p>
      <p>Payment Method: ${paymentMethod || 'Razorpay'}</p>
      <p>Delivery Address: ${address.street}, ${address.city}, ${address.postalCode}</p>
      <br/>
      <p>Thank you for purchasing with ShopNest!</p>
    `;

    try {
      await sendEmail({
        email: req.user.email,
        subject: 'ShopNest - Order Confirmation',
        message
      });
    } catch (err) {
      console.error('Failed to send order email confirmation', err);
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.productId', 'name price imageUrl brand category')
      .populate('userId', 'name email');
      
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(401).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('userId', 'id name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      const oldStatus = order.status;
      order.status = req.body.status || order.status;
      if (req.body.refundStatus) {
        order.refundStatus = req.body.refundStatus;
      }
      const updatedOrder = await order.save();

      // Real-time notification if status changed
      if (oldStatus !== order.status) {
        const io = req.app.get('socketio');
        if (io) {
          io.to(order.userId.toString()).emit('notification', {
            title: `Order Status Update`,
            message: `Your order ID ${order._id} status is now: ${order.status}.`,
            createdAt: new Date()
          });
        }

        // Send status update email
        const message = `
          <h2>Order Status Update - ShopNest</h2>
          <p>Order ID: <strong>${order._id}</strong></p>
          <p>Your order status has been updated to: <strong>${order.status}</strong></p>
          <p>Thank you for choosing ShopNest!</p>
        `;
        try {
          const user = await Product.model('User').findById(order.userId);
          if (user) {
            await sendEmail({
              email: user.email,
              subject: `ShopNest - Order Status: ${order.status}`,
              message
            });
          }
        } catch (err) {
          console.error('Failed to send status update email', err);
        }
      }

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to cancel this order' });
    }

    if (order.status !== 'Placed' && order.status !== 'Confirmed') {
      return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
    }

    order.status = 'Cancelled';
    const updatedOrder = await order.save();

    // Restore stocks
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.qty }
      });
    }

    res.json({ message: 'Order cancelled successfully', order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const requestReturn = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (order.status !== 'Delivered') {
      return res.status(400).json({ message: 'Only delivered orders can be returned' });
    }

    order.status = 'Returned';
    order.refundStatus = 'Requested';
    const updatedOrder = await order.save();

    res.json({ message: 'Return request submitted successfully', order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addOrderItems,
  getMyOrders,
  getOrderById,
  getOrders,
  updateOrderStatus,
  cancelOrder,
  requestReturn
};
