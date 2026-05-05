# Render Deployment Guide

## Prerequisites
- GitHub repository with your frontend code
- Render account (free tier available)
- Backend API deployed on Render (or other hosting)

## Step 1: Update Environment Variables

1. Update `.env.production` with your actual backend URL:
```env
VITE_API_BASE_URL=https://your-backend-app.onrender.com/api
VITE_CRYPTO_API_BASE_URL=https://api.coincap.io/v2
```

2. Update `render.yaml` with your backend URL:
```yaml
envVars:
  - key: VITE_API_BASE_URL
    value: https://your-backend-app.onrender.com/api
```

## Step 2: Deploy to Render

### Option A: Using Render Dashboard
1. Go to [Render.com](https://render.com)
2. Click "New +" → "Static Site"
3. Connect your GitHub repository
4. Configure:
   - **Name**: coinbase-frontend
   - **Branch**: main
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
   - **Environment Variables**:
     - `VITE_API_BASE_URL`: `https://your-backend-app.onrender.com/api`

### Option B: Using render.yaml (Auto-deploy)
1. Push your code to GitHub with the `render.yaml` file
2. Connect your GitHub account to Render
3. Render will automatically detect and deploy

## Step 3: Build Test (Local)
```bash
npm install
npm run build
```

## Step 4: Verify Deployment
1. Check the Render dashboard for deployment status
2. Visit your deployed URL
3. Test all functionality:
   - Page loading
   - Navigation
   - API calls to backend
   - Authentication flow

## Important Notes

### Environment Variables
- `VITE_API_BASE_URL`: Your backend API URL
- `VITE_CRYPTO_API_BASE_URL`: External crypto API (CoinCap)

### Build Configuration
- Output directory: `dist`
- Source maps enabled for debugging
- React 19 with Vite 7

### Security Headers
The deployment includes security headers:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: "1; mode=block"

### Troubleshooting

#### Build Errors
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

#### API Connection Issues
1. Verify backend URL is correct
2. Check CORS settings on backend
3. Ensure backend is deployed and accessible

#### 404 Errors
- Check React Router configuration
- Verify static site routing on Render

## Production Optimizations

### Performance
- Code splitting with lazy loading
- Optimized bundle size
- Static asset compression

### SEO
- Meta tags in index.html
- Proper routing structure
- Semantic HTML structure

## Next Steps
1. Deploy backend API first
2. Update environment variables with backend URL
3. Deploy frontend
4. Test full integration
5. Set up custom domain (optional)
