const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const importData = async () => {
  try {
    await User.deleteMany();
    await Product.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    await User.create({
      name: 'Admin User',
      email: 'admin@shopnest.com',
      password: hashedPassword,
      role: 'admin',
      isVerified: true
    });

    const products = [
      {
        name: 'Wireless Noise-Cancelling Headphones',
        description: 'Immersive sound experience with advanced active noise cancellation.',
        price: 299.99,
        category: 'Electronics',
        brand: 'Sony',
        stock: 15,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.8,
        numReviews: 24,
        tags: ['audio', 'wireless', 'noise-cancelling']
      },
      {
        name: 'Minimalist Modern Chair',
        description: 'A stylish and comfortable addition to any contemporary living room.',
        price: 150.00,
        category: 'Furniture',
        brand: 'Generic',
        stock: 30,
        imageUrl: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.2,
        numReviews: 12,
        tags: ['chair', 'furniture', 'modern']
      },
      {
        name: 'Professional DSLR Camera',
        description: 'Capture stunning moments with high-resolution clarity and speed.',
        price: 1199.99,
        category: 'Electronics',
        brand: 'Canon',
        stock: 8,
        imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.9,
        numReviews: 50,
        tags: ['camera', 'dslr', 'electronics']
      },
      {
        name: 'Classic White Sneakers',
        description: 'Versatile and comfortable, a staple for any casual outfit.',
        price: 85.00,
        category: 'Clothing',
        brand: 'Nike',
        stock: 50,
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.5,
        numReviews: 89,
        tags: ['sneakers', 'nike', 'shoes']
      },
      {
        name: 'Bose SoundLink Bluetooth Speaker',
        description: 'Portable wireless speaker delivering deep, loud, and immersive sound.',
        price: 129.99,
        category: 'Electronics',
        brand: 'Bose',
        stock: 25,
        imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.6,
        numReviews: 32,
        tags: ['audio', 'speaker', 'bose']
      },
      {
        name: 'Ergonomic Mesh Office Chair',
        description: 'High-back desk chair featuring adjustable lumbar support and headrest.',
        price: 249.00,
        category: 'Furniture',
        brand: 'Generic',
        stock: 12,
        imageUrl: 'https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.4,
        numReviews: 18,
        tags: ['chair', 'ergonomic', 'office']
      },
      {
        name: 'Mechanical Gaming Keyboard',
        description: 'RGB backlit mechanical keyboard with tactile switches for precision gaming.',
        price: 99.99,
        category: 'Electronics',
        brand: 'Logitech',
        stock: 20,
        imageUrl: 'https://images.unsplash.com/photo-1618384887929-16ec33faf9c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.7,
        numReviews: 45,
        tags: ['keyboard', 'rgb', 'gaming']
      },
      {
        name: 'Wireless Gaming Mouse',
        description: 'Lightweight high-performance mouse with customizable shortcuts.',
        price: 59.99,
        category: 'Electronics',
        brand: 'Logitech',
        stock: 40,
        imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.3,
        numReviews: 28,
        tags: ['mouse', 'wireless', 'gaming']
      },
      {
        name: 'Smart Fitness Watch',
        description: 'Tracks heart rate, sleep metrics, and athletic activities with GPS.',
        price: 199.99,
        category: 'Electronics',
        brand: 'Sony',
        stock: 15,
        imageUrl: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.5,
        numReviews: 14,
        tags: ['watch', 'smartwatch', 'fitness']
      },
      {
        name: 'Sony WH-1000XM4 Wireless Headphones',
        description: 'Premium over-ear headphones with industry-leading active noise cancellation.',
        price: 348.00,
        category: 'Electronics',
        brand: 'Sony',
        stock: 10,
        imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.8,
        numReviews: 95,
        tags: ['audio', 'wireless', 'headphones']
      },
      {
        name: 'Nike Zoom Running Shoes',
        description: 'High-performance athletic running shoes with ultra-cushioned soles.',
        price: 120.00,
        category: 'Clothing',
        brand: 'Nike',
        stock: 35,
        imageUrl: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.6,
        numReviews: 64,
        tags: ['nike', 'shoes', 'running']
      },
      {
        name: 'Ergonomic Standing Desk',
        description: 'Dual-motor electric height adjustable standing desk with oak wood top.',
        price: 399.00,
        category: 'Furniture',
        brand: 'Generic',
        stock: 6,
        imageUrl: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.5,
        numReviews: 22,
        tags: ['desk', 'standing-desk', 'office']
      },
      {
        name: 'Logitech StreamCam Webcam',
        description: 'Full HD 1080p camera optimized for streaming, meetings, and content creation.',
        price: 169.99,
        category: 'Electronics',
        brand: 'Logitech',
        stock: 18,
        imageUrl: 'https://images.unsplash.com/photo-1600541519468-4a9121c7315a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.4,
        numReviews: 30,
        tags: ['camera', 'webcam', 'logitech']
      },
      {
        name: 'Premium Leather Backpack',
        description: 'Water-resistant luxury travel bag matching executive standard sizing.',
        price: 110.00,
        category: 'Clothing',
        brand: 'Generic',
        stock: 25,
        imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.3,
        numReviews: 19,
        tags: ['bag', 'backpack', 'leather']
      },
      {
        name: 'Bose QuietComfort Earbuds II',
        description: 'True wireless noise cancelling earbuds with custom-tailored sound.',
        price: 279.00,
        category: 'Electronics',
        brand: 'Bose',
        stock: 15,
        imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.7,
        numReviews: 38,
        tags: ['audio', 'earbuds', 'wireless']
      },
      {
        name: 'Casual Denim Jacket',
        description: 'Sturdy classic wash denim jacket with button locks and pockets.',
        price: 95.00,
        category: 'Clothing',
        brand: 'Nike',
        stock: 40,
        imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.2,
        numReviews: 27,
        tags: ['denim', 'jacket', 'clothing']
      },
      {
        name: 'Logitech MX Master 3S Mouse',
        description: 'Ergonomic office productivity mouse featuring ultra-quiet clicks.',
        price: 99.99,
        category: 'Electronics',
        brand: 'Logitech',
        stock: 30,
        imageUrl: 'https://images.unsplash.com/photo-1625805519364-e00c41ac61fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.8,
        numReviews: 70,
        tags: ['mouse', 'ergonomic', 'office']
      },
      {
        name: 'PlayStation 5 Console',
        description: 'Unleash new gaming possibilities with lightning-fast SSD storage.',
        price: 499.99,
        category: 'Electronics',
        brand: 'Sony',
        stock: 5,
        imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.9,
        numReviews: 120,
        tags: ['console', 'gaming', 'sony']
      },
      {
        name: 'Cozy Fabric Sectional Sofa',
        description: 'Large modular sofa set featuring high-density foam padding.',
        price: 799.00,
        category: 'Furniture',
        brand: 'Generic',
        stock: 4,
        imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.3,
        numReviews: 15,
        tags: ['sofa', 'furniture', 'couch']
      }
    ];

    await Product.insertMany(products);
    
    console.log('✅ Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error with data import: ${error.message}`);
    process.exit(1);
  }
};

importData();
