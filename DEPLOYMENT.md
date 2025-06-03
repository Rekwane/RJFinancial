# RJWealthGroup Deployment Guide

## Pre-Deployment Checklist

### Environment Variables
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `STRIPE_SECRET_KEY` - Stripe private API key
- [ ] `VITE_STRIPE_PUBLIC_KEY` - Stripe public API key
- [ ] `SESSION_SECRET` - Secret for session encryption
- [ ] `TWILIO_ACCOUNT_SID` - For SMS verification (optional)
- [ ] `TWILIO_AUTH_TOKEN` - For SMS verification (optional)
- [ ] `TWILIO_PHONE_NUMBER` - For SMS verification (optional)
- [ ] `SENDGRID_API_KEY` - For email verification (optional)

### SSL Certificates
- [ ] SSL certificate files available in `/etc/ssl/rjwealthgroup` directory
- [ ] `privkey.pem` - SSL private key file
- [ ] `fullchain.pem` - SSL certificate chain file

### Database
- [ ] Database migrations applied (`npm run db:push`)
- [ ] Initial admin user created
- [ ] Initial dispute letter categories and templates loaded

### Domain Configuration
- [ ] DNS records point to server IP address
- [ ] A record: `rjwealthgroup.com` → Server IP
- [ ] CNAME record: `www.rjwealthgroup.com` → `rjwealthgroup.com`

## Deployment Steps

### 1. Environment Setup
```bash
# Set required environment variables
export NODE_ENV=production
export PORT=5000

# Set database connection
export DATABASE_URL='postgresql://user:password@hostname:port/database'

# Set security keys
export SESSION_SECRET='your-secure-random-string'
export SSL_DIR='/etc/ssl/rjfinancial'

# Set payment processing 
export STRIPE_SECRET_KEY='sk_live_...'
export VITE_STRIPE_PUBLIC_KEY='pk_live_...'

# Set MFA services (optional but recommended)
export TWILIO_ACCOUNT_SID='AC...'
export TWILIO_AUTH_TOKEN='your-twilio-auth-token'
export TWILIO_PHONE_NUMBER='+1234567890'
export SENDGRID_API_KEY='SG...'
```

### 2. Build the Application
```bash
# Install dependencies
npm install

# Run database migrations
npm run db:push

# Build the application
npm run build
```

### 3. Start the Application
```bash
# Option 1: Using the startup script (recommended)
node startup.js

# Option 2: Using npm start
npm start

# Option 3: Using a process manager like PM2
pm2 start npm --name "rjfinancial" -- start
```

### 4. Verify Deployment
- Visit `https://rjfinancial.com` to confirm the site is live
- Test user registration and login functionality
- Verify Stripe payment integration works correctly
- Check that MFA features (SMS and email verification) function properly
- Ensure trust document templates are accessible and generating correctly
- Verify credit dispute features and EIN applications work as expected

### 5. Post-Deployment Tasks
- Monitor server logs for errors
- Set up SSL certificate auto-renewal
- Configure server backups
- Implement uptime monitoring
- Set up error alerts

## Troubleshooting

### Common Issues
1. **Database Connection Failed**
   - Check DATABASE_URL is correct
   - Verify database user permissions
   - Check database server is running

2. **SSL Certificate Issues**
   - Verify certificate files exist in the correct location
   - Check certificate expiration dates
   - Ensure certificate is issued for rjfinancial.com

3. **Stripe Integration Problems**
   - Verify Stripe API keys are correct
   - Check Stripe dashboard for event logs
   - Test payments using Stripe test mode

4. **Performance Issues**
   - Monitor server CPU and memory usage
   - Check database query performance
   - Consider adding caching for high-traffic pages

## Maintenance

### Regular Tasks
- Update SSL certificates before expiration
- Monitor disk space usage
- Apply security patches
- Review error logs
- Perform database backups

### Emergency Contacts
- Server administrator: admin@rjfinancial.com
- Database administrator: dba@rjfinancial.com
- Security team: security@rjfinancial.com