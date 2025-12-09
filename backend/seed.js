import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

const products = [
    // --- SHIRTS ---
    {
        id: 1,
        name: "Classic Oxford Blue Shirt",
        category: "shirts",
        price: 950,
        image: "/images/shirt1.jpeg",
        description: "A timeless classic, this Oxford blue shirt is perfect for both casual and formal occasions. Made from 100% premium cotton for breathability and comfort.",
        rating: 4.5,
        numReviews: 124,
        stock: 50,
        featured: true
    },
    {
        id: 2,
        name: "Casual Check Shirt",
        category: "shirts",
        price: 950,
        image: "/images/shirt2.jpeg",
        description: "Add a pop of pattern to your wardrobe with this stylish check shirt. Soft fabric and a relaxed fit make it an everyday essential.",
        rating: 4.2,
        numReviews: 89,
        stock: 40
    },
    {
        id: 3,
        name: "Formal White Shirt",
        category: "shirts",
        price: 1200,
        image: "/images/shirt3.jpeg",
        description: "Crisp, clean, and professional. This formal white shirt features a wrinkle-resistant finish and a modern slim fit.",
        rating: 4.8,
        numReviews: 210,
        stock: 60,
        featured: true
    },
    {
        id: 4,
        name: "Denim Chambray Shirt",
        category: "shirts",
        price: 899,
        image: "/images/shirt4.jpeg",
        description: "Rugged yet refined, this denim chambray shirt pairs perfectly with chinos or jeans. Durable double-stitched seams.",
        rating: 4.3,
        numReviews: 76,
        stock: 35
    },
    {
        id: 5,
        name: "Linen Summer Shirt",
        category: "shirts",
        price: 999,
        image: "/images/shirt5.jpeg",
        description: "Stay cool in the heat with our lightweight linen shirt. Natural fibers provide excellent ventilation.",
        rating: 4.6,
        numReviews: 150,
        stock: 25,
        featured: true
    },
    {
        id: 6,
        name: "Striped Business Shirt",
        category: "shirts",
        price: 950,
        image: "/images/shirt6.jpeg",
        description: "Elevate your office look with this vertical striped shirt. Tailored fit ensures a sharp silhouette.",
        rating: 4.4,
        numReviews: 92,
        stock: 45
    },
    {
        id: 7,
        name: "Vintage Print Shirt",
        category: "shirts",
        price: 800,
        image: "/images/shirt7.jpeg",
        description: "Retro-inspired print for those who like to stand out. Soft wash finish for a lived-in feel from day one.",
        rating: 4.1,
        numReviews: 45,
        stock: 30
    },
    {
        id: 8,
        name: "Solid Black Shirt",
        category: "shirts",
        price: 850,
        image: "/images/shirt8.jpeg",
        description: "Sleek and versatile solid black shirt. A wardrobe staple that goes with everything.",
        rating: 4.7,
        numReviews: 180,
        stock: 55
    },
    {
        id: 9,
        name: "Navy Slim Fit Shirt",
        category: "shirts",
        price: 950,
        image: "/images/shirt9.jpeg",
        description: "Deep navy hue in a modern slim silhouette. Perfect for evening outings.",
        rating: 4.5,
        numReviews: 110,
        stock: 40
    },
    {
        id: 10,
        name: "Beige Casual Shirt",
        category: "shirts",
        price: 950,
        image: "/images/shirt10.jpeg",
        description: "Neutral beige tone for a relaxed, earthy vibe. Comfortable cotton blend fabric.",
        rating: 4.2,
        numReviews: 65,
        stock: 35
    },

    // --- PANTS ---
    {
        id: 19,
        name: "Slim Fit Chinos",
        category: "pants",
        price: 1100,
        image: "/images/pant1.jpeg",
        description: "Versatile slim fit chinos suitable for work or weekend. Stretch fabric allows for easy movement.",
        rating: 4.4,
        numReviews: 200,
        stock: 60,
        featured: true
    },
    {
        id: 20,
        name: "Classic Beige Trousers",
        category: "pants",
        price: 1300,
        image: "/images/pant2.jpeg",
        description: "Timeless beige trousers with a straight leg fit. Essential for semi-formal attire.",
        rating: 4.3,
        numReviews: 140,
        stock: 50
    },
    {
        id: 21,
        name: "Navy Blue Formal Pants",
        category: "pants",
        price: 1150,
        image: "/images/pant3.jpeg",
        description: "Sharp navy formal pants. Crease-resistant fabric keeps you looking professional all day.",
        rating: 4.6,
        numReviews: 180,
        stock: 55
    },
    {
        id: 22,
        name: "Grey Wool Blend Pants",
        category: "pants",
        price: 1200,
        image: "/images/pant4.jpeg",
        description: "Premium wool blend for warmth and texture. Perfect for cooler seasons.",
        rating: 4.5,
        numReviews: 95,
        stock: 30
    },
    {
        id: 23,
        name: "Olive Cargo Pants",
        category: "pants",
        price: 1250,
        image: "/images/pant5.jpeg",
        description: "Functional and stylish cargo pants with multiple pockets. Durable fabric for outdoor activities.",
        rating: 4.2,
        numReviews: 110,
        stock: 45
    },

    // --- HOODIES ---
    {
        id: 17,
        name: "Essential Grey Hoodie",
        category: "hoodies",
        price: 1500,
        image: "/images/Hoodie1.jpeg",
        description: "The ultimate comfort wear. Heavyweight cotton fleece provided warmth and softness.",
        rating: 4.8,
        numReviews: 320,
        stock: 70,
        featured: true
    },
    {
        id: 102,
        name: "Black Pullover Hoodie",
        category: "hoodies",
        price: 1600,
        image: "/images/Hoodie2.jpeg",
        description: "Classic black pullover with a kangaroo pocket. A streetwear essential.",
        rating: 4.7,
        numReviews: 250,
        stock: 65,
        featured: true
    },
    {
        id: 103,
        name: "Navy Zip-Up Hoodie",
        category: "hoodies",
        price: 1550,
        image: "/images/Hoodie3.jpeg",
        description: "Versatile zip-up style in navy. Great for layering.",
        rating: 4.5,
        numReviews: 180,
        stock: 50
    },

    // --- T-SHIRTS ---
    {
        id: 201,
        name: "Basic White Tee",
        category: "t-shirts",
        price: 700,
        image: "/images/Tshirt1.jpeg",
        description: "Essential white crew neck t-shirt. Made from combed cotton for extra softness.",
        rating: 4.6,
        numReviews: 400,
        stock: 100
    },
    {
        id: 202,
        name: "Graphic Print Tee",
        category: "t-shirts",
        price: 800,
        image: "/images/Tshirt2.jpeg",
        description: "Express yourself with this unique graphic print. High-quality print that won't fade.",
        rating: 4.3,
        numReviews: 120,
        stock: 80
    },
    {
        id: 203,
        name: "V-Neck Grey Tee",
        category: "t-shirts",
        price: 750,
        image: "/images/Tshirt3.jpeg",
        description: "Modern V-neck cut in a heather grey. Flattering fit.",
        rating: 4.4,
        numReviews: 150,
        stock: 90
    },

    // --- MORE SHIRTS ---
    {
        id: 11,
        name: "Premium Cotton Shirt",
        category: "shirts",
        price: 1050,
        image: "/images/shirt11.jpeg",
        description: "High-quality premium cotton shirt for special occasions.",
        rating: 4.6,
        numReviews: 88,
        stock: 42
    },
    {
        id: 12,
        name: "Urban Check Shirt",
        category: "shirts",
        price: 999,
        image: "/images/shirt12.jpeg",
        description: "Modern check pattern for the urban explorer.",
        rating: 4.3,
        numReviews: 54,
        stock: 38
    },
    {
        id: 13,
        name: "Soft Touch Flannel",
        category: "shirts",
        price: 1100,
        image: "/images/shirt13.jpeg",
        description: "Ultra-soft flannel shirt, perfect for layering.",
        rating: 4.7,
        numReviews: 130,
        stock: 48
    },
    {
        id: 14,
        name: "Casual Friday Shirt",
        category: "shirts",
        price: 920,
        image: "/images/shirt14.jpeg",
        description: "Relaxed fit for your end-of-week style.",
        rating: 4.4,
        numReviews: 76,
        stock: 52
    },
    {
        id: 15,
        name: "Summer Breeze Shirt",
        category: "shirts",
        price: 899,
        image: "/images/shirt15.jpeg",
        description: "Lightweight and airy, designed for hot summer days.",
        rating: 4.5,
        numReviews: 99,
        stock: 60
    },

    // --- MORE PANTS ---
    {
        id: 24,
        name: "Comfort Fit Trousers",
        category: "pants",
        price: 1150,
        image: "/images/pant7.jpeg",
        description: "Designed for all-day comfort without sacrificing style.",
        rating: 4.3,
        numReviews: 82,
        stock: 45
    },
    {
        id: 25,
        name: "Urban Cargo Pants",
        category: "pants",
        price: 1300,
        image: "/images/pant8.jpeg",
        description: "Street-style cargo pants with a modern taper.",
        rating: 4.6,
        numReviews: 112,
        stock: 40
    },
    {
        id: 26,
        name: "Smart Casual Chinos",
        category: "pants",
        price: 1200,
        image: "/images/pant9.jpeg",
        description: "The perfect balance between formal and casual.",
        rating: 4.4,
        numReviews: 95,
        stock: 50
    },
    {
        id: 27,
        name: "Stretch Denim Jeans",
        category: "pants",
        price: 1400,
        image: "/images/pant10.jpeg",
        description: "Classic denim look with added stretch for flexibility.",
        rating: 4.7,
        numReviews: 205,
        stock: 75
    },
    {
        id: 28,
        name: "Relaxed Fit Joggers",
        category: "pants",
        price: 999,
        image: "/images/pant11.jpeg",
        description: "Casual joggers for lounging or hitting the gym.",
        rating: 4.5,
        numReviews: 150,
        stock: 65
    },

    // --- MORE HOODIES ---
    {
        id: 104,
        name: "Urban Street Hoodie",
        category: "hoodies",
        price: 1650,
        image: "/images/Hoodie4.jpeg",
        description: "Bold street style hoodie with unique detailing.",
        rating: 4.7,
        numReviews: 180,
        stock: 55
    },
    {
        id: 105,
        name: "Cozy Fleece Pullover",
        category: "hoodies",
        price: 1450,
        image: "/images/Hoodie5.jpeg",
        description: "Maximum warmth with our signature soft fleece lining.",
        rating: 4.8,
        numReviews: 210,
        stock: 60
    },
    {
        id: 106,
        name: "Active Performance Hoodie",
        category: "hoodies",
        price: 1550,
        image: "/images/Hoodie6.jpeg",
        description: "Moisture-wicking fabric for active lifestyles.",
        rating: 4.6,
        numReviews: 95,
        stock: 45
    },

    // --- MORE T-SHIRTS ---
    {
        id: 204,
        name: "Striped Henley Tee",
        category: "t-shirts",
        price: 850,
        image: "/images/Tshirt4.jpeg",
        description: "Classic Henley style with a subtle stripe pattern.",
        rating: 4.4,
        numReviews: 110,
        stock: 70
    },
    {
        id: 205,
        name: "Vintage Logo Tee",
        category: "t-shirts",
        price: 900,
        image: "/images/Tshirt5.jpeg",
        description: "Retro logo print for a nostalgic look.",
        rating: 4.5,
        numReviews: 135,
        stock: 55
    },
    {
        id: 206,
        name: "Slim Fit Colorblock",
        category: "t-shirts",
        price: 799,
        image: "/images/Tshirt6.jpeg",
        description: "Trendy colorblock design for a modern aesthetic.",
        rating: 4.2,
        numReviews: 88,
        stock: 50
    },
    {
        id: 207,
        name: "Crew Neck Essential",
        category: "t-shirts",
        price: 750,
        image: "/images/Tshirt7.jpeg",
        description: "Everyday essential tee in a fresh colorway.",
        rating: 4.6,
        numReviews: 160,
        stock: 100
    },
    {
        id: 208,
        name: "Long Sleeve Tee",
        category: "t-shirts",
        price: 899,
        image: "/images/Tshirt8.jpeg",
        description: "Perfect for transitional weather, soft and breathable.",
        rating: 4.3,
        numReviews: 92,
        stock: 60
    }
];

const seedDatabase = async () => {
    try {
        await connectDB();

        // Clear existing data
        await Product.deleteMany();
        await User.deleteMany();

        // Create admin user
        const adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'admin123',
            role: 'admin',
        });

        // Create test user
        await User.create({
            name: 'Test User',
            email: 'user@example.com',
            password: 'user123',
            role: 'user',
        });

        // Insert products
        await Product.insertMany(products);

        console.log('Database seeded successfully!');
        console.log('Admin credentials: admin@example.com / admin123');
        console.log('User credentials: user@example.com / user123');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedDatabase();
