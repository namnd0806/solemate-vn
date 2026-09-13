# SoleMate VN

Website bán giày thể thao mô phỏng – Next.js 14 App Router + Supabase + Vercel.

## Tech Stack

- **Frontend + API:** Next.js 14 App Router (JavaScript)
- **Styling:** Tailwind CSS v4
- **Database:** Supabase (PostgreSQL)
- **Auth:** bcryptjs + JWT (jose) via HttpOnly cookies
- **Cart:** localStorage + React Context
- **Deploy:** Vercel

---

## Cấu trúc dự án

```
solemate-vn/
├── app/
│   ├── (store)/        # Storefront pages
│   ├── (admin)/        # Admin panel pages
│   └── api/            # API Routes
├── components/         # React components
├── contexts/           # CartContext
├── lib/                # DB layer, auth, utils
├── supabase/           # SQL files
└── __tests__/          # Property-based tests
```

---

## Hướng dẫn Deploy

### Bước 1 – Tạo Supabase Project

1. Vào [supabase.com](https://supabase.com) → New Project
2. Lấy **Project URL** và **Anon Key** từ Settings → API
3. Lấy **Service Role Key** từ Settings → API (giữ bí mật)

### Bước 2 – Deploy Database (2 cách)

#### Cách A: Dùng Supabase CLI (khuyến nghị — agent có thể làm tự động)

```bash
cd solemate-vn

# Login Supabase CLI
supabase login

# Link với project của bạn (lấy Project Ref từ Supabase Dashboard → Settings → General)
supabase link --project-ref YOUR_PROJECT_REF_ID

# Push toàn bộ migrations lên remote database
supabase db push

# Kiểm tra trạng thái
supabase migration list
```

Hoặc chạy script tự động (Windows):
```cmd
scripts\deploy-db.cmd
```

#### Cách B: Thủ công qua SQL Editor

Trong Supabase Dashboard → SQL Editor, chạy lần lượt:
1. Copy nội dung `supabase/migrations/20240101000000_initial_schema.sql` → Run
2. Copy nội dung `supabase/migrations/20240101000001_rpc_functions.sql` → Run
3. Copy nội dung `supabase/seed.sql` → Run

### Bước 3 – Deploy lên Vercel

1. Push code lên GitHub
2. Vào [vercel.com](https://vercel.com) → Import Project → chọn repo
3. Trong **Environment Variables**, thêm:

| Variable | Mô tả |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key (**server-only**) |
| `JWT_SECRET` | Secret key cho JWT (≥32 ký tự) |

> ⚠️ **Quan trọng:** `SUPABASE_SERVICE_ROLE_KEY` **KHÔNG** được đặt prefix `NEXT_PUBLIC_`. Key này chỉ dùng server-side.

4. Click **Deploy**

### Bước 4 – Kiểm tra

- Truy cập `/` → xem trang chủ có sản phẩm
- Truy cập `/admin/login` → đăng nhập với `admin@solemate.vn` / `Admin123!`
- Truy cập `/login` → đăng nhập với `nam@solemate.vn` / `Nam123!`

---

## Phát triển Local

```bash
# Clone và cài dependencies
cd solemate-vn
npm install

# Tạo .env.local (copy từ .env.local.example và điền thông tin thật)
cp .env.local.example .env.local

# Chạy dev server
npm run dev

# Chạy tests
npm run test
# hoặc
npx vitest --run
```

---

## Tài khoản mẫu (sau khi chạy seed.sql)

| Role | Email | Password |
|---|---|---|
| Admin | admin@solemate.vn | Admin123! |
| Customer | nam@solemate.vn | Nam123! |

---

## Lưu ý bảo mật

- Tất cả mutations database đi qua API Routes với Service Role Key
- Không có client-side database mutation
- Admin routes được bảo vệ bởi Edge Middleware (`middleware.js`)
- Passwords được hash bằng bcryptjs (cost factor 10)
- JWT tokens lưu trong HttpOnly cookies (không thể đọc từ JavaScript)
