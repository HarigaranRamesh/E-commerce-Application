# Men's Hub — Luxury Menswear E-commerce Platform

A production-ready full-stack luxury e-commerce platform built with React 18, Node.js/Express, PostgreSQL, Razorpay Payment Gateway, and Strapi Headless CMS.

---

## 🏛️ Architecture & Folder Structure

```
E-commerce-Application/
├── frontend/             # Single Page Application (React 18 + Vite + Tailwind/Glassmorphism) -> Port 5173
├── backend/              # Core Storefront REST API (Node.js + Express + PostgreSQL + Razorpay) -> Port 5001
├── cms/                  # Headless CMS & Media Library (Strapi v5 + SQLite/PG) -> Port 1337
├── docker-compose.yml    # Monorepo container orchestration (Frontend, Backend, CMS, PostgreSQL)
└── README.md             # Project documentation
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js >= 18.x
- PostgreSQL database
- npm >= 9.x

### 1. Backend Server (Port 5001)
```bash
cd backend
npm install
# Configure your backend/.env (DB connection, Razorpay keys, JWT secret)
npm run dev
```
- API Base URL: `http://localhost:5001/api`
- Health check: `http://localhost:5001/api/health`

### 2. Frontend Storefront (Port 5173)
```bash
cd frontend
npm install
npm run dev
```
- Storefront URL: `http://localhost:5173`

### 3. Strapi Headless CMS (Port 1337)
```bash
cd cms
npm install
npm run develop
```
- Admin Panel: `http://localhost:1337/admin`
- Content API: `http://localhost:1337/api/products`

---

## 💳 Payment Gateway Integration (Razorpay)

- **Standard Checkout**: Built-in Razorpay checkout supporting UPI (Google Pay, PhonePe, Paytm, QR), Credit & Debit cards, Net Banking, and Wallets.
- **HMAC SHA-256 Verification**: Server-side cryptographic signature verification on all payments.
- **Webhook Handlers**: Automatic order updates and payment state tracking.

---

## 📸 Dynamic Strapi CMS Features

- **Media Library**: All catalog images uploaded and served from Strapi Media storage.
- **Dynamic Pricing & Offers**: Real-time promo codes, flash sale banners, and coupon deductions.
- **Dynamic Site & Footer Settings**: Header announcements, brand tagline, contact information, and policy links.

---

## 🛡️ Security

- All secret keys (`RAZORPAY_KEY_SECRET`, `JWT_SECRET`, database credentials) are stored exclusively in `backend/.env`.
- Frontend client bundles contain zero secret keys.
- All `.env*` files are strictly ignored and prevented from being committed to version control.
