# Quick Deployment Guide

## 🚀 Deploy in 5 Minutes

### Option 1: Render (Recommended - All-in-One)

1. **Push to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Add deployment configuration"
   git push origin main
   ```

2. **Deploy via Render Blueprint**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click **New** → **Blueprint**
   - Connect your GitHub repository
   - Render will detect `render.yaml` and create both services automatically

3. **Set Environment Variables**
   
   **Backend Service:**
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `STRIPE_SECRET_KEY`: Your Stripe secret key
   - `STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key
   
   **Frontend Service:**
   - `VITE_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key

4. **Done!** Your app will be live in a few minutes.

---

### Option 2: Vercel + Railway

#### Deploy Backend to Railway

1. Go to [Railway](https://railway.app/)
2. Click **New Project** → **Deploy from GitHub repo**
3. Select repository and set **Root Directory**: `backend`
4. Add environment variables (see `.env.example`)
5. Copy the Railway URL (e.g., `https://your-app.up.railway.app`)

#### Deploy Frontend to Vercel

1. Go to [Vercel](https://vercel.com/)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Set **Root Directory**: `frontend`
5. Add environment variables:
   - `VITE_API_URL`: `https://your-railway-url.up.railway.app/api`
   - `VITE_STRIPE_PUBLISHABLE_KEY`: Your Stripe key
6. Click **Deploy**

7. **Update Backend CORS**: Add your Vercel URL to `FRONTEND_URL` in Railway

---

## 📋 Environment Variables Checklist

### Required for Backend
- ✅ `MONGODB_URI` - MongoDB Atlas connection string
- ✅ `JWT_SECRET` - Random 32+ character string
- ✅ `STRIPE_SECRET_KEY` - From Stripe Dashboard
- ✅ `STRIPE_PUBLISHABLE_KEY` - From Stripe Dashboard
- ✅ `FRONTEND_URL` - Your frontend URL (for CORS)

### Required for Frontend
- ✅ `VITE_API_URL` - Your backend URL + `/api`
- ✅ `VITE_STRIPE_PUBLISHABLE_KEY` - From Stripe Dashboard

---

## 🔧 Update Existing Render Deployment

If you already have a deployment on Render:

### Method 1: Auto-Deploy (Recommended)
```bash
git add .
git commit -m "Update deployment"
git push origin main
```
Render will automatically deploy the changes.

### Method 2: Manual Deploy
1. Go to your service in Render Dashboard
2. Click **Manual Deploy** → **Deploy latest commit**

### Update Environment Variables
1. Go to service → **Environment** tab
2. Update variables as needed
3. Click **Save Changes**
4. Service will automatically redeploy

---

## 🧪 Test Your Deployment

After deployment, test these features:

1. ✅ Frontend loads
2. ✅ Backend health check: `https://your-backend/api/health`
3. ✅ User registration
4. ✅ User login
5. ✅ Browse products
6. ✅ Add to cart
7. ✅ Checkout with test card: `4242 4242 4242 4242`

---

## 🆘 Common Issues

### CORS Error
**Problem**: Frontend can't connect to backend

**Solution**: 
- Update `FRONTEND_URL` in backend to match your frontend URL
- Redeploy backend

### Environment Variables Not Working
**Problem**: App not using environment variables

**Solution**:
- Verify variables are set in platform dashboard
- For frontend, ensure variables start with `VITE_`
- Redeploy after adding variables

### MongoDB Connection Failed
**Problem**: Can't connect to database

**Solution**:
- Check MongoDB Atlas IP whitelist (add `0.0.0.0/0`)
- Verify connection string is correct
- Ensure database user has correct permissions

---

## 📚 Full Documentation

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🎯 Next Steps

1. ✅ Deploy your application
2. ✅ Test all features
3. ✅ Set up Stripe webhook (see DEPLOYMENT.md)
4. ✅ Configure custom domain (optional)
5. ✅ Set up monitoring and analytics

---

**Need Help?** Check [DEPLOYMENT.md](./DEPLOYMENT.md) for troubleshooting and detailed guides.
