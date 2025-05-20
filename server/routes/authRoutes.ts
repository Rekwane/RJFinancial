import { Router } from 'express';
import { db } from '../db';
import * as schema from '@shared/schema';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import passport from 'passport';
import { isAuthenticated, generateToken } from '../auth';
import * as mfaService from '../services/mfaService';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  phoneNumber: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const verifyMfaSchema = z.object({
  userId: z.number(),
  code: z.string().length(6),
  type: z.enum(['email', 'sms']),
});

// Register a new user
router.post('/register', async (req, res) => {
  try {
    // Validate request body
    const validated = registerSchema.parse(req.body);
    
    // Check if username or email already exists
    const existingUser = await db.select()
      .from(schema.users)
      .where(eq(schema.users.username, validated.username))
      .or(eq(schema.users.email, validated.email))
      .limit(1);
    
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(validated.password, salt);
    
    // Create user
    const [user] = await db.insert(schema.users)
      .values({
        username: validated.username,
        email: validated.email,
        password: hashedPassword,
        fullName: validated.fullName,
        phoneNumber: validated.phoneNumber,
        isActive: true,
      })
      .returning();
    
    // Add default user role (client)
    await db.insert(schema.userRoles)
      .values({
        userId: user.id,
        role: 'client',
      });
    
    // Send email verification
    if (validated.email) {
      try {
        await mfaService.sendEmailVerification(user.id, validated.email);
      } catch (error) {
        console.error('Failed to send verification email:', error);
        // Continue with registration despite email failure
      }
    }
    
    // Send SMS verification if phone number is provided
    if (validated.phoneNumber) {
      try {
        await mfaService.sendSmsVerification(user.id, validated.phoneNumber);
      } catch (error) {
        console.error('Failed to send SMS verification:', error);
        // Continue with registration despite SMS failure
      }
    }
    
    // Create JWT token and log user in
    const token = generateToken(user);
    
    // Log registration in audit trail
    await db.insert(schema.auditLogs).values({
      userId: user.id,
      action: 'user_registered',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { method: 'local' }
    });
    
    // Return user data without password
    const { password, ...userWithoutPassword } = user;
    res.status(201).json({
      user: userWithoutPassword,
      token,
      message: 'Registration successful. Please verify your email and phone number.'
    });
  } catch (error) {
    console.error('Registration failed:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Login
router.post('/login', (req, res, next) => {
  try {
    // Validate request body
    const validated = loginSchema.parse(req.body);
    
    passport.authenticate('local', { session: true }, (err, user, info) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({ message: info.message || 'Invalid credentials' });
      }
      
      // Check if MFA is required
      if (user.requiresMfa) {
        return res.status(200).json({ 
          requiresMfa: true, 
          userId: user.id,
          message: 'MFA verification required'
        });
      }
      
      // Log the user in
      req.login(user, async (err) => {
        if (err) {
          return next(err);
        }
        
        // Update last login time
        await db.update(schema.users)
          .set({ lastLoginAt: new Date() })
          .where(eq(schema.users.id, user.id));
        
        // Log login in audit trail
        await db.insert(schema.auditLogs).values({
          userId: user.id,
          action: 'login',
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          details: { method: 'local' }
        });
        
        // Create JWT token
        const token = generateToken(user);
        
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        
        res.json({
          user: userWithoutPassword,
          token,
          message: 'Login successful'
        });
      });
    })(req, res, next);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    next(error);
  }
});

// Verify MFA code
router.post('/verify-mfa', async (req, res) => {
  try {
    const validated = verifyMfaSchema.parse(req.body);
    
    const isValid = await mfaService.verifyCode(
      validated.userId, 
      validated.code, 
      validated.type
    );
    
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }
    
    // Get user
    const [user] = await db.select()
      .from(schema.users)
      .where(eq(schema.users.id, validated.userId));
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update last login time
    await db.update(schema.users)
      .set({ lastLoginAt: new Date() })
      .where(eq(schema.users.id, user.id));
    
    // Log MFA verification in audit trail
    await db.insert(schema.auditLogs).values({
      userId: user.id,
      action: 'mfa_verified',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { type: validated.type }
    });
    
    // Log the user in
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to log in' });
      }
      
      // Create JWT token
      const token = generateToken(user);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.json({
        user: userWithoutPassword,
        token,
        message: 'MFA verification successful'
      });
    });
  } catch (error) {
    console.error('MFA verification failed:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ message: 'MFA verification failed' });
  }
});

// Request email verification
router.post('/request-email-verification', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user email
    const [user] = await db.select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));
    
    if (!user || !user.email) {
      return res.status(400).json({ message: 'User email not found' });
    }
    
    // Send verification email
    const sent = await mfaService.sendEmailVerification(userId, user.email);
    
    if (!sent) {
      return res.status(500).json({ message: 'Failed to send verification email' });
    }
    
    res.json({ message: 'Verification email sent' });
  } catch (error) {
    console.error('Failed to send verification email:', error);
    res.status(500).json({ message: 'Failed to send verification email' });
  }
});

// Request SMS verification
router.post('/request-sms-verification', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user phone number
    const [user] = await db.select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));
    
    if (!user || !user.phoneNumber) {
      return res.status(400).json({ message: 'User phone number not found' });
    }
    
    // Send verification SMS
    const sent = await mfaService.sendSmsVerification(userId, user.phoneNumber);
    
    if (!sent) {
      return res.status(500).json({ message: 'Failed to send verification SMS' });
    }
    
    res.json({ message: 'Verification SMS sent' });
  } catch (error) {
    console.error('Failed to send verification SMS:', error);
    res.status(500).json({ message: 'Failed to send verification SMS' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  if (req.isAuthenticated()) {
    // Log logout in audit trail
    db.insert(schema.auditLogs).values({
      userId: req.user.id,
      action: 'logout',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    }).catch(console.error);
  }
  
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to logout' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Get current user
router.get('/me', isAuthenticated, (req, res) => {
  // Remove password from response
  const { password, ...userWithoutPassword } = req.user;
  res.json(userWithoutPassword);
});

export default router;