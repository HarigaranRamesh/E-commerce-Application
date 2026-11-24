import { pool } from '../config/db.js';

const getStrapiConfig = () => ({
    url: (process.env.STRAPI_URL || 'http://localhost:1337').replace(/\/$/, ''),
    apiToken: process.env.STRAPI_API_TOKEN || '',
});

/**
 * Resolve Strapi media URL (single object or string)
 */
export const resolveStrapiMediaUrl = (mediaObj, strapiBaseUrl) => {
    if (!mediaObj) return null;
    let path = '';

    if (typeof mediaObj === 'string') {
        path = mediaObj;
    } else if (mediaObj.url) {
        path = mediaObj.url;
    } else if (mediaObj.data?.attributes?.url) {
        path = mediaObj.data.attributes.url;
    } else if (Array.isArray(mediaObj.data) && mediaObj.data[0]?.attributes?.url) {
        path = mediaObj.data[0].attributes.url;
    }

    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    return `${strapiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
};

/**
 * Normalizes Strapi product payload into unified e-commerce Product format
 */
export const normalizeStrapiProduct = (rawItem, strapiBaseUrl) => {
    if (!rawItem) return null;

    const base = strapiBaseUrl || getStrapiConfig().url;
    // Support Strapi v4 nested attributes, Strapi v5 flat objects, or webhook entry payloads
    const attrs = rawItem.attributes || rawItem;
    const strapiId = rawItem.id || attrs.id;

    // Resolve primary image
    const primaryImg = resolveStrapiMediaUrl(attrs.image, base) || '/images/placeholder.png';

    // Resolve gallery images
    let gallery = [];
    if (attrs.images) {
        if (Array.isArray(attrs.images)) {
            gallery = attrs.images
                .map((img) => resolveStrapiMediaUrl(img, base))
                .filter(Boolean);
        } else if (Array.isArray(attrs.images.data)) {
            gallery = attrs.images.data
                .map((img) => resolveStrapiMediaUrl(img, base))
                .filter(Boolean);
        }
    }
    if (gallery.length === 0 && primaryImg) {
        gallery = [primaryImg];
    }

    return {
        strapi_id: strapiId ? String(strapiId) : null,
        name: attrs.name || 'Untitled Product',
        description: typeof attrs.description === 'string' ? attrs.description : 'Premium garment crafted with high quality fabric.',
        price: parseFloat(attrs.price || 0),
        original_price: attrs.original_price ? parseFloat(attrs.original_price) : Math.round(parseFloat(attrs.price || 0) * 1.25),
        category: (attrs.category || 'shirts').toLowerCase(),
        image: primaryImg,
        images: gallery,
        stock: parseInt(attrs.stock ?? 15, 10),
        rating: parseFloat(attrs.rating || 4.5),
        num_reviews: parseInt(attrs.num_reviews || 0, 10),
        featured: Boolean(attrs.featured),
        brand: attrs.brand || "Men's Hub Luxury",
        sku: attrs.sku || (strapiId ? `STRAPI-${strapiId}` : `SKU-${Date.now()}`),
        specifications: typeof attrs.specifications === 'object' && attrs.specifications !== null ? attrs.specifications : {},
        variants: Array.isArray(attrs.variants) ? attrs.variants : [
            { size: 'S', stock: 5 },
            { size: 'M', stock: 10 },
            { size: 'L', stock: 8 },
            { size: 'XL', stock: 4 },
        ],
        tags: Array.isArray(attrs.tags) ? attrs.tags : ['strapi', 'new-arrival'],
    };
};

/**
 * Check if Strapi instance is currently reachable
 */
export const checkStrapiHealth = async () => {
    const { url, apiToken } = getStrapiConfig();
    try {
        const headers = {};
        if (apiToken) headers.Authorization = `Bearer ${apiToken}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const res = await fetch(`${url}/api/products?pagination[limit]=1`, {
            method: 'GET',
            headers,
            signal: controller.signal,
        });
        clearTimeout(timeoutId);

        return {
            online: res.ok || res.status === 403, // 403 indicates Strapi is up but permissions need to be enabled
            status: res.status,
            url,
        };
    } catch {
        return {
            online: false,
            url,
        };
    }
};

/**
 * Syncs a single Strapi product into PostgreSQL database
 */
export const syncProductToDatabase = async (rawItem) => {
    const { url } = getStrapiConfig();
    const product = normalizeStrapiProduct(rawItem, url);
    if (!product) return null;

    // Check if product exists by SKU or name
    const checkQuery = `
        SELECT id, _id FROM products 
        WHERE (sku IS NOT NULL AND sku = $1) OR name = $2 
        LIMIT 1;
    `;
    const checkRes = await pool.query(checkQuery, [product.sku, product.name]);

    if (checkRes.rows.length > 0) {
        // Update existing product
        const updateQuery = `
            UPDATE products
            SET name = $1, description = $2, price = $3, original_price = $4,
                category = $5, image = $6, images = $7, stock = $8,
                rating = $9, num_reviews = $10, featured = $11, brand = $12,
                sku = $13, specifications = $14, variants = $15, tags = $16,
                updated_at = NOW()
            WHERE id = $17
            RETURNING *;
        `;
        const values = [
            product.name,
            product.description,
            product.price,
            product.original_price,
            product.category,
            product.image,
            JSON.stringify(product.images),
            product.stock,
            product.rating,
            product.num_reviews,
            product.featured,
            product.brand,
            product.sku,
            JSON.stringify(product.specifications),
            JSON.stringify(product.variants),
            JSON.stringify(product.tags),
            checkRes.rows[0].id,
        ];
        const updated = await pool.query(updateQuery, values);
        return updated.rows[0];
    }

    // Insert new product
    const insertQuery = `
        INSERT INTO products (
            name, description, price, original_price, category,
            image, images, stock, rating, num_reviews,
            featured, brand, sku, specifications, variants, tags
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *;
    `;
    const insertValues = [
        product.name,
        product.description,
        product.price,
        product.original_price,
        product.category,
        product.image,
        JSON.stringify(product.images),
        product.stock,
        product.rating,
        product.num_reviews,
        product.featured,
        product.brand,
        product.sku,
        JSON.stringify(product.specifications),
        JSON.stringify(product.variants),
        JSON.stringify(product.tags),
    ];
    const inserted = await pool.query(insertQuery, insertValues);
    return inserted.rows[0];
};

/**
 * Remove a deleted Strapi product from the database
 */
export const deleteProductFromDatabase = async (sku, name) => {
    if (!sku && !name) return false;
    const res = await pool.query(
        'DELETE FROM products WHERE (sku IS NOT NULL AND sku = $1) OR name = $2 RETURNING id;',
        [sku, name]
    );
    return res.rows.length > 0;
};

/**
 * Full Sync: Fetches all products from Strapi Content API and syncs into PostgreSQL
 */
export const syncAllFromStrapi = async () => {
    const { url, apiToken } = getStrapiConfig();
    const headers = {};
    if (apiToken) headers.Authorization = `Bearer ${apiToken}`;

    const res = await fetch(`${url}/api/products?populate=*&pagination[limit]=100`, {
        method: 'GET',
        headers,
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch products from Strapi (${res.status} ${res.statusText})`);
    }

    const json = await res.json();
    const items = Array.isArray(json.data) ? json.data : [];

    const syncedList = [];
    for (const item of items) {
        const synced = await syncProductToDatabase(item);
        if (synced) syncedList.push(synced);
    }

    return {
        totalFetched: items.length,
        totalSynced: syncedList.length,
        syncedProducts: syncedList,
    };
};

export default {
    resolveStrapiMediaUrl,
    normalizeStrapiProduct,
    checkStrapiHealth,
    syncProductToDatabase,
    deleteProductFromDatabase,
    syncAllFromStrapi,
};
