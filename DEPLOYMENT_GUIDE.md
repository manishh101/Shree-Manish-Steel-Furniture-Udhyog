# Quick Start Guide - Production Deployment

This guide will help you deploy the production-ready Manish Steel Furniture application.

## Prerequisites

- Node.js 18+ installed
- npm or pnpm installed  
- MongoDB database access (production cluster)
- Cloudinary account configured
- Vercel account (or other Node.js hosting)

## Local Setup

### 1. Clone and Install

```bash
cd manish-steel-furniture
npm install
# or
pnpm install
```

### 2. Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env.local

# Edit with your production values
nano .env.local
```

**Required Variables (MUST SET):**
```
JWT_SECRET=your-generated-secret-key-here
MONGODB_URI=your-production-mongodb-uri
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your-api-key
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-preset
```

### 3. Generate JWT Secret

```bash
# Generate a strong random key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy the output to JWT_SECRET in .env.local
```

### 4. Test Build Locally

```bash
# This will validate all environment variables
npm run build

# If successful, you'll see the .next directory created
```

### 5. Run Locally

```bash
# Development mode
npm run dev

# Production mode (after build)
npm start
```

Visit http://localhost:3000 to test.

---

## Deployment to Vercel

### 1. Push Code to Git

```bash
git add .
git commit -m "Production-ready codebase"
git push origin main
```

### 2. Create Vercel Project

1. Go to https://vercel.com/new
2. Connect your GitHub repository
3. Click "Import"

### 3. Add Environment Variables

In the Vercel dashboard:

1. Go to Settings → Environment Variables
2. Add all variables from your `.env.local`:

```
JWT_SECRET = your-secret
MONGODB_URI = your-uri
NEXT_PUBLIC_API_URL = https://your-api-domain.com
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = your-cloud
NEXT_PUBLIC_CLOUDINARY_API_KEY = your-key
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET = your-preset
CLOUDINARY_API_SECRET = your-secret (optional)
```

**IMPORTANT:** Do NOT commit `.env.local` to git. Vercel will use the dashboard variables.

### 4. Configure Domain

1. Go to Settings → Domains
2. Add your domain (e.g., manishsteel.com.np)
3. Follow DNS configuration steps
4. Ensure SSL is enabled (auto-provisioned by Vercel)

### 5. Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Test your deployed site

---

## Post-Deployment Verification

### 1. Check HTTPS

```bash
curl -I https://your-domain.com
# Should see secure connection
```

### 2. Verify Security Headers

Visit https://securityheaders.com and enter your domain.  
Should show A+ rating.

### 3. Test API Endpoints

```bash
# Test inquiries endpoint (should be rate limited)
curl https://your-domain.com/api/inquiries

# Test products endpoint
curl https://your-domain.com/api/products
```

### 4. Test Authentication

1. Try admin login at `/admin`
2. Verify proper error handling
3. Check token storage

### 5. Check Database Connection

1. Submit an inquiry form
2. Verify it appears in MongoDB database
3. Check notification sending works

---

## Monitoring & Maintenance

### Daily Tasks

```bash
# Check error logs (if using Sentry)
# Monitor API response times
# Review rate limiting metrics
```

### Weekly Tasks

```bash
# Update security checklist status
# Review authentication logs
# Check database performance
```

### Monthly Tasks

```bash
# Update npm dependencies
npm update

# Run security audit
npm audit

# Review backup status
# Test recovery procedure
```

---

## Troubleshooting

### Build Fails with "Environment variable not set"

**Solution:**
1. Check .env.local has all required variables
2. Verify Vercel dashboard has all variables
3. Restart Vercel deployment

### 500 Errors on API Routes

**Check:**
1. MongoDB connection string is correct
2. Database user has appropriate permissions
3. All required environment variables are set
4. Check Vercel logs: `vercel logs --follow`

### Images Not Loading from Cloudinary

**Check:**
1. Cloudinary credentials are correct
2. Cloud name matches `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
3. Upload preset is valid and active
4. Images are in the correct folder

### Rate Limiting Too Restrictive

**Adjust in** `middleware.ts`:
```typescript
const RATE_LIMIT_ENDPOINTS = {
  '/api/inquiries': { window: 15 * 60 * 1000, max: 5 },
  // Increase 'max' value if needed
};
```

### Database Connection Timeout

**Try:**
1. Verify MongoDB cluster allows your IP
2. Check database credentials
3. Ensure SSL connection is enabled
4. Increase connection timeout in `lib/db.ts`

---

## Performance Optimization

### 1. Enable Caching

```typescript
// Already configured in next.config.js
// Images: 30 days cache
// JS/CSS: immutable cache
```

### 2. Optimize Database Queries

```bash
# Check slow queries in MongoDB Atlas dashboard
# Add indexes if needed
```

### 3. Monitor Web Vitals

```bash
# In production, check:
# - Largest Contentful Paint (LCP)
# - First Input Delay (FID)
# - Cumulative Layout Shift (CLS)
```

---

## Scaling Guide

### When Traffic Increases:

1. **Database:**
   - Check MongoDB connection pool size
   - Consider replica sets for high availability
   - Archive old inquiries to separate collection

2. **API:**
   - Monitor rate limits
   - Adjust per your traffic patterns
   - Consider caching layer (Redis)

3. **Frontend:**
   - Enable Vercel Pro for better performance
   - Consider CDN for static assets
   - Implement service worker for offline support

---

## Security Maintenance

### Monthly Security Checklist:

- [ ] Review failed login attempts
- [ ] Check rate limiting metrics
- [ ] Audit admin actions
- [ ] Review security headers
- [ ] Update dependencies
- [ ] Check backup integrity
- [ ] Review database access logs
- [ ] Verify HTTPS certificate validity

### Emergency Procedures:

**If Compromised:**
1. Rotate JWT_SECRET immediately
2. Force password reset for all users
3. Review and rotate Cloudinary credentials
4. Check database for unauthorized changes
5. Review access logs
6. Consider point-in-time recovery

---

## Getting Help

### Resources:

- Next.js Docs: https://nextjs.org/docs
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Vercel Docs: https://vercel.com/docs
- Cloudinary Docs: https://cloudinary.com/documentation
- Security: See `PRODUCTION_FIXES_SUMMARY.md`

### Rollback Procedure:

```bash
# If needed, rollback to previous version
git revert <commit-hash>
git push origin main

# Vercel will automatically redeploy
```

---

## Deployment Commands

```bash
# View current deployment status
vercel status

# View logs
vercel logs --follow

# Deploy manually
vercel deploy --prod

# Preview a commit before merging
vercel preview my-feature-branch
```

---

## Success Indicators

Your production deployment is successful when:

✅ Site loads in < 2 seconds  
✅ All API endpoints respond correctly  
✅ Database writes work properly  
✅ Images load from Cloudinary  
✅ Security headers are present  
✅ No console errors  
✅ Admin panel is functional  
✅ Inquiries are received  
✅ Notifications work  
✅ Rate limiting prevents abuse  

---

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Verified By:** _______________  

---

## Support

For issues or questions:
1. Check `PRODUCTION_DEPLOYMENT_CHECKLIST.md`
2. Review `PRODUCTION_FIXES_SUMMARY.md`
3. Check Vercel dashboard and logs
4. Review application error logs
