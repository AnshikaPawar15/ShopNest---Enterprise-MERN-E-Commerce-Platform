const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');

// Security packages
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io initialization
const io = socketio(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', process.env.FRONTEND_URL],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  
  socket.on('joinRoom', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

app.set('socketio', io);

// Security Middlewares
app.use(helmet());
app.use(cookieParser());

// Custom MongoDB Injection Protection (Express 5 compatible)
app.use((req, res, next) => {
  const sanitize = (obj) => {
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (key.startsWith('$')) {
          delete obj[key];
        } else {
          sanitize(obj[key]);
        }
      }
    }
  };
  sanitize(req.body);
  sanitize(req.params);
  if (req.query) {
    for (const key in req.query) {
      if (key.startsWith('$')) {
        delete req.query[key];
      } else if (typeof req.query[key] === 'object') {
        sanitize(req.query[key]);
      }
    }
  }
  next();
});

// Custom XSS Sanitizer Middleware (Express 5 compatible)
app.use((req, res, next) => {
  const clean = (obj) => {
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = obj[key].replace(/<[^>]*>/g, ''); // Strip HTML tags
        } else if (typeof obj[key] === 'object') {
          clean(obj[key]);
        }
      }
    }
  };
  clean(req.body);
  clean(req.params);
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].replace(/<[^>]*>/g, '');
      } else if (typeof req.query[key] === 'object') {
        clean(req.query[key]);
      }
    }
  }
  next();
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per window
  message: { message: 'Too many requests, please try again later.' }
});
app.use('/api/', apiLimiter);

// Set CORS for frontend URL / allow single-node deploy
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', process.env.FRONTEND_URL],
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/coupons', require('./routes/couponRoutes'));

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.use((req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/build/index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('ShopNest API is running in Development mode...');
  });
}

// Global Centralized Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
