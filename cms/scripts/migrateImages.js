const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Database = require('better-sqlite3');

const sourceDir = path.join(__dirname, '../../frontend/public/images');
const uploadDir = path.join(__dirname, '../public/uploads');
const dbPath = path.join(__dirname, '../.tmp/data.db');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const db = new Database(dbPath);

console.log('🚀 Starting Strapi Media Migration...');

// 1. Copy all images to cms/public/uploads
const files = fs.readdirSync(sourceDir).filter(f => !f.startsWith('.'));
console.log(`📁 Found ${files.length} image files in ${sourceDir}`);

const now = new Date().toISOString();
const fileMap = new Map(); // filename -> fileId

const insertFileStmt = db.prepare(`
  INSERT INTO files (
    document_id, name, alternative_text, caption, width, height, formats,
    hash, ext, mime, size, url, preview_url, provider, provider_metadata,
    folder_path, created_at, updated_at, published_at, locale
  ) VALUES (
    @document_id, @name, @alternative_text, @caption, @width, @height, @formats,
    @hash, @ext, @mime, @size, @url, @preview_url, @provider, @provider_metadata,
    @folder_path, @created_at, @updated_at, @published_at, @locale
  )
`);

const findFileByNameStmt = db.prepare('SELECT id, name, url FROM files WHERE name = ?');

for (const fileName of files) {
  const srcPath = path.join(sourceDir, fileName);
  const destPath = path.join(uploadDir, fileName);

  // Copy physical file
  fs.copyFileSync(srcPath, destPath);

  const stats = fs.statSync(destPath);
  const ext = path.extname(fileName).toLowerCase();
  const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
  const baseName = path.basename(fileName, ext);
  const hash = `${baseName}_${crypto.randomBytes(4).toString('hex')}`;
  const sizeInKb = parseFloat((stats.size / 1024).toFixed(2));

  let existing = findFileByNameStmt.get(fileName);
  let fileId;

  if (!existing) {
    const docId = crypto.randomBytes(12).toString('hex');
    const result = insertFileStmt.run({
      document_id: docId,
      name: fileName,
      alternative_text: baseName.replace(/[-_]/g, ' '),
      caption: baseName.replace(/[-_]/g, ' '),
      width: 800,
      height: 1000,
      formats: null,
      hash,
      ext,
      mime,
      size: sizeInKb,
      url: `/uploads/${fileName}`,
      preview_url: null,
      provider: 'local',
      provider_metadata: null,
      folder_path: '/',
      created_at: now,
      updated_at: now,
      published_at: now,
      locale: null,
    });
    fileId = result.lastInsertRowid;
  } else {
    fileId = existing.id;
  }

  fileMap.set(fileName.toLowerCase(), { fileId, fileName, url: `/uploads/${fileName}` });
}

console.log(`✅ ${files.length} images mirrored in cms/public/uploads and registered in files table.`);

// 2. Link products to Strapi media in files_related_mph
const products = db.prepare('SELECT id, document_id, name, image_url, category FROM products').all();
console.log(`📦 Processing ${products.length} product rows...`);

const findLinkStmt = db.prepare(`
  SELECT id FROM files_related_mph 
  WHERE related_id = ? AND related_type = 'api::product.product' AND field = ?
`);

const insertLinkStmt = db.prepare(`
  INSERT INTO files_related_mph (file_id, related_id, related_type, field, "order")
  VALUES (?, ?, 'api::product.product', ?, ?)
`);

const updateProductImageUrlStmt = db.prepare(`
  UPDATE products SET image_url = ? WHERE id = ?
`);

let linkedCount = 0;

for (const prod of products) {
  let matchedFile = null;

  if (prod.image_url) {
    const rawName = path.basename(prod.image_url).toLowerCase();
    matchedFile = fileMap.get(rawName);
  }

  // Fallback if not matched directly
  if (!matchedFile) {
    // Attempt category fallback
    const cat = prod.category ? prod.category.toLowerCase() : 'shirt';
    if (cat.includes('shirt')) matchedFile = fileMap.get('shirt1.jpeg');
    else if (cat.includes('pant')) matchedFile = fileMap.get('pant1.jpeg');
    else if (cat.includes('hoodie')) matchedFile = fileMap.get('hoodie1.jpeg');
    else if (cat.includes('t-shirt') || cat.includes('tshirt')) matchedFile = fileMap.get('tshirt1.jpeg');
  }

  if (matchedFile) {
    // 1. Link single image
    const existingSingleLink = findLinkStmt.get(prod.id, 'image');
    if (!existingSingleLink) {
      insertLinkStmt.run(matchedFile.fileId, prod.id, 'image', 1);
      linkedCount++;
    }

    // 2. Link gallery images
    const existingGalleryLink = findLinkStmt.get(prod.id, 'images');
    if (!existingGalleryLink) {
      insertLinkStmt.run(matchedFile.fileId, prod.id, 'images', 1);
    }

    // 3. Update image_url to Strapi media URL
    const fullMediaUrl = `http://localhost:1337${matchedFile.url}`;
    updateProductImageUrlStmt.run(fullMediaUrl, prod.id);
  }
}

console.log(`🎉 Successfully linked ${linkedCount} media relations to products!`);

console.log('🏁 Strapi Media Migration Finished Successfully!');
db.close();
