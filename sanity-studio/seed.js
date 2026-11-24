/**
 * Sanity Seed Script
 * Migrates existing catalog from cms/data/products.json directly into your Sanity dataset
 */
import { createClient } from '@sanity/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET || process.env.SANITY_DATASET || 'production';
const token = process.env.SANITY_AUTH_TOKEN || process.env.SANITY_API_TOKEN;

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
  const jsonPath = path.resolve(__dirname, '../cms/data/products.json');
  if (!fs.existsSync(jsonPath)) {
    console.error(`Cannot find products file at ${jsonPath}`);
    return;
  }

  const raw = fs.readFileSync(jsonPath, 'utf8');
  const products = JSON.parse(raw);

  console.log(`🚀 Seeding ${products.length} products to Sanity dataset "${dataset}"...`);

  for (const item of products) {
    const doc = {
      _type: 'product',
      _id: `product-${item.id}`,
      name: item.name,
      slug: { _type: 'slug', current: item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') },
      description: item.description || '',
      price: Number(item.price || 0),
      original_price: Number(item.original_price || (item.price * 1.25)),
      category: item.category || 'shirts',
      gender: item.gender || 'men',
      imageUrl: item.image || item.imageUrl || '',
      stock: Number(item.stock || 20),
      rating: Number(item.rating || 4.5),
      num_reviews: Number(item.numReviews || 0),
      featured: Boolean(item.featured),
      brand: "Clothings Store Luxury",
      sku: `CS-${(item.category || 'GEN').toUpperCase().substring(0, 3)}-${String(item.id).padStart(4, '0')}`,
      tags: [item.category, item.gender || 'menswear', 'luxury'],
      variants: ['S', 'M', 'L', 'XL', 'XXL'],
    };

    try {
      await client.createOrReplace(doc);
      console.log(`✅ Seeded: ${item.name} (${doc._id})`);
    } catch (err) {
      console.error(`Failed to seed ${item.name}:`, err.message);
    }
  }

  console.log('🎉 Seeding completed successfully!');
}

runSeed();
