# Deployment Checklist

Use this checklist to ensure a smooth deployment process.

## Pre-Deployment

### MongoDB Setup
- [ ] Create MongoDB Atlas account
- [ ] Create a new cluster (free tier available)
- [ ] Create database user with password
- [ ] Whitelist all IPs (0.0.0.0/0) for production
- [ ] Copy connection string
- [ ] Test connection locally

### Stripe Setup
- [ ] Create Stripe account
- [ ] Get publishable key (pk_test_... or pk_live_...)
- [ ] Get secret key (sk_test_... or sk_live_...)
- [ ] Test locally with test card (4242 4242 4242 4242)

### Code Preparation
- [ ] All dependencies in package.json
- [ ] Test frontend build: `cd frontend && npm run build`
- [ ] Test backend starts: `cd backend && npm start`
- [ ] All environment variables documented in .env.example
- [ ] .env files in .gitignore
- [ ] Push latest code to GitHub

## Deployment (Choose One)

### Option A: Render (All-in-One)
- [ ] Go to Render Dashboard
- [ ] Click New → Blueprint
- [ ] Connect GitHub repository
- [ ] Render detects render.yaml
- [ ] Set backend environment variables:
  - [ ] MONGODB_URI
  - [ ] STRIPE_SECRET_KEY
  - [ ] STRIPE_PUBLISHABLE_KEY
- [ ] Set frontend environment variables:
  - [ ] VITE_STRIPE_PUBLISHABLE_KEY
- [ ] Wait for deployment to complete
- [ ] Copy backend URL
- [ ] Copy frontend URL

### Option B: Vercel + Railway

#### Railway (Backend)
- [ ] Go to Railway Dashboard
- [ ] Click New Project → Deploy from GitHub
- [ ] Select repository
- [ ] Set Root Directory: `backend`
- [ ] Add environment variables:
  - [ ] NODE_ENV=production
  - [ ] MONGODB_URI
  - [ ] JWT_SECRET
  - [ ] STRIPE_SECRET_KEY
  - [ ] STRIPE_PUBLISHABLE_KEY
  - [ ] FRONTEND_URL (add after Vercel deployment)
- [ ] Copy Railway URL

#### Vercel (Frontend)
- [ ] Go to Vercel Dashboard
- [ ] Click Add New → Project
- [ ] Import GitHub repository
- [ ] Set Root Directory: `frontend`
- [ ] Add environment variables:
  - [ ] VITE_API_URL (Railway URL + /api)
  - [ ] VITE_STRIPE_PUBLISHABLE_KEY
- [ ] Deploy
- [ ] Copy Vercel URL
- [ ] Update Railway FRONTEND_URL with Vercel URL

## Post-Deployment

### Verification
- [ ] Frontend loads without errors
- [ ] Backend health check works: `https://your-backend/api/health`
- [ ] Test user registration
- [ ] Test user login
- [ ] Test product browsing
- [ ] Test add to cart
- [ ] Test wishlist
- [ ] Test checkout with Stripe test card
- [ ] Test order history
- [ ] Test user profile

### Stripe Webhook (Important!)
- [ ] Go to Stripe Dashboard → Developers → Webhooks
- [ ] Click "Add endpoint"
- [ ] Enter: `https://your-backend-url/api/payment/webhook`
- [ ] Select events:
  - [ ] payment_intent.succeeded
  - [ ] payment_intent.payment_failed
- [ ] Copy webhook signing secret
- [ ] Add to backend env: STRIPE_WEBHOOK_SECRET
- [ ] Redeploy backend

### Security
- [ ] All sensitive data in environment variables
- [ ] .env files NOT in Git
- [ ] Strong JWT secret (32+ characters)
- [ ] MongoDB IP whitelist configured
- [ ] CORS configured for production domain
- [ ] HTTPS enabled (automatic on all platforms)

### Optional Enhancements
- [ ] Set up custom domain
- [ ] Configure DNS records
- [ ] Set up error tracking (Sentry)
- [ ] Set up analytics (Google Analytics)
- [ ] Set up monitoring (UptimeRobot)
- [ ] Configure email notifications
- [ ] Set up automated backups

## Updating Existing Deployment

### Render
- [ ] Push changes to GitHub: `git push origin main`
- [ ] Render auto-deploys
- [ ] OR: Manual Deploy in Render Dashboard

### Vercel
- [ ] Push changes to GitHub: `git push origin main`
- [ ] Vercel auto-deploys
- [ ] OR: Manual Deploy in Vercel Dashboard

### Railway
- [ ] Push changes to GitHub: `git push origin main`
- [ ] Railway auto-deploys
- [ ] OR: Manual Deploy in Railway Dashboard

## Troubleshooting

### If Frontend Can't Connect to Backend
- [ ] Check VITE_API_URL is correct
- [ ] Verify FRONTEND_URL in backend
- [ ] Check CORS configuration
- [ ] Verify backend is running

### If MongoDB Connection Fails
- [ ] Check MONGODB_URI is correct
- [ ] Verify IP whitelist (0.0.0.0/0)
- [ ] Check database user credentials
- [ ] Test connection string locally

### If Stripe Payments Fail
- [ ] Verify STRIPE_SECRET_KEY is set
- [ ] Check STRIPE_PUBLISHABLE_KEY matches
- [ ] Test with Stripe test card
- [ ] Check Stripe Dashboard for errors
- [ ] Verify webhook is configured

### If Environment Variables Don't Work
- [ ] Frontend vars must start with VITE_
- [ ] Redeploy after adding variables
- [ ] Check variables in platform dashboard
- [ ] Clear cache and rebuild

## Success Criteria

✅ All features working in production
✅ No console errors
✅ Payments processing successfully
✅ Orders saving to database
✅ Email confirmations sent (if implemented)
✅ Mobile responsive
✅ Fast load times
✅ HTTPS enabled
✅ Monitoring set up

---

**Deployment Complete!** 🎉

Next steps:
1. Monitor application logs
2. Set up analytics
3. Configure custom domain
4. Plan feature updates
