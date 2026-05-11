# Production Deployment Checklist

This checklist ensures your application is production-ready and secure before deployment to Vercel.

## Security Verification ✅

- [ ] **Environment Variables Set**
  - [ ] JWT_SECRET is set to a strong random value (min 32 chars)
  - [ ] MONGODB_URI is configured with production database
  - [ ] All NEXT_PUBLIC_* variables are set correctly
  - [ ] Sensitive keys are NOT committed to git
  - [ ] .env.local is in .gitignore

- [ ] **No Hardcoded Secrets**
  - [ ] No hardcoded passwords, tokens, or API keys in source code
  - [ ] No admin credentials in code
  - [ ] No default values for secrets in code

- [ ] **Authentication & Authorization**
  - [ ] JWT_SECRET is enforced and validated
  - [ ] Offline auth mode is disabled
  - [ ] All admin endpoints require proper authentication
  - [ ] CSRF middleware is active

- [ ] **Input Validation**
  - [ ] All API endpoints validate input with Zod schemas
  - [ ] Search queries are escaped to prevent injection attacks
  - [ ] Request size limits are enforced
  - [ ] Email and phone validation is strict

- [ ] **Error Handling**
  - [ ] Error responses don't leak sensitive information
  - [ ] Stack traces are not exposed to clients
  - [ ] All promises are properly handled
  - [ ] Error boundaries are in place for client-side

- [ ] **Rate Limiting**
  - [ ] Rate limiting is configured for public endpoints
  - [ ] /api/inquiries is limited to 5 requests per 15 minutes
  - [ ] /api/auth/login is limited to 10 requests per 15 minutes
  - [ ] /api/auth/register is limited to 5 requests per hour

- [ ] **Database Security**
  - [ ] MongoDB connection is over SSL/TLS
  - [ ] Database user has least privilege permissions
  - [ ] Text indexes are created for search functionality
  - [ ] Query timeouts are configured

## Performance Verification ✅

- [ ] **Image Optimization**
  - [ ] Images are served through Cloudinary
  - [ ] WebP format is enabled
  - [ ] Image sizes are optimized
  - [ ] Cache headers are set (30 days for immutable assets)
  - [ ] SVG files are restricted for security

- [ ] **Bundle Size**
  - [ ] Run `npm run analyze` to check bundle size
  - [ ] Critical path is optimized
  - [ ] Unused code is removed
  - [ ] Vendor bundles are acceptable

- [ ] **Logging**
  - [ ] Debug logs are disabled in production
  - [ ] Sensitive data is not logged
  - [ ] Error tracking is configured (consider Sentry)
  - [ ] Performance monitoring is enabled

## API & Data Verification ✅

- [ ] **API Endpoints**
  - [ ] All CRUD operations work correctly
  - [ ] Pagination limits are enforced (max 100 items)
  - [ ] Sorting is safe from injection
  - [ ] Filtering doesn't expose unintended data

- [ ] **Database**
  - [ ] Database indexes are created
  - [ ] Text search indexes exist for product search
  - [ ] Backups are configured
  - [ ] Connection pooling is enabled

## SEO & Configuration ✅

- [ ] **SEO Setup**
  - [ ] robots.txt is configured correctly
  - [ ] Sitemap is generated and accessible
  - [ ] Canonical URLs are set
  - [ ] Open Graph meta tags are present

- [ ] **Domain Configuration**
  - [ ] Primary domain is set to non-www version
  - [ ] Redirects are configured (www -> non-www)
  - [ ] SSL certificate is valid
  - [ ] Domain DNS is correctly configured

- [ ] **Vercel Configuration**
  - [ ] Environment variables are set in Vercel dashboard
  - [ ] Build command is `npm run build`
  - [ ] Start command is correct
  - [ ] Node.js version is specified (18+)

## Headers & Security Policy ✅

- [ ] **Security Headers**
  - [ ] Strict-Transport-Security is set
  - [ ] X-Frame-Options is SAMEORIGIN
  - [ ] X-Content-Type-Options is nosniff
  - [ ] X-XSS-Protection is enabled
  - [ ] Content-Security-Policy is configured
  - [ ] Referrer-Policy is set
  - [ ] Permissions-Policy restricts sensitive APIs

- [ ] **CORS Configuration**
  - [ ] CORS is properly configured
  - [ ] Only trusted origins are allowed
  - [ ] Credentials are handled securely

## Code Quality Verification ✅

- [ ] **TypeScript**
  - [ ] No `any` types used
  - [ ] Strict mode is enabled
  - [ ] All type errors are resolved

- [ ] **Linting**
  - [ ] ESLint passes: `npm run lint`
  - [ ] No console.log in production code
  - [ ] Unused imports are removed

- [ ] **Testing**
  - [ ] Critical paths are tested
  - [ ] Edge cases are handled
  - [ ] API responses are validated

## Monitoring & Alerting ✅

- [ ] **Error Tracking**
  - [ ] Sentry (or similar) is integrated
  - [ ] Error notifications are configured
  - [ ] Critical errors trigger alerts

- [ ] **Performance Monitoring**
  - [ ] Web Vitals are tracked
  - [ ] Database query performance is monitored
  - [ ] API response times are logged

- [ ] **Uptime Monitoring**
  - [ ] Uptime monitor is configured
  - [ ] Alert notifications are set up
  - [ ] Health check endpoint works

## Documentation ✅

- [ ] **README Updated**
  - [ ] Setup instructions are clear
  - [ ] Environment variables are documented
  - [ ] Deployment steps are documented

- [ ] **API Documentation**
  - [ ] Endpoints are documented
  - [ ] Request/response formats are documented
  - [ ] Error codes are documented

- [ ] **.env.example Updated**
  - [ ] All required variables are listed
  - [ ] Examples are realistic
  - [ ] Comments explain each variable

## Pre-Deployment Tasks ✅

- [ ] **Final Checks**
  - [ ] No uncommitted changes with secrets
  - [ ] Git history is clean (no sensitive data in commits)
  - [ ] All tests pass
  - [ ] Build succeeds: `npm run build`

- [ ] **Backup & Rollback**
  - [ ] Database backup is created
  - [ ] Rollback procedure is documented
  - [ ] Previous version is preserved

- [ ] **Communication**
  - [ ] Team is notified of deployment
  - [ ] Maintenance window (if needed) is announced
  - [ ] Support team is briefed

## Post-Deployment Verification ✅

- [ ] **Application Health**
  - [ ] Home page loads correctly
  - [ ] API endpoints respond correctly
  - [ ] Database connections work
  - [ ] Third-party services (Cloudinary, etc.) work

- [ ] **Smoke Testing**
  - [ ] User login works
  - [ ] Product browsing works
  - [ ] Inquiry submission works
  - [ ] Admin panel is accessible

- [ ] **Performance Validation**
  - [ ] Page load times are acceptable
  - [ ] Images load quickly
  - [ ] No console errors
  - [ ] Network requests are efficient

- [ ] **Security Validation**
  - [ ] HTTPS is working
  - [ ] Security headers are present
  - [ ] No sensitive data in logs
  - [ ] Rate limiting is working

## Ongoing Maintenance ✅

- [ ] **Regular Updates**
  - [ ] Dependencies are kept up to date
  - [ ] Security patches are applied
  - [ ] Node.js version is current

- [ ] **Monitoring**
  - [ ] Error logs are reviewed
  - [ ] Performance metrics are tracked
  - [ ] User feedback is monitored

- [ ] **Backups**
  - [ ] Database is backed up regularly
  - [ ] Backups are tested
  - [ ] Recovery procedures are documented

---

## Notes

- Review this checklist before every deployment
- Update this checklist as security practices evolve
- Keep a deployment log with dates and changes
- Document any deviations or issues encountered
