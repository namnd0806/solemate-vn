# SoleMate VN — Tổng quan dự án

**Phiên bản:** 2.0.0  
**Ngày cập nhật:** Tháng 9/2026  
**Trạng thái:** Production

---

## 1. Giới thiệu

SoleMate VN là website bán giày thể thao trực tuyến, được xây dựng nhằm mục đích học tập và thực hành phát triển web fullstack hiện đại. Dự án mô phỏng đầy đủ một hệ thống thương mại điện tử thực tế với:

- **Storefront** cho khách hàng duyệt và mua sản phẩm
- **Admin Panel** cho quản trị viên quản lý toàn bộ hệ thống
- **Database thực** trên Supabase (không phải mock/localStorage)
- **Deploy thực** trên Vercel với domain công khai

---

## 2. Mục tiêu dự án

| Mục tiêu | Mô tả |
|---|---|
| Học fullstack | Thực hành Next.js App Router, Server Components, API Routes |
| Database thực | Làm việc với PostgreSQL qua Supabase |
| Authentication | Triển khai auth với bcrypt + JWT + HttpOnly cookies |
| Production mindset | Deploy, env vars, security, migrations |
| Clean architecture | Tách biệt UI, business logic, data layer |

---

## 3. Links

| | URL |
|---|---|
| 🌐 Live site | https://solemate-vn.vercel.app |
| 🔧 Admin panel | https://solemate-vn.vercel.app/admin/login |
| 📦 GitHub repo | https://github.com/namnd0806/solemate-vn |
| 🗄️ Supabase | https://supabase.com/dashboard/project/whywiogsaetjkixvreus |

---

## 4. Tài khoản demo

| Role | Email | Password |
|---|---|---|
| 👑 Admin | admin@solemate.vn | Admin123! |
| 👤 Customer | nam@solemate.vn | Nam123! |

---

## 5. Tech Stack tóm tắt

```
Frontend:  Next.js 16 App Router (JavaScript) + Tailwind CSS v4
Backend:   Next.js API Routes (serverless)
Database:  Supabase PostgreSQL
Auth:      bcryptjs + JWT (jose) via HttpOnly Cookies
Storage:   Supabase Storage (ảnh sản phẩm)
Deploy:    Vercel (Singapore region)
Testing:   Vitest + fast-check (property-based testing)
```

---

## 6. Danh sách tài liệu

| File | Nội dung |
|---|---|
| [01-business-analysis.md](./01-business-analysis.md) | Phân tích nghiệp vụ, user stories, business rules |
| [02-tech-spec.md](./02-tech-spec.md) | Technical specification, architecture, luồng xử lý |
| [03-database-design.md](./03-database-design.md) | Schema database, quan hệ, RPC functions |
| [04-api-reference.md](./04-api-reference.md) | Tài liệu API đầy đủ với request/response examples |
| [05-setup-guide.md](./05-setup-guide.md) | Hướng dẫn cài đặt local và deploy production |

---

## 7. Phạm vi tính năng

### Storefront (Khách hàng)
- ✅ Trang chủ với sản phẩm nổi bật và bán chạy
- ✅ Danh sách sản phẩm có filter, search, sort, pagination
- ✅ Chi tiết sản phẩm với chọn màu/size, kiểm tra tồn kho
- ✅ Giỏ hàng (localStorage, guest checkout)
- ✅ Thanh toán với mã giảm giá, tính phí ship
- ✅ Trang xác nhận đặt hàng
- ✅ Đăng ký / Đăng nhập tài khoản
- ✅ Xem lịch sử đơn hàng (đã đăng nhập)
- ✅ Tra cứu đơn hàng (khách vãng lai)
- ✅ Danh sách yêu thích
- ✅ Hủy đơn hàng (PENDING/CONFIRMED)

### Admin Panel
- ✅ Dashboard: doanh thu, đơn chờ, tồn kho thấp, biểu đồ 7 ngày
- ✅ Quản lý sản phẩm: CRUD đầy đủ, upload ảnh, quản lý variants
- ✅ Quản lý đơn hàng: xem, chuyển trạng thái, lưu tracking, hủy đơn
- ✅ Quản lý kho: điều chỉnh thủ công, lịch sử biến động
- ✅ Quản lý khuyến mãi: CRUD, toggle bật/tắt, theo dõi usage

---

## 8. Giới hạn (scope)

Các tính năng **không** có trong phiên bản này:
- ❌ Thanh toán thực (VNPAY, MoMo API) — chỉ mô phỏng
- ❌ Gửi email thông báo đơn hàng
- ❌ Real-time notifications (Websocket)
- ❌ Tìm kiếm nâng cao (Elasticsearch)
- ❌ Multi-language (chỉ tiếng Việt)
