# React E-commerce Application

A modern, full-stack e-commerce application built with React, Node.js, Express, and MongoDB.

## 🚀 Quick Start

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd React-E-commerce
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Backend
   cd backend
   cp .env.example .env
   # Edit .env with your values

   # Frontend
   cd ../frontend
   cp .env.example .env
   # Edit .env with your values
   ```

4. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

## 📦 Project Structure

```
React-E-commerce/
├── backend/              # Node.js + Express backend
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Express middleware
│   └── server.js        # Entry point
│
├── frontend/            # React + Vite frontend
│   ├── src/
│   │   ├── Components/  # React components
│   │   ├── Context/     # Context providers
│   │   ├── assets/      # Static assets
│   │   └── services/    # API services
│   └── package.json
│
├── DEPLOYMENT.md        # Detailed deployment guide
├── QUICK_DEPLOY.md      # Quick deployment guide
└── README.md           # This file
```

## ✨ Features

- 🔐 **User Authentication** - Secure login and registration with JWT
- 🛍️ **Product Catalog** - Browse products by category
- 🛒 **Shopping Cart** - Add, remove, and manage cart items
- ❤️ **Wishlist** - Save products for later
- 💳 **Stripe Integration** - Secure payment processing
- 📦 **Order Management** - View order history and status
- 👤 **User Profile** - Manage account information
- 📱 **Responsive Design** - Works on mobile, tablet, and desktop

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Context API** - State management
- **Axios** - HTTP client
- **Stripe** - Payment processing
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Stripe** - Payment processing

## 🚀 Deployment

### Quick Deploy (5 minutes)

See [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) for the fastest way to deploy.

### Detailed Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment guides covering:
- Render (All-in-One)
- Vercel + Railway
- Environment configuration
- Troubleshooting

### Deployment Platforms

| Platform | Use Case | Free Tier |
|----------|----------|-----------|
| **Render** | Full-stack (Frontend + Backend) | ✅ Yes |
| **Vercel** | Frontend only | ✅ Yes |
| **Railway** | Backend only | ✅ Limited |

## 📚 Documentation

- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)
- [Backend Architecture](./backend/FOLDER_STRUCTURE.md)
- [Frontend Architecture](./frontend/FOLDER_STRUCTURE.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Quick Deploy Guide](./QUICK_DEPLOY.md)

## 🔧 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable
```

See `.env.example` files in backend and frontend directories for detailed documentation.

## 🧪 Testing

### Test with Stripe
Use Stripe test card for payments:
- **Card Number**: 4242 4242 4242 4242
- **Expiry**: Any future date
- **CVC**: Any 3 digits
- **ZIP**: Any 5 digits

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order

### Payment
- `POST /api/payment/create-payment-intent` - Create payment intent

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for troubleshooting
- Review [Backend README](./backend/README.md) for API documentation
- Review [Frontend README](./frontend/README.md) for component documentation

## 🎯 Roadmap

- [ ] Add product reviews and ratings
- [ ] Implement admin dashboard
- [ ] Add email notifications
- [ ] Implement advanced search and filters
- [ ] Add product recommendations
- [ ] Implement dark mode
- [ ] Add multi-language support

---

**Built with ❤️ using React and Node.js**
