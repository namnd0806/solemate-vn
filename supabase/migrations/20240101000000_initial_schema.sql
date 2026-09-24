-- Migration: Initial Schema
-- SoleMate VN – tạo toàn bộ bảng và indexes

-- =============================================================
-- SETTINGS
-- =============================================================
CREATE TABLE IF NOT EXISTS settings (
  id                      SERIAL PRIMARY KEY,
  free_shipping_threshold INTEGER NOT NULL DEFAULT 499000,
  standard_shipping_fee   INTEGER NOT NULL DEFAULT 30000,
  express_shipping_fee    INTEGER NOT NULL DEFAULT 50000,
  low_stock_threshold     INTEGER NOT NULL DEFAULT 3,
  CHECK (id = 1)
);

-- =============================================================
-- USERS
-- =============================================================
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  role          TEXT NOT NULL CHECK (role IN ('CUSTOMER','ADMIN')),
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  phone         TEXT,
  password_hash TEXT NOT NULL,
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- =============================================================
-- PRODUCTS
-- =============================================================
CREATE TABLE IF NOT EXISTS products (
  id          TEXT PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,
  brand       TEXT NOT NULL,
  name        TEXT NOT NULL,
  gender      TEXT NOT NULL CHECK (gender IN ('NAM','NỮ')),
  category    TEXT NOT NULL CHECK (category IN ('LIFESTYLE','RUNNING')),
  price       INTEGER NOT NULL CHECK (price > 0),
  sale_price  INTEGER CHECK (sale_price IS NULL OR sale_price < price),
  sale_start_at TIMESTAMPTZ,
  sale_end_at   TIMESTAMPTZ,
  accent      TEXT NOT NULL DEFAULT '#171717',
  description TEXT,
  status      TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE')),
  featured    BOOLEAN NOT NULL DEFAULT FALSE,
  best_seller BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT products_sale_dates_check CHECK (sale_end_at IS NULL OR sale_start_at IS NULL OR sale_end_at > sale_start_at)
);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_brand  ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_gender ON products(gender);

-- =============================================================
-- VARIANTS
-- =============================================================
CREATE TABLE IF NOT EXISTS variants (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  sku        TEXT NOT NULL UNIQUE,
  color      TEXT NOT NULL,
  size       TEXT NOT NULL,
  stock      INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  status     TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE')),
  price      INTEGER,
  sale_price INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT variants_sale_price_check CHECK (sale_price IS NULL OR sale_price < price)
);
CREATE INDEX IF NOT EXISTS idx_variants_product_id ON variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_sku        ON variants(sku);

-- =============================================================
-- ORDERS
-- =============================================================
CREATE TABLE IF NOT EXISTS orders (
  id              TEXT PRIMARY KEY,
  customer_id     TEXT REFERENCES users(id) ON DELETE SET NULL,
  guest           BOOLEAN NOT NULL DEFAULT FALSE,
  status          TEXT NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING','CONFIRMED','PACKING','SHIPPING','DELIVERED','CANCELLED')),
  payment_method  TEXT NOT NULL CHECK (payment_method IN ('COD','BANK','VISA','MOMO')),
  payment_status  TEXT NOT NULL DEFAULT 'UNPAID'
                    CHECK (payment_status IN ('UNPAID','PENDING','PAID','REFUND_PENDING')),
  shipping_method TEXT NOT NULL DEFAULT 'STANDARD' CHECK (shipping_method IN ('STANDARD','EXPRESS')),
  subtotal        INTEGER NOT NULL CHECK (subtotal >= 0),
  discount        INTEGER NOT NULL DEFAULT 0 CHECK (discount >= 0),
  shipping_fee    INTEGER NOT NULL DEFAULT 0 CHECK (shipping_fee >= 0),
  total           INTEGER NOT NULL CHECK (total >= 0),
  promo_code      TEXT,
  stock_restored  BOOLEAN NOT NULL DEFAULT FALSE,
  contact         JSONB NOT NULL,
  shipping_carrier TEXT NOT NULL DEFAULT '',
  tracking        TEXT NOT NULL DEFAULT '',
  note            TEXT NOT NULL DEFAULT '',
  internal_note   TEXT NOT NULL DEFAULT '',
  cancel_reason   TEXT NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at    TIMESTAMPTZ,
  cancelled_at    TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status      ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at  ON orders(created_at DESC);

CREATE TABLE IF NOT EXISTS order_events (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  order_id    TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  actor       TEXT NOT NULL DEFAULT 'SYSTEM',
  event_type  TEXT NOT NULL,
  from_status TEXT,
  to_status   TEXT,
  note        TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_order_events_order_id ON order_events(order_id);

ALTER TABLE order_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE order_events FROM anon, authenticated;

-- =============================================================
-- ORDER ITEMS
-- =============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  order_id    TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  TEXT NOT NULL,
  slug        TEXT NOT NULL,
  name        TEXT NOT NULL,
  brand       TEXT NOT NULL,
  sku         TEXT NOT NULL,
  color       TEXT NOT NULL,
  size        TEXT NOT NULL,
  qty         INTEGER NOT NULL CHECK (qty > 0),
  unit_price  INTEGER NOT NULL CHECK (unit_price > 0),
  line_total  INTEGER NOT NULL CHECK (line_total > 0)
);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- =============================================================
-- PROMOTIONS
-- =============================================================
CREATE TABLE IF NOT EXISTS promotions (
  id           TEXT PRIMARY KEY,
  code         TEXT NOT NULL UNIQUE,
  name         TEXT NOT NULL,
  type         TEXT NOT NULL CHECK (type IN ('PERCENT','FIXED')),
  value        INTEGER NOT NULL CHECK (value > 0),
  max_discount INTEGER,
  min_spend    INTEGER NOT NULL DEFAULT 0,
  start_at     TIMESTAMPTZ NOT NULL,
  end_at       TIMESTAMPTZ NOT NULL,
  usage_limit  INTEGER NOT NULL DEFAULT 999999,
  usage_count  INTEGER NOT NULL DEFAULT 0,
  enabled      BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT promotions_dates_check CHECK (end_at > start_at),
  CONSTRAINT promotions_usage_check CHECK (usage_limit >= usage_count)
);
CREATE INDEX IF NOT EXISTS idx_promotions_code ON promotions(UPPER(code));

-- =============================================================
-- STOCK MOVEMENTS
-- =============================================================
CREATE TABLE IF NOT EXISTS stock_movements (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  sku          TEXT NOT NULL,
  product_id   TEXT NOT NULL,
  product_name TEXT NOT NULL,
  type         TEXT NOT NULL CHECK (type IN ('SALE','CANCEL_RETURN','ADJUST')),
  delta        INTEGER NOT NULL,
  before       INTEGER NOT NULL,
  after        INTEGER NOT NULL,
  ref          TEXT,
  note         TEXT NOT NULL DEFAULT '',
  actor        TEXT NOT NULL DEFAULT 'SYSTEM',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_movements_sku        ON stock_movements(sku);
CREATE INDEX IF NOT EXISTS idx_movements_created_at ON stock_movements(created_at DESC);

-- =============================================================
-- WISHLISTS
-- =============================================================
CREATE TABLE IF NOT EXISTS wishlists (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product_id ON wishlists(product_id);
