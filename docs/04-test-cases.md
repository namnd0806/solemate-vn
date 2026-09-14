# Test Cases Chi tiết — SoleMate VN

**Phiên bản:** 1.0  
**Ngày:** Tháng 9/2026  

**Hướng dẫn đọc bảng:**
- **ID:** Mã test case
- **Pre-condition:** Điều kiện cần có trước khi test
- **Steps:** Các bước thực hiện
- **Expected:** Kết quả mong đợi
- **Status:** Pass ✅ / Fail ❌ / Blocked ⚠️ / Not Run ⬜

---

## TC-01: Đăng ký tài khoản

### TC-01-001: Đăng ký thành công

| Hạng mục | Nội dung |
|---|---|
| **Pre-condition** | Chưa đăng nhập, email chưa tồn tại |
| **URL** | `/register` |
| **Steps** | 1. Nhập Họ: "Trần" <br>2. Nhập Tên: "Thị B" <br>3. Nhập Email: "testb@gmail.com" <br>4. Nhập SĐT: "0912999888" <br>5. Nhập Mật khẩu: "Test123!" <br>6. Xác nhận mật khẩu: "Test123!" <br>7. Click "Đăng ký" |
| **Expected** | Tạo tài khoản thành công, redirect về trang chủ, header hiển thị tên "Thị B" |
| **Status** | ⬜ |

### TC-01-002: Đăng ký email đã tồn tại

| Hạng mục | Nội dung |
|---|---|
| **Pre-condition** | Email "nam@solemate.vn" đã tồn tại trong hệ thống |
| **Steps** | 1. Điền email "nam@solemate.vn" <br>2. Điền các trường còn lại hợp lệ <br>3. Click "Đăng ký" |
| **Expected** | Hiển thị lỗi "Email đã được đăng ký." — không tạo tài khoản |
| **Status** | ⬜ |

### TC-01-003: Mật khẩu quá ngắn

| Hạng mục | Nội dung |
|---|---|
| **Steps** | 1. Điền email mới hợp lệ <br>2. Nhập mật khẩu "12345" (5 ký tự) <br>3. Click "Đăng ký" |
| **Expected** | Lỗi "Mật khẩu phải có ít nhất 6 ký tự." |
| **Status** | ⬜ |

### TC-01-004: Mật khẩu xác nhận không khớp

| Hạng mục | Nội dung |
|---|---|
| **Steps** | 1. Nhập mật khẩu "Test123!" <br>2. Nhập xác nhận "Test456!" <br>3. Click "Đăng ký" |
| **Expected** | Lỗi "Mật khẩu xác nhận không khớp." |
| **Status** | ⬜ |

---

## TC-02: Đăng nhập

### TC-02-001: Đăng nhập thành công (Customer)

| Hạng mục | Nội dung |
|---|---|
| **Pre-condition** | Chưa đăng nhập |
| **URL** | `/login` |
| **Steps** | 1. Nhập email: "nam@solemate.vn" <br>2. Nhập mật khẩu: "Nam123!" <br>3. Click "Đăng nhập" |
| **Expected** | Redirect về trang chủ, header hiển thị "👤 Nam" |
| **Status** | ⬜ |

### TC-02-002: Sai mật khẩu

| Hạng mục | Nội dung |
|---|---|
| **Steps** | 1. Email đúng: "nam@solemate.vn" <br>2. Mật khẩu sai: "WrongPassword" <br>3. Click "Đăng nhập" |
| **Expected** | Lỗi "Email hoặc mật khẩu không đúng." — ở lại trang login |
| **Status** | ⬜ |

### TC-02-003: Email không tồn tại

| Hạng mục | Nội dung |
|---|---|
| **Steps** | 1. Email: "notexist@gmail.com" <br>2. Mật khẩu: "anypassword" |
| **Expected** | Lỗi "Email hoặc mật khẩu không đúng." (không nói email không tồn tại) |
| **Status** | ⬜ |

---

## TC-03: Sản phẩm

### TC-03-001: Tìm kiếm sản phẩm

| Hạng mục | Nội dung |
|---|---|
| **URL** | `/products` |
| **Steps** | 1. Nhập từ khóa "nike" vào ô tìm kiếm <br>2. Quan sát kết quả |
| **Expected** | Chỉ hiển thị sản phẩm của thương hiệu NIKE |
| **Status** | ⬜ |

### TC-03-002: Filter theo danh mục Nam

| Hạng mục | Nội dung |
|---|---|
| **Steps** | 1. Click menu "Nam" hoặc vào `/nam` |
| **Expected** | Tất cả sản phẩm hiển thị đều thuộc gender=NAM |
| **Status** | ⬜ |

### TC-03-003: Sản phẩm hết hàng hiển thị đúng

| Hạng mục | Nội dung |
|---|---|
| **URL** | `/product/new-balance-9060` |
| **Steps** | 1. Chọn màu "Đen" <br>2. Chọn size "41" |
| **Expected** | Size 41 màu Đen: stock = 1, nút thêm vào giỏ vẫn active. Chọn màu Be, Size 42: stock thấp nhưng vẫn active. Nếu stock = 0 thì button disabled và hiện "Hết hàng" |
| **Status** | ⬜ |

### TC-03-004: Giá sale hiển thị đúng

| Hạng mục | Nội dung |
|---|---|
| **URL** | `/product/nike-air-max-270` |
| **Expected** | Hiển thị giá gốc 4.590.000₫ (gạch ngang) và giá sale 3.990.000₫ (màu cam) |
| **Status** | ⬜ |

---

## TC-04: Giỏ hàng

### TC-04-001: Thêm sản phẩm vào giỏ

| Hạng mục | Nội dung |
|---|---|
| **Pre-condition** | Ở trang chi tiết sản phẩm Nike Air Max 270 |
| **Steps** | 1. Chọn màu "Đen" <br>2. Chọn size "40" <br>3. Click "Thêm vào giỏ" |
| **Expected** | Toast "Đã thêm vào giỏ hàng!", badge header tăng lên 1 |
| **Status** | ⬜ |

### TC-04-002: Thêm quá tồn kho

| Hạng mục | Nội dung |
|---|---|
| **Pre-condition** | Đã có 1 Nike Air Max 270 Đen-40 trong giỏ (tồn kho thực tế: 8) |
| **Steps** | 1. Vào giỏ hàng <br>2. Tăng số lượng lên 9 |
| **Expected** | Lỗi "Chỉ còn 8 sản phẩm trong kho." |
| **Status** | ⬜ |

### TC-04-003: Xóa sản phẩm khỏi giỏ

| Hạng mục | Nội dung |
|---|---|
| **Steps** | 1. Trong giỏ hàng, click nút "✕" bên cạnh sản phẩm |
| **Expected** | Sản phẩm biến mất, tổng tiền cập nhật, badge giảm |
| **Status** | ⬜ |

### TC-04-004: Giỏ hàng persist sau reload

| Hạng mục | Nội dung |
|---|---|
| **Steps** | 1. Thêm sản phẩm vào giỏ <br>2. Nhấn F5 reload trang |
| **Expected** | Giỏ hàng vẫn còn sản phẩm, badge vẫn hiển thị đúng số lượng |
| **Status** | ⬜ |

---

## TC-05: Thanh toán

### TC-05-001: Đặt hàng thành công (Guest)

| Hạng mục | Nội dung |
|---|---|
| **Pre-condition** | Giỏ hàng có ít nhất 1 sản phẩm, chưa đăng nhập |
| **Steps** | 1. Vào `/checkout` <br>2. Họ tên: "Nguyễn Văn Test" <br>3. SĐT: "0912345678" <br>4. Tỉnh: "Hà Nội", Quận: "Cầu Giấy", Phường: "Dịch Vọng" <br>5. Địa chỉ: "10 Trần Duy Hưng" <br>6. Chọn COD <br>7. Click "Đặt hàng" |
| **Expected** | Redirect sang `/order-success?id=SMVN-xxx`, hiển thị mã đơn hàng, giỏ hàng rỗng |
| **Status** | ⬜ |

### TC-05-002: Áp dụng mã giảm giá WELCOME10

| Hạng mục | Nội dung |
|---|---|
| **Pre-condition** | Giỏ hàng có đơn hàng ≥ 500.000₫ |
| **Steps** | 1. Ở trang checkout, nhập mã "WELCOME10" <br>2. Click "Áp dụng" |
| **Expected** | Hiển thị "✅ Giảm X₫" (10% tối đa 150.000₫), tổng tiền cập nhật |
| **Status** | ⬜ |

### TC-05-003: Mã giảm giá hết hạn

| Hạng mục | Nội dung |
|---|---|
| **Steps** | 1. Nhập mã "EXPIRED20" <br>2. Click "Áp dụng" |
| **Expected** | Lỗi "❌ Mã giảm giá đã hết hạn." |
| **Status** | ⬜ |

### TC-05-004: Kiểm tra tồn kho sau khi đặt hàng

| Hạng mục | Nội dung |
|---|---|
| **Pre-condition** | Biết tồn kho hiện tại của SKU sẽ mua (xem ở Admin) |
| **Steps** | 1. Đặt hàng 2 sản phẩm của SKU "NK-AM270-BLK-40" <br>2. Vào Admin → Kho hàng → tìm SKU đó |
| **Expected** | Tồn kho giảm đúng 2 đơn vị |
| **Status** | ⬜ |

### TC-05-005: SĐT không đúng định dạng VN

| Hạng mục | Nội dung |
|---|---|
| **Steps** | 1. Nhập SĐT: "123456789" (9 số, không bắt đầu bằng 0) <br>2. Click "Đặt hàng" |
| **Expected** | Lỗi "Số điện thoại không hợp lệ." |
| **Status** | ⬜ |

---

## TC-06: Tra cứu đơn hàng (Guest)

### TC-06-001: Tra cứu đúng thông tin

| Hạng mục | Nội dung |
|---|---|
| **URL** | `/track-order` |
| **Steps** | 1. Nhập Mã đơn: "SMVN-1004" <br>2. Nhập SĐT: "0977123456" <br>3. Click "Tra cứu" |
| **Expected** | Hiển thị thông tin đơn hàng SMVN-1004 |
| **Status** | ⬜ |

### TC-06-002: SĐT không khớp

| Hạng mục | Nội dung |
|---|---|
| **Steps** | 1. Nhập Mã đơn: "SMVN-1004" <br>2. Nhập SĐT sai: "0900000000" <br>3. Click "Tra cứu" |
| **Expected** | Lỗi "Không tìm thấy đơn hàng." |
| **Status** | ⬜ |

---

## TC-07: Hủy đơn hàng

### TC-07-001: Hủy đơn PENDING (Customer)

| Hạng mục | Nội dung |
|---|---|
| **Pre-condition** | Đăng nhập bằng nam@solemate.vn, có đơn hàng trạng thái PENDING |
| **Steps** | 1. Vào đơn hàng PENDING <br>2. Click "Hủy đơn hàng" <br>3. Xác nhận trong dialog |
| **Expected** | Đơn chuyển sang CANCELLED, tồn kho được hoàn trả |
| **Status** | ⬜ |

### TC-07-002: Không có nút hủy ở đơn SHIPPING

| Hạng mục | Nội dung |
|---|---|
| **Steps** | 1. Vào đơn hàng SMVN-1003 (trạng thái SHIPPING) |
| **Expected** | Không có nút "Hủy đơn hàng" |
| **Status** | ⬜ |

---

## TC-08: Admin — Sản phẩm

### TC-08-001: Tạo sản phẩm mới

| Hạng mục | Nội dung |
|---|---|
| **Pre-condition** | Đăng nhập admin |
| **URL** | `/admin/products` |
| **Steps** | 1. Click "Thêm sản phẩm" <br>2. Điền: Tên "Test Shoe 001", Slug "test-shoe-001", Brand "NIKE", Gender "NAM", Category "LIFESTYLE" <br>3. Giá: 2000000 <br>4. Thêm 1 variant: SKU "TEST-001-BLK-40", Màu "Đen", Size "40", Tồn kho "5" <br>5. Click "Tạo sản phẩm" |
| **Expected** | Sản phẩm xuất hiện trong danh sách, có thể tìm thấy trên storefront |
| **Status** | ⬜ |

### TC-08-002: Upload ảnh sản phẩm

| Hạng mục | Nội dung |
|---|---|
| **Steps** | 1. Mở form chỉnh sửa sản phẩm bất kỳ <br>2. Click vùng ảnh hoặc nút "📤 Chọn ảnh" <br>3. Chọn file ảnh JPG/PNG ≤ 5MB <br>4. Lưu sản phẩm |
| **Expected** | Ảnh hiển thị trong form, sau khi lưu ảnh hiển thị trên storefront |
| **Status** | ⬜ |

### TC-08-003: Ẩn sản phẩm

| Hạng mục | Nội dung |
|---|---|
| **Steps** | 1. Tìm sản phẩm đang ACTIVE <br>2. Click "🙈 Ẩn" <br>3. Vào storefront tìm sản phẩm đó |
| **Expected** | Sản phẩm không còn hiển thị trên storefront |
| **Status** | ⬜ |

---

## TC-09: Admin — Đơn hàng

### TC-09-001: Xác nhận đơn hàng

| Hạng mục | Nội dung |
|---|---|
| **Pre-condition** | Có đơn hàng trạng thái PENDING trong hệ thống |
| **URL** | `/admin/orders` |
| **Steps** | 1. Click vào đơn PENDING <br>2. Click "→ Đã xác nhận" |
| **Expected** | Trạng thái đơn chuyển sang CONFIRMED |
| **Status** | ⬜ |

### TC-09-002: Lưu mã vận đơn

| Hạng mục | Nội dung |
|---|---|
| **Steps** | 1. Mở chi tiết đơn bất kỳ <br>2. Nhập mã vận đơn: "VNPOST123456" <br>3. Click "Lưu" |
| **Expected** | Toast "Đã lưu mã vận đơn!", mã được hiển thị |
| **Status** | ⬜ |

---

## TC-10: Admin — Khuyến mãi

### TC-10-001: Tạo mã giảm giá mới

| Hạng mục | Nội dung |
|---|---|
| **URL** | `/admin/promotions` |
| **Steps** | 1. Click "Tạo mã mới" <br>2. Code: "TESTQR10", Tên: "Test QR 10%", Loại: Phần trăm, Giá trị: 10 <br>3. Đơn tối thiểu: 300000 <br>4. Ngày bắt đầu: hôm nay, Kết thúc: 30 ngày sau <br>5. Click "Tạo mã" |
| **Expected** | Mã xuất hiện trong danh sách, có thể dùng ở checkout |
| **Status** | ⬜ |

### TC-10-002: Toggle tắt/bật mã

| Hạng mục | Nội dung |
|---|---|
| **Steps** | 1. Click "🔴 Tắt" trên mã WELCOME10 <br>2. Vào checkout, nhập WELCOME10 |
| **Expected** | Checkout báo "Mã giảm giá đang tạm ngưng." |
| **Status** | ⬜ |

---

## TC-11: Admin — Kho hàng

### TC-11-001: Tăng tồn kho

| Hạng mục | Nội dung |
|---|---|
| **URL** | `/admin/inventory` |
| **Steps** | 1. Click "Điều chỉnh kho" <br>2. Chọn SKU "NK-AM270-BLK-40" <br>3. Nhập delta: 10, ghi chú: "Nhập hàng thêm" <br>4. Click "Xác nhận" |
| **Expected** | Tồn kho tăng 10, lịch sử hiển thị ADJUST +10 |
| **Status** | ⬜ |

### TC-11-002: Không cho tồn kho âm

| Hạng mục | Nội dung |
|---|---|
| **Steps** | 1. Chọn SKU có tồn kho = 3 <br>2. Nhập delta: -5 |
| **Expected** | Lỗi "Tồn kho không thể âm." |
| **Status** | ⬜ |

---

## TC-12: Kiểm thử Responsive

| ID | Màn hình | Trang | Kết quả mong đợi | Status |
|---|---|---|---|---|
| TC-12-01 | Mobile (375px) | Trang chủ | Layout 1 cột, không bị overflow | ⬜ |
| TC-12-02 | Mobile (375px) | Trang sản phẩm | Grid 2 cột, dễ đọc | ⬜ |
| TC-12-03 | Mobile (375px) | Checkout | Form full width, dễ nhập | ⬜ |
| TC-12-04 | Tablet (768px) | Trang chủ | Grid 2-3 cột | ⬜ |
| TC-12-05 | Desktop (1440px) | Admin Orders | Bảng và panel hiển thị cạnh nhau | ⬜ |
