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
  console.error('❌ Missing credentials');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2024-01-01',
  useCdn: false,
});

async function uploadImage(relPath) {
  const fullPath = path.resolve(__dirname, '..', relPath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${fullPath}`);
  }
  const stream = fs.createReadStream(fullPath);
  console.log(`📤 Uploading ${path.basename(fullPath)} to Sanity CMS...`);
  const asset = await client.assets.upload('image', stream, {
    filename: path.basename(fullPath),
  });
  console.log(`✅ Uploaded ${path.basename(fullPath)} -> ${asset._id} (${asset.url})`);
  return asset;
}

async function run() {
  console.log('🚀 Starting banner asset upload to Sanity...');
  const sweaterAsset = await uploadImage('frontend/src/assets/hero_sale_sweater.png');
  const modelAsset = await uploadImage('frontend/src/assets/hero_model_clean.png');
  const saleAsset = await uploadImage('frontend/src/assets/sale.jpg');
  const manAsset = await uploadImage('frontend/src/assets/man.jpg');

  const banners = [
    {
      _id: 'banner-1',
      _type: 'banner',
      title: 'Winter Knitwear & Luxury Sweaters',
      subtitle: 'Premium wool blends, ribbed textures, and effortless warmth',
      alt: 'Winter Knitwear & Sweaters - Clothings Store',
      image: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: sweaterAsset._id,
        },
      },
      imageUrl: sweaterAsset.url,
      link: '/Category',
      badge: 'NEW WINTER DROP',
      order: 1,
      active: true,
    },
    {
      _id: 'banner-2',
      _type: 'banner',
      title: 'Signature Luxury Collection',
      subtitle: 'Tailored menswear crafted for timeless elegance',
      alt: 'Clothings Store Signature Collection',
      image: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: modelAsset._id,
        },
      },
      imageUrl: modelAsset.url,
      link: '/Category',
      badge: 'SIGNATURE 2026',
      order: 2,
      active: true,
    },
    {
      _id: 'banner-3',
      _type: 'banner',
      title: 'Season Sale — Up to 60% Off',
      subtitle: 'Exclusive discounts on selected menswear essentials',
      alt: 'Season Sale - Up to 60% Off',
      image: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: saleAsset._id,
        },
      },
      imageUrl: saleAsset.url,
      link: '/Category',
      badge: 'FLASH SALE',
      order: 3,
      active: true,
    },
    {
      _id: 'banner-4',
      _type: 'banner',
      title: "Men's Luxury Essentials",
      subtitle: 'Crisp Oxford shirts, premium chinos, and tailored blazers',
      alt: "Men's Luxury Essentials",
      image: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: manAsset._id,
        },
      },
      imageUrl: manAsset.url,
      link: '/category/men',
      badge: "MEN'S ATELIER",
      order: 4,
      active: true,
    },
  ];

  console.log('📝 Updating banner documents in Sanity CMS...');
  for (const b of banners) {
    await client.createOrReplace(b);
    console.log(`✅ Banner updated: ${b.title} (Order: ${b.order})`);
  }

  console.log('🎉 All banner images and documents updated successfully in Sanity CMS!');
}

run().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
