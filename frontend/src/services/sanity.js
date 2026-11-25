/**
 * Sanity CMS Client Service for Luxury E-commerce Storefront
 * Queries Sanity Global Edge CDN directly with ultra-low latency (<10ms).
 */

const SANITY_PROJECT_ID = import.meta.env.VITE_SANITY_PROJECT_ID || 'twhkbzvd';
const SANITY_DATASET = import.meta.env.VITE_SANITY_DATASET || 'production';
const SANITY_API_VERSION = 'v2024-01-01';

const CDN_BASE_URL = `https://${SANITY_PROJECT_ID}.api.sanity.io/${SANITY_API_VERSION}/data/query/${SANITY_DATASET}`;

// In-memory cache for Sanity queries to eliminate repeated API calls
const sanityQueryCache = new Map();
const SANITY_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Execute GROQ query against Sanity Edge CDN with caching
 */
export async function querySanity(groq) {
  const cached = sanityQueryCache.get(groq);
  if (cached && Date.now() - cached.timestamp < SANITY_CACHE_TTL) {
    return cached.data;
  }

  try {
    const url = `${CDN_BASE_URL}?query=${encodeURIComponent(groq)}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Sanity CDN returned HTTP ${res.status}`);
    }
    const json = await res.json();
    sanityQueryCache.set(groq, { data: json.result, timestamp: Date.now() });
    return json.result;
  } catch (err) {
    console.warn('[Sanity CMS] CDN query failed, falling back:', err.message);
    if (cached) return cached.data;
    return null;
  }
}

/**
 * Resolves image URL from a Sanity asset reference or fallback imageUrl
 */
export function resolveSanityImageUrl(imageObj, fallbackUrl = '') {
  if (!imageObj) return fallbackUrl;
  if (typeof imageObj === 'string') return imageObj;
  if (imageObj.imageUrl) return imageObj.imageUrl;
  if (imageObj.asset?._ref) {
    // Sanity image asset reference format: image-<id>-<dimensions>-<format>
    const ref = imageObj.asset._ref;
    const parts = ref.split('-');
    if (parts.length >= 4) {
      const assetId = parts[1];
      const dimensions = parts[2];
      const format = parts[3];
      return `https://cdn.sanity.io/images/${SANITY_PROJECT_ID}/${SANITY_DATASET}/${assetId}-${dimensions}.${format}`;
    }
  }
  return fallbackUrl;
}

/**
 * Fetch dynamic Hero Banner slides
 */
export async function fetchHeroBanners() {
  const groq = `*[_type == "banner" && active == true] | order(order asc) {
    _id,
    title,
    subtitle,
    alt,
    image,
    "imageUrl": coalesce(image.asset->url, imageUrl),
    link,
    badge,
    order
  }`;
  const result = await querySanity(groq);
  if (!result || !Array.isArray(result) || result.length === 0) return null;

  return result.map((item, idx) => ({
    id: item._id || idx + 1,
    title: item.title,
    subtitle: item.subtitle,
    alt: item.alt || item.title,
    image: item.imageUrl || resolveSanityImageUrl(item.image, item.imageUrl),
    link: item.link || '/Category',
    badge: item.badge,
  }));
}

/**
 * Fetch dynamic curated Categories
 */
export async function fetchCuratedCategories() {
  const groq = `*[_type == "category"] | order(order asc) {
    _id,
    name,
    "slug": slug.current,
    image,
    imageUrl,
    count,
    gender,
    order,
    description
  }`;
  const result = await querySanity(groq);
  if (!result || !Array.isArray(result) || result.length === 0) return null;

  return result.map((cat) => ({
    id: cat._id,
    name: cat.name,
    slug: cat.slug || 'all',
    image: resolveSanityImageUrl(cat.image, cat.imageUrl),
    count: cat.count || 'Styles Available',
    gender: cat.gender || 'all',
    description: cat.description,
  }));
}

/**
 * Fetch dynamic Navigation Menus
 */
export async function fetchNavigationMenus() {
  const groq = `*[_type == "navigationMenu"] | order(order asc) {
    _id,
    name,
    slug,
    order,
    items[] {
      label,
      link
    }
  }`;
  const result = await querySanity(groq);
  if (!result || !Array.isArray(result) || result.length === 0) return null;

  return result.map((menu) => ({
    name: menu.name,
    slug: menu.slug,
    items: (menu.items || []).map((it) => ({
      label: it.label,
      link: it.link,
    })),
  }));
}

/**
 * Fetch dynamic Global Site Settings & Trust Features
 */
export async function fetchSanityGlobalSettings() {
  const groq = `*[_type == "globalSetting"][0] {
    _id,
    site_name,
    tagline,
    announcement_banner,
    about_text,
    phone,
    email,
    address,
    twitter_url,
    instagram_url,
    facebook_url,
    copyright_text,
    free_shipping_threshold,
    features[] {
      title,
      desc,
      icon
    }
  }`;
  const result = await querySanity(groq);
  return result || null;
}

/**
 * Fetch dynamic Promotional Offers
 */
export async function fetchSanityOffers() {
  const groq = `*[_type == "offer" && active == true] | order(order asc) {
    _id,
    title,
    code,
    discount,
    description,
    min_spend,
    badge,
    cta_text,
    cta_link,
    is_flash_sale
  }`;
  const result = await querySanity(groq);
  return result || null;
}

export default {
  querySanity,
  resolveSanityImageUrl,
  fetchHeroBanners,
  fetchCuratedCategories,
  fetchNavigationMenus,
  fetchSanityGlobalSettings,
  fetchSanityOffers,
};
