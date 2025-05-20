import { db } from "../db";
import * as schema from "@shared/schema";
import crypto from "crypto";
import twilio from "twilio";
import sgMail from "@sendgrid/mail";
import { eq } from "drizzle-orm";

// Initialize Twilio client for SMS
let twilioClient: twilio.Twilio | null = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
} else {
  console.warn("Twilio credentials not set. SMS verification will not work.");
}

// Initialize SendGrid for email
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn("SendGrid API key not set. Email verification will not work.");
}

// Generate a random verification code
function generateVerificationCode(): string {
  // Generate a 6-digit code
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Create a new verification record
export async function createVerification(userId: number, type: 'email' | 'sms'): Promise<string> {
  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
  
  await db.insert(schema.mfaVerifications).values({
    userId,
    verificationType: type,
    verificationCode: code,
    expiresAt,
    isVerified: false
  });
  
  return code;
}

// Send verification code via SMS
export async function sendSmsVerification(userId: number, phoneNumber: string): Promise<boolean> {
  if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
    throw new Error("Twilio is not configured properly");
  }
  
  try {
    const code = await createVerification(userId, 'sms');
    
    await twilioClient.messages.create({
      body: `Your RJFinancial verification code is: ${code}. It will expire in 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    
    return true;
  } catch (error) {
    console.error("Failed to send SMS verification:", error);
    return false;
  }
}

// Send verification code via Email
export async function sendEmailVerification(userId: number, email: string): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error("SendGrid API key is not set");
  }
  
  try {
    const code = await createVerification(userId, 'email');
    
    const msg = {
      to: email,
      from: process.env.FROM_EMAIL || 'noreply@rjfinancial.com',
      subject: 'Verify Your Email - RJFinancial',
      text: `Your verification code is: ${code}. It will expire in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(to right, #1e3a8a, #3b82f6); padding: 20px; color: white; text-align: center; border-radius: 5px 5px 0 0;">
            <h1>Email Verification</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 5px 5px;">
            <p>Thank you for choosing RJFinancial. Please verify your email address by entering the following code:</p>
            <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0; font-weight: bold;">
              ${code}
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you did not request this verification, please ignore this email or contact support if you have concerns.</p>
            <p>Best Regards,<br>The RJFinancial Team</p>
          </div>
        </div>
      `
    };
    
    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error("Failed to send email verification:", error);
    return false;
  }
}

// Verify the code provided by the user
export async function verifyCode(userId: number, code: string, type: 'email' | 'sms'): Promise<boolean> {
  try {
    // Find the most recent verification for this user and type
    const [verification] = await db.select()
      .from(schema.mfaVerifications)
      .where(eq(schema.mfaVerifications.userId, userId))
      .where(eq(schema.mfaVerifications.verificationType, type))
      .orderBy(schema.mfaVerifications.createdAt, 'desc')
      .limit(1);
    
    if (!verification) {
      return false;
    }
    
    // Check if code has expired
    if (new Date() > new Date(verification.expiresAt)) {
      return false;
    }
    
    // Check if code matches
    if (verification.verificationCode !== code) {
      return false;
    }
    
    // Mark as verified
    await db.update(schema.mfaVerifications)
      .set({ isVerified: true })
      .where(eq(schema.mfaVerifications.id, verification.id));
    
    // Update user verification status
    if (type === 'email') {
      await db.update(schema.users)
        .set({ isEmailVerified: true })
        .where(eq(schema.users.id, userId));
    } else if (type === 'sms') {
      await db.update(schema.users)
        .set({ isPhoneVerified: true })
        .where(eq(schema.users.id, userId));
    }
    
    return true;
  } catch (error) {
    console.error("Verification failed:", error);
    return false;
  }
}