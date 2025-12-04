# Frontend Folder Structure - Professional Architecture

## Overview
This document outlines the recommended professional folder structure for scalable React applications following industry best practices.

## Recommended Structure

```
frontend/
├── public/                     # Static files served directly
│   ├── favicon.ico
│   └── index.html
│
├── src/
│   ├── assets/                # Static resources
│   │   ├── images/           # Image files
│   │   │   ├── logo.png
│   │   │   └── products/
│   │   ├── icons/            # Icon files
│   │   └── fonts/            # Custom fonts
│   │
│   ├── components/            # Reusable UI components
│   │   ├── common/           # Shared across features
│   │   │   ├── Button/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Button.css
│   │   │   │   └── index.js
│   │   │   ├── Input/
│   │   │   ├── Card/
│   │   │   └── Modal/
│   │   │
│   │   ├── layout/           # Layout components
│   │   │   ├── Navbar/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Navbar.css
│   │   │   │   └── index.js
│   │   │   ├── Footer/
│   │   │   └── Sidebar/
│   │   │
│   │   └── ui/               # UI-specific components
│   │       ├── LoadingSpinner/
│   │       ├── ErrorBoundary/
│   │       └── Toast/
│   │
│   ├── features/              # Feature-based modules
│   │   ├── auth/             # Authentication feature
│   │   │   ├── components/
│   │   │   │   ├── Login/
│   │   │   │   │   ├── Login.jsx
│   │   │   │   │   ├── Login.css
│   │   │   │   │   └── index.js
│   │   │   │   └── Signup/
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.js
│   │   │   ├── services/
│   │   │   │   └── authService.js
│   │   │   ├── context/
│   │   │   │   └── AuthContext.jsx
│   │   │   └── index.js
│   │   │
│   │   ├── products/         # Products feature
│   │   │   ├── components/
│   │   │   │   ├── ProductList/
│   │   │   │   ├── ProductCard/
│   │   │   │   └── ProductDetail/
│   │   │   ├── hooks/
│   │   │   │   └── useProducts.js
│   │   │   ├── services/
│   │   │   │   └── productService.js
│   │   │   └── index.js
│   │   │
│   │   ├── cart/             # Shopping cart feature
│   │   │   ├── components/
│   │   │   │   ├── Cart/
│   │   │   │   └── CartItem/
│   │   │   ├── hooks/
│   │   │   │   └── useCart.js
│   │   │   ├── context/
│   │   │   │   └── CartContext.jsx
│   │   │   └── index.js
│   │   │
│   │   ├── checkout/         # Checkout feature
│   │   │   ├── components/
│   │   │   │   └── Checkout/
│   │   │   ├── services/
│   │   │   │   └── paymentService.js
│   │   │   └── index.js
│   │   │
│   │   ├── orders/           # Orders feature
│   │   │   ├── components/
│   │   │   │   └── MyOrders/
│   │   │   ├── services/
│   │   │   │   └── orderService.js
│   │   │   └── index.js
│   │   │
│   │   ├── profile/          # User profile feature
│   │   │   ├── components/
│   │   │   │   └── Profile/
│   │   │   └── index.js
│   │   │
│   │   └── wishlist/         # Wishlist feature
│   │       ├── components/
│   │       │   └── Wishlist/
│   │       ├── context/
│   │       │   └── WishlistContext.jsx
│   │       └── index.js
│   │
│   ├── hooks/                 # Global custom hooks
│   │   ├── useDebounce.js
│   │   ├── useLocalStorage.js
│   │   └── useMediaQuery.js
│   │
│   ├── context/               # Global context providers
│   │   └── ThemeContext.jsx
│   │
│   ├── services/              # API services
│   │   ├── api/
│   │   │   ├── client.js     # Axios instance
│   │   │   └── endpoints.js  # API endpoints
│   │   └── index.js
│   │
│   ├── utils/                 # Utility functions
│   │   ├── helpers/
│   │   │   ├── formatters.js # Date, currency formatters
│   │   │   ├── validators.js # Validation functions
│   │   │   └── storage.js    # LocalStorage helpers
│   │   ├── constants/
│   │   │   ├── routes.js     # Route constants
│   │   │   ├── apiUrls.js    # API URLs
│   │   │   └── config.js     # App configuration
│   │   └── index.js
│   │
│   ├── styles/                # Global styles
│   │   ├── variables.css     # CSS variables
│   │   ├── global.css        # Global styles
│   │   ├── reset.css         # CSS reset
│   │   └── index.css         # Main stylesheet
│   │
│   ├── routes/                # Route configuration
│   │   ├── PrivateRoute.jsx  # Protected routes
│   │   ├── PublicRoute.jsx   # Public routes
│   │   └── index.jsx         # Route definitions
│   │
│   ├── config/                # Configuration files
│   │   ├── constants.js      # App constants
│   │   └── env.js            # Environment variables
│   │
│   ├── App.jsx                # Main App component
│   ├── main.jsx               # Entry point
│   └── index.css              # Root styles
│
├── .env                       # Environment variables
├── .env.example               # Example env file
├── .gitignore
├── package.json
├── vite.config.js
└── README.md
```

## Folder Descriptions

### `/assets`
Static resources like images, icons, and fonts that are imported into components.

### `/components`
Reusable UI components organized by purpose:
- **common**: Shared components used across multiple features
- **layout**: Layout-specific components (Navbar, Footer)
- **ui**: UI utility components (Spinners, Modals)

### `/features`
Feature-based organization where each feature contains:
- **components**: Feature-specific components
- **hooks**: Feature-specific custom hooks
- **services**: API calls related to the feature
- **context**: Feature-specific context providers

### `/hooks`
Global custom React hooks used across features.

### `/context`
Global context providers (theme, language, etc.).

### `/services`
API communication layer with centralized HTTP client.

### `/utils`
Utility functions, helpers, validators, and constants.

### `/styles`
Global stylesheets and CSS variables.

### `/routes`
Route configuration and protected route components.

### `/config`
Application configuration and constants.

## Benefits

✅ **Scalability**: Easy to add new features without affecting existing code
✅ **Maintainability**: Clear separation of concerns
✅ **Reusability**: Shared components and utilities
✅ **Testability**: Isolated features are easier to test
✅ **Collaboration**: Team members can work on separate features
✅ **Code Splitting**: Better performance with lazy loading

## Migration Guide

### Current Structure → New Structure

**Components:**
- `Components/Navbar/` → `components/layout/Navbar/`
- `Components/Footer/` → `components/layout/Footer/`
- `Components/Pages/Login/` → `features/auth/components/Login/`
- `Components/Pages/Cart/` → `features/cart/components/Cart/`
- `Components/Pages/Checkout/` → `features/checkout/components/Checkout/`
- `Components/Pages/Profile/` → `features/profile/components/Profile/`
- `Components/Main/Products.jsx` → `features/products/components/ProductList/`
- `Components/Main/Slider.jsx` → `components/common/Slider/`

**Context:**
- `Context/AuthContext.jsx` → `features/auth/context/AuthContext.jsx`
- `Context/CartContext.jsx` → `features/cart/context/CartContext.jsx`
- `Context/WishlistContext.jsx` → `features/wishlist/context/WishlistContext.jsx`

**Services:**
- `services/api.js` → `services/api/client.js` + feature-specific services

## Best Practices

1. **Index Files**: Use `index.js` for clean imports
2. **Naming**: Use PascalCase for components, camelCase for utilities
3. **Colocation**: Keep related files together
4. **Single Responsibility**: One component per file
5. **Barrel Exports**: Export from index files for cleaner imports

## Example Import Patterns

```javascript
// Before
import Navbar from './Components/Navbar/Navbar';

// After
import { Navbar } from '@/components/layout';
import { Login } from '@/features/auth';
import { useAuth } from '@/features/auth/hooks';
```
