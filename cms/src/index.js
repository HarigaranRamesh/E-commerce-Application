'use strict';
const path = require('path');
const fs = require('fs');

module.exports = {
  register(/*{ strapi }*/) {},

  async bootstrap({ strapi }) {
    console.log("🚀 Strapi CMS Initializing for Men's Hub E-commerce...");

    try {
      // 1. Automatically configure Public permissions for all public content types
      const publicRole = await strapi
        .query('plugin::users-permissions.role')
        .findOne({ where: { type: 'public' } });

      if (publicRole) {
        const permissionsToEnable = [
          'api::product.product.find',
          'api::product.product.findOne',
          'api::category.category.find',
          'api::category.category.findOne',
          'api::offer.offer.find',
          'api::offer.offer.findOne',
          'api::global-setting.global-setting.find',
          'api::global-setting.global-setting.findOne',
          'plugin::upload.content-api.find',
          'plugin::upload.content-api.findOne',
        ];

        for (const action of permissionsToEnable) {
          try {
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
          } catch (permErr) {
            // Ignore if action isn't registered yet
          }
        }
      }

      // 2. Migrate Products from data/products.json (if empty)
      const productsFile = path.join(__dirname, '../data/products.json');
      if (fs.existsSync(productsFile)) {
        const raw = fs.readFileSync(productsFile, 'utf8');
        const seedProducts = JSON.parse(raw);

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
        }
      }

      // 3. Migrate Global Site & Footer Settings
      try {
        let globalCount = 0;
        if (strapi.documents) {
          globalCount = await strapi.documents('api::global-setting.global-setting').count();
        } else if (strapi.entityService) {
          globalCount = await strapi.entityService.count('api::global-setting.global-setting');
        }

        if (globalCount === 0) {
          console.log('🌐 Seeding Global Site & Footer Settings into Strapi CMS...');
          const globalData = {
            site_name: "Mens Hub",
            tagline: "Quality products, Fresh Choices",
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

          if (strapi.documents) {
            await strapi.documents('api::global-setting.global-setting').create({
              data: globalData,
              status: 'published',
            });
          } else if (strapi.entityService) {
            await strapi.entityService.create('api::global-setting.global-setting', {
              data: globalData,
            });
          }
          console.log('✅ Global Site & Footer Settings seeded successfully!');
        }
      } catch (globalErr) {
        console.warn('Could not seed global settings:', globalErr.message);
      }

      // 4. Migrate Dynamic Promotional Offers & Flash Deals
      try {
        let offerCount = 0;
        if (strapi.documents) {
          offerCount = await strapi.documents('api::offer.offer').count();
        } else if (strapi.entityService) {
          offerCount = await strapi.entityService.count('api::offer.offer');
        }

        if (offerCount === 0) {
          console.log('🏷️ Seeding Promotional Offers & Coupons into Strapi CMS...');
          const initialOffers = [
            {
              title: "Mid-Season Flash Sale - Up to 60% OFF",
              code: "SUPER20",
              discount: "Up to 60% OFF + Extra 20%",
              description: "Grab our trending wardrobe essentials at unbeatable prices. Extra 20% off on checkout with code SUPER20.",
              min_spend: "₹1,500",
              badge: "LIMITED TIME OFFER",
              cta_text: "Shop Flash Deals Now",
              cta_link: "/Category",
              active: true,
              is_flash_sale: true,
              order: 1,
            },
            {
              title: "First Order Welcome Discount",
              code: "WELCOME10",
              discount: "10% OFF",
              description: "10% OFF on your 1st order with instant discount deduction at checkout.",
              min_spend: "₹500",
              badge: "WELCOME GIFT",
              cta_text: "Explore Collections",
              cta_link: "/Category",
              active: true,
              is_flash_sale: false,
              order: 2,
            },
            {
              title: "Complimentary Express Delivery",
              code: "FREESHIP",
              discount: "FREE SHIPPING",
              description: "Enjoy complimentary Express Priority Delivery on all orders over ₹999 across India.",
              min_spend: "₹999",
              badge: "FREE SHIPPING",
              cta_text: "Discover Styles",
              cta_link: "/Category",
              active: true,
              is_flash_sale: false,
              order: 3,
            },
          ];

          for (const offer of initialOffers) {
            if (strapi.documents) {
              await strapi.documents('api::offer.offer').create({
                data: offer,
                status: 'published',
              });
            } else if (strapi.entityService) {
              await strapi.entityService.create('api::offer.offer', {
                data: offer,
              });
            }
          }
          console.log(`✅ Seeded ${initialOffers.length} dynamic promotional offers!`);
        }
      } catch (offerErr) {
        console.warn('Could not seed offers:', offerErr.message);
      }
    } catch (err) {
      console.error('Error during Strapi CMS bootstrap migration:', err);
    }
  },
};
