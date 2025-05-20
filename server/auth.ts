import * as client from "openid-client";
import { Strategy } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { pool } from "./db";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import * as schema from "@shared/schema";
import { db } from "./db";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Strategy as LocalStrategy } from "passport-local";

// Local strategy setup for regular username/password login
passport.use('local', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email: string, password: string, done: any) => {
  try {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
    
    if (!user) {
      return done(null, false, { message: 'Invalid credentials' });
    }
    
    // Verify password with bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return done(null, false, { message: 'Invalid credentials' });
    }
    
    // Check if MFA is enabled for user
    if (user.mfaEnabled) {
      return done(null, { id: user.id, requiresMfa: true });
    }
    
    // Update last login time
    await db.update(schema.users)
      .set({ lastLoginAt: new Date() })
      .where(eq(schema.users.id, user.id));
    
    // Log successful login to audit log
    await db.insert(schema.auditLogs).values({
      userId: user.id,
      action: 'login',
      details: { method: 'local' }
    });
    
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

// Initialize session management
export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    pool,
    tableName: "sessions",
    createTableIfMissing: true,
  });
  
  if (!process.env.SESSION_SECRET) {
    // For development only - in production always use a strong secret
    console.warn("SESSION_SECRET not set. Using a temporary secret. This is not secure for production!");
  }
  
  return session({
    secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex"),
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

// Serialize and deserialize user for session management
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Authentication middleware to protect routes
export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Authentication required" });
};

// Admin role check middleware
export const isAdmin: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  const userId = req.user.id;
  
  // Check if user has admin role
  db.select()
    .from(schema.userRoles)
    .where(eq(schema.userRoles.userId, userId))
    .then((roles) => {
      if (roles.some(role => role.role === "admin")) {
        return next();
      }
      return res.status(403).json({ message: "Admin access required" });
    })
    .catch(next);
};

// Gold membership check middleware
export const hasGoldMembership: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  const user = req.user;
  
  // Check if membership is gold and not expired
  if (user.membershipLevel === "gold" && (!user.membershipExpires || new Date(user.membershipExpires) > new Date())) {
    return next();
  }
  
  return res.status(403).json({ message: "Gold membership required" });
};

// Combined middleware for admin OR gold membership
export const hasGoldMembershipOrAdmin: RequestHandler = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  const userId = req.user.id;
  const user = req.user;
  
  // Check for admin role
  const roles = await db.select()
    .from(schema.userRoles)
    .where(eq(schema.userRoles.userId, userId));
  
  const isAdminUser = roles.some(role => role.role === "admin");
  const hasGold = user.membershipLevel === "gold" && (!user.membershipExpires || new Date(user.membershipExpires) > new Date());
  
  if (isAdminUser || hasGold) {
    return next();
  }
  
  return res.status(403).json({ message: "Gold membership or admin access required" });
};

// Generate a JWT for API access
export function generateToken(user) {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email
  };
  
  return jwt.sign(
    payload, 
    process.env.JWT_SECRET || 'insecure_jwt_secret', 
    { expiresIn: '1h' }
  );
}

// JWT authentication middleware
export const authenticateJWT: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, process.env.JWT_SECRET || 'insecure_jwt_secret', (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
      }
      
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ message: "Authentication token required" });
  }
};

// Setup authentication for the Express app
export function setupAuth(app: Express) {
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Setup rate limiting for login attempts
  // More security features can be added here
}