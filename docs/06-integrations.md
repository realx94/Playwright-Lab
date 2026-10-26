# Tích hợp bên thứ 3 & Dịch vụ cần đăng ký

Nguyên tắc: **mọi lab có chế độ mặc định chạy 100% trong site (chi phí 0, ổn định)** và chế độ nâng cao dùng dịch vụ thật. Gói free của các dịch vụ có thể thay đổi, cần kiểm tra lại khi đăng ký.

> **Quyết định mới nhất (ưu tiên hơn các mục bên dưới):** triển khai **mock-first**. Tầng A (built-in) là phạm vi hiện tại; không build Supabase, BYO Setup Wizard, kho khoá mã hoá hay trang hướng dẫn đăng ký. Ngoại lệ: **email/OTP gửi thật** (qua Resend free, người học tự dán API key; key lưu trong trình duyệt và đi kèm từng request qua server proxy, server không lưu; Fake Inbox là chế độ dự phòng/CI). TOTP/2FA tính hoàn toàn trong code. Tầng B khác chỉ làm sau, và chỉ với dịch vụ xác nhận được đăng ký miễn phí (ví dụ Mailtrap, Stripe test mode). Cần kiểm tra lại giới hạn gói free của Resend/Brevo/Mailtrap trước khi viết hướng dẫn đăng ký. Các mục 6–8 giữ lại làm thiết kế tham khảo cho tầng B.

## 1. Chiến lược 2 tầng
| Tầng | Mô tả | Dùng khi |
|------|-------|----------|
| **A – Built-in (mặc định)** | Fake Inbox (email + SMS), Fake IdP (OAuth), Fake Payment, Fake Webhook sender; dữ liệu lưu ở trình duyệt/DB lab | Học, CI, hướng dẫn từng bước |
| **B – Thật** | Gọi dịch vụ thật ở chế độ test/sandbox | Luyện tích hợp thực tế, quan sát độ trễ/lỗi thật |

Chọn bằng tham số `?mode=builtin|real` hoặc cấu hình trong panel của lab.

## 2. Danh sách dịch vụ đề xuất
| Nhu cầu | Dịch vụ | Việc phải làm | Biến môi trường |
|---------|---------|---------------|-----------------|
| Gửi email thật | **Resend** (chính) | Tạo tài khoản, API key; có domain thì xác thực DNS để gửi người khác | `RESEND_API_KEY`, `MAIL_FROM` |
| Gửi email dự phòng | **Brevo** (SMTP) | Tạo tài khoản, SMTP key | `BREVO_SMTP_USER`, `BREVO_SMTP_KEY` |
| Hộp thư sandbox có API đọc mail | **Mailtrap** (Email Sandbox) | Tạo inbox, lấy API token + inbox id | `MAILTRAP_API_TOKEN`, `MAILTRAP_INBOX_ID` |
| Hộp thư dùng một lần cho test | **mail.tm** | Không cần đăng ký; API công khai | — |
| SMS | Không dùng nhà mạng thật | Fake SMS inbox trong site | — |
| TOTP/2FA | `otplib` | Cài package | — |
| OAuth GitHub | **GitHub OAuth App** | Settings → Developer settings; callback `https://<site>/api/auth/callback/github` | `GITHUB_ID`, `GITHUB_SECRET` |
| OAuth Google | **Google Cloud OAuth client** | Tạo OAuth consent + client id | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| Thanh toán | **Stripe** (test mode) | Lấy publishable/secret key test, tạo webhook endpoint | `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PK`, `STRIPE_WEBHOOK_SECRET` |
| Thanh toán thay thế | PayPal Sandbox | Tạo app sandbox | `PAYPAL_CLIENT_ID`, `PAYPAL_SECRET` |
| CAPTCHA | **Cloudflare Turnstile** hoặc reCAPTCHA (key test) | Key test công khai, key thật tuỳ chọn | `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET` |
| Database lab | **Neon** (Postgres) hoặc **Turso** (SQLite) | Tạo project, 2 role: `lab_writer`, `lab_reader` (chỉ SELECT) | `DATABASE_URL`, `DATABASE_URL_READONLY` |
| Lưu file | **Cloudinary** hoặc Supabase Storage | Tạo bucket/cloud | `CLOUDINARY_URL` |
| Bắt webhook từ site ra ngoài | **webhook.site** | Không cần đăng ký | — |
| Mock dịch vụ ngoài | MSW (trong site), Mockoon (local) | Cài package | — |

> Bảng này là danh sách **người học** đăng ký (BYO, mục 6). Chủ site không phải đăng ký dịch vụ nào cho MVP.

## 3. Thiết kế Database Lab (LAB-21, 22, 27)
- **BYO:** mỗi người học dùng Neon/Turso của mình; Setup Wizard tạo schema mẫu: `orders`, `order_items`, `payments`, `users`, `audit_log`, `webhook_events`, `otp_codes`, `emails_outbox`.
- API của lab (proxy) ghi vào DB của người học bằng connection string họ cấp; test của họ `SELECT` trực tiếp bằng `pg`.
- Nếu chưa cấu hình: chế độ built-in dùng DB trong trình duyệt (SQLite WASM/IndexedDB) và trang “DB Inspector” chỉ-đọc để luyện tư duy so sánh.
- **Bug Toggle** có thể bật hành vi sai ở tầng API/DB (ghi thiếu, tổng tiền lệch, không rollback).

## 4. Fake Inbox (email/SMS) – tầng A
- Trang xem: `/lab/inbox` (giao diện giống webmail: danh sách, nội dung, link).
- API cho test: `GET /api/lab/inbox?tenant=<id>&to=<email>`, `DELETE` để dọn.
- Mọi email/SMS do lab “gửi” được ghi vào bảng `emails_outbox` (theo `tenant_id`) rồi hiển thị.
- Tầng B: cùng nội dung được gửi thêm qua Resend/Brevo tới địa chỉ người học nhập (chỉ khi có domain đã xác thực), hoặc tới Mailtrap sandbox.

## 5. Dạy gì về “test bên thứ 3”
1. **Không phụ thuộc dịch vụ thật trong CI**: dùng sandbox/mock; hiểu khi nào mock, khi nào chạy thật.
2. **Polling có điều kiện**: `expect.poll`, `expect(...).toPass()` với timeout hợp lý thay cho `sleep`.
3. **Tách lớp**: fixture `mailbox`, `db`, `idp`, `stripe` trong `fixtures/`.
4. **Dữ liệu cô lập**: mỗi test dùng email/`tenant_id` riêng để chạy song song.
5. **Mock ở mức mạng**: `page.route`, `context.route`, HAR replay.
6. **Bảo mật khoá**: `.env`, secrets trong GitHub Actions, không commit khoá.
7. **Chống flaky**: retry hợp lý, idempotent, dọn dữ liệu trước/sau.

## 6. BYO Services – mỗi người học tự thiết lập dịch vụ của mình (quyết định đã chốt)
Chủ site **không cần đăng ký dịch vụ trả phí hay domain**. Người học muốn dùng tầng B thì tự tạo tài khoản free và nhập khoá vào trang **Cài đặt → Dịch vụ của tôi**.

| Tầng | Ai chuẩn bị | Ghi chú |
|------|-------------|---------|
| A – Built-in | Site cung cấp | Mặc định, không cần cấu hình |
| B – BYO | Người học | Neon/Turso, Resend/Mailtrap/Brevo, Stripe test, GitHub/Google OAuth, Cloudinary… |

### Setup Wizard (mỗi dịch vụ)
1. Giải thích dịch vụ để làm gì + thời gian cài (2–5 phút).
2. Hướng dẫn từng bước có ảnh: tạo tài khoản → lấy key → cấp quyền tối thiểu.
3. Form nhập khoá (shadcn `Form`, ẩn giá trị, nút hiện/ẩn).
4. Nút **Test connection** (gọi proxy, báo OK/lỗi cụ thể).
5. Với DB: nút **Tạo schema mẫu** chạy migration (`orders`, `order_items`, `audit_log`…) trên Neon của người học; hiển thị connection string để dùng trong test.
6. Trạng thái: Chưa cấu hình / Đã kết nối / Lỗi; lab hiện cảnh báo nếu thiếu dịch vụ cần thiết và gợi ý chuyển về built-in.

### Lưu & bảo mật khoá (đã chốt: lưu server, mã hoá)
Người học **đăng nhập** (Supabase Auth: GitHub/Google) → khoá được lưu trong bảng `user_service_credentials` của Supabase, **luôn ở dạng mã hoá**.

- **Mã hoá:** envelope encryption, AES-256-GCM. Mỗi bản ghi có `iv`, `auth_tag`, `key_version`. Master key nằm ở biến môi trường server (`CREDENTIAL_MASTER_KEY`, hỗ trợ xoay vòng bằng `key_version`); có thể dùng Supabase Vault thay thế.
- **Giải mã chỉ ở server**, trong Route Handler (Node runtime), ngay khi gọi dịch vụ; không bao giờ trả khoá đầy đủ về client (UI chỉ hiện `****abcd`; sửa = nhập lại).
- **Bảo vệ truy cập:** bật Row Level Security (`user_id = auth.uid()`); client không có quyền đọc cột đã mã hoá, chỉ server dùng service role.
- **Không log** header/body chứa khoá; ẩn khoá khỏi error trace; không đưa vào URL.
- **Proxy (`/api/byo/*`)**: chỉ cho phép host trong allowlist (api.resend.com, mailtrap.io, *.neon.tech, api.stripe.com…), chặn IP nội bộ/localhost (SSRF), timeout, giới hạn kích thước, rate limit theo user.
- **Quyền người học:** nút **Xoá khoá**, **Xoá tài khoản + toàn bộ dữ liệu**, xem lần dùng gần nhất (`last_used_at`).
- **Minh bạch:** vì master key do chủ site giữ nên chủ site về kỹ thuật có thể giải mã. Trang Cài đặt ghi rõ điều này, kèm khuyến cáo: chỉ dùng khoá **free/sandbox/quyền tối thiểu**, không nhập dữ liệu thật hay khoá production; rotate khi học xong.
- **Chưa đăng nhập:** vẫn dùng được khoá lưu tạm trong trình duyệt (IndexedDB) cho phiên đó, hoặc dùng tầng built-in.

### Hệ quả cho các lab
- LAB-21/22/27: dùng **Neon của chính người học** → bỏ DB dùng chung, cron dọn dữ liệu, role chỉ-đọc công khai.
- LAB-17/23: Resend của người học gửi mail tới chính họ (không cần domain); hoặc Mailtrap/mail.tm.
- LAB-19/20: OAuth app và Stripe test key của người học; callback `https://<site>/api/auth/callback/*` dùng chung, `redirect_uri` cấu hình theo site.
- Starter repo đọc cấu hình từ `.env` (có nút “Xuất .env” từ trang Cài đặt, khoá không bao giờ bị commit).

## 7. Cập nhật kiến trúc (hệ quả)
- Bỏ ngoại lệ “DB dùng chung của chủ site”; thay bằng BYO DB. Chủ site không cần đăng ký dịch vụ nào cho MVP.
- Route Handlers dùng runtime Node (không Edge) cho `pg`/Stripe SDK; dùng driver `@neondatabase/serverless` khi phù hợp.
- **Supabase (free) là bắt buộc từ khi làm BYO:** Auth + bảng `user_service_credentials` + lịch sử học đồng bộ. Cần lưu ý free project bị tạm dừng nếu không hoạt động ~1 tuần: thêm cron ping (GitHub Actions) giữ hoạt động.
- Dữ liệu học vẫn local-first; đăng nhập chỉ bật khi dùng BYO hoặc muốn đồng bộ.

## 8. Tài liệu hướng dẫn đăng ký (step-by-step, có hình)
Mỗi dịch vụ một bài trong `src/content/guides/<service>.mdx`, ảnh trong `public/guides/<service>/NN-mo-ta.png`.

**Template bài hướng dẫn:**
1. Dịch vụ này làm gì & vì sao lab cần (2–3 câu) · thời gian ~X phút · chi phí (free tier + giới hạn).
2. Chuẩn bị (email, thẻ? – ghi rõ có cần thẻ không).
3. Các bước đánh số, **mỗi bước 1 ảnh** có khoanh đỏ/mũi tên vị trí cần bấm, ghi chú điều cần copy.
4. Cách lấy key & **quyền tối thiểu** cần cấp.
5. Dán key vào site → Test connection → kết quả mong đợi (ảnh).
6. Lỗi thường gặp (bảng: triệu chứng → nguyên nhân → cách xử lý).
7. Cách thu hồi/xoá key khi học xong.
8. Từ khoá hỏi Google AI.

**Danh sách hướng dẫn:**
| ID | Hướng dẫn | Ưu tiên |
|----|-----------|---------|
| G-01 | Tạo tài khoản & project **Neon**, lấy connection string, chạy schema mẫu | P1 |
| G-02 | Tạo tài khoản **Resend**, tạo API key, gửi mail thử cho chính mình | P1 |
| G-03 | **Mailtrap** Email Sandbox: tạo inbox, lấy API token & inbox id | P1 |
| G-04 | **mail.tm** (không cần đăng ký) dùng trong test | P1 |
| G-05 | **GitHub OAuth App** (callback URL, client id/secret) | P1 |
| G-06 | **Google OAuth** (consent screen, client id/secret, test users) | P1 |
| G-07 | **Stripe test mode**: key, thẻ test, webhook endpoint | P1 |
| G-08 | **Turnstile/reCAPTCHA** test key | P2 |
| G-09 | **Brevo SMTP** | P2 |
| G-10 | **Cloudinary** | P2 |
| G-11 | Đăng nhập site & hiểu cách khoá được bảo vệ | P1 |

**Quy trình sản xuất hướng dẫn:** chụp màn hình tài khoản test (che email/key bằng blur) → tối ưu ảnh (WebP, ≤ 200KB) → viết MDX → chạy thử theo đúng hướng dẫn trên tài khoản mới (“fresh run”) → gắn ngày kiểm tra cuối `verifiedAt` vì giao diện dịch vụ hay đổi → nhắc cập nhật mỗi quý. Đề xuất: viết kịch bản chụp ảnh bằng chính Playwright để dễ chụp lại khi giao diện đổi (chỉ với trang không cần che dữ liệu nhạy cảm).
