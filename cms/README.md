# Strapi Headless CMS — Men's Hub E-commerce Application

This directory contains the complete **Strapi Headless Content Management System** configured for dynamic product catalog management, media uploads (single & multi-image galleries), custom ratings, reviews, specifications, and categories.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd cms
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Launch Development Server
```bash
npm run develop
```
- **Strapi Admin Panel**: [http://localhost:1337/admin](http://localhost:1337/admin)
- On first launch, create your Super Admin account.

---

## 📦 Content-Types Available

1. **Product (`api::product.product`)**:
   - `name` (String, Required)
   - `description` (Rich Text)
   - `price` (Decimal, Required)
   - `original_price` (Decimal)
   - `category` (Enum: `shirts`, `pants`, `hoodies`, `t-shirts`, `jackets`, `accessories`, `shoes`)
   - `image` (Single Image Media)
   - `images` (Multiple Gallery Images Media)
   - `rating` (Decimal: 1.0 – 5.0)
   - `num_reviews` (Integer)
   - `stock` (Integer)
   - `featured` (Boolean)
   - `brand` (String)
   - `sku` (String, Unique)
   - `specifications` (JSON)
   - `variants` (JSON: sizes, colors)
   - `tags` (JSON)

2. **Category (`api::category.category`)**:
   - `name`, `slug`, `image`, `description`

3. **Review (`api::review.review`)**:
   - `user_name`, `rating`, `comment`, `product_id`

---

## 🔗 Connecting to the Storefront Backend

### 1. Enable Public Read Access
In Strapi Admin:
1. Navigate to **Settings** $\rightarrow$ **Roles** $\rightarrow$ **Public**.
2. Under **Product**, select `find` and `findOne`.
3. Under **Upload**, select `find` and `findOne`.
4. Click **Save**.

### 2. Webhook Setup for Real-Time Sync
In Strapi Admin:
1. Navigate to **Settings** $\rightarrow$ **Webhooks** $\rightarrow$ **Create New Webhook**.
2. **Name**: `Storefront Auto-Sync`
3. **URL**: `http://localhost:5001/api/strapi/webhook`
4. **Events**: Select `Entry` (`create`, `update`, `delete`, `publish`, `unpublish`).
5. Click **Save**.

Now whenever an administrator creates or updates a product or uploads new photos in Strapi, the storefront backend automatically updates its product catalog in real time!
