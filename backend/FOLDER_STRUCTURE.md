# Backend Folder Structure - Professional Architecture

## Overview
This document outlines the recommended professional folder structure for scalable Node.js/Express applications following industry best practices and clean architecture principles.

## Recommended Structure

```
backend/
├── src/
│   ├── config/                    # Configuration files
│   │   ├── database.js           # MongoDB connection
│   │   ├── stripe.js             # Stripe configuration
│   │   ├── env.js                # Environment variables
│   │   └── index.js
│   │
│   ├── constants/                 # Application constants
│   │   ├── errorMessages.js      # Error message constants
│   │   ├── statusCodes.js        # HTTP status codes
│   │   ├── enums.js              # Enumerations
│   │   └── index.js
│   │
│   ├── controllers/               # Request handlers (thin layer)
│   │   ├── auth.controller.js    # Authentication endpoints
│   │   ├── product.controller.js # Product endpoints
│   │   ├── order.controller.js   # Order endpoints
│   │   ├── payment.controller.js # Payment endpoints
│   │   └── index.js
│   │
│   ├── services/                  # Business logic layer
│   │   ├── auth.service.js       # Auth business logic
│   │   ├── product.service.js    # Product business logic
│   │   ├── order.service.js      # Order business logic
│   │   ├── payment.service.js    # Payment business logic
│   │   └── index.js
│   │
│   ├── models/                    # Database models (Mongoose)
│   │   ├── User.js               # User schema
│   │   ├── Product.js            # Product schema
│   │   ├── Order.js              # Order schema
│   │   └── index.js
│   │
│   ├── middleware/                # Express middleware
│   │   ├── auth.middleware.js    # JWT authentication
│   │   ├── error.middleware.js   # Error handling
│   │   ├── validation.middleware.js # Request validation
│   │   ├── logger.middleware.js  # Request logging
│   │   └── index.js
│   │
│   ├── routes/                    # API routes with versioning
│   │   ├── v1/                   # Version 1 routes
│   │   │   ├── auth.routes.js
│   │   │   ├── product.routes.js
│   │   │   ├── order.routes.js
│   │   │   ├── payment.routes.js
│   │   │   └── index.js          # Combine all v1 routes
│   │   └── index.js              # Main router
│   │
│   ├── validators/                # Request validation schemas
│   │   ├── auth.validator.js     # Auth validation rules
│   │   ├── product.validator.js  # Product validation rules
│   │   ├── order.validator.js    # Order validation rules
│   │   └── index.js
│   │
│   ├── dto/                       # Data Transfer Objects
│   │   ├── auth.dto.js           # Auth DTOs
│   │   ├── product.dto.js        # Product DTOs
│   │   ├── order.dto.js          # Order DTOs
│   │   └── index.js
│   │
│   ├── utils/                     # Utility functions
│   │   ├── helpers.js            # Helper functions
│   │   ├── logger.js             # Logging utility
│   │   ├── errorHandler.js       # Error handling utility
│   │   ├── response.js           # Standardized responses
│   │   └── index.js
│   │
│   └── app.js                     # Express app setup
│
├── tests/                         # Test files
│   ├── unit/                     # Unit tests
│   │   ├── services/
│   │   └── utils/
│   ├── integration/              # Integration tests
│   │   └── routes/
│   └── fixtures/                 # Test data
│
├── scripts/                       # Utility scripts
│   ├── seed.js                   # Database seeding
│   └── migrate.js                # Database migrations
│
├── logs/                          # Application logs
│   ├── error.log
│   └── combined.log
│
├── .env                           # Environment variables
├── .env.example                   # Example env file
├── .gitignore
├── package.json
├── server.js                      # Entry point
└── README.md
```

## Layer Architecture

### 1. **Routes Layer** (`/routes`)
- Define API endpoints
- Route requests to controllers
- Apply middleware (auth, validation)
- API versioning

### 2. **Controllers Layer** (`/controllers`)
- Handle HTTP requests/responses
- Call service layer methods
- Return standardized responses
- **Thin layer** - no business logic

### 3. **Services Layer** (`/services`)
- Business logic implementation
- Data manipulation
- Orchestrate multiple operations
- Call models for data access

### 4. **Models Layer** (`/models`)
- Database schema definitions
- Data validation
- Database queries
- Relationships

## Folder Descriptions

### `/config`
Configuration files for database, external services, and environment setup.

### `/constants`
Application-wide constants, enums, and error messages for consistency.

### `/controllers`
Thin layer that handles HTTP requests and delegates to services.

### `/services`
Business logic layer containing core application functionality.

### `/models`
Mongoose schemas and database models.

### `/middleware`
Express middleware for authentication, validation, logging, etc.

### `/routes`
API route definitions with versioning support.

### `/validators`
Request validation schemas using libraries like Joi or express-validator.

### `/dto`
Data Transfer Objects for standardizing data structure.

### `/utils`
Utility functions, helpers, and shared code.

### `/tests`
Test files organized by type (unit, integration).

### `/scripts`
Utility scripts for seeding, migrations, etc.

## Example File Structures

### Controller Example (`auth.controller.js`)
```javascript
const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/response');

exports.register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    return successResponse(res, 201, 'User registered successfully', user);
  } catch (error) {
    next(error);
  }
};
```

### Service Example (`auth.service.js`)
```javascript
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (userData) => {
  // Business logic here
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const user = await User.create({
    ...userData,
    password: hashedPassword
  });
  return user;
};
```

### Route Example (`v1/auth.routes.js`)
```javascript
const express = require('express');
const router = express.Router();
const authController = require('../../controllers/auth.controller');
const { validateRegister } = require('../../validators/auth.validator');

router.post('/register', validateRegister, authController.register);
router.post('/login', authController.login);

module.exports = router;
```

## Benefits

✅ **Separation of Concerns**: Clear layer boundaries
✅ **Testability**: Services can be unit tested independently
✅ **Maintainability**: Easy to locate and modify code
✅ **Scalability**: Easy to add new features
✅ **Reusability**: Services can be shared across controllers
✅ **API Versioning**: Support multiple API versions
✅ **Error Handling**: Centralized error management

## Migration Guide

### Current Structure → New Structure

**Controllers:**
- `controllers/authController.js` → `src/controllers/auth.controller.js`
- `controllers/productController.js` → `src/controllers/product.controller.js`
- `controllers/orderController.js` → `src/controllers/order.controller.js`

**Routes:**
- `routes/authRoutes.js` → `src/routes/v1/auth.routes.js`
- `routes/productRoutes.js` → `src/routes/v1/product.routes.js`

**Models:**
- `models/User.js` → `src/models/User.js`
- `models/Product.js` → `src/models/Product.js`

**New Additions:**
- Extract business logic from controllers → `src/services/`
- Create validation schemas → `src/validators/`
- Add DTOs → `src/dto/`
- Add constants → `src/constants/`

## Best Practices

1. **Thin Controllers**: Keep controllers minimal, delegate to services
2. **Service Layer**: All business logic in services
3. **Error Handling**: Use centralized error middleware
4. **Validation**: Validate at route level with middleware
5. **Async/Await**: Use async/await for cleaner code
6. **Environment Variables**: Never hardcode sensitive data
7. **Logging**: Use proper logging utility
8. **API Versioning**: Version your APIs from the start

## Environment Variables

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/ecommerce

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable

# Frontend
FRONTEND_URL=http://localhost:5173
```

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": {
    "code": "ERROR_CODE",
    "details": []
  }
}
```
