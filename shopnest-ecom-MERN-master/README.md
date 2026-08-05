# ShopNest - Enterprise MERN E-Commerce Platform

A production-ready, full-stack E-commerce platform built strictly using React.js on the frontend, and Node.js / Express / MongoDB on the backend. This platform has been enhanced with enterprise-grade security protocols, robust user and administrative tools, real-time sync, and client-side data exporting.

---

## 🛠 Tech Stack Details

- **Frontend**: React (Pure SPA), Redux Toolkit (Cart & Wishlist persistence), Context APIs (JWT user sessions & styling themes), Lucide Icons, inline SVG weekly sales graph displays.
- **Backend**: Node.js, Express.js architecture, modular controllers, HTTP-only cookie handlers, centralized error handlers.
- **Database**: MongoDB (via Mongoose schemas), custom query filters for price/rating/stock status, inventory tracking.
- **Real-Time Layer**: Socket.io integrated directly to the server for instant user alerts and administrative order feeds.
- **Invoice Generator**: PDFKit dynamically compiling and streaming printable PDF receipts on demand.

---

## 🔒 Enterprise Security Features

- **JWT Rotation & Cookies**: Access tokens (15m) and secure, HTTP-only cookies containing refresh tokens (7d) to prevent XSS-based session hijacking.
- **OTP Verification**: Multi-factor OTP email verification for registration validation and secure password resets via NodeMailer.
- **Express Rate Limiting**: Protection against DDoS and API endpoint spamming.
- **helmet Middleware**: Comprehensive HTTP security header management.
- **Custom Injection Sanity**: Custom Express 5-compatible request sanitization to block MongoDB Query Injection and XSS tag scripts.

---

## 📦 Extended Features List

### 👤 Customer Features
- **Address Book**: Add and list multiple delivery locations directly from your profile, with custom default selection.
- **Persistent Wishlist**: Save items to a personalized wishlist, persists in Redux Toolkit state, and add directly to shopping cart.
- **Order Cancels & Returns**: Request cancellations on active shipments, or trigger return requests on delivered orders.
- **Timeline Tracker**: Follow the order lifecycle (`Placed` -> `Confirmed` -> `Packed` -> `Shipped` -> `Out for Delivery` -> `Delivered`).
- **PDF Invoice Download**: Get auto-generated PDF receipts showing breakdowns of taxes (18% GST), shipping, and applied coupons.

### 🛍 Interactive Shop Filters
- **Price Range Inputs**: Input minimum/maximum bounds to match budgets.
- **Toggles & Sorts**: Toggles for In-Stock availability, ratings (>3★, >4★), and category/brand selectors.
- **Debounced Search**: Text search input optimized with a 500ms debounce buffer to lower database stress.
- **Average Ratings & Reviews**: Users can write comments and select 1–5 star ratings. Users can edit/delete their own reviews.

### 👑 Admin Management Console
- **Analytics Cards**: Cards showing Today's Sales, Monthly Sales, Total Revenue, Total Orders, and Products.
- **Sales Trends Charts**: Responsive weekly sales trends visualized using inline vector graphs.
- **Inventory Stock Updates**: Lists low-stock/out-of-stock items, and supports bulk-stock updating in real-time.
- **Coupon Manager**: Create, list, validate, and delete percentage or flat-discount coupons.
- **CSV Data Exporter**: Export coupons or inventory stock lists to `.csv` format instantly.

---

## 🚀 Quick Start / Local Development Guide

### 1️⃣ Environment Variables Configuration
In the `/backend` folder, create a `.env` file containing the following properties:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/shopnest
JWT_SECRET=super_secret_key_shopnest
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your_email_password
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### 2️⃣ Populate the Database (Seeding)
Run this command from the root directory to populate the database with mock products (categories: Electronics, Furniture, Clothing) and set up the default admin account:
```bash
npm run seed
```
> **Default Admin Account**:
> - **Email**: `admin@shopnest.com`
> - **Password**: `password123`

### 3️⃣ Run Servers Concurrently
Start the Express server on port 5000 and the React development server on port 3000 concurrently:
```bash
npm run dev
```

---

## 📄 Postman Documentations
This repository includes a pre-configured testing suite inside **`ShopNest_Postman_Collection.json`**. Import it into Postman to test backend routes.
