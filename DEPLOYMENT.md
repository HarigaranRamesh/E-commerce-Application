# Deployment Guide - React E-commerce Application

## Overview
This guide covers deploying your full-stack React E-commerce application to various cloud platforms. The application consists of:
- **Frontend**: React + Vite
- **Backend**: Node.js + Express + MongoDB
- **Payment**: Stripe integration

---

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Render Deployment](#render-deployment)
3. [Vercel + Railway Deployment](#vercel--railway-deployment)
4. [Environment Variables](#environment-variables)
5. [Post-Deployment](#post-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

### 1. MongoDB Setup
- [ ] Create MongoDB Atlas account (free tier available)
- [ ] Create a new cluster
- [ ] Create database user with password
- [ ] Whitelist all IPs (0.0.0.0/0) for production
- [ ] Get connection string

### 2. Stripe Setup
- [ ] Create Stripe account
- [ ] Get API keys (publishable and secret)
- [ ] Set up webhook endpoint (after backend deployment)

### 3. Code Preparation
- [ ] Ensure all dependencies are in package.json
- [ ] Test build locally: `npm run build` in frontend
- [ ] Verify backend starts: `npm start` in backend
- [ ] Push latest code to GitHub

---

## Render Deployment

### Option 1: Using Render Blueprint (Recommended)

#### Step 1: Create `render.yaml`
This file is already created in your project root. It defines both frontend and backend services.

#### Step 2: Deploy via Render Dashboard
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New** → **Blueprint**
3. Connect your GitHub repository
4. Render will detect `render.yaml` and create both services
5. Set environment variables (see [Environment Variables](#environment-variables))

### Option 2: Manual Deployment

#### Deploy Backend
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `ecommerce-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
5. Add environment variables
6. Click **Create Web Service**

#### Deploy Frontend
1. Click **New** → **Static Site**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `ecommerce-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add environment variables
5. Click **Create Static Site**

### Update Existing Render Deployment
If you already have a deployment on Render:

1. **Update via Git**:
   ```bash
   git add .
   git commit -m "Update deployment configuration"
   git push origin main
   ```
   Render will auto-deploy on push.

2. **Manual Redeploy**:
   - Go to your service in Render Dashboard
   - Click **Manual Deploy** → **Deploy latest commit**

3. **Update Environment Variables**:
   - Go to service → **Environment**
   - Update `FRONTEND_URL` in backend
   - Update `VITE_API_URL` in frontend
   - Click **Save Changes**

---

## Vercel + Railway Deployment

### Backend on Railway

#### Step 1: Deploy to Railway
1. Go to [Railway](https://railway.app/)
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your repository
4. Configure:
   - **Root Directory**: `backend`
   - **Start Command**: `npm start`
5. Add environment variables
6. Railway will provide a URL (e.g., `https://your-app.up.railway.app`)

#### Step 2: Configure Railway
1. Go to **Settings** → **Networking**
2. Generate a domain or use the provided one
3. Note the backend URL for frontend configuration

### Frontend on Vercel

#### Step 1: Deploy to Vercel
1. Go to [Vercel](https://vercel.com/)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add environment variables:
   - `VITE_API_URL`: Your Railway backend URL
   - `VITE_STRIPE_PUBLISHABLE_KEY`: Your Stripe key
6. Click **Deploy**

#### Step 2: Update Backend CORS
After deployment, update your backend's `FRONTEND_URL` environment variable on Railway to your Vercel URL.

---

## Environment Variables

### Backend Environment Variables

```env
# Server
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_characters
JWT_EXPIRE=7d

# Stripe
STRIPE_SECRET_KEY=sk_live_... or sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_live_... or pk_test_...

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### Frontend Environment Variables

```env
# API URL
VITE_API_URL=https://your-backend-url.onrender.com/api

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_... or pk_test_...
```

### Important Notes
- **Never commit `.env` files** to Git
- Use `.env.example` as a template
- Different values for development and production
- Update CORS settings when changing frontend URL

---

## Post-Deployment

### 1. Verify Deployment
- [ ] Frontend loads correctly
- [ ] Backend health check: `https://your-backend/api/health`
- [ ] Test user registration
- [ ] Test user login
- [ ] Test product browsing
- [ ] Test cart functionality
- [ ] Test checkout with Stripe test card

### 2. Configure Stripe Webhook
1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter: `https://your-backend-url/api/payment/webhook`
4. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
5. Copy webhook signing secret
6. Add to backend environment variables as `STRIPE_WEBHOOK_SECRET`

### 3. Custom Domain (Optional)
- **Render**: Settings → Custom Domain
- **Vercel**: Settings → Domains
- **Railway**: Settings → Networking → Custom Domain

### 4. SSL/HTTPS
All platforms provide free SSL certificates automatically.

---

## Troubleshooting

### Frontend Issues

#### "Failed to fetch" or CORS errors
- Check `VITE_API_URL` is correct
- Verify backend `FRONTEND_URL` includes your frontend domain
- Check backend CORS configuration

#### Blank page after deployment
- Check browser console for errors
- Verify build completed successfully
- Check `dist` folder was created

#### Environment variables not working
- Ensure variables start with `VITE_`
- Redeploy after adding variables
- Check variables are set in platform dashboard

### Backend Issues

#### "Cannot connect to MongoDB"
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas IP whitelist (should include 0.0.0.0/0)
- Verify database user credentials

#### "Port already in use"
- Ensure `PORT` environment variable is set
- Use `process.env.PORT || 5000`

#### "Module not found"
- Verify all dependencies are in `package.json`
- Check `node_modules` is in `.gitignore`
- Rebuild: `npm install`

### Payment Issues

#### Stripe payments failing
- Verify `STRIPE_SECRET_KEY` is set correctly
- Check Stripe dashboard for errors
- Test with Stripe test card: `4242 4242 4242 4242`
- Verify webhook endpoint is configured

---

## Platform Comparison

| Feature | Render | Vercel | Railway |
|---------|--------|--------|---------|
| **Free Tier** | ✅ Yes | ✅ Yes | ✅ Yes (limited) |
| **Auto Deploy** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Custom Domain** | ✅ Yes | ✅ Yes | ✅ Yes |
| **SSL** | ✅ Free | ✅ Free | ✅ Free |
| **Backend Support** | ✅ Yes | ❌ No | ✅ Yes |
| **Static Sites** | ✅ Yes | ✅ Yes | ❌ No |
| **Database** | 💰 Paid | ❌ No | ✅ Yes |
| **Best For** | Full-stack | Frontend | Backend |

### Recommended Combinations
1. **All-in-One**: Render (Frontend + Backend)
2. **Best Performance**: Vercel (Frontend) + Railway (Backend)
3. **Simplest**: Render Blueprint

---

## Deployment Commands Reference

### Frontend
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Backend
```bash
# Install dependencies
npm install

# Start production server
npm start

# Seed database (optional)
npm run seed
```

---

## Support

### Platform Documentation
- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app/)

### MongoDB Atlas
- [Atlas Documentation](https://docs.atlas.mongodb.com/)

### Stripe
- [Stripe Documentation](https://stripe.com/docs)

---

## Security Checklist

- [ ] All sensitive data in environment variables
- [ ] `.env` files in `.gitignore`
- [ ] Strong JWT secret (min 32 characters)
- [ ] MongoDB IP whitelist configured
- [ ] CORS configured for production domain
- [ ] HTTPS enabled (automatic on all platforms)
- [ ] Stripe webhook secret configured
- [ ] Rate limiting enabled (optional)

---

## Next Steps

1. Deploy to your chosen platform(s)
2. Configure environment variables
3. Test all functionality
4. Set up custom domain (optional)
5. Configure Stripe webhook
6. Monitor application logs
7. Set up error tracking (optional: Sentry)
8. Configure analytics (optional: Google Analytics)

---

**Need Help?** Check the troubleshooting section or platform-specific documentation.
