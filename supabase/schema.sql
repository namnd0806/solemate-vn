-- =============================================================
-- SoleMate VN – Database Schema
-- PostgreSQL / Supabase
-- =============================================================
-- Tất cả monetary columns dùng INTEGER (VND không có số thập phân).
-- ID columns dùng TEXT để khớp với seed data ('P001', 'SMVN-1001').
-- =============================================================

-- =============================================================
-- SETTINGS (single row, enforced by CHECK)
-- =============================================================
CREATE TABLE settings (
  id                      SERIAL PRIMARY KEY,
  free_shipping_threshold INTEGER NOT NULL DEFAULT 499000,
  standard_shipping_fee   INTEGER NOT NULL DEFAULT 30000,
  express_shipping_fee    INTEGER NOT NULL DEFAULT 50000,
  low_stock_threshold     INTEGER NOT NULL DEFAULT 3,
  CHECK (id = 1)          -- only one row allowed
);

-- =============================================================
-- USERS
-- =============================================================
CREATE TABLE users (
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
CREATE INDEX idx_users_email ON users(email);

-- =============================================================
-- PRODUCTS
-- =============================================================
CREATE TABLE products (
  id          TEXT PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,
  brand       TEXT NOT NULL,
  name        TEXT NOT NULL,
  gender      TEXT NOT NULL CHECK (gender IN ('NAM','NỮ')),
  category    TEXT NOT NULL CHECK (category IN ('LIFESTYLE','RUNNING')),
  price       INTEGER NOT NULL CHECK (price > 0),
  sale_price  INTEGER CHECK (sale_price IS NULL OR sale_price < price),
  accent      TEXT NOT NULL DEFAULT '#171717',
  description TEXT,
  status      TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE')),
  featured    BOOLEAN NOT NULL DEFAULT FALSE,
  best_seller BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_brand  ON products(brand);
CREATE INDEX idx_products_gender ON products(gender);

-- =============================================================
-- VARIANTS (SKUs)
-- =============================================================
CREATE TABLE variants (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  sku        TEXT NOT NULL UNIQUE,
  color      TEXT NOT NULL,
  size       TEXT NOT NULL,
  stock      INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  status     TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE')),
  price      INTEGER,           -- NULL = inherit from product
  sale_price INTEGER,           -- NULL = inherit from product
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT variants_sale_price_check CHECK (sale_price IS NULL OR sale_price < price)
);
CREATE INDEX idx_variants_product_id ON variants(product_id);
CREATE INDEX idx_variants_sku        ON variants(sku);

-- =============================================================
-- ORDERS
-- =============================================================
CREATE TABLE orders (
  id              TEXT PRIMARY KEY,
  customer_id     TEXT REFERENCES users(id) ON DELETE SET NULL,
  guest           BOOLEAN NOT NULL DEFAULT FALSE,
  status          TEXT NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING','CONFIRMED','SHIPPING','DELIVERED','CANCELLED')),
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
  tracking        TEXT NOT NULL DEFAULT '',
  note            TEXT NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at    TIMESTAMPTZ,
  cancelled_at    TIMESTAMPTZ
);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status      ON orders(status);
CREATE INDEX idx_orders_created_at  ON orders(created_at DESC);

-- =============================================================
-- ORDER ITEMS (snapshot tại thời điểm đặt hàng)
-- =============================================================
CREATE TABLE order_items (
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
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- =============================================================
-- PROMOTIONS
-- =============================================================
CREATE TABLE promotions (
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
CREATE INDEX idx_promotions_code ON promotions(UPPER(code));

-- =============================================================
-- STOCK MOVEMENTS
-- =============================================================
CREATE TABLE stock_movements (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  sku          TEXT NOT NULL,
  product_id   TEXT NOT NULL,
  product_name TEXT NOT NULL,
  type         TEXT NOT NULL CHECK (type IN ('SALE','CANCEL_RETURN','ADJUST')),
  delta        INTEGER NOT NULL,
  before       INTEGER NOT NULL,
  after        INTEGER NOT NULL,
  ref          TEXT,           -- order_id hoặc null
  note         TEXT NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_movements_sku        ON stock_movements(sku);
CREATE INDEX idx_movements_created_at ON stock_movements(created_at DESC);

-- =============================================================
-- WISHLISTS
-- =============================================================
CREATE TABLE wishlists (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);
CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);
