# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

# Frontend - React E-commerce Application

## Overview
Modern, responsive e-commerce frontend built with React, Vite, and professional architecture patterns.

## Tech Stack
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Context API** - State management
- **Lucide React** - Icons
- **Stripe** - Payment processing
- **Axios** - HTTP client

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update .env with your values
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

See [FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md) for detailed folder organization and architecture guidelines.

### Current Structure
```
src/
├── Components/        # UI components
├── Context/          # React Context providers
├── assets/           # Static resources
├── services/         # API services
├── App.jsx           # Main app component
└── main.jsx          # Entry point
```

### Recommended Structure
For scalability, consider migrating to the feature-based structure outlined in `FOLDER_STRUCTURE.md`.

## Features

✅ User Authentication (Login/Signup)
✅ Product Browsing & Categories
✅ Shopping Cart Management
✅ Wishlist Functionality
✅ Checkout with Stripe Integration
✅ Order History
✅ User Profile
✅ Responsive Design (Mobile, Tablet, Desktop)

## Key Components

### Layout
- **Navbar** - Navigation with cart/wishlist counters
- **Footer** - Site information and links

### Features
- **Auth** - Login and signup pages
- **Products** - Product listing and categories
- **Cart** - Shopping cart with quantity management
- **Checkout** - Payment processing with Stripe
- **Orders** - Order history and tracking
- **Profile** - User profile and account management
- **Wishlist** - Save products for later

## Styling

- **Global Styles**: `index.css` with CSS variables
- **Component Styles**: Co-located CSS files
- **Font**: Times New Roman (serif)
- **Responsive**: Mobile-first approach with breakpoints at 576px and 992px

## API Integration

API calls are centralized in `services/api.js`:
- Authentication endpoints
- Product endpoints
- Cart/Order endpoints
- Payment endpoints

## State Management

### Context Providers
- **AuthContext** - User authentication state
- **CartContext** - Shopping cart state
- **WishlistContext** - Wishlist state

## Environment Variables

```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Development Guidelines

### Code Style
- Use functional components with hooks
- Follow component naming conventions (PascalCase)
- Keep components focused and reusable
- Use meaningful variable names

### File Organization
- One component per file
- Co-locate styles with components
- Use index.js for barrel exports

### Best Practices
- Handle loading and error states
- Validate user input
- Use proper error messages
- Implement responsive design
- Optimize images and assets

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow the folder structure guidelines
2. Write clean, documented code
3. Test on multiple devices
4. Ensure responsive design
5. Update documentation

## License

MIT
