import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail, findUserById } from '../models/index.js';
import { seedClosetItems } from '../models/index.js';

const SALT_ROUNDS = 12;

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

export function googleOAuth(req, res) {
  res.status(501).json({ success: false, message: 'OAuth coming soon', code: 'NOT_IMPLEMENTED' });
}

export function appleOAuth(req, res) {
  res.status(501).json({ success: false, message: 'OAuth coming soon', code: 'NOT_IMPLEMENTED' });
}
