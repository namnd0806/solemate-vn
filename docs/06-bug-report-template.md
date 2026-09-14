# Mẫu Báo cáo Lỗi (Bug Report Template) — SoleMate VN

---

## Hướng dẫn sử dụng

1. Copy template bên dưới cho mỗi bug tìm được
2. Điền đầy đủ thông tin
3. Đặt tên file theo format: `BUG-[số thứ tự]-[mô tả ngắn].md`  
   Ví dụ: `BUG-001-gio-hang-khong-luu-sau-f5.md`
4. Nộp qua kênh đã được thống nhất

---

## Template

```markdown
# [BUG-XXX] Tiêu đề mô tả lỗi ngắn gọn

**Ngày phát hiện:** DD/MM/YYYY  
**Người báo cáo:** [Tên của bạn]  
**Môi trường:** Production (https://solemate-vn.vercel.app)  
**Trình duyệt:** Chrome 120 / Firefox 121 / Edge 120  
**Thiết bị:** Desktop / Mobile (iPhone 13 / Samsung Galaxy S21)  

---

## Mức độ nghiêm trọng

- [ ] 🔴 Critical — Hệ thống không dùng được
- [ ] 🟠 High — Tính năng quan trọng bị lỗi
- [ ] 🟡 Medium — Tính năng lỗi một phần
- [ ] 🟢 Low — Lỗi giao diện / ít ảnh hưởng

## Module bị ảnh hưởng

- [ ] Đăng ký / Đăng nhập
- [ ] Sản phẩm (trang chủ / danh sách / chi tiết)
- [ ] Giỏ hàng
- [ ] Thanh toán / Đặt hàng
- [ ] Đơn hàng (xem / hủy / tra cứu)
- [ ] Admin - Sản phẩm
- [ ] Admin - Đơn hàng
- [ ] Admin - Kho hàng
- [ ] Admin - Khuyến mãi
- [ ] Giao diện / Responsive

---

## Mô tả lỗi

[Mô tả rõ ràng vấn đề gặp phải là gì]

---

## Các bước tái hiện (Steps to Reproduce)

1. [Bước 1]
2. [Bước 2]
3. [Bước 3]
...

---

## Kết quả thực tế (Actual Result)

[Điều gì thực sự xảy ra]

---

## Kết quả mong đợi (Expected Result)

[Điều lẽ ra phải xảy ra]

---

## Tần suất tái hiện

- [ ] Luôn luôn (100%)
- [ ] Thỉnh thoảng (~50%)
- [ ] Hiếm khi (<10%)

---

## Bằng chứng (Evidence)

**Screenshot:** [Đính kèm ảnh chụp màn hình]  
**Video:** [Link video nếu có]  
**Console Error:** 
```
[Dán nội dung lỗi từ DevTools → Console nếu có]
```
**Network Error:**
```
[Dán response từ DevTools → Network nếu có]
```

---

## Thông tin bổ sung

**URL tại thời điểm xảy ra lỗi:** [URL]  
**Tài khoản đang dùng:** [email hoặc "Guest"]  
**Dữ liệu test:** [Ví dụ: đơn hàng SMVN-1004, SKU NK-AM270-BLK-40]  
**Ghi chú thêm:** [Thông tin khác có thể liên quan]

---

## Trạng thái

- [ ] New — Mới báo cáo
- [ ] Confirmed — Dev đã xác nhận
- [ ] In Progress — Đang fix
- [ ] Fixed — Đã fix, chờ verify
- [ ] Verified — Tester đã verify pass
- [ ] Closed — Đóng
- [ ] Rejected — Không phải bug / Won't fix
```

---

## Ví dụ Bug Report mẫu

```markdown
# [BUG-001] Giỏ hàng bị mất sau khi refresh trang

**Ngày phát hiện:** 15/09/2026  
**Người báo cáo:** Nguyễn Thị A  
**Môi trường:** Production  
**Trình duyệt:** Chrome 120  
**Thiết bị:** Desktop Windows 11  

---

## Mức độ nghiêm trọng

- [x] 🔴 Critical — Hệ thống không dùng được

## Module bị ảnh hưởng

- [x] Giỏ hàng

---

## Mô tả lỗi

Khi thêm sản phẩm vào giỏ hàng, sau đó nhấn F5 refresh trang, toàn bộ 
sản phẩm trong giỏ biến mất. User phải thêm lại từ đầu.

---

## Các bước tái hiện

1. Vào https://solemate-vn.vercel.app/product/nike-air-max-270
2. Chọn màu "Đen", size "40"
3. Click "Thêm vào giỏ" — badge header hiển thị 1
4. Nhấn F5 refresh trang

---

## Kết quả thực tế

Badge về 0, giỏ hàng trống, mất toàn bộ items.

---

## Kết quả mong đợi

Giỏ hàng vẫn còn 1 sản phẩm sau khi refresh (dữ liệu được lưu localStorage).

---

## Tần suất tái hiện

- [x] Luôn luôn (100%)

---

## Bằng chứng

**Screenshot:** [screen-001.png]  
**Console Error:** 
```
TypeError: Cannot read properties of undefined (reading 'get')
  at CartContext.js:15
```

---

## Thông tin bổ sung

**URL:** https://solemate-vn.vercel.app/cart  
**Tài khoản:** Guest  
```

---

## Checklist trước khi submit bug

- [ ] Đã tái hiện lỗi ít nhất 2 lần
- [ ] Đã chụp screenshot hoặc quay video
- [ ] Đã ghi rõ các bước tái hiện
- [ ] Đã kiểm tra console/network nếu có lỗi kỹ thuật
- [ ] Đã điền đầy đủ môi trường và tài khoản test
- [ ] Đã phân loại đúng mức độ nghiêm trọng
