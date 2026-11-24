/**
 * Strapi CMS Client Utility & Normalizer
 */

const STRAPI_BASE_URL = (import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337').replace(/\/$/, '');

/**
 * Resolves Strapi media URL (handles relative '/uploads/...' paths and full CDN URLs)
 */
export const getStrapiMedia = (media) => {
    if (!media) return '/images/placeholder.png';

    let path = '';
    if (typeof media === 'string') {
        path = media;
    } else if (media.url) {
        path = media.url;
    } else if (media.data?.attributes?.url) {
        path = media.data.attributes.url;
    }

    if (!path) return '/images/placeholder.png';
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    return `${STRAPI_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

/**
 * Normalizes a Strapi product object for direct frontend rendering
 */
export const formatStrapiProduct = (item) => {
    if (!item) return null;
    const attrs = item.attributes || item;

    const primaryImage = getStrapiMedia(attrs.image);

    let gallery = [];
    if (attrs.images) {
        if (Array.isArray(attrs.images)) {
            gallery = attrs.images.map(getStrapiMedia).filter(Boolean);
        } else if (Array.isArray(attrs.images.data)) {
            gallery = attrs.images.data.map(getStrapiMedia).filter(Boolean);
        }
    }
    if (gallery.length === 0 && primaryImage) {
        gallery = [primaryImage];
    }

    return {
        id: item.id || attrs.id,
        _id: item.id || attrs.id,
        name: attrs.name || 'Untitled',
        description: attrs.description || '',
        price: parseFloat(attrs.price || 0),
        original_price: attrs.original_price ? parseFloat(attrs.original_price) : Math.round(parseFloat(attrs.price || 0) * 1.25),
        category: attrs.category || 'shirts',
        image: primaryImage,
        images: gallery,
        stock: parseInt(attrs.stock ?? 10, 10),
        rating: parseFloat(attrs.rating || 4.5),
        num_reviews: parseInt(attrs.num_reviews || 0, 10),
        featured: Boolean(attrs.featured),
        brand: attrs.brand || "Men's Hub Luxury",
        sku: attrs.sku || `STRAPI-${item.id}`,
        specifications: attrs.specifications || {},
        variants: attrs.variants || [],
        tags: attrs.tags || [],
    };
};

export default {
    getStrapiMedia,
    formatStrapiProduct,
    STRAPI_BASE_URL,
};
