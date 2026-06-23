import mongoose from 'mongoose';
import { mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create data directory for backwards compatibility
try {
  mkdirSync(path.join(__dirname, 'data'), { recursive: true });
} catch {}

// Connect to MongoDB
export async function initDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('MONGODB_URI not set — using in-memory fallback');
    return;
  }
  await mongoose.connect(uri);
  console.log('Connected to MongoDB Atlas');
}

// Product Schema
const productSchema = new mongoose.Schema({
  id: String,
  name: String,
  description: String,
  price: Number,
  category: String,
  image_url: String,
  image: String,
  stock: { type: Number, default: 0 },
  featured: Boolean,
  currency: String,
  createdAt: { type: Date, default: Date.now },
});

// Order Schema
const orderSchema = new mongoose.Schema({
  id: String,
  items: Array,
  total: Number,
  status: { type: String, default: 'pending' },
  customerEmail: String,
  customerName: String,
  safepayTracker: String,
  paidAt: Date,
  createdAt: { type: Date, default: Date.now },
});

// Customer Schema
const customerSchema = new mongoose.Schema({
  id: String,
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  createdAt: { type: Date, default: Date.now },
});

// Admin Schema
const adminSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  createdAt: { type: Date, default: Date.now },
});

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema);
export const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

// Compatibility layer for old LowDB-style code
export const db = {
  data: {
    products: [],
    orders: [],
    customers: [],
    admin: null,
  },
  read: async function() {
    this.data.products = await Product.find({}).lean();
    this.data.orders = await Order.find({}).lean();
    this.data.customers = await Customer.find({}).lean();
    const admin = await Admin.findOne({}).lean();
    this.data.admin = admin || null;
  },
  write: async function() {
    // writes are handled directly via mongoose models
  },
};

export function newId() {
  return new mongoose.Types.ObjectId().toString();
}
