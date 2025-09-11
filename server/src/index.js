import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
// GraphQL removed; using pure REST
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import passport from 'passport';
import passportGoogle from 'passport-google-oauth20';
import passportFacebook from 'passport-facebook';
import passportLine from 'passport-line';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import User from './models/User.js';
import Cart from './models/Cart.js';
import Order from './models/Order.js';
import Product from './models/Product.js';
import Ticket from './models/Ticket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nr2';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_');
    cb(null, `${timestamp}-${safeOriginal}`);
  }
});
const upload = multer({ storage });

// Demo products used for initial seed
const seedProducts = [
  {
    sku: 'sku-cleanser',
    name: 'Silky Smooth Cleanser',
    price: 15900,
    image:
      'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=800&q=80',
    description: 'Gentle daily facial cleanser for all skin types.',
    shippingFee: 500,
    maxQtyPerUser: 5,
  },
  {
    sku: 'sku-moisturizer',
    name: 'HydraGlow Moisturizer',
    price: 24900,
    image:
      'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80',
    description: 'Lightweight hydration that lasts all day.',
    shippingFee: 500,
    maxQtyPerUser: 5,
  },
  {
    sku: 'sku-serum',
    name: 'Vitamin C Brightening Serum',
    price: 32900,
    image:
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80',
    description: 'Potent vitamin C formula for a radiant complexion.',
    shippingFee: 500,
    maxQtyPerUser: 5,
  },
  {
    sku: 'sku-lipstick',
    name: 'Rose Tint Lipstick',
    price: 17900,
    image:
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
    description: 'Creamy, long-wear lipstick with a rose tint.',
    shippingFee: 500,
    maxQtyPerUser: 5,
  },
  {
    sku: 'sku-sunscreen',
    name: 'Daily Defense Sunscreen SPF50',
    price: 21900,
    image:
      'https://images.unsplash.com/photo-1505577058444-a3dab90d4253?auto=format&fit=crop&w=800&q=80',
    description: 'Broad-spectrum sunscreen with a lightweight finish.',
    shippingFee: 500,
    maxQtyPerUser: 5,
  },
  {
    sku: 'sku-toner',
    name: 'Revitalizing Toner',
    price: 13900,
    image:
      'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80',
    description: 'Balances skin and preps for treatments.',
    shippingFee: 500,
    maxQtyPerUser: 5,
  },
];

// Simple GraphQL schema & resolvers
const typeDefs = /* GraphQL */ `#graphql
  type Query {
    hello: String!
    ping(message: String): String!
  }

  type Mutation {
    echo(message: String!): String!
  }
`;

const resolvers = {
  Query: {
    hello: () => 'Hello from GraphQL server 👋',
    ping: (_parent, args) => args.message ?? 'pong',
  },
  Mutation: {
    echo: (_parent, { message }) => message,
  },
};

async function start() {
  const app = express();

  app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', CLIENT_ORIGIN);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
  });
  app.use(bodyParser.json());
  app.use(passport.initialize());
  // Serve uploaded files
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

  // DB connect
  await mongoose.connect(MONGODB_URI, { autoIndex: true });

  // Seed admin (username: admin, password: test)
  try {
    const admin = await User.findOne({ username: 'admin', provider: 'local' });
    if (!admin) {
      const hash = await bcrypt.hash('test', 10);
      await User.create({
        provider: 'local',
        providerId: 'admin',
        username: 'admin',
        passwordHash: hash,
        name: 'Administrator',
        email: 'admin@example.com',
        isAdmin: true,
      });
      console.log('Seeded admin user: admin/test');
    }
  } catch (e) {
    console.warn('Admin seed skipped:', e?.message || e);
  }

  // Seed products if none exist
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany(seedProducts);
      console.log('Seeded demo products');
    }
  } catch (e) {
    console.warn('Product seed skipped:', e?.message || e);
  }

  // Admin endpoint to seed demo cosmetics products on demand
  app.post('/api/admin/seed-products', requireAuth, requireAdmin, async (_req, res) => {
    try {
      const count = await Product.countDocuments();
      if (count > 0) return res.json({ ok: true, skipped: true, reason: 'Products already exist' });
      await Product.insertMany(seedProducts);
      return res.json({ ok: true, seeded: seedProducts.length });
    } catch (e) {
      return res.status(500).json({ error: e?.message || 'Seed failed' });
    }
  });

  // JWT helpers
  function signToken(user) {
    return jwt.sign(
      {
        sub: String(user._id),
        email: user.email || null,
        name: user.name || null,
        provider: user.provider,
        username: user.username || null,
        isAdmin: !!user.isAdmin,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  function requireAuth(req, res, next) {
    const auth = req.headers.authorization || '';
    const [, token] = auth.split(' ');
    if (!token) return res.status(401).json({ error: 'Missing token' });
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      req.user = payload;
      next();
    } catch (e) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }

  function requireAdmin(req, res, next) {
    if (!req.user?.isAdmin) return res.status(403).json({ error: 'Admin only' });
    next();
  }

  // Passport strategies
  const { Strategy: GoogleStrategy } = passportGoogle;
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && GoogleStrategy) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: `${process.env.SERVER_BASE_URL || `http://localhost:${PORT}`}/auth/google/callback`,
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value || null;
            const name = profile.displayName || [profile.name?.givenName, profile.name?.familyName].filter(Boolean).join(' ') || null;
            let user = await User.findOne({ provider: 'google', providerId: profile.id });
            if (!user) {
              user = await User.create({ provider: 'google', providerId: profile.id, email, name });
            } else if (email && !user.email) {
              user.email = email; user.name = user.name || name; await user.save();
            }
            return done(null, user);
          } catch (err) { return done(err); }
        }
      )
    );
  }

  const { Strategy: FacebookStrategy } = passportFacebook;
  if (process.env.FB_APP_ID && process.env.FB_APP_SECRET && FacebookStrategy) {
    passport.use(
      new FacebookStrategy(
        {
          clientID: process.env.FB_APP_ID,
          clientSecret: process.env.FB_APP_SECRET,
          callbackURL: `${process.env.SERVER_BASE_URL || `http://localhost:${PORT}`}/auth/facebook/callback`,
          profileFields: ['id', 'displayName', 'emails', 'name'],
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value || null;
            const name = profile.displayName || [profile.name?.givenName, profile.name?.familyName].filter(Boolean).join(' ') || null;
            let user = await User.findOne({ provider: 'facebook', providerId: profile.id });
            if (!user) {
              user = await User.create({ provider: 'facebook', providerId: profile.id, email, name });
            } else if (email && !user.email) {
              user.email = email; user.name = user.name || name; await user.save();
            }
            return done(null, user);
          } catch (err) { return done(err); }
        }
      )
    );
  }

  const { Strategy: LineStrategy } = passportLine;
  if (process.env.LINE_CHANNEL_ID && process.env.LINE_CHANNEL_SECRET && LineStrategy) {
    passport.use(
      new LineStrategy(
        {
          channelID: process.env.LINE_CHANNEL_ID,
          channelSecret: process.env.LINE_CHANNEL_SECRET,
          callbackURL: `${process.env.SERVER_BASE_URL || `http://localhost:${PORT}`}/auth/line/callback`,
          scope: ['profile', 'openid', 'email'],
        },
        async (_accessToken, _refreshToken, params, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value || profile._json?.email || null;
            const name = profile.displayName || profile._json?.name || null;
            let user = await User.findOne({ provider: 'line', providerId: profile.id });
            if (!user) {
              user = await User.create({ provider: 'line', providerId: profile.id, email, name });
            } else if (email && !user.email) {
              user.email = email; user.name = user.name || name; await user.save();
            }
            return done(null, user);
          } catch (err) { return done(err); }
        }
      )
    );
  }

  // Healthcheck
  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  // Credential auth
  app.post('/auth/register', async (req, res) => {
    try {
      const { username, password, email, name } = req.body || {};
      if (!username || !password) return res.status(400).json({ error: 'username and password required' });
      const exists = await User.findOne({ username, provider: 'local' });
      if (exists) return res.status(409).json({ error: 'Username already exists' });
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({ provider: 'local', providerId: username, username, passwordHash, email, name });
      const token = signToken(user);
      res.status(201).json({ token });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  app.post('/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body || {};
      if (!username || !password) return res.status(400).json({ error: 'username and password required' });
      const user = await User.findOne({ username, provider: 'local' });
      if (!user || !user.passwordHash) return res.status(401).json({ error: 'Invalid credentials' });
      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
      const token = signToken(user);
      res.json({ token });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // Products (public)
  app.get('/api/products', async (_req, res) => {
    const docs = await Product.find({ active: true }).sort({ createdAt: -1 }).lean();
    const list = docs.map((p) => ({ id: p.sku, name: p.name, price: p.price, image: p.image, description: p.description }));
    res.json(list);
  });

  // Product detail (public)
  app.get('/api/products/:sku', async (req, res) => {
    const { sku } = req.params;
    const p = await Product.findOne({ sku, active: true }).lean();
    if (!p) return res.status(404).json({ error: 'Not found' });
    res.json({
      id: p.sku,
      name: p.name,
      price: p.price,
      image: p.image,
      description: p.description,
      shippingFee: p.shippingFee ?? 0,
      maxQtyPerUser: p.maxQtyPerUser ?? 0,
    });
  });

  // Admin APIs
  app.get('/api/admin/users', requireAuth, requireAdmin, async (_req, res) => {
    const users = await User.find().sort({ createdAt: -1 }).lean();
    res.json(users.map((u) => ({ id: String(u._id), username: u.username, email: u.email, name: u.name, provider: u.provider, isAdmin: !!u.isAdmin, createdAt: u.createdAt })));
  });

  app.get('/api/admin/products', requireAuth, requireAdmin, async (_req, res) => {
    const docs = await Product.find().sort({ createdAt: -1 }).lean();
    res.json(docs);
  });
  app.get('/api/admin/products/:sku', requireAuth, requireAdmin, async (req, res) => {
    const { sku } = req.params;
    const doc = await Product.findOne({ sku }).lean();
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  });
  app.post('/api/admin/products', requireAuth, requireAdmin, async (req, res) => {
    const { sku, name, price, image, description, shippingFee = 0, maxQtyPerUser = 0, active = true } = req.body || {};
    if (!name || typeof price !== 'number') return res.status(400).json({ error: 'name and price required' });
    const finalSku = sku || `sku-${Date.now()}`;
    const created = await Product.create({ sku: finalSku, name, price, image, description, shippingFee, maxQtyPerUser, active });
    res.status(201).json(created);
  });
  app.put('/api/admin/products/:sku', requireAuth, requireAdmin, async (req, res) => {
    const { sku } = req.params;
    const { name, price, image, description, shippingFee, maxQtyPerUser, active } = req.body || {};
    const update = {};
    if (typeof name !== 'undefined') update.name = name;
    if (typeof price !== 'undefined') update.price = price;
    if (typeof image !== 'undefined') update.image = image;
    if (typeof description !== 'undefined') update.description = description;
    if (typeof shippingFee !== 'undefined') update.shippingFee = shippingFee;
    if (typeof maxQtyPerUser !== 'undefined') update.maxQtyPerUser = maxQtyPerUser;
    if (typeof active !== 'undefined') update.active = active;
    const doc = await Product.findOneAndUpdate({ sku }, update, { new: true });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  });
  app.delete('/api/admin/products/:sku', requireAuth, requireAdmin, async (req, res) => {
    const { sku } = req.params;
    const r = await Product.deleteOne({ sku });
    res.json({ ok: r.deletedCount === 1 });
  });

  app.get('/api/admin/orders', requireAuth, requireAdmin, async (_req, res) => {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    res.json(orders);
  });
  app.patch('/api/admin/orders/:id', requireAuth, requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body || {};
    const order = await Order.findByIdAndUpdate(id, { $set: { status } }, { new: true }).lean();
    if (!order) return res.status(404).json({ error: 'Not found' });
    res.json(order);
  });

  // Auth routes
  app.get('/auth/google', (req, res, next) => {
    if (!passport._strategies.google) return res.status(500).json({ error: 'Google auth not configured' });
    return passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
  });
  app.get('/auth/google/callback', (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user) => {
      if (err || !user) return res.redirect(`${CLIENT_ORIGIN}/auth/callback?error=google_failed`);
      const token = signToken(user);
      return res.redirect(`${CLIENT_ORIGIN}/auth/callback?token=${encodeURIComponent(token)}`);
    })(req, res, next);
  });

  app.get('/auth/facebook', (req, res, next) => {
    if (!passport._strategies.facebook) return res.status(500).json({ error: 'Facebook auth not configured' });
    return passport.authenticate('facebook', { scope: ['email'], session: false })(req, res, next);
  });
  app.get('/auth/facebook/callback', (req, res, next) => {
    passport.authenticate('facebook', { session: false }, (err, user) => {
      if (err || !user) return res.redirect(`${CLIENT_ORIGIN}/auth/callback?error=facebook_failed`);
      const token = signToken(user);
      return res.redirect(`${CLIENT_ORIGIN}/auth/callback?token=${encodeURIComponent(token)}`);
    })(req, res, next);
  });

  app.get('/auth/line', (req, res, next) => {
    if (!passport._strategies.line) return res.status(500).json({ error: 'LINE auth not configured' });
    return passport.authenticate('line', { session: false })(req, res, next);
  });
  app.get('/auth/line/callback', (req, res, next) => {
    passport.authenticate('line', { session: false }, (err, user) => {
      if (err || !user) return res.redirect(`${CLIENT_ORIGIN}/auth/callback?error=line_failed`);
      const token = signToken(user);
      return res.redirect(`${CLIENT_ORIGIN}/auth/callback?token=${encodeURIComponent(token)}`);
    })(req, res, next);
  });

  app.get('/auth/me', requireAuth, async (req, res) => {
    const user = await User.findById(req.user.sub).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({
      id: String(user._id),
      email: user.email,
      name: user.name,
      provider: user.provider,
      username: user.username || null,
      isAdmin: !!user.isAdmin,
      createdAt: user.createdAt,
    });
  });

  // File upload endpoint using Multer
  app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const relPath = path.relative(path.join(__dirname, '..'), req.file.path);
    res.json({
      ok: true,
      filename: req.file.filename,
      path: relPath.replace(/\\/g, '/'),
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  });

  // No GraphQL; all endpoints are REST

  // Support - User ticket APIs
  app.post('/api/support/tickets', requireAuth, async (req, res) => {
    const { subject, category = 'other', priority = 'normal', message, attachments = [] } = req.body || {};
    if (!subject || !message) return res.status(400).json({ error: 'subject and message required' });
    const ticket = await Ticket.create({
      user: req.user.sub,
      subject,
      category,
      priority,
      messages: [{ author: 'user', user: req.user.sub, text: message, attachments }],
    });
    res.status(201).json(ticket);
  });
  app.get('/api/support/tickets', requireAuth, async (req, res) => {
    const tickets = await Ticket.find({ user: req.user.sub }).sort({ updatedAt: -1 }).lean();
    res.json(tickets);
  });
  app.get('/api/support/tickets/:id', requireAuth, async (req, res) => {
    const ticket = await Ticket.findOne({ _id: req.params.id, user: req.user.sub }).lean();
    if (!ticket) return res.status(404).json({ error: 'Not found' });
    res.json(ticket);
  });
  app.post('/api/support/tickets/:id/messages', requireAuth, async (req, res) => {
    const { text, attachments = [] } = req.body || {};
    if (!text && (!attachments || attachments.length === 0)) return res.status(400).json({ error: 'text or attachments required' });
    const ticket = await Ticket.findOneAndUpdate(
      { _id: req.params.id, user: req.user.sub },
      { $push: { messages: { author: 'user', user: req.user.sub, text, attachments, createdAt: new Date() } }, $set: { status: 'pending' } },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ error: 'Not found' });
    res.json(ticket);
  });
  app.patch('/api/support/tickets/:id/close', requireAuth, async (req, res) => {
    const ticket = await Ticket.findOneAndUpdate({ _id: req.params.id, user: req.user.sub }, { $set: { status: 'closed' } }, { new: true }).lean();
    if (!ticket) return res.status(404).json({ error: 'Not found' });
    res.json(ticket);
  });

  // Support - Admin ticket APIs
  app.get('/api/admin/tickets', requireAuth, requireAdmin, async (req, res) => {
    const q = {};
    if (req.query.status) q.status = req.query.status;
    const tickets = await Ticket.find(q).sort({ updatedAt: -1 }).lean();
    res.json(tickets);
  });
  app.get('/api/admin/tickets/:id', requireAuth, requireAdmin, async (req, res) => {
    const ticket = await Ticket.findById(req.params.id).lean();
    if (!ticket) return res.status(404).json({ error: 'Not found' });
    res.json(ticket);
  });
  app.post('/api/admin/tickets/:id/messages', requireAuth, requireAdmin, async (req, res) => {
    const { text, attachments = [], status } = req.body || {};
    if (!text && (!attachments || attachments.length === 0)) return res.status(400).json({ error: 'text or attachments required' });
    const update = { $push: { messages: { author: 'admin', user: req.user.sub, text, attachments, createdAt: new Date() } } };
    if (status) update.$set = { status };
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, update, { new: true }).lean();
    if (!ticket) return res.status(404).json({ error: 'Not found' });
    res.json(ticket);
  });
  app.patch('/api/admin/tickets/:id', requireAuth, requireAdmin, async (req, res) => {
    const { status, priority, category } = req.body || {};
    const set = {};
    if (status) set.status = status;
    if (priority) set.priority = priority;
    if (category) set.category = category;
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, { $set: set }, { new: true }).lean();
    if (!ticket) return res.status(404).json({ error: 'Not found' });
    res.json(ticket);
  });

  // Cart APIs
  app.get('/api/cart', requireAuth, async (req, res) => {
    const cart = await Cart.findOne({ user: req.user.sub }).lean();
    res.json(cart || { user: req.user.sub, items: [] });
  });
  app.post('/api/cart', requireAuth, async (req, res) => {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    const cart = await Cart.findOneAndUpdate(
      { user: req.user.sub },
      { $set: { items } },
      { new: true, upsert: true }
    ).lean();
    res.json(cart);
  });

  // Order APIs
  app.get('/api/orders', requireAuth, async (req, res) => {
    const orders = await Order.find({ user: req.user.sub }).sort({ createdAt: -1 }).lean();
    res.json(orders);
  });
  app.post('/api/orders', requireAuth, async (req, res) => {
    const { items = [], total = 0 } = req.body || {};
    const order = await Order.create({ user: req.user.sub, items, total, status: 'PLACED' });
    res.status(201).json(order);
  });

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
    console.log(`Uploads endpoint at http://localhost:${PORT}/upload`);
    console.log(`Auth endpoints at http://localhost:${PORT}/auth/*`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
