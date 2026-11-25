/**
 * Sanity Seed Script
 * Migrates existing catalog from cms/data/products.json directly into your Sanity dataset,
 * and seeds dynamic Banners, Categories, Navigation Menus, Offers, and Global Settings.
 */
import { createClient } from '@sanity/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || process.env.SANITY_PROJECT_ID || 'twhkbzvd';
const dataset = process.env.SANITY_STUDIO_DATASET || process.env.SANITY_DATASET || 'production';

let token = process.env.SANITY_AUTH_TOKEN || process.env.SANITY_API_TOKEN;
if (!token) {
  try {
    const configPath = path.join(os.homedir(), '.config/sanity/config.json');
    if (fs.existsSync(configPath)) {
      const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      token = cfg.authToken;
    }
  } catch (e) {
    // ignore
  }
}

if (!projectId || !token) {
  console.error("❌ Please provide SANITY_PROJECT_ID and SANITY_API_TOKEN environment variables.");
  console.log("Usage: SANITY_PROJECT_ID=xxx SANITY_API_TOKEN=xxx node seed.js");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2024-01-01',
  useCdn: false,
});

async function runSeed() {
  // 1. Seed Dynamic Hero Banners
  console.log('🖼️ Seeding Hero Banners into Sanity...');
  const banners = [
    {
      _id: 'banner-1',
      _type: 'banner',
      title: 'Signature Collection',
      subtitle: 'Luxury Menswear & Modern Tailoring',
      alt: 'Clothings Store Signature Collection',
      imageUrl: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?auto=format&fit=crop&w=1920&q=80',
      link: '/Category',
      badge: 'SIGNATURE 2026',
      order: 1,
      active: true,
    },
    {
      _id: 'banner-2',
      _type: 'banner',
      title: 'Season Sale — Up to 60% Off',
      subtitle: 'Limited-time discounts across formal and casual lines',
      alt: 'Season Sale - Up to 60% Off',
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1920&q=80',
      link: '/Category',
      badge: 'FLASH SALE',
      order: 2,
      active: true,
    },
    {
      _id: 'banner-3',
      _type: 'banner',
      title: "Men's Luxury Essentials",
      subtitle: 'Crisp Oxford shirts, premium chinos, and tailored blazers',
      alt: "Men's Luxury Essentials",
      imageUrl: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1920&q=80',
      link: '/category/men',
      badge: "MEN'S ATELIER",
      order: 3,
      active: true,
    },
    {
      _id: 'banner-4',
      _type: 'banner',
      title: "Women's Designer Fashion",
      subtitle: 'Flowing dresses, silk shirts, and contemporary silhouettes',
      alt: "Women's Designer Fashion",
      imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1920&q=80',
      link: '/category/women',
      badge: 'HAUTE COUTURE',
      order: 4,
      active: true,
    },
  ];

  for (const b of banners) {
    await client.createOrReplace(b);
  }
  console.log(`✅ Seeded ${banners.length} Hero Banners.`);

  // 2. Seed Dynamic Categories
  console.log('🗂️ Seeding Curated Categories into Sanity...');
  const categories = [
    {
      _id: 'cat-men',
      _type: 'category',
      name: "Men's Wear",
      slug: { _type: 'slug', current: 'men' },
      imageUrl: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80',
      count: '40+ Styles',
      gender: 'men',
      order: 1,
      description: 'Handcrafted luxury menswear, tailored trousers, and formal essentials.',
    },
    {
      _id: 'cat-women',
      _type: 'category',
      name: "Women's Fashion",
      slug: { _type: 'slug', current: 'women' },
      imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
      count: 'Trending Dresses & Tops',
      gender: 'women',
      order: 2,
      description: 'Elegant dresses, floral prints, contemporary blazers, and chic evening wear.',
    },
    {
      _id: 'cat-kids',
      _type: 'category',
      name: "Kids' Collection",
      slug: { _type: 'slug', current: 'kids' },
      imageUrl: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80',
      count: 'Boys & Girls Styles',
      gender: 'kids',
      order: 3,
      description: 'Comfortable cotton wear, party frocks, and play-ready sets for boys and girls.',
    },
    {
      _id: 'cat-shirts',
      _type: 'category',
      name: 'Shirts & Trousers',
      slug: { _type: 'slug', current: 'shirts' },
      imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
      count: 'Timeless Essentials',
      gender: 'all',
      order: 4,
      description: 'Timeless Oxford shirts, chambray buttons, and smart slim-fit chinos.',
    },
  ];

  for (const c of categories) {
    await client.createOrReplace(c);
  }
  console.log(`✅ Seeded ${categories.length} Categories.`);

  // 3. Seed Dynamic Navigation Menus
  console.log('🧭 Seeding Navigation Menus into Sanity...');
  const navMenus = [
    {
      _id: 'nav-men',
      _type: 'navigationMenu',
      name: 'MEN',
      slug: 'men',
      order: 1,
      items: [
        { _key: 'item-1', label: "All Men's Wear", link: '/category/men' },
        { _key: 'item-2', label: 'Shirts', link: '/category/shirts?gender=men' },
        { _key: 'item-3', label: 'T-Shirts', link: '/category/t-shirts?gender=men' },
        { _key: 'item-4', label: 'Pants & Trousers', link: '/category/pants?gender=men' },
        { _key: 'item-5', label: 'Hoodies & Sweatshirts', link: '/category/hoodies?gender=men' },
      ],
    },
    {
      _id: 'nav-women',
      _type: 'navigationMenu',
      name: 'WOMEN',
      slug: 'women',
      order: 2,
      items: [
        { _key: 'item-1', label: "All Women's Wear", link: '/category/women' },
        { _key: 'item-2', label: 'Dresses & Gowns', link: '/category/dresses?gender=women' },
        { _key: 'item-3', label: 'Tops & Shirts', link: '/category/tops?gender=women' },
        { _key: 'item-4', label: 'Jeans & Trousers', link: '/category/pants?gender=women' },
        { _key: 'item-5', label: 'Ethnic & Kurtas', link: '/category/ethnic?gender=women' },
      ],
    },
    {
      _id: 'nav-kids',
      _type: 'navigationMenu',
      name: 'KIDS',
      slug: 'kids',
      order: 3,
      items: [
        { _key: 'item-1', label: 'All Kids Wear', link: '/category/kids' },
        { _key: 'item-2', label: 'Boys Clothing', link: '/category/boys?gender=kids' },
        { _key: 'item-3', label: 'Girls Clothing', link: '/category/girls?gender=kids' },
        { _key: 'item-4', label: 'T-Shirts & Tops', link: '/category/kids?gender=kids' },
        { _key: 'item-5', label: 'Pants & Dungarees', link: '/category/pants?gender=kids' },
      ],
    },
  ];

  for (const n of navMenus) {
    await client.createOrReplace(n);
  }
  console.log(`✅ Seeded ${navMenus.length} Navigation Menus.`);

  // 4. Seed Global Site Settings & Trust Features
  console.log('🌐 Seeding Global Site Settings into Sanity...');
  const globalSettingDoc = {
    _id: 'globalSetting-main',
    _type: 'globalSetting',
    site_name: 'Clothings Store',
    tagline: 'Quality products, Fresh Choices',
    announcement_banner: '✨ Special Festive Offer: Flat 20% OFF on all orders with coupon SUPER20 | Free Express Shipping on ₹999+',
    about_text: 'At Clothings Store, we believe in delivering premium quality apparel with an effortless shopping experience. Handpicked fabrics, tailored cuts, and contemporary craftsmanship.',
    phone: '+91 97826260723',
    email: 'harigaran925@gmail.com',
    address: 'Kotagiri, Nilgiris, Tamil Nadu, India.',
    twitter_url: 'https://twitter.com',
    instagram_url: 'https://instagram.com',
    facebook_url: 'https://facebook.com',
    copyright_text: '© Copyright 2026 Clothings Store. All rights reserved.',
    free_shipping_threshold: 999,
    features: [
      { _key: 'f-1', title: 'Free Shipping', desc: 'On all orders over ₹999 across India', icon: 'truck' },
      { _key: 'f-2', title: 'Easy Returns', desc: '15-day hassle-free doorstep exchange', icon: 'refresh' },
      { _key: 'f-3', title: 'Secure Payment', desc: '100% verified Razorpay & UPI encryption', icon: 'shield' },
      { _key: 'f-4', title: 'Assured Quality', desc: 'Every garment checked by master tailors', icon: 'headset' },
    ],
  };

  await client.createOrReplace(globalSettingDoc);
  console.log('✅ Seeded Global Site Settings.');

  // 5. Seed Promotional Offers
  console.log('🎟️ Seeding Offers into Sanity...');
  const offers = [
    {
      _id: 'offer-super20',
      _type: 'offer',
      title: 'Mid-Season Flash Sale — Up to 60% OFF',
      code: 'SUPER20',
      discount: 'Extra 20% OFF',
      description: 'Grab our trending wardrobe essentials at unbeatable prices with code SUPER20.',
      min_spend: '₹1,500',
      badge: 'LIMITED TIME OFFER',
      cta_text: 'Shop Flash Deals Now',
      cta_link: '/Category',
      active: true,
      is_flash_sale: true,
      order: 1,
    },
    {
      _id: 'offer-welcome10',
      _type: 'offer',
      title: 'First Order Welcome Discount',
      code: 'WELCOME10',
      discount: '10% OFF',
      description: '10% OFF on your 1st order with instant discount deduction at checkout.',
      min_spend: '₹500',
      badge: 'WELCOME GIFT',
      cta_text: 'Explore Collections',
      cta_link: '/Category',
      active: true,
      is_flash_sale: false,
      order: 2,
    },
  ];

  for (const o of offers) {
    await client.createOrReplace(o);
  }
  console.log(`✅ Seeded ${offers.length} Promotional Offers.`);

  console.log('🎉 All dynamic CMS entities seeded successfully to Sanity!');
}

runSeed();
