#!/usr/bin/env node

/**
 * RJFinancial Deployment Script
 * 
 * This script handles the final preparation steps for deploying the 
 * RJFinancial website to production.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  appName: "RJFinancial",
  domain: "rjfinancial.com",
  environment: process.env.NODE_ENV || 'production',
  port: process.env.PORT || 5000,
  sslEnabled: !!process.env.SSL_DIR,
  stripeEnabled: !!process.env.STRIPE_SECRET_KEY,
  databaseEnabled: !!process.env.DATABASE_URL,
};

console.log(`\n📦 Starting ${config.appName} deployment process...`);
console.log(`🌐 Target domain: ${config.domain}`);
console.log(`🔒 SSL enabled: ${config.sslEnabled ? 'Yes' : 'No'}`);
console.log(`💳 Payment processing: ${config.stripeEnabled ? 'Active' : 'Not configured'}`);
console.log(`🗄️ Database connection: ${config.databaseEnabled ? 'Connected' : 'Not configured'}`);

// Create necessary deployment directories
const deploymentDir = path.join(__dirname, '.deployment');
if (!fs.existsSync(deploymentDir)) {
  fs.mkdirSync(deploymentDir, { recursive: true });
  console.log("✅ Created deployment directory");
}

// Generate robots.txt for production
if (config.environment === 'production') {
  const robotsContent = `
# robots.txt for ${config.domain}
User-agent: *
Allow: /

# Sitemaps
Sitemap: https://${config.domain}/sitemap.xml
  `.trim();
  
  fs.writeFileSync(path.join(__dirname, 'client', 'public', 'robots.txt'), robotsContent);
  console.log("✅ Generated robots.txt");
}

// Pre-deployment checks
const checks = [
  { 
    name: "Database connection", 
    enabled: config.databaseEnabled,
    message: "Missing DATABASE_URL environment variable. Database features will not work.",
    critical: true
  },
  { 
    name: "Stripe integration", 
    enabled: config.stripeEnabled,
    message: "Missing STRIPE_SECRET_KEY environment variable. Payment features will not work.",
    critical: true
  },
  {
    name: "SSL certificates",
    enabled: config.sslEnabled,
    message: "Missing SSL certificates. The site will not use HTTPS.",
    critical: false
  },
  {
    name: "Session security",
    enabled: !!process.env.SESSION_SECRET,
    message: "Missing SESSION_SECRET environment variable. Using insecure default.",
    critical: true
  },
  {
    name: "MFA SMS verification",
    enabled: !!process.env.TWILIO_ACCOUNT_SID,
    message: "Missing Twilio credentials. SMS verification won't work.",
    critical: false
  },
  {
    name: "MFA Email verification",
    enabled: !!process.env.SENDGRID_API_KEY,
    message: "Missing SendGrid API key. Email verification won't work.",
    critical: false
  }
];

// Run checks
let criticalIssues = 0;
checks.forEach(check => {
  if (!check.enabled) {
    console.log(`⚠️ ${check.message}`);
    if (check.critical) criticalIssues++;
  }
});

if (criticalIssues > 0) {
  console.error(`\n❌ Found ${criticalIssues} critical issues that must be resolved before deployment.`);
  console.error("Please configure the missing environment variables and try again.");
  process.exit(1);
}

// Run database migrations
try {
  console.log("\n🗄️ Running database migrations...");
  execSync('npm run db:push', { stdio: 'inherit' });
  console.log("✅ Database migrations completed successfully");
} catch (error) {
  console.error("❌ Database migration failed:", error.message);
  process.exit(1);
}

// Build the frontend
try {
  console.log("\n🏗️ Building the frontend...");
  execSync('npm run build', { stdio: 'inherit' });
  console.log("✅ Frontend build completed successfully");
} catch (error) {
  console.error("❌ Frontend build failed:", error.message);
  process.exit(1);
}

console.log(`\n🚀 ${config.appName} is ready for deployment!`);
console.log(`To start the server in production mode, run: npm start`);