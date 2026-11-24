const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Database = require('better-sqlite3');

const sourceLogoPath = path.join(__dirname, '../../frontend/src/assets/mens_hub_logo.png');
const uploadDir = path.join(__dirname, '../public/uploads');
const destLogoPath = path.join(uploadDir, 'mens_hub_logo.png');
const dbPath = path.join(__dirname, '../.tmp/data.db');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

if (fs.existsSync(sourceLogoPath)) {
  fs.copyFileSync(sourceLogoPath, destLogoPath);
  console.log('✅ Copied mens_hub_logo.png to cms/public/uploads/');
} else {
  console.error('❌ Source logo not found at:', sourceLogoPath);
}

const db = new Database(dbPath);

// Ensure logo_url column exists in global_settings
const columns = db.prepare('PRAGMA table_info(global_settings)').all();
const hasLogoUrl = columns.some(c => c.name === 'logo_url');
if (!hasLogoUrl) {
  try {
    db.prepare('ALTER TABLE global_settings ADD COLUMN logo_url varchar(255)').run();
    console.log('✅ Added logo_url column to global_settings table.');
  } catch (err) {
    console.log('Note on ALTER TABLE:', err.message);
  }
}

// Check or insert file in files table
const findFileStmt = db.prepare('SELECT id, name, url FROM files WHERE name = ?');
let file = findFileStmt.get('mens_hub_logo.png');

if (!file) {
  const stats = fs.statSync(destLogoPath);
  const now = new Date().toISOString();
  const docId = crypto.randomBytes(12).toString('hex');
  const sizeInKb = parseFloat((stats.size / 1024).toFixed(2));

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

  const result = insertFileStmt.run({
    document_id: docId,
    name: 'mens_hub_logo.png',
    alternative_text: "Men's Hub Luxury Logo",
    caption: "Men's Hub Logo",
    width: 512,
    height: 512,
    formats: null,
    hash: `mens_hub_logo_${crypto.randomBytes(4).toString('hex')}`,
    ext: '.png',
    mime: 'image/png',
    size: sizeInKb,
    url: '/uploads/mens_hub_logo.png',
    preview_url: null,
    provider: 'local',
    provider_metadata: null,
    folder_path: '/',
    created_at: now,
    updated_at: now,
    published_at: now,
    locale: null,
  });

  file = { id: result.lastInsertRowid, url: '/uploads/mens_hub_logo.png' };
  console.log(`✅ Registered mens_hub_logo.png into files table with id: ${file.id}`);
} else {
  console.log(`ℹ️ mens_hub_logo.png already in files table with id: ${file.id}`);
}

// Link in files_related_mph for api::global-setting.global-setting
const globalSetting = db.prepare('SELECT id FROM global_settings LIMIT 1').get();

if (globalSetting) {
  const findLinkStmt = db.prepare(`
    SELECT id FROM files_related_mph 
    WHERE related_id = ? AND related_type = 'api::global-setting.global-setting' AND field = 'logo'
  `);
  const existingLink = findLinkStmt.get(globalSetting.id);

  if (!existingLink) {
    db.prepare(`
      INSERT INTO files_related_mph (file_id, related_id, related_type, field, "order")
      VALUES (?, ?, 'api::global-setting.global-setting', 'logo', 1)
    `).run(file.id, globalSetting.id);
    console.log(`✅ Linked logo file to global_settings (id=${globalSetting.id}) in files_related_mph.`);
  } else {
    db.prepare(`
      UPDATE files_related_mph SET file_id = ? WHERE id = ?
    `).run(file.id, existingLink.id);
    console.log(`✅ Updated existing files_related_mph logo link to file id ${file.id}.`);
  }

  // Also update logo_url field
  db.prepare(`
    UPDATE global_settings 
    SET logo_url = '/uploads/mens_hub_logo.png', updated_at = ?
    WHERE id = ?
  `).run(new Date().toISOString(), globalSetting.id);
  console.log('✅ Updated global_settings logo_url to /uploads/mens_hub_logo.png.');
}

console.log('🎉 Logo seeding complete!');
