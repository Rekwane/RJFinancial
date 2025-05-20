#!/usr/bin/env node

/**
 * RJFinancial Production Startup Script
 * 
 * This script manages the startup of the RJFinancial application
 * in production environments with proper error handling.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const config = JSON.parse(fs.readFileSync('./deploy-config.json', 'utf8'));
console.log(`Starting ${config.app.name} in ${config.app.environment} mode...`);

// Environment validation
const requiredEnvVars = [
  'DATABASE_URL',
  'STRIPE_SECRET_KEY',
  'VITE_STRIPE_PUBLIC_KEY',
  'SESSION_SECRET'
];

let missingVars = [];
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    missingVars.push(envVar);
  }
});

if (missingVars.length > 0) {
  console.error('\n⚠️ Missing required environment variables:');
  missingVars.forEach(envVar => console.error(`  - ${envVar}`));
  console.error('\nPlease set these variables before starting the application.');
  
  if (missingVars.includes('SESSION_SECRET')) {
    console.error('\nFor SESSION_SECRET, you can generate a secure random string:');
    console.error('Example: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  }
  
  if (missingVars.includes('STRIPE_SECRET_KEY') || missingVars.includes('VITE_STRIPE_PUBLIC_KEY')) {
    console.error('\nFor Stripe keys, visit https://dashboard.stripe.com/apikeys');
  }
  
  process.exit(1);
}

// Database check
console.log('Checking database connection...');
try {
  execSync('node -e "const { Pool } = require(\'@neondatabase/serverless\'); const pool = new Pool({ connectionString: process.env.DATABASE_URL }); pool.query(\'SELECT NOW()\').then(() => { console.log(\'Database connection successful\'); pool.end(); }).catch(err => { console.error(\'Database connection failed:\', err); process.exit(1); })"', { stdio: 'inherit' });
} catch (error) {
  console.error('Database connection check failed. Exiting.');
  process.exit(1);
}

// Check for SSL certificates if SSL is enabled
if (config.security.sslEnabled) {
  const sslDir = process.env.SSL_DIR || config.security.sslCertDir;
  
  if (!fs.existsSync(sslDir)) {
    console.warn(`\n⚠️ SSL directory not found: ${sslDir}`);
    console.warn('HTTPS will not be available. Website will run on HTTP only.');
  } else {
    const privateKeyPath = path.join(sslDir, 'privkey.pem');
    const certificatePath = path.join(sslDir, 'fullchain.pem');
    
    if (!fs.existsSync(privateKeyPath) || !fs.existsSync(certificatePath)) {
      console.warn('\n⚠️ SSL certificate files not found.');
      console.warn('HTTPS will not be available. Website will run on HTTP only.');
    } else {
      console.log('SSL certificates found and will be used for HTTPS.');
    }
  }
}

// Start the application
console.log('\n🚀 Starting RJFinancial application...');
try {
  execSync('NODE_ENV=production node dist/index.js', { stdio: 'inherit' });
} catch (error) {
  console.error('Application startup failed:', error);
  process.exit(1);
}