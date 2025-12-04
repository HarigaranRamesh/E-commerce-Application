# Backend - Node.js E-commerce API

## Overview
RESTful API for e-commerce application built with Node.js, Express, and MongoDB following professional architecture patterns.

## Tech Stack
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Stripe** - Payment processing
- **bcryptjs** - Password hashing

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Stripe account

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update .env with your values
```

### Environment Variables

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/ecommerce

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Frontend
FRONTEND_URL=http://localhost:5173
```

### Development

```bash
# Start development server
npm run dev

# Start production server
npm start

# Seed database
npm run seed
```

## Project Structure

See [FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md) for detailed folder organization and architecture guidelines.

### Current Structure
```
backend/
├── config/           # Configuration files
├── controllers/      # Request handlers
├── models/           # Database models
├── routes/           # API routes
├── middleware/       # Express middleware
├── utils/            # Utility functions
├── seed.js           # Database seeding
└── server.js         # Entry point
```

### Recommended Structure
For better scalability, consider migrating to the layered architecture outlined in `FOLDER_STRUCTURE.md`.

## API Endpoints

### Authentication
```
POST   /api/auth/register    # Register new user
POST   /api/auth/login       # Login user
GET    /api/auth/me          # Get current user
```

### Products
```
GET    /api/products         # Get all products
GET    /api/products/:id     # Get single product
POST   /api/products         # Create product (admin)
PUT    /api/products/:id     # Update product (admin)
DELETE /api/products/:id     # Delete product (admin)
```

### Orders
```
GET    /api/orders           # Get user orders
GET    /api/orders/:id       # Get single order
POST   /api/orders           # Create order
PUT    /api/orders/:id       # Update order status (admin)
```

### Payment
```
POST   /api/payment/create-payment-intent    # Create Stripe payment intent
POST   /api/payment/webhook                  # Stripe webhook
```

## Database Models

### User
- fullname
- email
- password (hashed)
- mobile
- gender
- dob
- address (street, city, state, zip, country)
- createdAt

### Product
- name
- description
- price
- category
- image
- stock
- createdAt

### Order
- user (ref)
- orderItems (array)
- shippingAddress
- paymentMethod
- paymentResult
- totalPrice
- isPaid
- paidAt
- isDelivered
- deliveredAt
- createdAt

## Architecture Layers

### 1. Routes
- Define API endpoints
- Apply middleware
- Route to controllers

### 2. Controllers
- Handle HTTP requests/responses
- Validate input
- Call business logic
- Return responses

### 3. Models
- Define database schemas
- Handle data validation
- Manage database operations

### 4. Middleware
- **auth.middleware.js** - JWT authentication
- **error.middleware.js** - Error handling
- CORS configuration

### 5. Utils
- Helper functions
- Error handlers
- Response formatters

## Authentication

Uses JWT (JSON Web Tokens) for authentication:
1. User registers/logs in
2. Server generates JWT token
3. Client stores token
4. Client sends token in Authorization header
5. Server validates token for protected routes

## Error Handling

Centralized error handling with custom error classes:
- ValidationError
- AuthenticationError
- NotFoundError
- ServerError

## Security

✅ Password hashing with bcryptjs
✅ JWT authentication
✅ CORS enabled
✅ Environment variables for sensitive data
✅ Input validation
✅ MongoDB injection prevention

## Development Guidelines

### Code Style
- Use async/await for asynchronous operations
- Follow RESTful API conventions
- Use meaningful variable and function names
- Add comments for complex logic

### Error Handling
- Always use try-catch blocks
- Return appropriate HTTP status codes
- Provide meaningful error messages

### Database
- Use Mongoose schemas for validation
- Index frequently queried fields
- Use populate for relationships

### Best Practices
- Validate all user input
- Never expose sensitive data
- Use environment variables
- Log errors appropriately
- Write clean, maintainable code

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": { }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message"
}
```

## Testing

```bash
# Run tests (when implemented)
npm test

# Run tests with coverage
npm run test:coverage
```

## Database Seeding

```bash
# Seed database with sample data
npm run seed
```

This will create:
- Sample products
- Sample categories
- Test users

## Deployment

### Production Checklist
- [ ] Set NODE_ENV=production
- [ ] Use production MongoDB URI
- [ ] Set secure JWT_SECRET
- [ ] Configure CORS for production domain
- [ ] Enable rate limiting
- [ ] Set up logging
- [ ] Configure SSL/TLS

## Contributing

1. Follow the folder structure guidelines
2. Write clean, documented code
3. Test all endpoints
4. Update API documentation
5. Handle errors properly

## License

MIT
