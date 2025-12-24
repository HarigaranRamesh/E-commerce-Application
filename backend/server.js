import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import seedAdmin from './utils/seeder.js';


import analyticsRoutes from './routes/analyticsRoutes.js';

dotenv.config();

const app = express();

// Connect to MongoDB
// Connect to MongoDB
connectDB().then(() => {
  seedAdmin();
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

app.use('/api/analytics', analyticsRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
