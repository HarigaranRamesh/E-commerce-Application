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

/**
 * Fetch dynamic promotional offers from Strapi CMS
 */
export const fetchOffers = async () => {
    try {
        const res = await fetch(`${STRAPI_BASE_URL}/api/offers?sort=order:ASC`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        return Array.isArray(json.data) ? json.data : [];
    } catch (err) {
        console.warn('Could not fetch offers from Strapi, using defaults:', err.message);
        return [
            {
                id: 1,
                title: "Mid-Season Flash Sale - Up to 60% OFF",
                code: "SUPER20",
                discount: "Up to 60% OFF + Extra 20%",
                description: "Grab our trending wardrobe essentials at unbeatable prices. Extra 20% off on checkout with code SUPER20.",
                min_spend: "₹1,500",
                badge: "LIMITED TIME OFFER",
                cta_text: "Shop Flash Deals Now",
                cta_link: "/Category",
                is_flash_sale: true,
            },
            {
                id: 2,
                title: "First Order Welcome Discount",
                code: "WELCOME10",
                discount: "10% OFF",
                description: "10% OFF on your 1st order with instant discount deduction at checkout.",
                min_spend: "₹500",
                badge: "WELCOME GIFT",
                cta_text: "Explore Collections",
                cta_link: "/Category",
                is_flash_sale: false,
            },
            {
                id: 3,
                title: "Complimentary Express Delivery",
                code: "FREESHIP",
                discount: "FREE SHIPPING",
                description: "Enjoy complimentary Express Priority Delivery on all orders over ₹999 across India.",
                min_spend: "₹999",
                badge: "FREE SHIPPING",
                cta_text: "Discover Styles",
                cta_link: "/Category",
                is_flash_sale: false,
            },
        ];
    }
};

/**
 * Fetch dynamic site & footer settings from Strapi CMS
 */
export const fetchGlobalSettings = async () => {
    try {
        const res = await fetch(`${STRAPI_BASE_URL}/api/global-settings?populate=*`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (Array.isArray(json.data) && json.data.length > 0) {
            const raw = json.data[0];
            const attrs = raw.attributes || raw;
            const logoMedia = attrs.logo || raw.logo;
            const logoUrl = logoMedia ? getStrapiMedia(logoMedia) : (attrs.logo_url ? getStrapiMedia(attrs.logo_url) : null);
            return {
                id: raw.id,
                ...attrs,
                logoUrl,
            };
        }
        return null;
    } catch (err) {
        console.warn('Could not fetch global settings from Strapi, using defaults:', err.message);
        return {
            site_name: "Mens Hub",
            tagline: "Quality products, Fresh Choices",
            logoUrl: null,
            announcement_banner: "🔥 FREE EXPRESS DELIVERY ON ORDERS OVER ₹999 | USE CODE SUPER20 FOR 20% OFF | 7-DAY EASY RETURNS",
            about_text: "At Mens Hub, we believe in delivering premium quality products with an effortless shopping experience. We bring you an exclusive selection curated with care.",
            phone: "+91 97826260723",
            email: "harigaran925@gmail.com",
            address: "Kotagiri, Nilgiris, Tamil Nadu, India.",
            twitter_url: "https://twitter.com",
            instagram_url: "https://instagram.com",
            facebook_url: "https://facebook.com",
            copyright_text: "© Copyright 2025 Mens Hub. All rights reserved.",
            free_shipping_threshold: 999,
            footer_links: [
                { label: "F.A.Q", url: "/faq" },
                { label: "Privacy Policy", url: "/privacy" },
                { label: "Terms & Conditions", url: "/terms" },
                { label: "Shipping & Returns", url: "/shipping" },
            ],
        };
    }
};

export default {
    getStrapiMedia,
    formatStrapiProduct,
    fetchOffers,
    fetchGlobalSettings,
    STRAPI_BASE_URL,
};
