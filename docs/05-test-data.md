# Dữ liệu Kiểm thử (Test Data) — SoleMate VN

**Phiên bản:** 1.0  
**Ngày:** Tháng 9/2026  

> Đây là toàn bộ dữ liệu mẫu đã được seed vào hệ thống. Tester sử dụng để thực hiện test cases.

---

## 1. Tài khoản

| ID | Vai trò | Email | Mật khẩu | Ghi chú |
|---|---|---|---|---|
| A001 | ADMIN | admin@solemate.vn | Admin123! | Toàn quyền quản trị |
| U001 | CUSTOMER | nam@solemate.vn | Nam123! | Khách hàng có lịch sử đơn |

---

## 2. Sản phẩm

### 2.1 Danh sách sản phẩm

| ID | Slug | Tên | Thương hiệu | Giới tính | Giá gốc | Giá sale | Trạng thái |
|---|---|---|---|---|---|---|---|
| P001 | nike-air-max-270 | Nike Air Max 270 | NIKE | NAM | 4.590.000₫ | 3.990.000₫ | ACTIVE ⭐ Nổi bật |
| P002 | nike-pegasus-41 | Nike Pegasus 41 | NIKE | NAM | 3.990.000₫ | 3.590.000₫ | ACTIVE ⭐ |
| P003 | adidas-ultraboost-light | Adidas Ultraboost Light | ADIDAS | NỮ | 5.200.000₫ | 4.490.000₫ | ACTIVE ⭐ |
| P004 | adidas-samba-og | Adidas Samba OG | ADIDAS | UNISEX | 3.290.000₫ | — | ACTIVE ⭐ |
| P005 | new-balance-530-classic | New Balance 530 Classic | NEW BALANCE | NỮ | 3.190.000₫ | — | ACTIVE ⭐ |
| P006 | new-balance-9060 | New Balance 9060 | NEW BALANCE | NAM | 4.290.000₫ | 3.990.000₫ | ACTIVE |
| P007 | asics-gel-kayano-31 | ASICS Gel-Kayano 31 | ASICS | NAM | 4.350.000₫ | — | ACTIVE |
| P008 | asics-gel-nyc | ASICS Gel-NYC | ASICS | NỮ | 3.790.000₫ | 3.490.000₫ | ACTIVE |
| P009 | converse-chuck-70-high | Converse Chuck 70 High | CONVERSE | UNISEX | 2.190.000₫ | — | ACTIVE |
| P010 | converse-run-star-hike | Converse Run Star Hike | CONVERSE | NỮ | 2.890.000₫ | 2.490.000₫ | ACTIVE |
| P011 | nike-court-borough-kids | Nike Court Borough Kids | NIKE | TRẺ EM | 1.690.000₫ | 1.490.000₫ | ACTIVE |
| P012 | adidas-superstar-kids | Adidas Superstar Kids | ADIDAS | TRẺ EM | 1.890.000₫ | — | **INACTIVE** ← Để test filter |
| P013 | new-balance-327-kids | New Balance 327 Kids | NEW BALANCE | TRẺ EM | 1.790.000₫ | 1.590.000₫ | ACTIVE ⭐ |
| P014 | asics-contend-9-kids | ASICS Contend 9 Kids | ASICS | TRẺ EM | 1.650.000₫ | — | ACTIVE |
| P015 | adidas-gazelle-bold-women | Adidas Gazelle Bold | ADIDAS | NỮ | 3.490.000₫ | 3.190.000₫ | ACTIVE ⭐ |

### 2.2 SKU hữu ích để test

| SKU | Sản phẩm | Tồn kho | Ghi chú |
|---|---|---|---|
| NK-AM270-BLK-40 | Nike Air Max 270 - Đen size 40 | 8 | Tồn kho bình thường |
| NK-AM270-WHT-41 | Nike Air Max 270 - Trắng size 41 | 3 | **Tồn kho thấp** (≤ ngưỡng 3) |
| AD-UBL-WHT-38 | Adidas Ultraboost - Trắng size 38 | 2 | Tồn kho thấp |
| NB-9060-BLK-41 | New Balance 9060 - Đen size 41 | 1 | Tồn kho rất thấp |
| AD-SS-KID-32 | Adidas Superstar Kids - size 32 | 0 | **Hết hàng** + sản phẩm INACTIVE |
| AS-GNY-GRY-39 | ASICS Gel-NYC - Xám size 39 | 1 | Tồn kho thấp |

---

## 3. Mã giảm giá

| Code | Loại | Giá trị | Tối đa | Đơn tối thiểu | Trạng thái | Ghi chú |
|---|---|---|---|---|---|---|
| WELCOME10 | PERCENT | 10% | 150.000₫ | 500.000₫ | ✅ **Đang chạy** | 36/500 lượt đã dùng |
| SALE50K | FIXED | 50.000₫ | — | 1.000.000₫ | ✅ **Đang chạy** | 18/200 lượt |
| EXPIRED20 | PERCENT | 20% | 200.000₫ | 700.000₫ | ⏰ **Hết hạn** | Để test expired |
| LIMITED | FIXED | 100.000₫ | — | 1.500.000₫ | 🚫 **Hết lượt** | 5/5 đã dùng hết |

**Ví dụ tính discount:**

| Mã | Subtotal | Discount |
|---|---|---|
| WELCOME10 | 1.000.000₫ | 100.000₫ (10%) |
| WELCOME10 | 2.000.000₫ | 150.000₫ (đã capped tối đa) |
| SALE50K | 1.500.000₫ | 50.000₫ (fixed) |

---

## 4. Đơn hàng mẫu

| ID | Khách | Trạng thái | Thanh toán | Tổng | SĐT |
|---|---|---|---|---|---|
| SMVN-1001 | Nam Nguyễn (U001) | DELIVERED ✅ | COD - PAID | 3.840.000₫ | 0912345678 |
| SMVN-1002 | Minh Anh (Guest) | DELIVERED ✅ | BANK - PAID | 3.240.000₫ | 0988123456 |
| SMVN-1003 | Nam Nguyễn (U001) | SHIPPING 🚚 | MOMO - PAID | 3.590.000₫ | 0912345678 |
| SMVN-1004 | Hoàng Long (Guest) | PENDING ⏳ | COD - UNPAID | 2.140.000₫ | 0977123456 |
| SMVN-2001 | Nam Nguyễn (U001) | DELIVERED ✅ | MOMO - PAID | 4.540.000₫ | 0912345678 |
| SMVN-2002 | Linh Trần (Guest) | DELIVERED ✅ | BANK - PAID | 6.030.000₫ | 0901234567 |
| SMVN-2003 | Nam Nguyễn (U001) | CONFIRMED ✓ | COD - UNPAID | 3.190.000₫ | 0912345678 |
| SMVN-2004 | Minh Phúc (Guest) | DELIVERED ✅ | COD - PAID | 3.440.000₫ | 0932123456 |
| SMVN-2005 | Nam Nguyễn (U001) | CANCELLED ❌ | MOMO - UNPAID | 4.350.000₫ | 0912345678 |

**Gợi ý dùng test data:**

| Mục đích | Dùng đơn nào |
|---|---|
| Test xem chi tiết đơn (guest) | SMVN-1004 + SĐT 0977123456 |
| Test hủy đơn thành công | Tạo đơn mới ở trạng thái PENDING |
| Test không thể hủy | SMVN-1003 (SHIPPING) |
| Test Admin chuyển trạng thái | SMVN-2003 (CONFIRMED → SHIPPING) |
| Test xem đơn đã hủy | SMVN-2005 (CANCELLED) |

---

## 5. Số điện thoại hợp lệ để test

Hệ thống chấp nhận SĐT Việt Nam theo format:
- Bắt đầu bằng **0** + 9 chữ số (tổng 10 số)
- Đầu số hợp lệ: 03x, 05x, 07x, 08x, 09x

| SĐT | Kết quả |
|---|---|
| 0912345678 | ✅ Hợp lệ |
| 0388123456 | ✅ Hợp lệ |
| 0777000111 | ✅ Hợp lệ |
| 123456789 | ❌ Không hợp lệ (9 số) |
| 01234567890 | ❌ Không hợp lệ (11 số) |
| 1234567890 | ❌ Không bắt đầu bằng 0 |

---

## 6. Tình huống kiểm thử đặc biệt

### 6.1 Test ngưỡng miễn phí ship

| Subtotal sau discount | Ship method | Phí ship |
|---|---|---|
| 498.000₫ | STANDARD | 30.000₫ |
| 499.000₫ | STANDARD | **Miễn phí** |
| 500.000₫ | STANDARD | Miễn phí |
| 600.000₫ | EXPRESS | 50.000₫ (EXPRESS không miễn phí) |

**Cách test:** Cho giỏ hàng có subtotal gần 499.000₫, áp dụng/bỏ mã giảm giá để thấy phí ship thay đổi.

### 6.2 Test tồn kho tại thời điểm đặt hàng

> Hệ thống kiểm tra tồn kho **tại thời điểm submit** (không phải khi thêm vào giỏ). Điều này có nghĩa là:

**Scenario:** Người A và người B cùng thêm sản phẩm cuối cùng vào giỏ. Ai submit trước sẽ mua được, người còn lại sẽ nhận lỗi "SKU X chỉ còn 0 sản phẩm".

### 6.3 Sản phẩm INACTIVE

Sản phẩm **P012 (Adidas Superstar Kids)** có status=INACTIVE. Dùng để kiểm tra:
- Không xuất hiện trên storefront
- Không thể thêm vào giỏ
- Vẫn hiển thị trong Admin với badge "Đã ẩn"
