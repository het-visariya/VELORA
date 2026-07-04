import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { createUser, findUserByEmail, findUserById } from '../models/index.js';
import { seedClosetItems } from '../models/index.js';

const SALT_ROUNDS = 12;

const SOCIAL_CODE_TTL_MS = 15 * 60 * 1000;
const socialVerifications = new Map();

function createEmailTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 0);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
}

async function sendSocialVerificationEmail(provider, email, code) {
  const transporter = createEmailTransporter();
  if (!transporter) {
    return false;
  }

  const subject = `Velora ${provider === 'google' ? 'Google' : 'Apple'} sign-in code`;
  const from = process.env.SMTP_FROM || 'no-reply@velora.app';
  const text = `Your Velora confirmation code is ${code}. Enter it in the app to complete sign-in.`;
  const html = `<p>Your Velora confirmation code is <strong>${code}</strong>.</p><p>Enter it in the app to complete sign-in.</p>`;

  try {
    await transporter.sendMail({
      from,
      to: email,
      subject,
      text,
      html
    });
    return true;
  } catch (err) {
    console.error('Email send failed:', err);
    return false;
  }
}

function cleanupSocialVerifications() {
  const now = Date.now();
  for (const [email, entry] of socialVerifications.entries()) {
    if (now - entry.createdAt > SOCIAL_CODE_TTL_MS) {
      socialVerifications.delete(email);
    }
  }
}

function createSocialVerification(provider, email, name) {
  const normalizedEmail = (email || '').trim().toLowerCase();
  if (!normalizedEmail) {
    throw new Error('Email is required for social login');
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  socialVerifications.set(normalizedEmail, {
    provider,
    email: normalizedEmail,
    name,
    code,
    createdAt: Date.now(),
  });

  cleanupSocialVerifications();
  return code;
}

function consumeSocialVerification(provider, email, code) {
  const normalizedEmail = (email || '').trim().toLowerCase();
  const record = socialVerifications.get(normalizedEmail);
  if (!record || record.provider !== provider || record.code !== code) {
    return null;
  }

  if (Date.now() - record.createdAt > SOCIAL_CODE_TTL_MS) {
    socialVerifications.delete(normalizedEmail);
    return null;
  }

  socialVerifications.delete(normalizedEmail);
  return record;
}

const DEFAULT_CLOSET_ITEMS = [
  { name: 'Silk Shirt', brand: 'Maison', category: 'Women Tops', season: 'All', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop' },
  { name: 'Cashmere Knitwear', brand: 'Velora', category: 'Women Tops', season: 'Autumn', image: 'https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?q=80&w=800&auto=format&fit=crop' },
  { name: 'Elegant Maxi Dress', brand: 'Aura', category: 'Women Tops', season: 'Summer', image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=800&auto=format&fit=crop' },
  { name: 'Tailored Trousers', brand: 'Velora', category: 'Women Bottoms', season: 'Spring', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=800&auto=format&fit=crop' },
  { name: 'Floral Summer Skirt', brand: 'Maison', category: 'Women Bottoms', season: 'Summer', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop' },
  { name: 'Leather Pencil Skirt', brand: 'Velora', category: 'Women Bottoms', season: 'Autumn', image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=800&auto=format&fit=crop' },
  { name: 'Structured Blazer', brand: 'Velora', category: 'Women Outerwear', season: 'All', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop' },
  { name: 'Wool Overcoat', brand: 'Velora', category: 'Women Outerwear', season: 'Winter', image: 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?q=80&w=800&auto=format&fit=crop' },
  { name: 'Minimalist Boots', brand: 'Maison', category: 'Women Accessories', season: 'Winter', image: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?q=80&w=800&auto=format&fit=crop' },
  { name: 'Pearl Clutch', brand: 'Aura', category: 'Women Accessories', season: 'All', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop' },
  { name: 'Tailored Suit Jacket', brand: 'Velora', category: 'Men Tops', season: 'All', image: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=800&auto=format&fit=crop' },
  { name: 'Oxford Dress Shirt', brand: 'Maison', category: 'Men Tops', season: 'All', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop' },
  { name: 'Slim Fit Chinos', brand: 'Maison', category: 'Men Bottoms', season: 'Spring', image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop' },
  { name: 'Relaxed Cargo Pants', brand: 'Velora', category: 'Men Bottoms', season: 'Summer', image: 'https://images.unsplash.com/photo-1523381211786-3033e0c6fe84?q=80&w=800&auto=format&fit=crop' },
  { name: 'Leather Biker Jacket', brand: 'Velora', category: 'Men Outerwear', season: 'Autumn', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop' },
  { name: 'Tech Shell Jacket', brand: 'Maison', category: 'Men Outerwear', season: 'Winter', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop' },
  { name: 'Classic Oxford Shoes', brand: 'Maison', category: 'Men Accessories', season: 'Winter', image: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?q=80&w=800&auto=format&fit=crop' },
  { name: 'Aviator Sunglasses', brand: 'Velora', category: 'Men Accessories', season: 'All', image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop' },
];

async function findOrCreateSocialUser(provider, email, name) {
  const normalizedEmail = (email || '').trim().toLowerCase();
  if (!normalizedEmail) {
    throw new Error('Social login requires an email address');
  }

  const existingUser = await findUserByEmail(normalizedEmail);
  if (existingUser.rows.length > 0) {
    return existingUser.rows[0];
  }

  const userName = name || `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`;
  const passwordHash = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), SALT_ROUNDS);
  const result = await createUser(userName, normalizedEmail, passwordHash);
  const user = result.rows[0];
  await seedClosetItems(user.id, DEFAULT_CLOSET_ITEMS);
  return user;
}

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required', code: 'VALIDATION_ERROR' });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters with 1 uppercase, 1 number, and 1 special character',
        code: 'VALIDATION_ERROR'
      });
    }

    const existing = await findUserByEmail(email);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered', code: 'EMAIL_EXISTS' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await createUser(name, email, passwordHash);
    const user = result.rows[0];

    // Seed default closet items
    await seedClosetItems(user.id, DEFAULT_CLOSET_ITEMS);

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      data: { token, user: { id: user.id, name: user.name, email: user.email } }
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required', code: 'VALIDATION_ERROR' });
    }

    const result = await findUserByEmail(email);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password', code: 'INVALID_CREDENTIALS' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password', code: 'INVALID_CREDENTIALS' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      data: { token, user: { id: user.id, name: user.name, email: user.email, profileImage: user.profile_image } }
    });
  } catch (err) {
    next(err);
  }
}

export async function googleOAuth(req, res, next) {
  try {
    const { email, name } = req.body || {};
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required to send a Google confirmation code', code: 'VALIDATION_ERROR' });
    }

    const code = createSocialVerification('google', email, name || 'Google User');
    const sent = await sendSocialVerificationEmail('google', email, code);
    console.log(`Google login code for ${email}: ${code}`);

    res.json({
      success: true,
      message: sent
        ? `Confirmation code sent to ${email}`
        : `No email agent configured. Use the debug code shown in the app to complete login.`,
      debugCode: sent ? undefined : code,
    });
  } catch (err) {
    next(err);
  }
}

export async function appleOAuth(req, res, next) {
  try {
    const { email, name } = req.body || {};
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required to send an Apple confirmation code', code: 'VALIDATION_ERROR' });
    }

    const code = createSocialVerification('apple', email, name || 'Apple User');
    const sent = await sendSocialVerificationEmail('apple', email, code);
    console.log(`Apple login code for ${email}: ${code}`);

    res.json({
      success: true,
      message: sent
        ? `Confirmation code sent to ${email}`
        : `No email agent configured. Use the debug code shown in the app to complete login.`,
      debugCode: sent ? undefined : code,
    });
  } catch (err) {
    next(err);
  }
}

export async function verifySocialCode(req, res, next) {
  try {
    const { provider, email, code } = req.body || {};
    if (!provider || !email || !code) {
      return res.status(400).json({ success: false, message: 'Provider, email, and code are required', code: 'VALIDATION_ERROR' });
    }

    const verification = consumeSocialVerification(provider, email, code);
    if (!verification) {
      return res.status(401).json({ success: false, message: 'Invalid or expired confirmation code', code: 'INVALID_CODE' });
    }

    const user = await findOrCreateSocialUser(provider, email, verification.name);
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, profileImage: user.profile_image }
      }
    });
  } catch (err) {
    next(err);
  }
}
