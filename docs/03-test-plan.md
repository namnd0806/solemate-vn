# Kế hoạch Kiểm thử (Test Plan) — SoleMate VN

**Phiên bản:** 1.0  
**Ngày:** Tháng 9/2026  
**Người thực hiện:** QA Team  

---

## 1. Phạm vi kiểm thử

### 1.1 Trong phạm vi (In Scope)

- Tất cả tính năng Storefront (khách hàng)
- Tất cả tính năng Admin Panel
- Luồng mua hàng đầu đến cuối (End-to-End)
- Kiểm thử negative cases (nhập sai, thiếu data)
- Kiểm thử trên trình duyệt Chrome, Firefox, Edge
- Kiểm thử responsive: mobile, tablet, desktop

### 1.2 Ngoài phạm vi (Out of Scope)

- Kiểm thử thanh toán thực (VNPAY, MoMo API)
- Kiểm thử hiệu năng (load testing)
- Kiểm thử bảo mật chuyên sâu (penetration testing)
- Kiểm thử trên Safari (iOS)

---

## 2. Loại kiểm thử

| Loại | Mô tả | Công cụ |
|---|---|---|
| Functional Testing | Kiểm tra tính năng hoạt động đúng không | Trình duyệt + Postman |
| UI Testing | Giao diện hiển thị đúng không | Trình duyệt |
| Boundary Testing | Test giá trị biên (VD: đúng ngưỡng miễn phí ship) | Trình duyệt |
| Negative Testing | Test case sai để kiểm tra thông báo lỗi | Trình duyệt |
| Integration Testing | Luồng xuyên suốt (đặt hàng → trừ kho → admin thấy) | Trình duyệt |
| Regression Testing | Sau khi fix bug, test lại tính năng cũ | Trình duyệt |

---

## 3. Môi trường kiểm thử

| Hạng mục | Chi tiết |
|---|---|
| URL | https://solemate-vn.vercel.app |
| Trình duyệt | Chrome 120+, Firefox 121+, Edge 120+ |
| Màn hình mobile test | 375×667 (iPhone SE) |
| Màn hình tablet test | 768×1024 (iPad) |
| Màn hình desktop test | 1440×900 |

---

## 4. Test Data sẵn có

Xem chi tiết tại: [05-test-data.md](./05-test-data.md)

**Tóm tắt:**
- 15 sản phẩm (14 ACTIVE + 1 INACTIVE)
- 4 mã giảm giá (2 còn hiệu lực, 1 hết hạn, 1 hết lượt)
- 9 đơn hàng mẫu ở các trạng thái khác nhau
- 2 tài khoản test (admin + customer)

---

## 5. Tiêu chí chấp nhận (Entry/Exit Criteria)

### Entry Criteria (Điều kiện bắt đầu test)
- [ ] Website đã deploy và truy cập được
- [ ] Tài khoản test đã được cung cấp
- [ ] Test data đã được seed vào database

### Exit Criteria (Điều kiện kết thúc test)
- [ ] 100% test cases đã được thực thi
- [ ] Tất cả bug Critical/High đã được fix và verify
- [ ] Tỉ lệ pass ≥ 95% tổng test cases

---

## 6. Mức độ ưu tiên Bug

| Mức độ | Mô tả | Ví dụ | Thời gian fix |
|---|---|---|---|
| 🔴 Critical | Hệ thống không sử dụng được | Không đặt hàng được, không đăng nhập | 24h |
| 🟠 High | Tính năng quan trọng bị sai | Tồn kho không trừ sau khi đặt | 48h |
| 🟡 Medium | Tính năng hoạt động sai một phần | Filter sản phẩm không chính xác | 1 tuần |
| 🟢 Low | Lỗi giao diện nhỏ | Lệch margin, sai màu chữ | Backlog |

---

## 7. Các luồng kiểm thử ưu tiên

### Sprint 1 — Luồng cốt lõi
1. Đăng ký → Đăng nhập → Đăng xuất
2. Duyệt sản phẩm → Tìm kiếm → Filter
3. Thêm vào giỏ → Checkout → Xác nhận đơn
4. Kiểm tra tồn kho trừ sau khi đặt hàng

### Sprint 2 — Admin Panel
5. Admin đăng nhập
6. Admin tạo/sửa/ẩn sản phẩm
7. Admin xử lý đơn hàng (đủ các trạng thái)
8. Admin tạo/tắt khuyến mãi

### Sprint 3 — Edge Cases & Negative
9. Tất cả validation forms
10. Mã giảm giá (expired, hết lượt, sai điều kiện)
11. Hủy đơn hàng ở các trạng thái
12. Điều chỉnh kho (âm, zero, hợp lệ)

---

## 8. Checklist trước khi bắt đầu

- [ ] Đã đọc tài liệu Overview và Business Requirements
- [ ] Đã chuẩn bị template Bug Report
- [ ] Đã biết cách mở DevTools để xem lỗi console
- [ ] Đã có quyền truy cập vào hệ thống test
- [ ] Đã cài extension/tool hỗ trợ (nếu có)
