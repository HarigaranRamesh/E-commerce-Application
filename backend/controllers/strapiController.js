import {
    checkStrapiHealth,
    syncProductToDatabase,
    deleteProductFromDatabase,
    syncAllFromStrapi,
    normalizeStrapiProduct,
} from '../services/strapiService.js';

/**
 * @desc    Handle incoming Strapi Webhooks
 * @route   POST /api/strapi/webhook
 * @access  Public (Optionally secured with webhook secret)
 */
export const handleStrapiWebhook = async (req, res) => {
    try {
        const secret = process.env.STRAPI_WEBHOOK_SECRET;
        const incomingHeader = req.headers['strapi-webhook-secret'] || req.headers['authorization'];

        if (secret && incomingHeader !== secret && incomingHeader !== `Bearer ${secret}`) {
            console.warn('Unauthorized Strapi webhook attempt: secret mismatch');
            return res.status(401).json({ message: 'Unauthorized webhook request' });
        }

        const { event, model, entry } = req.body;

        // Verify this webhook belongs to the product model
        if (model && model !== 'product') {
            return res.status(200).json({ received: true, ignoredModel: model });
        }

        console.log(`📦 Strapi Webhook received: [${event}] for model [${model || 'product'}]`);

        if (event === 'entry.delete' || event === 'entry.unpublish') {
            const sku = entry?.sku;
            const name = entry?.name;
            const deleted = await deleteProductFromDatabase(sku, name);
            return res.status(200).json({
                success: true,
                action: 'deleted',
                sku,
                deleted,
            });
        }

        if (event === 'entry.create' || event === 'entry.update' || event === 'entry.publish') {
            const syncedProduct = await syncProductToDatabase(entry);
            return res.status(200).json({
                success: true,
                action: 'synced',
                productId: syncedProduct?.id,
                name: syncedProduct?.name,
            });
        }

        res.status(200).json({ received: true, unhandledEvent: event });
    } catch (error) {
        console.error('Error handling Strapi webhook:', error);
        res.status(500).json({ message: error.message || 'Error processing Strapi webhook' });
    }
};

/**
 * @desc    Manually trigger full synchronization from Strapi to PostgreSQL
 * @route   POST /api/strapi/sync
 * @access  Private/Admin
 */
export const triggerSync = async (req, res) => {
    try {
        console.log('🔄 Triggering full catalog synchronization from Strapi CMS...');
        const result = await syncAllFromStrapi();
        res.json({
            success: true,
            message: `Successfully synchronized ${result.totalSynced} of ${result.totalFetched} products from Strapi CMS`,
            ...result,
        });
    } catch (error) {
        console.error('Strapi manual sync error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to sync products from Strapi CMS. Is Strapi running?',
        });
    }
};

/**
 * @desc    Check Strapi CMS Connectivity and Health Status
 * @route   GET /api/strapi/status
 * @access  Public
 */
export const getCmsStatus = async (req, res) => {
    try {
        const health = await checkStrapiHealth();
        res.json({
            success: true,
            strapi: health,
            message: health.online
                ? 'Strapi CMS is reachable and connected'
                : 'Strapi CMS is currently offline or unreachable. Using database fallback.',
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Fetch products directly from Strapi Content API
 * @route   GET /api/strapi/products
 * @access  Public
 */
export const getStrapiProducts = async (req, res) => {
    try {
        const strapiUrl = (process.env.STRAPI_URL || 'http://localhost:1337').replace(/\/$/, '');
        const apiToken = process.env.STRAPI_API_TOKEN;

        const headers = {};
        if (apiToken) headers.Authorization = `Bearer ${apiToken}`;

        const strapiRes = await fetch(`${strapiUrl}/api/products?populate=*`, { headers });
        if (!strapiRes.ok) {
            return res.status(strapiRes.status).json({
                message: `Strapi API returned status ${strapiRes.status}`,
            });
        }

        const data = await strapiRes.json();
        const items = Array.isArray(data.data) ? data.data : [];
        const normalized = items.map((item) => normalizeStrapiProduct(item, strapiUrl));

        res.json({
            success: true,
            count: normalized.length,
            products: normalized,
        });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Error fetching products from Strapi' });
    }
};
