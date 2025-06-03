import fs from 'fs';
import path from 'path';
import https from 'https';
import express from 'express';
import { log } from './vite';

// Domain configuration for RJWealthGroup.com
export async function configureDomain(app: express.Express) {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    log('Setting up domain configuration for production', 'domain');
    
    // Set trusted proxies (important for security when behind a load balancer)
    app.set('trust proxy', 1);
    
    // Force HTTPS in production
    app.use((req, res, next) => {
      if (req.secure) {
        // Request is already secure
        next();
      } else {
        // Redirect to HTTPS
        log(`Redirecting insecure request to HTTPS: ${req.method} ${req.url}`, 'domain');
        res.redirect(`https://${req.hostname}${req.url}`);
      }
    });
    
    // Add security headers
    app.use((req, res, next) => {
      // Strict Transport Security - force browsers to use HTTPS for future requests
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
      
      // Content Security Policy - restrict resources to come only from specified domains
      res.setHeader('Content-Security-Policy', `
        default-src 'self' https://*.rjwealthgroup.com https://*.stripe.com;
        script-src 'self' https://*.rjwealthgroup.com https://*.stripe.com 'unsafe-inline';
        style-src 'self' https://*.rjwealthgroup.com 'unsafe-inline';
        img-src 'self' https://*.rjwealthgroup.com data: https://secure.gravatar.com;
        font-src 'self' https://*.rjwealthgroup.com;
        connect-src 'self' https://*.rjwealthgroup.com https://*.stripe.com;
        frame-src https://*.stripe.com;
        object-src 'none';
      `.replace(/\s+/g, ' ').trim());
      
      // Frame Options - prevent site from being embedded in iframes (clickjacking protection)
      res.setHeader('X-Frame-Options', 'SAMEORIGIN');
      
      // XSS Protection - enable browser's XSS filtering
      res.setHeader('X-XSS-Protection', '1; mode=block');
      
      // Content Type Options - prevent MIME sniffing
      res.setHeader('X-Content-Type-Options', 'nosniff');
      
      // Referrer Policy - control how much referrer information is included
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      
      // Permissions Policy - control which features can be used
      res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
      
      next();
    });
    
    // Handle custom domain
    app.use((req, res, next) => {
      // Check if the request hostname is the custom domain
      if (req.hostname === 'rjwealthgroup.com' || req.hostname.endsWith('.rjwealthgroup.com')) {
        log(`Handling request for custom domain: ${req.hostname}${req.url}`, 'domain');
      }
      next();
    });
    
    // SSL certificate management
    try {
      const sslDir = process.env.SSL_DIR || '/etc/ssl/rjwealthgroup';
      
      if (fs.existsSync(sslDir)) {
        const privateKeyPath = path.join(sslDir, 'privkey.pem');
        const certificatePath = path.join(sslDir, 'fullchain.pem');
        
        if (fs.existsSync(privateKeyPath) && fs.existsSync(certificatePath)) {
          const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
          const certificate = fs.readFileSync(certificatePath, 'utf8');
          
          const credentials = { key: privateKey, cert: certificate };
          
          // Create HTTPS server with SSL certificates
          const httpsServer = https.createServer(credentials, app);
          
          // Custom HTTPS port (default: 443)
          const httpsPort = process.env.HTTPS_PORT || 443;
          httpsServer.listen(httpsPort, () => {
            log(`HTTPS server running on port ${httpsPort}`, 'domain');
          });
          
          log('SSL certificates successfully configured', 'domain');
        } else {
          log('SSL certificate files not found, falling back to HTTP', 'domain');
        }
      } else {
        log('SSL directory not found, falling back to HTTP', 'domain');
      }
    } catch (error) {
      log(`Error configuring SSL: ${error}`, 'domain');
    }
  } else {
    log('Development mode: domain configuration skipped', 'domain');
  }
  
  return app;
}