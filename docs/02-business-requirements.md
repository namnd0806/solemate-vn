# Tài liệu Yêu cầu Nghiệp vụ — SoleMate VN

**Phiên bản:** 2.0  
**Ngày:** Tháng 9/2026  

---

## 1. Yêu cầu theo module

---

### MODULE 1: Xác thực người dùng (Authentication)

#### 1.1 Đăng ký tài khoản

**Mô tả:** Khách hàng tạo tài khoản mới để mua hàng và theo dõi đơn.

**Acceptance Criteria:**

| # | Điều kiện | Kết quả mong đợi |
|---|---|---|
| AC-1.1.1 | Điền đầy đủ họ tên, email, mật khẩu hợp lệ | Tạo tài khoản thành công, tự động đăng nhập |
| AC-1.1.2 | Email đã tồn tại trong hệ thống | Hiển thị lỗi "Email đã được đăng ký." |
| AC-1.1.3 | Mật khẩu ít hơn 6 ký tự | Hiển thị lỗi, không tạo tài khoản |
| AC-1.1.4 | Mật khẩu xác nhận không khớp | Hiển thị lỗi "Mật khẩu xác nhận không khớp." |
| AC-1.1.5 | Bỏ trống họ hoặc tên | Hiển thị lỗi validation |
| AC-1.1.6 | Đăng ký thành công | Header cập nhật hiển thị tên người dùng |

#### 1.2 Đăng nhập

**Acceptance Criteria:**

| # | Điều kiện | Kết quả mong đợi |
|---|---|---|
| AC-1.2.1 | Email và mật khẩu đúng | Đăng nhập thành công, redirect về trang trước |
| AC-1.2.2 | Email không tồn tại | Lỗi "Email hoặc mật khẩu không đúng." (không tiết lộ field nào sai) |
| AC-1.2.3 | Mật khẩu sai | Lỗi "Email hoặc mật khẩu không đúng." |
| AC-1.2.4 | Bỏ trống email hoặc mật khẩu | Validation ngăn submit |
| AC-1.2.5 | Đăng nhập thành công với returnUrl | Redirect về URL đã chỉ định |

#### 1.3 Đăng xuất

| # | Điều kiện | Kết quả mong đợi |
|---|---|---|
| AC-1.3.1 | Click đăng xuất | Phiên hết hạn, header chuyển về "Đăng nhập/Đăng ký" |
| AC-1.3.2 | Truy cập trang yêu thích sau khi đăng xuất | Redirect về trang đăng nhập |

---

### MODULE 2: Sản phẩm

#### 2.1 Trang chủ

| # | Điều kiện | Kết quả mong đợi |
|---|---|---|
| AC-2.1.1 | Vào trang chủ | Hiển thị section "Sản phẩm nổi bật" và "Bán chạy nhất" |
| AC-2.1.2 | Section có sản phẩm | Hiển thị đúng ảnh/tên/giá, badge đúng loại |
| AC-2.1.3 | Click vào sản phẩm | Chuyển sang trang chi tiết sản phẩm |

#### 2.2 Danh sách sản phẩm (PLP)

| # | Điều kiện | Kết quả mong đợi |
|---|---|---|
| AC-2.2.1 | Vào `/products` | Hiển thị sản phẩm ACTIVE, phân trang 12/trang |
| AC-2.2.2 | Nhập từ khóa tìm kiếm | Lọc theo tên, thương hiệu, danh mục (không phân biệt hoa/thường) |
| AC-2.2.3 | Chọn sort "Giá tăng dần" | Sản phẩm sắp xếp giá từ thấp đến cao |
| AC-2.2.4 | Chọn sort "Giá giảm dần" | Sản phẩm sắp xếp giá từ cao đến thấp |
| AC-2.2.5 | Chọn sort "Bán chạy" | Sản phẩm best_seller hiển thị trước |
| AC-2.2.6 | Vào `/nam` | Chỉ hiển thị sản phẩm gender=NAM |
| AC-2.2.7 | Vào `/nu` | Chỉ hiển thị sản phẩm gender=NỮ |
| AC-2.2.8 | Vào `/sale` | Chỉ hiển thị sản phẩm có giá sale |
| AC-2.2.9 | Sản phẩm INACTIVE | Không hiển thị trên storefront |

#### 2.3 Chi tiết sản phẩm (PDP)

| # | Điều kiện | Kết quả mong đợi |
|---|---|---|
| AC-2.3.1 | Vào trang sản phẩm | Hiển thị đúng tên, thương hiệu, giá, mô tả |
| AC-2.3.2 | Sản phẩm có giá sale | Hiển thị cả giá gốc (gạch ngang) và giá sale |
| AC-2.3.3 | Chọn màu | Size options cập nhật theo màu đã chọn |
| AC-2.3.4 | Chọn size hết hàng (stock=0) | Size bị disabled, nút "Thêm vào giỏ" disabled, hiển thị "Hết hàng" |
| AC-2.3.5 | Chọn size còn hàng | Nút "Thêm vào giỏ" được kích hoạt |
| AC-2.3.6 | Click wishlist khi chưa đăng nhập | Redirect về trang đăng nhập |

---

### MODULE 3: Giỏ hàng

| # | Điều kiện | Kết quả mong đợi |
|---|---|---|
| AC-3.1 | Thêm sản phẩm vào giỏ | Số lượng trên badge header tăng lên |
| AC-3.2 | Thêm cùng SKU lần 2 | Số lượng trong giỏ cộng dồn (không tạo dòng mới) |
| AC-3.3 | Thêm quá tồn kho | Hiển thị lỗi "Chỉ còn X sản phẩm trong kho." |
| AC-3.4 | Xóa sản phẩm khỏi giỏ | Dòng biến mất, badge cập nhật |
| AC-3.5 | Tăng số lượng vượt tồn kho | Hiển thị lỗi, không cho tăng |
| AC-3.6 | Giỏ hàng persist khi F5 | Vẫn còn items sau khi reload trang |
| AC-3.7 | Giỏ hàng của guest | Vẫn hoạt động khi chưa đăng nhập |
| AC-3.8 | Giỏ rỗng | Hiển thị thông báo giỏ trống + nút "Khám phá sản phẩm" |

---

### MODULE 4: Thanh toán & Đặt hàng

#### 4.1 Validation form

| # | Điều kiện | Kết quả mong đợi |
|---|---|---|
| AC-4.1.1 | Bỏ trống họ tên | Lỗi "Vui lòng nhập họ tên." |
| AC-4.1.2 | Số điện thoại không đúng định dạng VN | Lỗi "Số điện thoại không hợp lệ." |
| AC-4.1.3 | Bỏ trống tỉnh/quận/phường/địa chỉ | Lỗi "Vui lòng nhập đầy đủ địa chỉ." |
| AC-4.1.4 | Vào checkout khi giỏ rỗng | Redirect về `/cart` |

#### 4.2 Mã giảm giá

| # | Mã test | Kết quả mong đợi |
|---|---|---|
| AC-4.2.1 | `WELCOME10` | Giảm 10%, tối đa 150.000₫, đơn tối thiểu 500.000₫ |
| AC-4.2.2 | `SALE50K` | Giảm cố định 50.000₫, đơn tối thiểu 1.000.000₫ |
| AC-4.2.3 | `EXPIRED20` | Lỗi "Mã giảm giá đã hết hạn." |
| AC-4.2.4 | `LIMITED` | Lỗi "Mã giảm giá đã hết lượt sử dụng." |
| AC-4.2.5 | Mã không tồn tại | Lỗi "Mã giảm giá không tồn tại." |
| AC-4.2.6 | Mã nhập chữ thường `welcome10` | Vẫn áp dụng được (không phân biệt hoa/thường) |
| AC-4.2.7 | Đơn dưới mức tối thiểu | Lỗi "Đơn hàng tối thiểu X để dùng mã này." |

#### 4.3 Phí vận chuyển

| # | Điều kiện | Phí ship |
|---|---|---|
| AC-4.3.1 | Tiêu chuẩn, đơn < 499.000₫ | 30.000₫ |
| AC-4.3.2 | Tiêu chuẩn, đơn (sau giảm) ≥ 499.000₫ | Miễn phí |
| AC-4.3.3 | Express | Luôn 50.000₫ |

#### 4.4 Đặt hàng thành công

| # | Điều kiện | Kết quả mong đợi |
|---|---|---|
| AC-4.4.1 | Đặt hàng thành công | Redirect sang `/order-success?id=SMVN-xxx` |
| AC-4.4.2 | Trang order-success | Hiển thị mã đơn hàng + thông báo thành công |
| AC-4.4.3 | Giỏ hàng sau khi đặt | Giỏ trống |
| AC-4.4.4 | Tồn kho sau khi đặt | Số lượng trong kho bị trừ tương ứng |

---

### MODULE 5: Đơn hàng

#### 5.1 Tra cứu đơn (Guest)

| # | Điều kiện | Kết quả mong đợi |
|---|---|---|
| AC-5.1.1 | Nhập đúng mã đơn + SĐT | Hiển thị chi tiết đơn hàng |
| AC-5.1.2 | Đúng mã đơn nhưng sai SĐT | Lỗi "Không tìm thấy đơn hàng." |
| AC-5.1.3 | Mã đơn không tồn tại | Lỗi "Không tìm thấy đơn hàng." |

#### 5.2 Hủy đơn hàng

| # | Điều kiện | Kết quả mong đợi |
|---|---|---|
| AC-5.2.1 | Hủy đơn PENDING | Đơn chuyển sang CANCELLED, tồn kho được hoàn |
| AC-5.2.2 | Hủy đơn CONFIRMED | Đơn chuyển sang CANCELLED, tồn kho được hoàn |
| AC-5.2.3 | Hủy đơn SHIPPING | Nút hủy không hiển thị / bị vô hiệu hóa |
| AC-5.2.4 | Hủy đơn DELIVERED | Không thể hủy |
| AC-5.2.5 | Hủy đơn đã hủy | Hệ thống không hủy lại, không trừ kho lần 2 |

---

### MODULE 6: Admin — Sản phẩm

| # | Điều kiện | Kết quả mong đợi |
|---|---|---|
| AC-6.1 | Thêm sản phẩm mới với đầy đủ thông tin | Sản phẩm xuất hiện trên storefront |
| AC-6.2 | Slug bị trùng với sản phẩm khác | Lỗi "Slug đã tồn tại." |
| AC-6.3 | SKU variant trùng với variant khác | Lỗi "SKU đã tồn tại." |
| AC-6.4 | Giá sale ≥ giá gốc | Lỗi validation |
| AC-6.5 | Ẩn sản phẩm (toggle INACTIVE) | Sản phẩm biến mất khỏi storefront |
| AC-6.6 | Hiện sản phẩm (toggle ACTIVE) | Sản phẩm xuất hiện lại trên storefront |
| AC-6.7 | Upload ảnh sản phẩm | Ảnh hiển thị trên card và trang chi tiết |

---

### MODULE 7: Admin — Đơn hàng

| # | Transition | Kết quả mong đợi |
|---|---|---|
| AC-7.1 | PENDING → CONFIRMED | Trạng thái cập nhật thành công |
| AC-7.2 | PENDING → CANCELLED | Đơn bị hủy, kho hoàn |
| AC-7.3 | CONFIRMED → SHIPPING | Trạng thái cập nhật |
| AC-7.4 | CONFIRMED → CANCELLED | Đơn bị hủy, kho hoàn |
| AC-7.5 | SHIPPING → DELIVERED | Trạng thái cập nhật |
| AC-7.6 | DELIVERED → bất kỳ | Không có nút chuyển trạng thái |
| AC-7.7 | Lưu mã vận đơn | Mã tracking được lưu và hiển thị |

---

### MODULE 8: Admin — Khuyến mãi

| # | Điều kiện | Kết quả mong đợi |
|---|---|---|
| AC-8.1 | Tạo mã mới với code chưa tồn tại | Mã được tạo thành công |
| AC-8.2 | Tạo mã với code đã tồn tại (không phân biệt hoa/thường) | Lỗi "Mã khuyến mãi đã tồn tại." |
| AC-8.3 | Ngày kết thúc ≤ ngày bắt đầu | Lỗi "Thời gian kết thúc phải sau thời gian bắt đầu." |
| AC-8.4 | Toggle tắt mã đang chạy | Mã không còn dùng được ở checkout |
| AC-8.5 | Xóa mã có usage_count = 0 | Mã bị xóa vĩnh viễn |
| AC-8.6 | Xóa mã có usage_count > 0 | Mã chuyển sang disabled (không xóa) |

---

### MODULE 9: Admin — Kho hàng

| # | Điều kiện | Kết quả mong đợi |
|---|---|---|
| AC-9.1 | Điều chỉnh +10 cho SKU đang có 5 | Tồn kho thành 15, lịch sử ghi ADJUST +10 |
| AC-9.2 | Điều chỉnh -3 cho SKU đang có 5 | Tồn kho thành 2 |
| AC-9.3 | Điều chỉnh âm khiến tồn kho < 0 | Lỗi "Tồn kho không thể âm." |
| AC-9.4 | Nhập delta = 0 | Lỗi "Số lượng điều chỉnh phải là số nguyên khác 0." |
| AC-9.5 | Nhập delta không phải số | Validation ngăn submit |
| AC-9.6 | Xem lịch sử biến động | Hiển thị danh sách SALE/CANCEL_RETURN/ADJUST theo thứ tự mới nhất |

---

## 2. Non-Functional Requirements

| # | Yêu cầu | Tiêu chí |
|---|---|---|
| NFR-1 | Trang tải nhanh | Trang chủ load < 3 giây (mạng bình thường) |
| NFR-2 | Responsive | Hiển thị đúng trên mobile (375px), tablet (768px), desktop (1280px) |
| NFR-3 | Bảo mật cookie | Cookie admin/customer là HttpOnly, không đọc được qua JavaScript |
| NFR-4 | Mật khẩu an toàn | Không lưu mật khẩu dạng plaintext, dùng bcrypt |
| NFR-5 | Giao dịch nguyên tử | Tạo đơn hàng hoặc thành công hoàn toàn hoặc rollback hoàn toàn |
| NFR-6 | Tồn kho không âm | Mọi luồng đều phải ngăn tồn kho xuống dưới 0 |
