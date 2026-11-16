-- Stripe Connect: additive migration. Nothing is dropped, renamed or rewritten
-- except one INSERT policy on listings (see section 4). Safe to run once.
-- Reuses update_updated_at_column() from the original schema.

-- 1. Listing status ----------------------------------------------------------
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'available';

ALTER TABLE listings
  ADD CONSTRAINT listings_status_check CHECK (status IN ('available', 'sold'));

CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);

-- 2. Seller accounts (one Stripe connected account per seller email) ---------
CREATE TABLE IF NOT EXISTS seller_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_email VARCHAR(255) NOT NULL,
  stripe_account_id TEXT NOT NULL UNIQUE,
  details_submitted BOOLEAN NOT NULL DEFAULT FALSE,
  charges_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  payouts_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- One account per email, case-insensitive.
CREATE UNIQUE INDEX IF NOT EXISTS seller_accounts_email_key
  ON seller_accounts (lower(seller_email));

-- 3. Orders ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE RESTRICT,
  seller_email VARCHAR(255) NOT NULL,
  buyer_email VARCHAR(255),
  stripe_account_id TEXT NOT NULL,
  stripe_checkout_session_id TEXT NOT NULL UNIQUE,   -- no duplicate orders per session
  stripe_payment_intent_id TEXT,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  application_fee_cents INTEGER NOT NULL CHECK (application_fee_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'expired', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_listing_id ON orders(listing_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- A listing can be paid for at most once, enforced by the database itself.
CREATE UNIQUE INDEX IF NOT EXISTS orders_one_paid_per_listing
  ON orders(listing_id) WHERE status = 'paid';

-- 4. Row Level Security ------------------------------------------------------
-- seller_accounts and orders hold Stripe IDs and buyer emails. RLS is enabled
-- with NO policies, so the public (anon) key can neither read nor write them.
-- Only server code using the service role key can touch these tables.
ALTER TABLE seller_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- The public may still create listings, but only as 'available', so nobody can
-- post a listing that is already marked sold. Everything else is unchanged.
DROP POLICY IF EXISTS "Anyone can create listings" ON listings;
CREATE POLICY "Anyone can create listings" ON listings
  FOR INSERT WITH CHECK (status = 'available');

-- 5. updated_at triggers -----------------------------------------------------
CREATE TRIGGER update_seller_accounts_updated_at BEFORE UPDATE ON seller_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
