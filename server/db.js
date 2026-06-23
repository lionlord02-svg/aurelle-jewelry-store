import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { nanoid } from 'nanoid';
import path from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
const file = path.join(dataDir, 'db.json');

mkdirSync(dataDir, { recursive: true });
const defaultData = {
  products: [],
  orders: [],
  admin: null, // { username, passwordHash }
};

const adapter = new JSONFile(file);
export const db = new Low(adapter, defaultData);

export async function initDb() {
  await db.read();
  db.data ||= structuredClone(defaultData);

  // Seed sample products only on first run (empty catalog)
  if (db.data.products.length === 0) {
    db.data.products = SAMPLE_PRODUCTS;
    await db.write();
  }
}

export function newId() {
  return nanoid(10);
}

// Sample/placeholder catalog so the store is fully browsable on day one.
// Replace these via the admin panel once you have real inventory.
export const SAMPLE_PRODUCTS = [
  {
    id: 'p_jewel_01',
    category: 'jewelry',
    name: 'Aria Drop Earrings',
    description: 'Delicate gold-plated drop earrings with a single freshwater pearl. Lightweight enough for all-day wear, elegant enough for evening.',
    price: 4800, // cents
    currency: 'usd',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
    stock: 12,
    featured: true,
  },
  {
    id: 'p_jewel_02',
    category: 'jewelry',
    name: 'Solene Layered Necklace',
    description: 'Three-layer chain necklace in warm gold vermeil, each strand a different weight for natural dimension.',
    price: 6200,
    currency: 'usd',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
    stock: 8,
    featured: true,
  },
  {
    id: 'p_watch_01',
    category: 'watches',
    name: 'Meridian Steel Watch — Women\'s',
    description: 'Minimalist 32mm case in brushed steel with a sunray dial and genuine leather strap.',
    price: 18900,
    currency: 'usd',
    image: 'https://images.unsplash.com/photo-1620625515032-6ed0c1790c75?w=800&q=80',
    stock: 5,
    featured: true,
  },
  {
    id: 'p_watch_02',
    category: 'watches',
    name: 'Foundry Chronograph — Men\'s',
    description: '42mm chronograph with a dark slate dial, sapphire crystal, and an interchangeable steel bracelet.',
    price: 24500,
    currency: 'usd',
    image: 'https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=800&q=80',
    stock: 6,
    featured: true,
  },
  {
    id: 'p_bag_01',
    category: 'bags',
    name: 'Etta Structured Tote',
    description: 'Full-grain leather tote with a structured base, magnetic close, and an interior zip pocket.',
    price: 21500,
    currency: 'usd',
    image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&q=80',
    stock: 7,
    featured: true,
  },
  {
    id: 'p_bag_02',
    category: 'bags',
    name: 'Noor Crossbody',
    description: 'Compact crossbody in pebbled leather with an adjustable brass-buckle strap.',
    price: 14800,
    currency: 'usd',
    image: 'https://images.unsplash.com/photo-1559563458-527698bf5295?w=800&q=80',
    stock: 10,
    featured: false,
  },
  {
    id: 'p_wallet_01',
    category: 'wallets',
    name: 'Hudson Bifold Wallet',
    description: 'Slim bifold in vegetable-tanned leather that develops a rich patina over time. Six card slots, one bill compartment.',
    price: 8900,
    currency: 'usd',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80',
    stock: 15,
    featured: true,
  },
  {
    id: 'p_wallet_02',
    category: 'wallets',
    name: 'Rourke Cardholder',
    description: 'Minimalist front-pocket cardholder in matte black leather with a center pull-tab.',
    price: 5400,
    currency: 'usd',
    image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80',
    stock: 20,
    featured: false,
  },
];
