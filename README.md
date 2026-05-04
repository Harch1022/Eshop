# Eshop — Full-Stack E-Commerce Platform

A modern full-stack e-commerce application built with React, Express, and MySQL, featuring a complete shopping experience from product browsing to order tracking.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 6, Tailwind CSS v4, React Router v7 |
| 3D Graphics | Three.js (React Three Fiber), @react-three/drei |
| Animation | GSAP |
| Backend | Express 5, Node.js |
| Database | MySQL with mysql2 |
| File Upload | Multer |

## Features

### Customer
- **Authentication** — Register and login with database-backed credential validation
- **Product Catalog** — Browse products with category filtering and keyword search
- **Product Details** — View product information with Base64-encoded images from the database
- **Shopping Cart** — Persistent cart stored in `localStorage` with quantity management
- **Checkout** — Multi-step flow: cart review → shipping address → payment method selection → confirmation
- **Simulated Payment** — Choose from Credit Card, Debit Card, Alipay, WeChat Pay, or Cash on Delivery
- **Order Tracking** — Four-step timeline (Placed → Paid → Shipped → Delivered) with shipment details
- **Order History** — List all orders with status badges and expandable details

### Admin
- **Product Management** — Full CRUD with image upload support
- **Order Management** — View all orders with customer details, update shipping status and tracking numbers
- **Sales Report** — Aggregated view of sold products, revenue, and buyer information
- **Image Management** — Upload and replace product images stored as BLOBs in MySQL

## Architecture

```
eshop/
├── server.js              # Express API server (port 3001)
├── init.js                # Database table creation and seeding
├── connect.js             # MySQL connection
├── get.js                 # Read operations
├── insert.js              # Create operations
├── update.js              # Update operations
├── delete.js              # Delete operations
├── shipping.js            # Shipping/logistics operations
└── client/                # React frontend (port 5173)
    └── src/
        ├── App.jsx                          # Router and global state
        └── components/
            ├── AuthPage/                    # Login & registration
            ├── ProductPage/                 # Product listing with search
            ├── ProductInfoPage/             # Product detail
            ├── CartPage.jsx                 # Cart & multi-step checkout
            ├── OrderHistory.jsx             # Customer order list
            ├── OrderTracking.jsx            # Timeline and tracking details
            ├── AdminPage/                   # Admin dashboard with tabs
            ├── Navbar.jsx                   # Navigation bar
            └── HeroCanvas.jsx               # Three.js 3D background
```

## Database Schema

```
Users          (UserID PK, Name, Email, Password, Role, RegistrationDate)
Products       (ProductID PK, ProductName, ProductStock, ProductDescription, ProductPrice, ProductImage)
Orders         (OrderID PK, UserID FK, OrderDate)
Order_Items    (OrderID FK, ProductID FK, Number, Price)  — composite PK
Shipping       (ShippingID PK, OrderID FK, RecipientName, Phone, Address, Status, TrackingNumber, PaymentMethod)
Category_type  (TypeID PK, TypeName)
Category_item  (ProductID FK, TypeID FK)  — composite PK
```

## API Endpoints

### Authentication & Users
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/users/byCredentials?name=&password=` | Verify login credentials |
| POST | `/api/users` | Register new user |
| GET | `/api/users` | List all users |

### Products
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/products?productId=&name=` | List or search products |
| POST | `/api/products` | Create product (multipart) |
| PUT | `/api/products/update` | Update product |
| PUT | `/api/products/:id/image` | Upload product image |
| DELETE | `/api/products/:id` | Delete product |

### Orders & Checkout
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/checkout` | Atomic checkout (transaction) |
| GET | `/api/orders?userId=` | List orders with items & shipping |
| GET | `/api/orders/admin` | All orders with customer details |
| PUT | `/api/orders/:orderId/pay` | Mark order as paid |
| PUT | `/api/orders/:orderId/shipping` | Update shipping status |

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8.0+ running on `localhost:3306`

### Database Setup
Create the database in MySQL:
```sql
CREATE DATABASE online_shopping_app;
```

Update connection settings in `connect.js` if needed (default: `root` / `123456` / `online_shopping_app`).

### Install & Run

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client && npm install && cd ..

# Terminal 1 — Start backend (port 3001)
npm start

# Terminal 2 — Start frontend (port 5173)
cd client && npm run dev
```

Open http://localhost:5173 in your browser.

### Default Admin Account
On first startup, an admin user is automatically seeded:

> **Username:** `admin` · **Password:** `admin123`

Regular users can register through the Sign Up form.
