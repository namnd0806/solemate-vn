# 📚 Tài liệu Kiểm thử — SoleMate VN

Thư mục này chứa toàn bộ tài liệu dành cho **Tester / QA** của dự án SoleMate VN.

---

## Đọc theo thứ tự này

| Thứ tự | File | Nội dung | Thời gian đọc |
|---|---|---|---|
| 1 | [01-project-overview.md](./01-project-overview.md) | Tổng quan hệ thống, modules, URLs, luồng nghiệp vụ | ~15 phút |
| 2 | [02-business-requirements.md](./02-business-requirements.md) | Yêu cầu chi tiết từng module + Acceptance Criteria | ~30 phút |
| 3 | [03-test-plan.md](./03-test-plan.md) | Kế hoạch kiểm thử, phạm vi, môi trường, tiêu chí | ~15 phút |
| 4 | [05-test-data.md](./05-test-data.md) | Dữ liệu test: sản phẩm, mã KM, đơn hàng, tài khoản | ~20 phút |
| 5 | [04-test-cases.md](./04-test-cases.md) | Test cases chi tiết từng module | ~45 phút |
| 6 | [06-bug-report-template.md](./06-bug-report-template.md) | Template báo cáo lỗi + hướng dẫn | ~10 phút |

---

## Quick Start

**Bước 1:** Truy cập hệ thống
```
Storefront: https://solemate-vn.vercel.app
Admin:      https://solemate-vn.vercel.app/admin/login
```

**Bước 2:** Đăng nhập test
```
Admin:    admin@solemate.vn  /  Admin123!
Customer: nam@solemate.vn   /  Nam123!
```

**Bước 3:** Mở [04-test-cases.md](./04-test-cases.md) và bắt đầu thực thi từ TC-01

**Bước 4:** Khi tìm thấy bug → Copy [06-bug-report-template.md](./06-bug-report-template.md) và điền thông tin

---

## Lưu ý quan trọng

> ⚠️ **Thanh toán trong hệ thống này là MÔ PHỎNG** — không có tiền thật được giao dịch.

> ⚠️ **Dữ liệu test là dữ liệu thật trên production** — tránh tạo quá nhiều đơn hàng rác, không xóa dữ liệu của người khác.

> 💡 **Khi gặp lỗi JavaScript:** Mở DevTools (F12) → Tab Console để xem thông báo lỗi kỹ thuật — ghi vào bug report.
