# Aurelle & Co. — Jewelry, Watches & Leather Goods Store

A full e-commerce site: browsable storefront, cart, real Stripe checkout,
and a password-protected admin panel for managing products and viewing orders.

```
jewelry-store/
├── server/     Backend API (Node + Express). Handles products, orders, Stripe, admin auth.
└── client/     Frontend (React + Vite). The storefront and admin UI.
```

No database server to install — product/order data is stored in a JSON file
(`server/data/db.json`) using `lowdb`. This is fine for a store of this size;
it's a real file on disk, not in-memory, so nothing is lost on restart.

---

## 1. Run it locally first

You'll want to see it working on your own computer before deploying anywhere.

### Backend

```bash
cd server
npm install
cp .env.example .env
npm start
```

The backend runs at `http://localhost:4000`. The first time it starts, it
seeds 8 sample products so the site isn't empty.

### Frontend

In a **second terminal**:

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Open the URL it prints (usually `http://localhost:5173`). You should see the
full storefront with sample products.

### Set up your admin account

Go to `http://localhost:5173/admin`. The first visit prompts you to create
the admin username/password — this only happens once, and only works before
any admin account exists. After that, it's a normal login screen.

From the admin panel you can add, edit, and delete products — no code
editing required. Use this to replace the sample products with your real
inventory and photos (paste an image URL — see the photo note below).

---

## 2. Connect real Stripe payments

Right now, checkout will show "Stripe is not configured yet" — that's
expected until you do this step.

1. Create a free account at [stripe.com](https://stripe.com).
2. In the Stripe Dashboard, go to **Developers → API keys**. Copy the
   **Secret key** that starts with `sk_test_` (this is test mode — use this
   while building, switch to live keys only when you're ready to charge
   real cards).
3. Paste it into `server/.env` as `STRIPE_SECRET_KEY`.
4. Restart the backend (`npm start` again). Checkout will now work, and
   you can test full purchases using Stripe's test card number
   `4242 4242 4242 4242` with any future expiry date and any CVC.
5. **Before going live**, set up a webhook so payments are confirmed
   reliably (this matters — without it, orders won't reliably mark as
   paid). In the Stripe Dashboard: **Developers → Webhooks → Add endpoint**.
   - Endpoint URL: `https://your-deployed-backend-url.com/api/checkout/webhook`
   - Event to send: `checkout.session.completed`
   - Copy the **Signing secret** (starts with `whsec_`) into
     `STRIPE_WEBHOOK_SECRET` in your server's environment.
6. When you're ready to accept real money: in Stripe, finish **Activate
   your account** (business details, bank account for payouts), then
   swap your `sk_test_...` key for the live `sk_live_...` key.

---

## 3. Deploy it (so it's live on the internet)

Free tiers exist for everything below.

### Backend → Render (or Railway)

1. Push this project to a GitHub repo.
2. On [render.com](https://render.com), create a **New Web Service**,
   connect your repo, and set:
   - Root directory: `server`
   - Build command: `npm install`
   - Start command: `npm start`
3. Add environment variables in Render's dashboard (same as your `.env`):
   `JWT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `CLIENT_URL`
   (set this to your deployed frontend URL once you have it).
4. Deploy. Note the URL Render gives you (e.g. `https://your-app.onrender.com`).

**Important:** Render's free tier resets its filesystem on redeploy, which
would wipe `data/db.json`. For a free, persistent option, Render also offers
a free PostgreSQL-backed disk, or you can upgrade later — happy to help you
migrate from the JSON file to a real database if you outgrow this.

### Frontend → Vercel or Netlify

1. On [vercel.com](https://vercel.com), import the same GitHub repo.
2. Set root directory to `client`.
3. Add environment variable `VITE_API_URL` = your Render backend URL + `/api`
   (e.g. `https://your-app.onrender.com/api`).
4. Deploy. Vercel gives you a free URL like `your-store.vercel.app`.
5. Go back to your **backend's** environment variables and set `CLIENT_URL`
   to this Vercel URL, then redeploy the backend (needed for CORS and for
   Stripe's redirect-back-to-your-site to work).

### Custom domain (optional, ~$10–15/year)

Buy a domain (Namecheap, Google Domains, etc.) and point it at your Vercel
deployment — Vercel's dashboard has a guided "Add Domain" flow.

---

## Notes on photos

Right now products use an **image URL** — paste a link to a photo hosted
elsewhere (e.g. upload to [imgur.com](https://imgur.com) or a free Cloudinary
account, then paste the link into the admin form). Direct file upload from
your computer can be added later if you'd like — just ask.

## What's intentionally not included yet

- Customer accounts / order history for shoppers (currently guest checkout only)
- Shipping cost calculation (Stripe Checkout can be extended for this)
- Email receipts (Stripe can send these automatically — toggle in Stripe settings)
- Discount codes

All very doable additions once the core store is live — happy to build any
of these next.
