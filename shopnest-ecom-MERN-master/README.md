<p align="center">
  <img src="https://img.shields.io/badge/MERN-Stack-00d2ff?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-LTS-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose_9-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Socket.io-4.8-010101?style=for-the-badge&logo=socket.io&logoColor=white" />
  <img src="https://img.shields.io/badge/License-ISC-blue?style=for-the-badge" />
</p>

# 🛒 ShopNest — Enterprise MERN E-Commerce Platform

A **production-ready, full-stack e-commerce platform** built with the MERN stack (MongoDB, Express 5, React 18, Node.js). ShopNest features enterprise-grade security (JWT rotation, OTP verification, rate limiting), real-time Socket.io notifications, Razorpay payment integration, PDF invoice generation, and a full admin management console with analytics and inventory control.

---

## 📑 Table of Contents

- [✨ Feature Highlights](#-feature-highlights)
- [🛠 Tech Stack](#-tech-stack)
- [📂 Project Structure](#-project-structure)
- [🏗 Architecture Overview](#-architecture-overview)
- [🗄 Database Models](#-database-models)
- [🔌 API Reference](#-api-reference)
- [🔒 Security Architecture](#-security-architecture)
- [🚀 Getting Started](#-getting-started)
- [⚙️ Environment Variables](#️-environment-variables)
- [🌱 Database Seeding](#-database-seeding)
- [🧪 Postman Collection](#-postman-collection)
- [☁️ Deployment](#️-deployment)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Feature Highlights

### 👤 Customer Features
| Feature | Description |
|---|---|
| **OTP Email Verification** | 6-digit OTP sent via NodeMailer on registration; 10-minute expiry window |
| **JWT Token Rotation** | 15-minute access tokens + 7-day refresh tokens stored in HTTP-only cookies |
| **Address Book** | Add, list, and set default delivery addresses from the user profile |
| **Persistent Wishlist** | Save products to a wishlist powered by Redux Toolkit with localStorage persistence |
| **Smart Cart** | Add/remove/update quantities with real-time subtotal calculation; persisted across sessions |
| **Advanced Shop Filters** | Filter by price range, category, brand, rating (>3★, >4★), in-stock toggle, and debounced text search (500ms) |
| **Ratings & Reviews** | Write, edit, and delete product reviews with 1–5 star ratings |
| **Razorpay Payments** | Secure online payments with HMAC SHA-256 signature verification, plus Cash on Delivery option |
| **Order Lifecycle Tracker** | Visual timeline: `Placed → Confirmed → Packed → Shipped → Out for Delivery → Delivered` |
| **Cancel & Return** | Cancel orders in `Placed`/`Confirmed` stages; request returns on `Delivered` orders (stock auto-restored) |
| **PDF Invoice** | Auto-generated PDF receipts via PDFKit with tax (18% GST), shipping, and coupon breakdowns |
| **Real-Time Notifications** | Socket.io-powered instant alerts for order placement and status updates |
| **Email Notifications** | Automated emails for registration OTP, password reset, order confirmation, and status changes |

### 👑 Admin Management Console
| Feature | Description |
|---|---|
| **Analytics Dashboard** | Cards for Today's Sales, Monthly Sales, Total Revenue, Total Orders, Total Products, Total Users |
| **7-Day Sales Trend** | Responsive weekly sales graph rendered using inline SVG vectors |
| **Category Distribution** | Breakdown of orders by product category |
| **Top Products** | Ranked list of best-selling products by quantity and revenue |
| **Product CRUD** | Create, read, update, and delete products with Cloudinary image upload |
| **Inventory Tracker** | View low-stock (< 5) and out-of-stock items; bulk stock updates |
| **Order Management** | View all orders, update statuses, and process refunds (with role-based access for managers) |
| **User Management** | View all registered users with role information |
| **Coupon Manager** | Create, list, validate, and delete percentage or flat-discount coupons |
| **CSV Data Export** | Export coupons and inventory stock lists to `.csv` format from the browser |

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | Component-based SPA with React Router v6 |
| **Redux Toolkit** | Global state management for cart & wishlist with localStorage persistence |
| **React Context API** | Authentication state (JWT session management) |
| **Framer Motion** | Smooth page transitions and micro-animations |
| **Lucide React** | Consistent, modern icon library |
| **Canvas Confetti** | Celebratory animation on order success |
| **Socket.io Client** | Real-time notification listener |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express 5** | RESTful API server with modular MVC architecture |
| **Mongoose 9** | MongoDB ODM with schema validation |
| **Socket.io** | WebSocket server for real-time bidirectional communication |
| **PDFKit** | Dynamic PDF invoice generation and streaming |
| **Razorpay SDK** | Payment order creation and HMAC signature verification |
| **Cloudinary** | Cloud-based product image storage and optimization |
| **NodeMailer** | Transactional email delivery (Gmail SMTP) |
| **Multer** | Multipart form-data parsing for image file uploads |
| **bcryptjs** | Password hashing with configurable salt rounds |
| **jsonwebtoken** | JWT access & refresh token generation and verification |

### Security
| Technology | Purpose |
|---|---|
| **Helmet** | HTTP security header management (CSP, HSTS, X-Frame, etc.) |
| **express-rate-limit** | API rate limiting (200 requests / 15 min per IP) |
| **Custom Mongo Sanitizer** | Express 5-compatible `$`-operator injection prevention |
| **Custom XSS Sanitizer** | HTML tag stripping from request body, params, and query |
| **HTTP-only Cookies** | Secure, SameSite-strict refresh token storage |

---

## 📂 Project Structure

```
shopnest/
├── package.json                    # Root: concurrently runs both servers
├── ShopNest_Postman_Collection.json # Pre-configured API testing suite
├── .gitignore                       # node_modules, .env
│
├── backend/
│   ├── server.js                   # Express app entry point, Socket.io init, security middleware
│   ├── seed.js                     # Database seeder (19 products + admin account)
│   ├── package.json                # Backend dependencies & scripts
│   ├── .env.example                # Environment variable template
│   │
│   ├── config/
│   │   ├── db.js                   # MongoDB connection via Mongoose
│   │   └── cloudinary.js           # Cloudinary SDK configuration
│   │
│   ├── models/
│   │   ├── User.js                 # User schema (auth, addresses, wishlist, roles)
│   │   ├── Product.js              # Product schema (name, price, stock, ratings, tags)
│   │   ├── Order.js                # Order schema (items, address, payment, status lifecycle)
│   │   ├── Review.js               # Review schema (rating, comment, user reference)
│   │   └── Coupon.js               # Coupon schema (code, type, value, expiry)
│   │
│   ├── controllers/
│   │   ├── authController.js       # Register, OTP verify, login, JWT refresh, logout,
│   │   │                           #   forgot/reset/change password, wishlist CRUD, address CRUD
│   │   ├── productController.js    # Product CRUD, reviews CRUD, related products, Cloudinary upload
│   │   ├── orderController.js      # Place order, get orders, cancel, return, status update,
│   │   │                           #   stock management, Socket.io & email notifications
│   │   ├── paymentController.js    # Razorpay order creation & HMAC signature verification
│   │   ├── invoiceController.js    # PDFKit-based PDF invoice generation & streaming
│   │   ├── analyticsController.js  # Dashboard stats, 7-day sales trend, top products, inventory
│   │   └── couponController.js     # Coupon CRUD & validation (flat/percentage discounts)
│   │
│   ├── routes/
│   │   ├── authRoutes.js           # /api/auth/* — auth, wishlist, addresses, admin user list
│   │   ├── productRoutes.js        # /api/products/* — products CRUD, reviews, related
│   │   ├── orderRoutes.js          # /api/orders/* — orders CRUD, cancel, return, invoice
│   │   ├── paymentRoutes.js        # /api/payment/* — Razorpay create & verify
│   │   ├── analyticsRoutes.js      # /api/analytics/* — admin dashboard stats
│   │   └── couponRoutes.js         # /api/coupons/* — coupon management
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT Bearer token verification & user injection
│   │   └── adminMiddleware.js      # Role-based access control (admin, manager, authorizeRoles)
│   │
│   ├── utils/
│   │   └── sendEmail.js            # NodeMailer Gmail SMTP transporter
│   │
│   └── uploads/                    # Temporary multer file storage before Cloudinary upload
│
└── frontend/
    ├── package.json                # Frontend dependencies & CRA scripts
    ├── public/                     # Static assets (index.html, favicon, manifest)
    ├── build/                      # Production build output (generated by `npm run build`)
    │
    └── src/
        ├── index.js                # React DOM root with Redux Provider & AuthProvider
        ├── App.jsx                 # Root component with React Router route definitions
        │
        ├── context/
        │   └── AuthContext.jsx     # React Context for user auth state (login/logout/persist)
        │
        ├── redux/
        │   ├── store.js            # Redux Toolkit store (cart + wishlist reducers)
        │   ├── cartSlice.js        # Cart state: add, remove, clear (localStorage synced)
        │   └── wishlistSlice.js    # Wishlist state: add, remove, clear (localStorage synced)
        │
        ├── components/
        │   ├── Navbar.jsx          # Top navigation bar with auth-aware links & cart badge
        │   ├── Footer.jsx          # Site footer with info links
        │   └── ProductCard.jsx     # Reusable product display card with wishlist/cart actions
        │
        ├── pages/
        │   ├── Home.jsx            # Landing page with featured products
        │   ├── Shop.jsx            # Product listing with filters, search, sort, pagination
        │   ├── ProductDetail.jsx   # Full product view with reviews, ratings, related products
        │   ├── Cart.jsx            # Shopping cart with quantity controls
        │   ├── Checkout.jsx        # Multi-step checkout: address, coupon, payment (Razorpay/COD)
        │   ├── OrderSuccess.jsx    # Order confirmation page with confetti animation
        │   ├── Wishlist.jsx        # User wishlist with add-to-cart functionality
        │   ├── Profile.jsx         # User profile: orders, addresses, password change, order tracking
        │   ├── Login.jsx           # Login form with JWT handling
        │   ├── Register.jsx        # Registration form with OTP verification flow
        │   ├── About.jsx           # About page
        │   ├── Disclaimer.jsx      # Legal disclaimer
        │   └── ReturnPolicy.jsx    # Return & refund policy
        │
        ├── admin/
        │   ├── AdminDashboard.jsx  # Analytics overview: stats cards, sales chart, inventory, coupons
        │   ├── AdminProducts.jsx   # Product listing with edit/delete actions
        │   ├── AddProduct.jsx      # New product form with Cloudinary image upload
        │   ├── EditProduct.jsx     # Edit product form (pre-populated)
        │   ├── AdminOrders.jsx     # All orders list with status update controls
        │   └── AdminUsers.jsx      # User management table
        │
        └── styles/
            ├── global.css          # CSS reset, typography, layout utilities, theme variables
            ├── navbar.css          # Navigation bar styling
            ├── auth.css            # Login/Register form styling
            ├── product.css         # Product card & detail page styling
            └── cart.css            # Cart & checkout page styling
```

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Port 3000)                       │
│  React 18 SPA + Redux Toolkit + Context API + Socket.io Client  │
└──────────────────────────┬──────────────────────────────────────┘
                           │  HTTP (REST) + WebSocket
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SERVER (Port 5000)                        │
│   Express 5 + Helmet + Rate Limiter + Custom Sanitizers         │
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │  Routes      │→│  Middleware   │→│  Controllers           │  │
│  │  (6 modules) │  │  (auth+role) │  │  (7 modules)          │  │
│  └─────────────┘  └──────────────┘  └───────────┬────────────┘  │
│                                                  │               │
│  ┌──────────────────────┬────────────────────────┤               │
│  │                      │                        │               │
│  ▼                      ▼                        ▼               │
│  MongoDB (Mongoose)     Cloudinary (Images)      Socket.io       │
│  5 Collections          Product Image CDN        Real-time       │
│                                                  Notifications   │
│  ┌──────────────────┐  ┌────────────────────┐                    │
│  │  PDFKit           │  │  Razorpay SDK      │                   │
│  │  Invoice Stream   │  │  Payment Gateway   │                   │
│  └──────────────────┘  └────────────────────┘                    │
│                                                                  │
│  ┌──────────────────┐                                            │
│  │  NodeMailer       │                                           │
│  │  Gmail SMTP       │                                           │
│  └──────────────────┘                                            │
└──────────────────────────────────────────────────────────────────┘
```

### Request Lifecycle

1. **Client** sends HTTP request to Express server
2. **Helmet** applies security headers
3. **Custom Sanitizers** strip MongoDB `$`-operators and HTML tags from input
4. **Rate Limiter** enforces 200 requests / 15 minutes per IP
5. **Router** dispatches to the matching route module
6. **Auth Middleware** verifies JWT Bearer token (protected routes)
7. **Admin/Role Middleware** checks user role (admin-only routes)
8. **Controller** executes business logic (DB queries, file uploads, emails)
9. **Response** is sent back; Socket.io emits real-time events if applicable

---

## 🗄 Database Models

### User
| Field | Type | Description |
|---|---|---|
| `name` | String | Required |
| `email` | String | Required, unique |
| `password` | String | bcrypt-hashed |
| `role` | Enum | `user` / `manager` / `admin` (default: `user`) |
| `isVerified` | Boolean | Email OTP verification status |
| `otp` / `otpExpires` | String / Date | Temporary OTP for verification & password reset |
| `refreshToken` | String | JWT refresh token for session rotation |
| `addresses` | Array | `{ fullName, street, city, postalCode, country, isDefault }` |
| `wishlist` | ObjectId[] | References to `Product` documents |

### Product
| Field | Type | Description |
|---|---|---|
| `name` | String | Required |
| `description` | String | Required |
| `price` | Number | Required |
| `category` | String | Required (Electronics, Furniture, Clothing) |
| `brand` | String | Required (default: `Generic`) |
| `stock` | Number | Required; auto-decremented on order placement |
| `imageUrl` | String | Cloudinary CDN URL |
| `ratings` / `numReviews` | Number | Aggregate review metrics |
| `tags` | String[] | Searchable product tags |

### Order
| Field | Type | Description |
|---|---|---|
| `userId` | ObjectId | Reference to `User` |
| `items` | Array | `{ productId, qty, price }` |
| `totalAmount` / `discount` / `tax` / `shipping` | Number | Financial breakdown |
| `couponCode` | String | Applied coupon code |
| `address` | Object | Snapshot of delivery address |
| `paymentMethod` | Enum | `Razorpay` / `COD` |
| `paymentId` | String | Razorpay transaction ID |
| `status` | Enum | `Placed` → `Confirmed` → `Packed` → `Shipped` → `Out for Delivery` → `Delivered` / `Cancelled` / `Returned` |
| `refundStatus` | Enum | `None` / `Requested` / `Processed` |

### Review
| Field | Type | Description |
|---|---|---|
| `productId` | ObjectId | Reference to `Product` |
| `userId` | ObjectId | Reference to `User` |
| `name` | String | Reviewer display name |
| `rating` | Number | 1–5 stars |
| `comment` | String | Review text |

### Coupon
| Field | Type | Description |
|---|---|---|
| `code` | String | Unique, auto-uppercased |
| `discountType` | Enum | `flat` / `percentage` |
| `discountValue` | Number | Discount amount or percentage |
| `expiryDate` | Date | Coupon validity end date |
| `isActive` | Boolean | Toggle coupon availability |

---

## 🔌 API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/register` | Public | Register with email OTP verification |
| `POST` | `/verify-otp` | Public | Verify 6-digit OTP and receive tokens |
| `POST` | `/login` | Public | Login and receive access + refresh tokens |
| `POST` | `/refresh` | Public | Rotate access token using refresh cookie |
| `POST` | `/logout` | Public | Clear refresh token and cookie |
| `POST` | `/forgot-password` | Public | Send password reset OTP to email |
| `POST` | `/reset-password` | Public | Reset password with valid OTP |
| `POST` | `/change-password` | 🔐 User | Change password (requires current password) |
| `GET` | `/wishlist` | 🔐 User | Get user's wishlist (populated) |
| `POST` | `/wishlist` | 🔐 User | Add product to wishlist |
| `DELETE` | `/wishlist/:id` | 🔐 User | Remove product from wishlist |
| `GET` | `/addresses` | 🔐 User | Get user's saved addresses |
| `POST` | `/addresses` | 🔐 User | Add new delivery address |
| `DELETE` | `/addresses/:id` | 🔐 User | Delete an address |
| `GET` | `/users` | 🔐 Admin | Get all registered users |

### Products (`/api/products`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | Public | List products with filters (search, price, category, brand, rating, stock) |
| `POST` | `/` | 🔐 Admin | Create product with image upload (Cloudinary) |
| `GET` | `/:id` | Public | Get single product details |
| `PUT` | `/:id` | 🔐 Admin | Update product (with optional new image) |
| `DELETE` | `/:id` | 🔐 Admin | Delete product |
| `GET` | `/:id/related` | Public | Get related products by category/tags |
| `GET` | `/:id/reviews` | Public | Get product reviews |
| `POST` | `/:id/reviews` | 🔐 User | Create a review |
| `PUT` | `/:id/reviews/:reviewId` | 🔐 User | Edit own review |
| `DELETE` | `/:id/reviews/:reviewId` | 🔐 User | Delete own review |

### Orders (`/api/orders`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/` | 🔐 User | Place a new order (auto stock decrement + notifications) |
| `GET` | `/` | 🔐 Admin/Manager | Get all orders |
| `GET` | `/myorders` | 🔐 User | Get current user's orders |
| `GET` | `/:id` | 🔐 User/Admin | Get order by ID |
| `POST` | `/:id/cancel` | 🔐 User | Cancel order (stock restored) |
| `POST` | `/:id/return` | 🔐 User | Request return on delivered order |
| `PUT` | `/:id/status` | 🔐 Admin/Manager | Update order status |
| `GET` | `/:id/invoice` | 🔐 User/Admin | Download PDF invoice |

### Payments (`/api/payment`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/create` | Public | Create Razorpay order |
| `POST` | `/verify` | Public | Verify Razorpay payment signature |

### Analytics (`/api/analytics`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/admin` | 🔐 Admin | Full dashboard stats (revenue, trends, top products, inventory) |

### Coupons (`/api/coupons`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/validate` | 🔐 User | Validate and calculate coupon discount |
| `GET` | `/` | 🔐 Admin | List all coupons |
| `POST` | `/` | 🔐 Admin | Create new coupon |
| `DELETE` | `/:id` | 🔐 Admin | Delete coupon |

---

## 🔒 Security Architecture

| Layer | Implementation |
|---|---|
| **Authentication** | JWT access tokens (15 min TTL) + refresh tokens (7 day TTL) stored in HTTP-only, SameSite-strict, secure cookies |
| **MFA** | 6-digit OTP sent via email for registration verification and password resets (10-min expiry) |
| **Password Storage** | bcryptjs with 10 salt rounds |
| **Rate Limiting** | 200 requests per 15-minute window per IP via `express-rate-limit` |
| **HTTP Headers** | `helmet` middleware (CSP, HSTS, X-Content-Type-Options, X-Frame-Options, etc.) |
| **Injection Prevention** | Custom Express 5-compatible middleware strips `$`-prefixed keys from body/params/query |
| **XSS Prevention** | Custom middleware strips all HTML tags from string inputs in body/params/query |
| **CORS** | Whitelist-based origin policy with credentials support |
| **Role-Based Access** | Three-tier role system (`user` / `manager` / `admin`) with `authorizeRoles` middleware |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x (LTS recommended)
- **MongoDB** — Local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) cloud cluster
- **Cloudinary** account — [Sign up free](https://cloudinary.com/)
- **Razorpay** account — [Sign up](https://razorpay.com/) for test API keys
- **Gmail App Password** — [Generate one](https://myaccount.google.com/apppasswords) for NodeMailer SMTP

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/AnshikaPawar15/ShopNest---Enterprise-MERN-E-Commerce-Platform.git
cd ShopNest---Enterprise-MERN-E-Commerce-Platform

# 2. Install all dependencies (root + backend + frontend)
npm run install-all

# 3. Configure environment variables (see section below)
cp backend/.env.example backend/.env
# → Edit backend/.env with your actual credentials

# 4. Seed the database with sample data
npm run seed

# 5. Start both servers concurrently
npm run dev
```

The app will be available at:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

---

## ⚙️ Environment Variables

Create a `.env` file inside the `/backend` directory using the provided template:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/shopnest
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your_gmail_app_password
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

| Variable | Description |
|---|---|
| `PORT` | Backend server port (default: 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `CLOUDINARY_*` | Cloudinary cloud name, API key, and API secret |
| `RAZORPAY_*` | Razorpay key ID and key secret (test or live) |
| `GMAIL_USER` | Gmail address for sending emails |
| `GMAIL_PASS` | Gmail App Password (not your regular Gmail password) |
| `FRONTEND_URL` | Frontend origin URL for CORS and Socket.io |
| `NODE_ENV` | `development` or `production` |

---

## 🌱 Database Seeding

The seed script populates the database with **19 sample products** across 3 categories (Electronics, Furniture, Clothing) featuring brands like Sony, Nike, Bose, Logitech, Canon, and a **default admin account**.

```bash
npm run seed
```

> **Default Admin Credentials:**
> - 📧 Email: `admin@shopnest.com`
> - 🔑 Password: `password123`

⚠️ **Warning:** The seeder runs `deleteMany()` on the `Users` and `Products` collections before importing. Do not run on a production database with real data.

---

## 🧪 Postman Collection

A pre-configured Postman testing suite is included:

📁 **`ShopNest_Postman_Collection.json`**

**To use:**
1. Open Postman → **Import** → select the JSON file
2. Set the base URL variable to `http://localhost:5000`
3. Run auth endpoints first to obtain a JWT token
4. The collection covers all 30+ API endpoints

---

## ☁️ Deployment

### NPM Scripts Reference

| Script | Command | Description |
|---|---|---|
| `npm run install-all` | `npm install && cd backend && npm install && cd ../frontend && npm install` | Install all dependencies |
| `npm run dev` | `concurrently "start:backend" "start:frontend"` | Start both servers in development mode |
| `npm run start` | `cd backend && npm start` | Start backend in production mode |
| `npm run build` | `cd frontend && npm install && npm run build` | Build frontend for production |
| `npm run seed` | `npm --prefix backend run seed` | Seed the database |
| `npm run render-build` | Full install + build pipeline | Render.com deployment build command |

### Deploy on Render

1. Push this repository to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Set the **Build Command** to: `npm run render-build`
4. Set the **Start Command** to: `npm run start`
5. Add all environment variables from `.env` to Render's environment settings
6. Set `NODE_ENV=production` and `FRONTEND_URL` to your Render URL

In production, Express automatically serves the React build from `frontend/build/` as static files.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature`
3. **Commit** your changes: `git commit -m "Add your feature"`
4. **Push** to the branch: `git push origin feature/your-feature`
5. **Open** a Pull Request

---

## 📄 License

This project is licensed under the **ISC License**.

---

<p align="center">
  <strong>Built with ❤️ by <a href="https://github.com/AnshikaPawar15">Anshika Pawar</a></strong>
</p>
