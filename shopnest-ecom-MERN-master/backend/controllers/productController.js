const Product = require('../models/Product');
const Review = require('../models/Review');
const cloudinary = require('../config/cloudinary');

const getProducts = async (req, res) => {
  try {
    const {
      keyword,
      category,
      brand,
      minPrice,
      maxPrice,
      ratings,
      inStock,
      sortBy,
      page,
      limit = 8
    } = req.query;

    const query = {};

    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (brand) {
      query.brand = brand;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (ratings) {
      query.ratings = { $gte: Number(ratings) };
    }

    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    let sortOptions = {};
    if (sortBy === 'priceAsc') {
      sortOptions.price = 1;
    } else if (sortBy === 'priceDesc') {
      sortOptions.price = -1;
    } else if (sortBy === 'ratings') {
      sortOptions.ratings = -1;
    } else if (sortBy === 'newest') {
      sortOptions.createdAt = -1;
    } else if (sortBy === 'popularity') {
      sortOptions.numReviews = -1;
    } else {
      sortOptions.createdAt = -1;
    }

    if (!page) {
      // Return raw array for backward compatibility
      const products = await Product.find(query).sort(sortOptions);
      return res.json(products);
    }

    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOptions)
      .limit(Number(limit))
      .skip(Number(limit) * (Number(page) - 1));

    res.json({
      products,
      page: Number(page),
      pages: Math.ceil(count / Number(limit)),
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, brand, stock, tags } = req.body;
    let imageUrl = '';
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      imageUrl = result.secure_url;
    }
    const product = new Product({
      name,
      description,
      price: Number(price),
      category,
      brand: brand || 'Generic',
      stock: Number(stock),
      imageUrl,
      tags: tags ? tags.split(',').map((t) => t.trim()) : []
    });
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, brand, stock, tags } = req.body;
    const product = await Product.findById(req.params.id);
    if (product) {
      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price ? Number(price) : product.price;
      product.category = category || product.category;
      product.brand = brand || product.brand;
      product.stock = stock ? Number(stock) : product.stock;
      if (tags) {
        product.tags = tags.split(',').map((t) => t.trim());
      }

      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path);
        product.imageUrl = result.secure_url;
      }
      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Product Reviews
const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.id }).populate('userId', 'name');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;

    const alreadyReviewed = await Review.findOne({ productId, userId: req.user._id });
    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Product already reviewed by you' });
    }

    const review = await Review.create({
      productId,
      userId: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment
    });

    const reviews = await Review.find({ productId });
    const numReviews = reviews.length;
    const ratings = reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews;

    await Product.findByIdAndUpdate(productId, { ratings, numReviews });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.reviewId);

    if (!review) return res.status(404).json({ message: 'Review not found' });
    
    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to edit this review' });
    }

    review.rating = Number(rating) || review.rating;
    review.comment = comment || review.comment;
    await review.save();

    const reviews = await Review.find({ productId: review.productId });
    const numReviews = reviews.length;
    const ratings = reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews;

    await Product.findByIdAndUpdate(review.productId, { ratings, numReviews });

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProductReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const productId = review.productId;
    await review.deleteOne();

    const reviews = await Review.find({ productId });
    const numReviews = reviews.length;
    const ratings = numReviews > 0 ? (reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews) : 0;

    await Product.findByIdAndUpdate(productId, { ratings, numReviews });

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRelatedProducts = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const related = await Product.find({
      _id: { $ne: product._id },
      $or: [
        { category: product.category },
        { brand: product.brand }
      ]
    }).limit(4);

    res.json(related);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};
