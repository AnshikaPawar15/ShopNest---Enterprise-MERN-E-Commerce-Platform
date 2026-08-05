const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

const getAdminStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments({});
    const totalProducts = await Product.countDocuments({});
    const totalUsers = await User.countDocuments({ role: 'user' });

    const orders = await Order.find({}).populate('items.productId');
    const totalRevenue = orders.reduce((acc, item) => acc + item.totalAmount, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter((o) => new Date(o.createdAt) >= today);
    const todaySales = todayOrders.reduce((acc, item) => acc + item.totalAmount, 0);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const monthlyOrders = orders.filter((o) => new Date(o.createdAt) >= thirtyDaysAgo);
    const monthlySales = monthlyOrders.reduce((acc, item) => acc + item.totalAmount, 0);

    // Sales Trend (7 Days)
    const salesTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const nextD = new Date(d);
      nextD.setDate(d.getDate() + 1);

      const dayOrders = orders.filter((o) => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= d && orderDate < nextD;
      });
      const amount = dayOrders.reduce((acc, item) => acc + item.totalAmount, 0);
      salesTrend.push({
        date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        sales: Number(amount.toFixed(2))
      });
    }

    // Category distribution and Top products
    const categoryMap = {};
    const productQuantities = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.productId) {
          const cat = item.productId.category || 'Other';
          categoryMap[cat] = (categoryMap[cat] || 0) + item.qty;

          const prodId = item.productId._id.toString();
          if (!productQuantities[prodId]) {
            productQuantities[prodId] = {
              name: item.productId.name,
              qty: 0,
              revenue: 0
            };
          }
          productQuantities[prodId].qty += item.qty;
          productQuantities[prodId].revenue += item.qty * item.price;
        }
      });
    });

    const ordersByCategory = Object.keys(categoryMap).map((cat) => ({
      category: cat,
      count: categoryMap[cat]
    }));

    const topProducts = Object.values(productQuantities)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    // Inventory metrics
    const lowStockItems = await Product.find({ stock: { $lt: 5 } });
    const outOfStockCount = await Product.countDocuments({ stock: 0 });

    res.json({
      totalOrders,
      totalProducts,
      totalUsers,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      todaySales: Number(todaySales.toFixed(2)),
      monthlySales: Number(monthlySales.toFixed(2)),
      salesTrend,
      ordersByCategory,
      topProducts,
      lowStockItems,
      outOfStockCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAdminStats };
