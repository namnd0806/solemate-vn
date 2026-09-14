# Tài liệu Tổng quan Dự án — SoleMate VN

**Dự án:** SoleMate VN — Website bán giày thể thao  
**Phiên bản:** 2.0  
**Ngày:** Tháng 9/2026  
**Đối tượng:** Tester / QA  

---

## 1. Giới thiệu hệ thống

SoleMate VN là website thương mại điện tử bán giày thể thao, cho phép khách hàng duyệt, tìm kiếm và mua giày trực tuyến. Hệ thống gồm hai phần chính:

- **Cửa hàng (Storefront):** Giao diện dành cho khách hàng
- **Trang quản trị (Admin Panel):** Giao diện dành cho nhân viên/quản trị viên

---

## 2. URLs cần kiểm thử

| Môi trường | URL |
|---|---|
| Production (Live) | https://solemate-vn.vercel.app |
| Admin Panel | https://solemate-vn.vercel.app/admin/login |

---

## 3. Tài khoản kiểm thử

| Vai trò | Email | Mật khẩu | Quyền hạn |
|---|---|---|---|
| Admin | admin@solemate.vn | Admin123! | Toàn quyền quản trị |
| Customer | nam@solemate.vn | Nam123! | Mua hàng, xem đơn |
| Guest | *(không cần TK)* | — | Xem SP, mua hàng, tra cứu đơn |

---

## 4. Các module trong hệ thống

### 4.1 Storefront — Phía Khách hàng

| Module | Mô tả | URL |
|---|---|---|
| Trang chủ | Hiển thị sản phẩm nổi bật, bán chạy | `/` |
| Danh sách sản phẩm | Tìm kiếm, lọc, sắp xếp | `/products` |
| Danh mục | Lọc theo giới tính/loại | `/nam`, `/nu`, `/tre-em`, `/sale` |
| Chi tiết sản phẩm | Chọn màu, size, thêm vào giỏ | `/product/[slug]` |
| Giỏ hàng | Quản lý items trước thanh toán | `/cart` |
| Thanh toán | Nhập thông tin, chọn phương thức | `/checkout` |
| Xác nhận đơn hàng | Hiển thị sau khi đặt thành công | `/order-success` |
| Chi tiết đơn hàng | Xem thông tin đơn, hủy đơn | `/order/[id]` |
| Đăng nhập | Đăng nhập tài khoản | `/login` |
| Đăng ký | Tạo tài khoản mới | `/register` |
| Đơn hàng của tôi | Lịch sử mua hàng (đã đăng nhập) | `/account/orders` |
| Tra cứu đơn | Tìm đơn hàng không cần đăng nhập | `/track-order` |
| Yêu thích | Danh sách sản phẩm đã lưu | `/wishlist` |

### 4.2 Admin Panel — Phía Quản trị

| Module | Mô tả | URL |
|---|---|---|
| Đăng nhập Admin | Truy cập trang quản trị | `/admin/login` |
| Dashboard | Tổng quan doanh thu, đơn hàng | `/admin/dashboard` |
| Quản lý sản phẩm | Thêm/sửa/ẩn sản phẩm, upload ảnh | `/admin/products` |
| Quản lý kho | Điều chỉnh tồn kho, xem lịch sử | `/admin/inventory` |
| Quản lý đơn hàng | Xem, cập nhật trạng thái đơn | `/admin/orders` |
| Quản lý khuyến mãi | Tạo/sửa/xóa mã giảm giá | `/admin/promotions` |

---

## 5. Luồng nghiệp vụ chính

### Luồng mua hàng (Happy Path)
```
Khách vào trang chủ
  → Tìm/duyệt sản phẩm
  → Xem chi tiết, chọn màu + size
  → Thêm vào giỏ hàng
  → Vào giỏ hàng, kiểm tra
  → Tiến hành thanh toán
  → Điền thông tin giao hàng
  → (Tùy chọn) Nhập mã giảm giá
  → Chọn phương thức thanh toán
  → Đặt hàng
  → Xem trang xác nhận với mã đơn
```

### Luồng Admin xử lý đơn hàng
```
Admin đăng nhập
  → Vào Quản lý đơn hàng
  → Click vào đơn cần xử lý
  → Xem chi tiết đơn + thông tin khách
  → Xác nhận → Chuyển sang "Đang giao"
  → Nhập mã vận đơn
  → Chuyển sang "Đã giao"
```

### Trạng thái đơn hàng
```
PENDING (Chờ xác nhận)
  → CONFIRMED (Đã xác nhận)
    → SHIPPING (Đang giao)
      → DELIVERED (Đã giao)
  → CANCELLED (Đã hủy)  ← Chỉ hủy được từ PENDING hoặc CONFIRMED
```

---

## 6. Phương thức thanh toán (Mô phỏng)

| Phương thức | Mô tả | Ghi chú |
|---|---|---|
| COD | Tiền mặt khi nhận | Trạng thái ban đầu: UNPAID |
| BANK | Chuyển khoản ngân hàng | Mô phỏng, không kết nối thực |
| MOMO | Ví điện tử MoMo | Mô phỏng, không kết nối thực |

---

## 7. Phương thức vận chuyển

| Phương thức | Phí | Điều kiện |
|---|---|---|
| Tiêu chuẩn | 30.000₫ | Mặc định |
| Nhanh (Express) | 50.000₫ | Luôn tính phí |
| Miễn phí | 0₫ | Đơn hàng (sau giảm giá) ≥ 499.000₫, chỉ áp dụng Tiêu chuẩn |

---

## 8. Dữ liệu sản phẩm có sẵn

Hệ thống có **15 sản phẩm** từ 5 thương hiệu:

| Thương hiệu | Số sản phẩm | Ghi chú |
|---|---|---|
| NIKE | 4 | 2 Nam, 1 Trẻ em, ... |
| ADIDAS | 4 | 1 Inactive (Superstar Kids) |
| NEW BALANCE | 3 | |
| ASICS | 3 | |
| CONVERSE | 2 | |

Mỗi sản phẩm có nhiều **biến thể (variants)** phân theo màu và size với tồn kho riêng biệt.
