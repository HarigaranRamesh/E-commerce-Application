import { pool } from '../config/db.js';

const newProducts = [
  {
    name: 'Floral Print A-Line Midi Dress',
    description: 'Graceful floral printed A-line midi dress designed with a flattering cinched waist and flutter sleeves. Cut from breathable lightweight georgette for breezy elegance.',
    price: 1799,
    original_price: 2499,
    category: 'dresses',
    gender: 'women',
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80'],
    stock: 35,
    rating: 4.8,
    num_reviews: 94,
    featured: true,
    brand: 'Clothings Store Luxe',
    sku: 'CS-WOM-DRE-0040',
    specifications: { material: 'Georgette & Viscose Lining', fit: 'Regular A-Line', care: 'Hand wash cold or gentle machine cycle' },
    variants: [{ size: 'XS', stock: 5 }, { size: 'S', stock: 10 }, { size: 'M', stock: 12 }, { size: 'L', stock: 8 }],
    tags: ['women', 'dresses', 'floral', 'summer', 'elegant']
  },
  {
    name: 'Pure White Tiered Broderie Sundress',
    description: 'Pristine white broderie anglaise sundress with delicate tiered detailing and adjustable shoulder straps. Perfect for sunny outings and coastal getaways.',
    price: 2199,
    original_price: 3199,
    category: 'dresses',
    gender: 'women',
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80'],
    stock: 28,
    rating: 4.7,
    num_reviews: 67,
    featured: true,
    brand: 'Clothings Store Studio',
    sku: 'CS-WOM-DRE-0041',
    specifications: { material: '100% Organic Cotton', fit: 'Relaxed Fit', care: 'Machine wash cold inside out' },
    variants: [{ size: 'S', stock: 8 }, { size: 'M', stock: 10 }, { size: 'L', stock: 10 }],
    tags: ['women', 'dresses', 'cotton', 'vacation']
  },
  {
    name: 'Classic Linen Oversized Button-Down Shirt',
    description: 'Effortlessly chic oversized linen shirt tailored with dropped shoulders and pearl buttons. Style it tucked into tailored pants or untucked over swimwear.',
    price: 1499,
    original_price: 2199,
    category: 'tops',
    gender: 'women',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80'],
    stock: 45,
    rating: 4.6,
    num_reviews: 82,
    featured: false,
    brand: 'Clothings Store',
    sku: 'CS-WOM-TOP-0042',
    specifications: { material: '100% French Flax Linen', fit: 'Oversized Boyfriend Fit', care: 'Machine wash gentle, hang to dry' },
    variants: [{ size: 'S', stock: 15 }, { size: 'M', stock: 15 }, { size: 'L', stock: 15 }],
    tags: ['women', 'tops', 'shirts', 'linen', 'casual']
  },
  {
    name: 'Tailored Double-Breasted Power Blazer & Trousers',
    description: 'Impeccably tailored double-breasted formal pant set featuring sharp lapels and high-waist straight trousers. Designed for confident modern power dressing.',
    price: 3499,
    original_price: 4999,
    category: 'pants',
    gender: 'women',
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80'],
    stock: 20,
    rating: 4.9,
    num_reviews: 112,
    featured: true,
    brand: 'Clothings Store Atelier',
    sku: 'CS-WOM-PAN-0043',
    specifications: { material: 'Poly-Viscose Crepe Blend', fit: 'Tailored Slim Fit', care: 'Dry clean recommended' },
    variants: [{ size: 'S', stock: 5 }, { size: 'M', stock: 10 }, { size: 'L', stock: 5 }],
    tags: ['women', 'pants', 'workwear', 'blazer', 'formal']
  },
  {
    name: 'Embroidered Chanderi Kurta Set with Dupatta',
    description: 'Exquisite Chanderi silk kurta highlighted with delicate zari embroidery, paired with straight cotton-silk trousers and a matching printed organza dupatta.',
    price: 2799,
    original_price: 3999,
    category: 'ethnic',
    gender: 'women',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'],
    stock: 30,
    rating: 4.9,
    num_reviews: 140,
    featured: true,
    brand: 'Clothings Store Heritage',
    sku: 'CS-WOM-ETH-0044',
    specifications: { material: 'Chanderi Silk with Mulmul Lining', fit: 'Straight Silhouette', care: 'Dry clean only' },
    variants: [{ size: 'S', stock: 8 }, { size: 'M', stock: 12 }, { size: 'L', stock: 10 }],
    tags: ['women', 'ethnic', 'kurta', 'festive', 'traditional']
  },
  {
    name: 'High-Rise Wide Leg Vintage Washed Jeans',
    description: 'Authentic non-stretch rigid denim shaped into a comfortable high-rise waist and relaxed wide-leg flare. Stone washed for a vintage feel.',
    price: 1899,
    original_price: 2799,
    category: 'pants',
    gender: 'women',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80'],
    stock: 40,
    rating: 4.7,
    num_reviews: 95,
    featured: false,
    brand: 'Clothings Store Denim',
    sku: 'CS-WOM-PAN-0045',
    specifications: { material: '100% Heavyweight Cotton Denim', fit: 'High-Rise Wide Leg', care: 'Machine wash cold inside out' },
    variants: [{ size: '26', stock: 8 }, { size: '28', stock: 12 }, { size: '30', stock: 12 }, { size: '32', stock: 8 }],
    tags: ['women', 'pants', 'jeans', 'denim', 'wide-leg']
  },
  {
    name: 'Boys Oxford Check Button-Down Shirt & Shorts Set',
    description: 'Preppy two-piece casual ensemble featuring a breathable cotton plaid button-down shirt paired with tailored twill chino shorts with an adjustable waistband.',
    price: 999,
    original_price: 1499,
    category: 'boys',
    gender: 'kids',
    image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=800&q=80'],
    stock: 40,
    rating: 4.8,
    num_reviews: 73,
    featured: true,
    brand: 'Clothings Store Kids',
    sku: 'CS-KID-BOY-0046',
    specifications: { material: '100% Breathable Combed Cotton', fit: 'Regular Kid Fit', care: 'Machine wash warm' },
    variants: [{ size: '3-4Y', stock: 10 }, { size: '5-6Y', stock: 10 }, { size: '7-8Y', stock: 10 }, { size: '9-10Y', stock: 10 }],
    tags: ['kids', 'boys', 'shirts', 'casual', 'smart']
  },
  {
    name: 'Girls Sunshine Floral Tiered Cotton Dress',
    description: 'Delightful all-over floral printed summer sundress with ruffle flutter sleeves and soft cotton lining, perfect for playdates and weekend family brunch.',
    price: 899,
    original_price: 1399,
    category: 'girls',
    gender: 'kids',
    image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80'],
    stock: 50,
    rating: 4.9,
    num_reviews: 88,
    featured: true,
    brand: 'Clothings Store Junior',
    sku: 'CS-KID-GIR-0047',
    specifications: { material: '100% Soft Cotton Voile', fit: 'Easy Fit', care: 'Gentle machine wash' },
    variants: [{ size: '2-3Y', stock: 10 }, { size: '4-5Y', stock: 15 }, { size: '6-7Y', stock: 15 }, { size: '8-9Y', stock: 10 }],
    tags: ['kids', 'girls', 'dresses', 'floral', 'summer']
  },
  {
    name: 'Boys Urban Streetwear Graphic Tee & Joggers',
    description: 'Contemporary urban street style duo featuring an artistic front-print tee crafted from combed jersey and stretchy cargo joggers with functional pockets.',
    price: 1099,
    original_price: 1599,
    category: 'boys',
    gender: 'kids',
    image: 'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?auto=format&fit=crop&w=800&q=80'],
    stock: 35,
    rating: 4.6,
    num_reviews: 51,
    featured: false,
    brand: 'Clothings Store Kids',
    sku: 'CS-KID-BOY-0048',
    specifications: { material: '95% Cotton, 5% Elastane', fit: 'Athletic Comfort Fit', care: 'Machine wash cold' },
    variants: [{ size: '4-5Y', stock: 8 }, { size: '6-7Y', stock: 10 }, { size: '8-9Y', stock: 10 }, { size: '10-12Y', stock: 7 }],
    tags: ['kids', 'boys', 't-shirts', 'joggers', 'streetwear']
  },
  {
    name: 'Girls Shimmer Tulle Ballerina Party Frock',
    description: 'Enchanting fairy-tale celebration dress layered with sparkling soft tulle skirts, a satin sash bow, and 100% skin-friendly cotton lining for zero itching.',
    price: 1499,
    original_price: 2299,
    category: 'girls',
    gender: 'kids',
    image: 'https://images.unsplash.com/photo-1543332164-6e82f355badc?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1543332164-6e82f355badc?auto=format&fit=crop&w=800&q=80'],
    stock: 30,
    rating: 4.9,
    num_reviews: 64,
    featured: true,
    brand: 'Clothings Store Junior',
    sku: 'CS-KID-GIR-0049',
    specifications: { material: 'Tulle & Satin with Cotton Lining', fit: 'Flared Party Fit', care: 'Hand wash gently' },
    variants: [{ size: '3-4Y', stock: 6 }, { size: '5-6Y', stock: 10 }, { size: '7-8Y', stock: 10 }, { size: '9-10Y', stock: 4 }],
    tags: ['kids', 'girls', 'dresses', 'party', 'frock']
  },
  {
    name: 'Unisex Kids Sherpa Fleece Pullover Hoodie',
    description: 'Super plush and thermal Sherpa fleece hooded sweatshirt designed to keep kids snug and cozy in cold temperatures with kangaroo pocket and ribbed cuffs.',
    price: 1199,
    original_price: 1799,
    category: 'kids',
    gender: 'kids',
    image: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=800&q=80'],
    stock: 45,
    rating: 4.8,
    num_reviews: 79,
    featured: false,
    brand: 'Clothings Store Kids',
    sku: 'CS-KID-UNI-0050',
    specifications: { material: 'Thermal Poly-Fleece', fit: 'Relaxed Cozy Fit', care: 'Machine wash cold gentle' },
    variants: [{ size: '4-5Y', stock: 10 }, { size: '6-7Y', stock: 15 }, { size: '8-9Y', stock: 10 }, { size: '10-12Y', stock: 10 }],
    tags: ['kids', 'hoodies', 'winter', 'unisex']
  },
  {
    name: 'Girls Denim Pinafore Overalls & Striped Tee Set',
    description: 'Cute classic denim overall dungarees with metal clasps and patch pockets, paired with a soft striped long-sleeve cotton crewneck tee.',
    price: 1299,
    original_price: 1899,
    category: 'girls',
    gender: 'kids',
    image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80'],
    stock: 35,
    rating: 4.7,
    num_reviews: 58,
    featured: false,
    brand: 'Clothings Store Junior',
    sku: 'CS-KID-GIR-0051',
    specifications: { material: 'Lightweight Stretch Denim & Cotton Tee', fit: 'Regular Fit', care: 'Machine wash cold' },
    variants: [{ size: '3-4Y', stock: 8 }, { size: '5-6Y', stock: 12 }, { size: '7-8Y', stock: 10 }, { size: '9-10Y', stock: 5 }],
    tags: ['kids', 'girls', 'denim', 'dungaree', 'casual']
  }
];

async function seed() {
  try {
    console.log('📦 Updating PostgreSQL database schema and products...');
    await pool.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS gender VARCHAR(50) DEFAULT 'men';");
    await pool.query("UPDATE products SET gender = 'men' WHERE gender IS NULL OR gender = '';");

    for (const p of newProducts) {
      const check = await pool.query('SELECT id FROM products WHERE sku = $1', [p.sku]);
      if (check.rows.length > 0) {
        await pool.query(
          `UPDATE products SET name=$1, description=$2, price=$3, original_price=$4, category=$5,
             gender=$6, image=$7, images=$8, stock=$9, rating=$10, num_reviews=$11, featured=$12,
             brand=$13, specifications=$14, variants=$15, tags=$16, updated_at=NOW()
           WHERE sku=$17`,
          [p.name, p.description, p.price, p.original_price, p.category, p.gender, p.image,
           JSON.stringify(p.images), p.stock, p.rating, p.num_reviews, p.featured, p.brand,
           JSON.stringify(p.specifications), JSON.stringify(p.variants), JSON.stringify(p.tags), p.sku]
        );
      } else {
        await pool.query(
          `INSERT INTO products (name, description, price, original_price, category, gender, image,
             images, stock, rating, num_reviews, featured, brand, sku, specifications, variants, tags)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
          [p.name, p.description, p.price, p.original_price, p.category, p.gender, p.image,
           JSON.stringify(p.images), p.stock, p.rating, p.num_reviews, p.featured, p.brand, p.sku,
           JSON.stringify(p.specifications), JSON.stringify(p.variants), JSON.stringify(p.tags)]
        );
      }
    }

    const counts = await pool.query('SELECT gender, count(*) FROM products GROUP BY gender');
    console.log('✅ PostgreSQL product distribution:', counts.rows);

    await pool.end();
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

seed();
