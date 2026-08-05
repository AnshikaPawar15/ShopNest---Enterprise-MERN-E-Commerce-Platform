const PDFDocument = require('pdfkit');
const Order = require('../models/Order');

const getInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.productId', 'name price')
      .populate('userId', 'name email');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(401).json({ message: 'Not authorized to download this invoice' });
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice_${order._id}.pdf`);

    doc.pipe(res);

    // Title / Logo Block
    doc.fillColor('#f97316').fontSize(24).text('SHOPNEST', 50, 45);
    doc.fontSize(10).fillColor('#777777').text('Full-Stack MERN E-Commerce App', 50, 75);

    doc.fillColor('#333333').fontSize(10).text(`Invoice Date: ${new Date(order.createdAt).toLocaleDateString()}`, { align: 'right' });
    doc.text(`Order ID: ${order._id}`, { align: 'right' });
    doc.text(`Payment: ${order.paymentMethod}`, { align: 'right' });
    doc.moveDown();

    // Horizontal Separator
    doc.moveTo(50, 110).lineTo(550, 110).strokeColor('#e4e4e7').stroke();

    // Billing Block
    doc.moveDown(2);
    doc.fontSize(12).fillColor('#18181b').text('Billed To:', { underline: true });
    doc.fontSize(10).fillColor('#3f3f46').text(`Name: ${order.address.fullName}`);
    doc.text(`Email: ${order.userId.email}`);
    doc.text(`Shipping Address: ${order.address.street}, ${order.address.city}, ${order.address.postalCode}, ${order.address.country}`);
    
    // Items Table
    doc.moveDown(2);
    doc.fontSize(12).fillColor('#f97316').text('Items Purchased', { underline: true });
    doc.moveDown(0.5);

    let y = doc.y;
    doc.fillColor('#18181b').fontSize(10);
    doc.text('Product Name', 50, y);
    doc.text('Qty', 350, y, { width: 40, align: 'right' });
    doc.text('Price', 400, y, { width: 60, align: 'right' });
    doc.text('Total', 470, y, { width: 70, align: 'right' });
    
    doc.moveTo(50, y + 15).lineTo(540, y + 15).strokeColor('#e4e4e7').stroke();
    doc.moveDown(1);

    order.items.forEach((item) => {
      y = doc.y;
      const name = item.productId ? item.productId.name : 'Product details unavailable';
      doc.text(name, 50, y, { width: 290 });
      doc.text(item.qty.toString(), 350, y, { width: 40, align: 'right' });
      doc.text(`$${item.price.toFixed(2)}`, 400, y, { width: 60, align: 'right' });
      doc.text(`$${(item.qty * item.price).toFixed(2)}`, 470, y, { width: 70, align: 'right' });
      doc.moveDown(0.8);
    });

    y = doc.y + 10;
    doc.moveTo(50, y).lineTo(540, y).strokeColor('#e4e4e7').stroke();
    doc.moveDown(1);

    // Computations
    const subtotal = order.items.reduce((acc, item) => acc + item.qty * item.price, 0);
    doc.fillColor('#3f3f46');
    doc.text(`Subtotal: $${subtotal.toFixed(2)}`, { align: 'right' });
    if (order.discount > 0) {
      doc.text(`Discount: -$${order.discount.toFixed(2)}`, { align: 'right' });
    }
    if (order.tax > 0) {
      doc.text(`Tax (18%): $${order.tax.toFixed(2)}`, { align: 'right' });
    }
    if (order.shipping > 0) {
      doc.text(`Shipping Charges: $${order.shipping.toFixed(2)}`, { align: 'right' });
    }
    
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#f97316').text(`Grand Total: $${order.totalAmount.toFixed(2)}`, { align: 'right' });

    doc.moveDown(3);
    doc.fontSize(9).fillColor('#a1a1aa').text('This is a computer-generated invoice and requires no physical signature.', { align: 'center' });
    doc.text('Thank you for shopping at ShopNest!', { align: 'center' });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getInvoice };
