# Lab Catalog – Danh mục lab nghiệp vụ

Mỗi lab = **bài toán nghiệp vụ + app chạy tại `/lab/<slug>` + test case mẫu + bài tập + (tuỳ chọn) bug toggle**.
Độ khó: ★ dễ · ★★ vừa · ★★★ khó. Ưu tiên: P0 (MVP) / P1.

| ID | Lab | Domain | Độ khó | Kỹ năng Playwright trọng tâm | Kỹ thuật test chính | Ưu tiên |
|----|-----|--------|--------|------------------------------|--------------------|---------|
| LAB-01 | Login & Đăng ký | Auth | ★ | getByLabel/Role, fill, assertion, storageState | EP, BVA, negative, security input | P0 |
| LAB-02 | Form đa dạng (UI Elements) | Web elements | ★ | input/radio/checkbox/select/date picker/slider/tooltip/upload | EP, pairwise | P0 |
| LAB-03 | Giỏ hàng & Checkout | E-commerce | ★★ | list, filter, state, tính tiền, data-driven | decision table, BVA, state | P0 |
| LAB-04 | Quản lý Todo/Task (CRUD) | Productivity | ★ | CRUD UI, hooks, reset data | CRUD, state | P1 |
| LAB-05 | Ngân hàng: chuyển tiền | Banking | ★★★ | multi-step form, OTP giả, API+UI, số tiền | BVA, decision table, state, security | P1 |
| LAB-06 | Đặt vé / Booking (rạp, khách sạn) | Travel | ★★ | date picker, seat map, timer, hết chỗ | state, pairwise, concurrency | P1 |
| LAB-07 | HR: Nghỉ phép & Duyệt đơn | HR | ★★ | role-based (employee/manager), workflow | state transition, permission matrix | P1 |
| LAB-08 | Bảng dữ liệu động (Admin table) | Admin | ★★ | sort/filter/pagination, dynamic table, row action | EP, filter combos | P1 |
| LAB-09 | Quản lý kho & đơn hàng | ERP | ★★★ | multi-page, API seed, import/export CSV | state, decision table | P1 |
| LAB-10 | Y tế: Đặt lịch khám | Healthcare | ★★ | calendar, slot, validation, a11y | BVA, state, a11y | P1 |
| LAB-11 | Hỗ trợ khách hàng (Ticket) | CRM | ★★ | file upload, rich-text, status flow, SLA timer | state, priority matrix | P1 |
| LAB-12 | Chat / Notification realtime | Realtime | ★★★ | websocket giả lập, auto-wait, polling, multi-context | multi-user, timing | P1 |
| LAB-13 | Tình huống khó (Playground) | Edge cases | ★★★ | iframe, shadow DOM, new tab, dialog, drag&drop, infinite scroll, canvas, download, delay | — | P1 |
| LAB-14 | Mock REST API (Books/Users) | API | ★★ | `request`, status, schema, auth token, pagination, error | contract, negative | P1 |
| LAB-15 | Dashboard & Biểu đồ | BI | ★★ | chart assertion, visual, filter date range | visual, data validation | P1 |
| LAB-16 | Đa ngôn ngữ & Responsive | i18n | ★★ | locale, emulation, viewport | compatibility | P1 |
| LAB-17 | Login Email OTP / Magic link | Auth nâng cao | ★★ | đọc email từ inbox API, poll, hết hạn OTP, gửi lại | state, timing, negative | P0 |
| LAB-18 | Login SMS OTP & 2FA TOTP | Auth nâng cao | ★★★ | đọc SMS giả, `otplib` tính TOTP, recovery code | state, security, BVA thời gian | P1 |
| LAB-19 | OAuth / Social login (GitHub/Google) | Third-party | ★★★ | popup, redirect, `storageState`, mock OAuth, consent | integration, negative (deny/cancel) | P1 |
| LAB-20 | Thanh toán Stripe test mode | Payment | ★★★ | iframe Stripe, thẻ test, 3DS, webhook, hoàn tiền | decision table (thẻ), state | P1 |
| LAB-21 | Xác minh DB sau khi gọi API | Data | ★★★ | API + `pg` SELECT so sánh, tenant_id, cleanup | contract, data integrity | P1 |
| LAB-22 | Webhook & Event (nhận callback bên thứ 3) | Integration | ★★★ | chờ webhook, idempotency, retry, chữ ký HMAC | contract, timing | P1 |
| LAB-23 | Gửi email giao dịch (Order confirm, Reset pass) | Notification | ★★ | đọc mail thật qua Mailtrap/mail.tm, assert nội dung/link | content, link | P1 |
| LAB-24 | CAPTCHA & Rate limit | Security | ★★★ | test key CAPTCHA, 429, backoff, mock | negative, security | P1 |
| LAB-25 | Upload file lên storage & CDN | Storage | ★★ | upload lớn/sai định dạng, tiến trình, kiểm tra URL | BVA kích thước, EP định dạng | P1 |
| LAB-26 | Phân quyền RBAC & Multi-tenant | Authorization | ★★★ | nhiều context/role, 403, IDOR | permission matrix, security | P1 |
| LAB-27 | Import/Export CSV & báo cáo | Reporting | ★★ | download, parse CSV, so sánh với UI/DB | data validation | P1 |
| LAB-28 | Lịch/Booking với múi giờ & Clock | Time | ★★★ | `page.clock`, timezone, DST, hết hạn | BVA thời gian, state | P1 |

---
## Mẫu mô tả 1 lab (template)
```
# LAB-xx Tên lab
## 1. Bối cảnh (câu chuyện kinh doanh)
## 2. Actor & quyền
## 3. Business Rules (BR-01…)
## 4. Luồng chính / ngoại lệ (flow)
## 5. Tài khoản & dữ liệu seed
## 6. Sơ đồ trạng thái (nếu có)
## 7. Test Case Workshop
   - Kỹ thuật gợi ý → bảng TC mẫu → ma trận BR×TC
## 8. Bài tập Playwright (Dễ → Khó) + tiêu chí đạt
## 9. Bug Toggle (BUG-01…, mô tả ẩn)
## 10. Đáp án mẫu (spec + POM)
```

## Chi tiết 3 lab MVP

### LAB-01 Login & Đăng ký
**Bối cảnh:** Cổng khách hàng của công ty bảo hiểm.
**BR mẫu:**
- BR-01 Email hợp lệ theo định dạng chuẩn, tối đa 254 ký tự.
- BR-02 Mật khẩu 8–32 ký tự, có hoa, thường, số, ký tự đặc biệt.
- BR-03 Sai mật khẩu 5 lần liên tiếp → khoá tài khoản 15 phút.
- BR-04 “Ghi nhớ đăng nhập” giữ phiên 7 ngày.
- BR-05 Đăng ký: email chưa tồn tại; phải tick đồng ý điều khoản.
- BR-06 Quên mật khẩu: link reset hiệu lực 10 phút, dùng 1 lần (giả lập hiển thị trong UI).
**TC mẫu (trích):**
| ID | Mô tả | Dữ liệu | Kỳ vọng | Loại |
|----|-------|---------|---------|------|
| TC-L-001 | Đăng nhập hợp lệ | user@lab.dev / Passw0rd! | Vào dashboard | Happy |
| TC-L-005 | Mật khẩu dài 7 ký tự | 7 ký tự | Lỗi “tối thiểu 8” | BVA |
| TC-L-006 | Mật khẩu dài 8 ký tự | 8 ký tự | Chấp nhận | BVA |
| TC-L-010 | Sai MK lần 5 | — | Tài khoản bị khoá, hiển thị đếm ngược | State |
| TC-L-015 | Nhập `<script>` ở email | XSS | Không thực thi, báo lỗi định dạng | Security |
**Bài tập:** (★) đăng nhập OK; (★★) data-driven 10 tổ hợp lỗi; (★★) dùng `storageState` tái sử dụng login; (★★★) test khoá tài khoản với `page.clock`.
**Bug gợi ý:** BUG-01 cho phép MK 7 ký tự; BUG-02 khoá sau 6 lần thay vì 5; BUG-03 thông báo lộ “email không tồn tại”.

### LAB-02 Form đa dạng
Bao phủ: text/number/email, radio, checkbox nhóm, dropdown (native + custom), multi-select, date picker, slider, toggle, tooltip, file upload, rich text, autocomplete, validation inline & submit.
**Bài tập:** điền toàn bộ form bằng POM; assert từng thông báo lỗi; upload nhiều file; chọn ngày trong date picker custom.

### LAB-03 Giỏ hàng & Checkout
**BR mẫu:**
- BR-01 Mỗi sản phẩm tối đa 10 và không vượt tồn kho.
- BR-02 Mã giảm `SALE10` giảm 10%, đơn tối thiểu 500.000đ, tối đa giảm 100.000đ.
- BR-03 Miễn phí ship khi tạm tính sau giảm giá ≥ 1.000.000đ; còn lại 30.000đ.
- BR-04 VAT 8% tính sau giảm giá, làm tròn đến đồng.
- BR-05 Hết hàng → không thêm được vào giỏ.
- BR-06 Trạng thái đơn: Mới → Đã thanh toán → Đang giao → Hoàn tất; Huỷ chỉ khi chưa giao.
**Kỹ thuật:** decision table (mã × ngưỡng × ship), BVA ở 499.999/500.000/500.001, state transition đơn hàng.
**Bài tập:** tính tổng tiền chính xác bằng data-driven; mock API tồn kho bằng `page.route`; tạo đơn bằng API rồi verify UI.
**Bug gợi ý:** làm tròn VAT sai, giảm giá vượt trần, huỷ được đơn đang giao.

## Nguyên tắc thiết kế lab
1. **Deterministic**: seed cố định, `?seed=`; reset nhanh.
2. **Phân cấp locator**: Dễ (testid/role đầy đủ) → Vừa (chỉ role/label) → Khó (class động, không id).
3. **Không cần backend ngoài**: Route Handlers + in-memory/session; client store phiên.
4. **Không dữ liệu thật**; domain giả lập (tên, thẻ test).
5. **Mỗi lab có spec đáp án chạy xanh** trong repo e2e của chính site.
6. **Bug toggle** tách khỏi logic chính qua feature flags.

## Nhóm lab tích hợp bên thứ 3 & kiểm tra dữ liệu (chi tiết)
Xem dịch vụ và cách cấu hình tại [06-integrations.md](06-integrations.md).

### LAB-17 Login Email OTP / Magic link
**Bối cảnh:** Ứng dụng ví điện tử chỉ cho đăng nhập bằng email, không dùng mật khẩu.
- BR-01 Nhập email → hệ thống gửi OTP 6 số, hiệu lực 5 phút.
- BR-02 Nhập sai OTP 3 lần → OTP bị huỷ, phải xin mã mới.
- BR-03 Gửi lại OTP: cách nhau tối thiểu 60 giây, tối đa 5 lần/giờ.
- BR-04 Magic link dùng một lần, hết hạn sau 10 phút.
- BR-05 Email chưa đăng ký vẫn trả thông báo trung tính (chống dò tài khoản).
**Chế độ mail:** `inbox=builtin` (hộp thư giả trong site, mặc định) hoặc `inbox=mailtrap` / `inbox=mailtm` (thật).
**Kỹ năng:** helper `getLatestOtp(email)` có polling + timeout; `expect.poll`; fixture `mailbox`; `page.clock` để test hết hạn 5 phút.
**Bài tập:** (★★) login OTP happy path; (★★) OTP hết hạn; (★★★) gửi lại quá giới hạn; (★★★) magic link mở ở context khác.
**Bug gợi ý:** OTP dùng lại được; OTP cũ vẫn hợp lệ sau khi xin mã mới; resend không giới hạn.

### LAB-18 SMS OTP & 2FA TOTP
- BR-01 Bật 2FA bằng quét QR (secret base32), xác nhận bằng mã TOTP 6 số, chu kỳ 30s.
- BR-02 Chấp nhận lệch ±1 chu kỳ.
- BR-03 Tạo 10 recovery code, mỗi mã dùng một lần.
- BR-04 SMS OTP gửi vào hộp SMS giả `/lab/inbox/sms`.
**Kỹ năng:** `otplib` tính mã trong test, đọc secret từ UI, test ranh giới 30s.

### LAB-19 OAuth / Social login
Tạo hai chế độ: **Fake IdP** (trang đồng ý giả trong site, ổn định) và **GitHub/Google thật** (chỉ để quan sát luồng).
- Test: popup/redirect, nút Cho phép/Từ chối, token hết hạn, tài khoản liên kết trùng email.
- Bài học then chốt: không automate đăng nhập Google/GitHub thật trong CI → dùng `storageState` hoặc Fake IdP.

### LAB-20 Thanh toán Stripe test mode
- Thẻ test: `4242…` thành công, `4000 0000 0000 0002` bị từ chối, `4000 0025 0000 3155` yêu cầu 3DS.
- Kỹ năng: `frameLocator` cho Stripe Elements, chờ webhook cập nhật đơn, hoàn tiền một phần/toàn phần.
- Kỹ thuật: decision table (loại thẻ × số tiền × kết quả), state đơn (Pending → Paid → Refunded).

### LAB-21 Xác minh DB sau khi gọi API (DB assertion)
**Bối cảnh:** API quản lý đơn hàng; mỗi lệnh ghi phải phản ánh đúng vào DB.
- Người học nhận `tenant_id` và **read-only connection string**; ghi dữ liệu chỉ đi qua API.
- Kịch bản: `POST /orders` → 201 → `SELECT` bảng `orders`, `order_items`, `audit_log` xác nhận số dòng, tổng tiền, trạng thái, `created_at`.
- Kiểm tra: tính nhất quán (không ghi nửa chừng khi lỗi, transaction rollback), soft delete, trigger audit, unique constraint (409).
- Kỹ năng: fixture `db` dùng `pg`, `test.afterEach` dọn theo `tenant_id`, so sánh API ↔ DB ↔ UI (ba nguồn).
**Bug gợi ý:** API trả 200 nhưng không ghi DB; ghi trùng khi retry (thiếu idempotency key); tổng tiền DB lệch so với response.

### LAB-22 Webhook & Event
- Hệ thống giả lập đối tác gọi `POST /api/lab/webhook` kèm chữ ký HMAC-SHA256.
- BR: chữ ký sai → 401; sự kiện trùng `event_id` → xử lý một lần; đối tác retry theo backoff khi nhận 5xx.
- Kỹ năng: tạo request ký HMAC trong test, `expect.poll` kết quả bất đồng bộ, kiểm DB.

### LAB-23 Email giao dịch
Kiểm tra email đơn hàng/reset mật khẩu: tiêu đề, người nhận, nội dung động, link, định dạng tiền, ngôn ngữ; mở link trong email bằng Playwright.

### LAB-26 RBAC & multi-tenant
Vai trò Admin/Manager/Staff/Guest; ma trận quyền; thử IDOR (đổi id trong URL/API) phải nhận 403/404; dùng nhiều `browserContext` cho nhiều người dùng cùng lúc.

## Độ phủ kỹ năng theo lab (rà soát)
| Kỹ năng | Lab |
|---------|-----|
| Locator, action, assertion cơ bản | LAB-01, 02, 04 |
| Dữ liệu động, bảng, phân trang | LAB-08, 09, 27 |
| Đa người dùng / multi-context | LAB-12, 26 |
| API testing | LAB-14, 21, 22 |
| DB verification | LAB-21, 22, 27 |
| Email / SMS / OTP / TOTP | LAB-01, 17, 18, 23 |
| Bên thứ 3 (OAuth, Stripe, CAPTCHA, webhook) | LAB-19, 20, 22, 24 |
| Thời gian (clock, timezone) | LAB-01, 17, 28 |
| Visual / a11y / i18n | LAB-15, 16, 10 |
| Security cơ bản | LAB-01, 24, 26 |

## Trạng thái triển khai
| Lab | Slug | Trạng thái |
|-----|------|-----------|
| LAB-01 Login & Đăng ký | `/lab/login` | Đã làm (BR, bug toggle, bài tập, test case) |
| LAB-02 Form đa dạng | `/lab/forms` | Đã làm |
| LAB-03 Giỏ hàng & Checkout | `/lab/cart` | Đã làm |
| LAB-04 Quản lý công việc (CRUD) | `/lab/todo` | Đã làm |
| LAB-08 Bảng dữ liệu động | `/lab/table` | Đã làm (tìm kiếm, lọc, sắp xếp, phân trang, chọn nhiều, CSV) |
| LAB-13 Tình huống khó (Playground) | `/lab/playground` | Đã làm (dialog, tab mới, iframe, shadow DOM, kéo thả, tải trễ, cuộn vô hạn, tải xuống) |
| LAB-14 Mock REST API (Sách) | `/lab/api`, `/api/lab/*` | Đã làm (trạng thái theo cookie, 401/403/409/422, bug toggle) |
| LAB-17 Đăng nhập Email OTP | `/lab/otp`, `/lab/inbox` | Đã làm (hộp thư giả, page.clock, bug toggle) |
| LAB-05..07, 09..12, 15, 16, 18..28 | — | Chưa làm; các lab cần dịch vụ bên ngoài (OAuth, Stripe, DB, email thật) phụ thuộc mô hình BYO |

### Quy tắc kỹ thuật của trang lab
- `/lab/<slug>` là **ứng dụng thuần**: không header, không thanh tìm kiếm của site (chỉ một liên kết quay lại ở layout lab) để locator của người học không bị trùng.
- Business rule, test case mẫu, bài tập và đáp án nằm ở `/labs/<slug>` (nhóm route `(site)`).
