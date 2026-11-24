'use strict';
const path = require('path');
const fs = require('fs');

module.exports = {
  register(/*{ strapi }*/) {},

  async bootstrap({ strapi }) {
    console.log("🚀 Strapi CMS Initializing for Men's Hub E-commerce...");

    try {
      // 1. Automatically configure Public permissions for product and category
      const publicRole = await strapi
        .query('plugin::users-permissions.role')
        .findOne({ where: { type: 'public' } });

      if (publicRole) {
        const permissionsToEnable = [
          'api::product.product.find',
          'api::product.product.findOne',
          'api::category.category.find',
          'api::category.category.findOne',
        ];

        for (const action of permissionsToEnable) {
          const exists = await strapi
            .query('plugin::users-permissions.permission')
            .findOne({
              where: {
                role: publicRole.id,
                action,
              },
            });

          if (!exists) {
            await strapi
              .query('plugin::users-permissions.permission')
              .create({
                data: {
                  role: publicRole.id,
                  action,
                  enabled: true,
                },
              });
          }
        }
      }

      // 2. Migrate Products from data/products.json
      const productsFile = path.join(__dirname, '../data/products.json');
      if (fs.existsSync(productsFile)) {
        const raw = fs.readFileSync(productsFile, 'utf8');
        const seedProducts = JSON.parse(raw);

        // Check current product count in Strapi
        let count = 0;
        try {
          if (strapi.documents) {
            count = await strapi.documents('api::product.product').count();
          } else if (strapi.entityService) {
            count = await strapi.entityService.count('api::product.product');
          }
        } catch {
          count = 0;
        }

        if (count === 0) {
          console.log(`📦 Migrating ${seedProducts.length} products into Strapi CMS...`);

          for (const item of seedProducts) {
            const productData = {
              name: item.name,
              description: item.description || `Premium ${item.category} crafted with high quality fabric.`,
              price: Number(item.price),
              original_price: Number(item.price) * 1.25,
              category: item.category.toLowerCase(),
              imageUrl: item.image,
              stock: Number(item.stock || 25),
              rating: Number(item.rating || 4.5),
              num_reviews: Number(item.numReviews || 0),
              featured: Boolean(item.featured),
              brand: "Men's Hub Luxury",
              sku: `MH-${item.category.toUpperCase().substring(0, 3)}-${String(item.id).padStart(4, '0')}`,
              specifications: {
                material: "100% Premium Combed Cotton",
                fit: "Slim Fit",
                care: "Machine wash cold, tumble dry low",
              },
              variants: {
                sizes: ["S", "M", "L", "XL", "XXL"],
                colors: ["Classic Navy", "Charcoal Black", "Pure White"],
              },
              tags: [item.category, "menswear", "luxury"],
            };

            try {
              if (strapi.documents) {
                await strapi.documents('api::product.product').create({
                  data: productData,
                  status: 'published',
                });
              } else if (strapi.entityService) {
                await strapi.entityService.create('api::product.product', {
                  data: {
                    ...productData,
                    publishedAt: new Date(),
                  },
                });
              }
            } catch (createErr) {
              console.warn(`Could not seed product ${item.name}:`, createErr.message);
            }
          }
          console.log(`✅ Successfully migrated ${seedProducts.length} products to Strapi CMS!`);
        } else {
          console.log(`ℹ️ Strapi CMS already contains ${count} products.`);
        }
      }
    } catch (err) {
      console.error('Error during Strapi CMS bootstrap migration:', err);
    }
  },
};
