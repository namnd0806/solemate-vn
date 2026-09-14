# SoleMate VN

Website bán giày thể thao — Next.js 16 App Router + Supabase PostgreSQL + Vercel.

🌐 **Live:** https://solemate-vn.vercel.app  
📦 **Repo:** https://github.com/namnd0806/solemate-vn

---

## Tech Stack

| Layer | Công nghệ |
|---|---|
| Frontend + API | Next.js 16 App Router (JavaScript) |
| Styling | Tailwind CSS v4 |
| Database | Supabase (PostgreSQL) |
| Auth | bcryptjs + JWT via `jose` (HttpOnly cookies) |
| File Storage | Supabase Storage |
| Cart | localStorage + React Context |
| Deploy | Vercel (region: Singapore) |

---

## Tài khoản mẫu

| Role | Email | Password |
|---|---|---|
| Admin | admin@solemate.vn | Admin123! |
| Customer | nam@solemate.vn | Nam123! |

---

## Cài đặt & Chạy local

```bash
# 1. Clone repo
git clone https://github.com/namnd0806/solemate-vn.git
cd solemate-vn

# 2. Cài dependencies
npm install

# 3. Tạo .env.local
cp .env.local.example .env.local
# Điền credentials Supabase vào .env.local

# 4. Chạy dev server
npm run dev
# → http://localhost:3000
```

### Biến môi trường

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...   # Không có prefix NEXT_PUBLIC_
JWT_SECRET=your-secret-32-chars-min
```

---

## Deploy Database

```bash
# Login Supabase CLI (1 lần)
supabase login

# Link với project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push --db-url "postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres"
```

Hoặc chạy thủ công trong Supabase SQL Editor theo thứ tự:
1. `supabase/migrations/20240101000000_initial_schema.sql`
2. `supabase/migrations/20240101000001_rpc_functions.sql`
3. `supabase/migrations/20240102000000_add_image_url.sql`
4. `supabase/seed.sql`

---

## Cấu trúc dự án

```
solemate-vn/
├── app/
│   ├── (store)/              # Storefront — tất cả trang khách hàng
│   │   ├── layout.js         # CartProvider + Header + Footer
│   │   ├── page.js           # Trang chủ (featured + best sellers)
│   │   ├── products/         # PLP — danh sách sản phẩm
│   │   ├── product/[slug]/   # PDP — chi tiết sản phẩm
│   │   ├── [category]/       # Category pages (nam, nu, sale...)
│   │   ├── cart/             # Giỏ hàng
│   │   ├── checkout/         # Thanh toán
│   │   ├── order-success/    # Trang xác nhận đặt hàng thành công
│   │   ├── order/[id]/       # Chi tiết đơn hàng
│   │   ├── login/            # Đăng nhập
│   │   ├── register/         # Đăng ký
│   │   ├── account/orders/   # Đơn hàng của tôi
│   │   ├── track-order/      # Tra cứu đơn (guest)
│   │   └── wishlist/         # Yêu thích
│   ├── (admin)/              # Admin panel — bảo vệ bởi layout
│   │   ├── layout.js         # Auth guard + sidebar
│   │   └── admin/
│   │       ├── dashboard/
│   │       ├── products/
│   │       ├── inventory/
│   │       ├── orders/
│   │       └── promotions/
│   ├── admin/login/          # Trang đăng nhập admin (ngoài layout)
│   └── api/                  # API Routes
│       ├── auth/             # login, register, logout, admin/login
│       ├── products/         # CRUD + upload ảnh
│       ├── orders/           # Tạo, xem, hủy, tra cứu
│       ├── promotions/       # CRUD + validate
│       ├── stock/            # Điều chỉnh kho + lịch sử
│       └── wishlist/         # Thêm/xóa yêu thích
├── components/
│   ├── store/                # Header, Footer, ProductCard, Toast...
│   └── admin/                # AdminHeader, StockAdjustModal
├── contexts/
│   └── CartContext.js        # Giỏ hàng (localStorage)
├── lib/
│   ├── auth.js               # JWT helpers
│   ├── utils.js              # formatVND, validatePhone...
│   ├── supabase/             # Browser + Server clients
│   └── db/                   # Database layer
│       ├── users.js
│       ├── products.js
│       ├── orders.js
│       ├── promotions.js
│       ├── stock.js
│       └── wishlist.js
├── supabase/
│   ├── migrations/           # SQL migrations
│   ├── schema.sql            # Full schema (reference)
│   ├── functions.sql         # RPC functions (reference)
│   └── seed.sql              # Dữ liệu mẫu
└── __tests__/property/       # Property-based tests (fast-check)
```

---

## Database Schema

### Bảng chính

```
settings          — Cấu hình hệ thống (phí ship, ngưỡng miễn phí ship)
users             — Tài khoản (CUSTOMER / ADMIN), bcrypt password
products          — Sản phẩm, có image_url cho ảnh
variants          — SKU cụ thể (màu + size + tồn kho)
orders            — Đơn hàng, lưu contact dạng JSONB
order_items       — Snapshot sản phẩm tại thời điểm đặt
promotions        — Mã giảm giá (PERCENT / FIXED)
stock_movements   — Lịch sử biến động kho (SALE / CANCEL_RETURN / ADJUST)
wishlists         — Sản phẩm yêu thích của customer
```

### Quan hệ

```
users ─────────── orders (customer_id, nullable — guest orders allowed)
products ──────── variants (product_id)
orders ─────────── order_items (order_id)
users ─────────── wishlists (user_id)
products ──────── wishlists (product_id)
```

### RPC Functions (PostgreSQL — chạy trong 1 transaction)

**`create_order(payload JSONB)`**
- Validate stock từng variant (FOR UPDATE lock)
- Validate + tính discount từ promotion code
- Tính phí ship (EXPRESS / STANDARD / miễn phí nếu đủ ngưỡng)
- INSERT order + order_items
- UPDATE variants stock (trừ)
- INSERT SALE stock_movements
- UPDATE promotions usage_count

**`cancel_order(p_order_id TEXT)`**
- Idempotent: kiểm tra `stock_restored` flag trước
- Chỉ hủy được PENDING hoặc CONFIRMED
- Restore stock từng item
- INSERT CANCEL_RETURN stock_movements
- SET status = CANCELLED, stock_restored = TRUE

---

## Luồng chức năng

### 1. Đăng ký / Đăng nhập (Customer)

```
POST /api/auth/register
  → Validate email unique, password >= 6 ký tự
  → bcrypt.hash(password, 10)
  → INSERT users
  → Set cookie: smvn_customer_token (JWT, 7 ngày, HttpOnly, path=/)

POST /api/auth/login
  → SELECT user WHERE email
  → bcrypt.compare(password, hash)
  → Set cookie: smvn_customer_token
```

### 2. Duyệt sản phẩm

```
Trang chủ (/)
  → getProducts({ featured: true }) + getProducts({ bestSeller: true })
  → Server-side fetch, render ProductCard grid

PLP (/products?q=...&sort=...&page=...)
  → getProducts({ search, sort, page, limit=12 })
  → Pagination + filter

PDP (/product/[slug])
  → getProductBySlug(slug)
  → Client-side: chọn màu → lọc size → kiểm tra stock
  → Disable "Thêm vào giỏ" nếu stock = 0
```

### 3. Giỏ hàng

```
CartContext (localStorage key: smvn_cart)
  addItem({ productId, sku, qty })
    → Fetch /api/products/[id] kiểm tra variant ACTIVE + stock
    → Lưu vào localStorage
  
  updateQty(sku, newQty)
    → Re-validate stock
  
  clearCart()
    → Xóa state + localStorage
```

### 4. Checkout → Đặt hàng

```
/checkout (Client Component)
  1. Validate contact fields (họ tên, SĐT VN, địa chỉ đầy đủ)
  2. (Optional) validatePromo → hiển thị discount
  3. Submit → POST /api/orders
     → Gọi Supabase RPC create_order(payload)
     → Tất cả trong 1 transaction: validate stock, tạo order, trừ kho
  4. Thành công → clearCart() → redirect /order-success?id=SMVN-xxx
  5. Thất bại → hiển thị Toast lỗi, giỏ hàng không thay đổi
```

### 5. Admin — Sản phẩm

```
GET  /api/products?status=ALL          → Danh sách tất cả (kể cả INACTIVE)
POST /api/products                     → Tạo sản phẩm mới + variants
PUT  /api/products/[id]                → Cập nhật sản phẩm + variants
PATCH /api/products/[id] {status}      → Toggle ACTIVE/INACTIVE

POST /api/products/upload              → Upload ảnh → Supabase Storage
  → Trả về publicUrl → lưu vào products.image_url
```

### 6. Admin — Đơn hàng

```
GET /api/orders                        → Danh sách tất cả
GET /api/orders/[id]                   → Chi tiết
PATCH /api/orders/[id] {status}        → Chuyển trạng thái
  Allowed transitions:
    PENDING → CONFIRMED | CANCELLED
    CONFIRMED → SHIPPING | CANCELLED
    SHIPPING → DELIVERED
POST /api/orders/[id]/cancel           → Hủy (gọi RPC cancel_order)
```

### 7. Admin — Khuyến mãi

```
GET    /api/promotions                 → Danh sách
POST   /api/promotions                 → Tạo mới (check code unique case-insensitive)
PUT    /api/promotions/[id]            → Cập nhật
PATCH  /api/promotions/[id] {enabled}  → Toggle bật/tắt
DELETE /api/promotions/[id]            → Xóa (nếu usage_count=0) hoặc tắt

POST /api/promotions/validate {code, subtotal}
  → Kiểm tra: tồn tại, enabled, ngày hiệu lực, usage_limit, min_spend
  → Tính discount → trả về discount amount
```

### 8. Kho hàng

```
POST /api/stock/adjust {sku, delta, note}
  → Validate delta là integer !== 0
  → Validate stock + delta >= 0
  → UPDATE variants.stock + INSERT ADJUST stock_movement (1 transaction)

GET /api/stock/movements → Lịch sử biến động (SALE / CANCEL_RETURN / ADJUST)
```

---

## Auth Flow

```
Admin cookie:    smvn_admin_token  (JWT 24h, HttpOnly, path=/, sameSite=lax)
Customer cookie: smvn_customer_token (JWT 7d, HttpOnly, path=/, sameSite=lax)

Admin layout (app/(admin)/layout.js):
  → Đọc cookie server-side qua next/headers
  → verifyJwt → nếu không hợp lệ → redirect('/admin/login')
  → Trang /admin/login nằm NGOÀI (admin) layout để tránh redirect loop

API routes kiểm tra auth:
  → getAdminFromRequest(req) hoặc getCustomerFromRequest(req)
  → Đọc từ request.cookies → fallback cookies() từ next/headers
```

---

## Scripts

```bash
npm run dev          # Dev server
npm run build        # Production build
npm run test         # Chạy property tests (vitest --run)
npm run db:push      # Push migrations lên Supabase
npm run db:status    # Xem trạng thái migrations
```

---

## API Routes tổng hợp

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| POST | `/api/auth/register` | — | Đăng ký customer |
| POST | `/api/auth/login` | — | Đăng nhập customer |
| POST | `/api/auth/logout` | Customer | Đăng xuất |
| POST | `/api/auth/admin/login` | — | Đăng nhập admin |
| POST | `/api/auth/admin/logout` | Admin | Đăng xuất admin |
| GET | `/api/products` | — | Danh sách sản phẩm |
| POST | `/api/products` | Admin | Tạo sản phẩm |
| GET | `/api/products/[id]` | — | Chi tiết sản phẩm |
| PUT | `/api/products/[id]` | Admin | Cập nhật sản phẩm |
| PATCH | `/api/products/[id]` | Admin | Toggle status |
| POST | `/api/products/upload` | Admin | Upload ảnh |
| GET | `/api/orders` | Admin | Tất cả đơn hàng |
| POST | `/api/orders` | — | Tạo đơn hàng |
| GET | `/api/orders/[id]` | — / Customer / Admin | Chi tiết đơn |
| PATCH | `/api/orders/[id]` | Admin | Cập nhật status/tracking |
| POST | `/api/orders/[id]/cancel` | Customer / Admin | Hủy đơn |
| POST | `/api/orders/lookup` | — | Tra cứu đơn (guest) |
| GET | `/api/promotions` | Admin | Danh sách mã KM |
| POST | `/api/promotions` | Admin | Tạo mã KM |
| PUT | `/api/promotions/[id]` | Admin | Cập nhật mã |
| PATCH | `/api/promotions/[id]` | Admin | Toggle enabled |
| DELETE | `/api/promotions/[id]` | Admin | Xóa/tắt mã |
| POST | `/api/promotions/validate` | — | Kiểm tra mã tại checkout |
| POST | `/api/stock/adjust` | Admin | Điều chỉnh kho |
| GET | `/api/stock/movements` | Admin | Lịch sử kho |
| GET | `/api/wishlist` | Customer | Danh sách yêu thích |
| POST | `/api/wishlist` | Customer | Toggle yêu thích |

---

## Bảo mật

- Tất cả mutations database đi qua API Routes với Service Role Key
- Không có client-side database mutation
- `SUPABASE_SERVICE_ROLE_KEY` chỉ tồn tại server-side (không có prefix `NEXT_PUBLIC_`)
- JWT stored trong HttpOnly cookies — không thể đọc từ JavaScript
- Passwords hash bằng bcryptjs cost factor 10
- Admin routes được bảo vệ tại layout server-side

---

## Property-Based Tests

28 properties được test với `fast-check` + `vitest`:

```bash
npm run test
# hoặc: npx vitest --run __tests__/property
```

Covers: search/sort invariants, cart validation, promotion math, order state machine, stock non-negativity, auth security, dashboard revenue calculation.
