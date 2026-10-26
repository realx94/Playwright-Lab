# PRD – Playwright Lab

## 1. Tổng quan
**Playwright Lab** là website học Playwright (TypeScript) theo hướng *learn-by-doing*. Mỗi bài học gồm 4 bước xuyên suốt:

1. **Hiểu bài toán** – mô tả nghiệp vụ, rule, luồng người dùng.
2. **Thiết kế test case** – kỹ thuật (EP, BVA, decision table, state transition…), bảng test case mẫu.
3. **Thực hành Playwright** – viết script chạy trên *Lab App* có sẵn trong chính website.
4. **Kiểm tra & Review** – checklist, so sánh với đáp án mẫu, bài tập nâng cao.

## 2. Vấn đề
- QA mới thiếu môi trường an toàn để luyện automation (site thật hay đổi, bị chặn bot, không có bug có chủ đích).
- Tài liệu rời rạc: học Playwright nhưng thiếu tư duy **thiết kế test case** và **hiểu nghiệp vụ**.
- Khó tự học: không biết thuật ngữ (DOM, async/await, fixture, POM…) → cần giải thích ngay tại chỗ.

## 3. Mục tiêu
| Mục tiêu | Chỉ số (KPI) |
|----------|-------------|
| QA đi từ 0 đến viết được framework Playwright hoàn chỉnh | ≥ 60% học viên hoàn thành Level 1–4 |
| Lab đủ rộng nghiệp vụ | ≥ 12 domain lab ở v1.0 |
| Giải thích kiến thức dễ hiểu | ≥ 90% bài có phần “Giải thích như cho người mới” + từ khoá hỏi AI |
| Trải nghiệm tốt | Lighthouse ≥ 90, LCP < 2.5s |

## 4. Đối tượng
| Persona | Mô tả | Nhu cầu |
|---------|-------|---------|
| **Manual QA chuyển automation** | 1–3 năm manual, chưa biết code | Lộ trình từ JS/TS cơ bản, giải thích dễ hiểu |
| **Fresher / SV** | Chưa có kinh nghiệm test | Học tư duy test + công cụ |
| **Automation QA muốn nâng cấp** | Biết Selenium/Cypress | API test, fixture, CI/CD, BDD, visual test |
| **Mentor / Trainer** | Dạy nhóm | Giao bài, xem tiến độ, tái sử dụng lab |

## 5. Phạm vi
### In scope (v1.0)
- Site học: lộ trình, bài học MDX, quiz, bài tập, theo dõi tiến độ.
- **Lab App**: các mini-app nghiệp vụ nằm trong cùng website (route `/lab/*`), có chủ đích gắn **bug có thể bật/tắt**, **selector tình huống** (iframe, shadow DOM, dialog, dynamic table…).
- **Mock API** (Next.js Route Handlers) phục vụ API testing.
- Tính năng “**Bôi đen → Hỏi AI**”: bôi đen thuật ngữ → mở Google (AI Mode) với prompt dựng sẵn để giải thích.
- Code playground: xem snippet, copy, tải starter project (repo template).
- Deploy Vercel / Netlify.

### Out of scope (v1.0)
- Chạy Playwright trực tiếp trên trình duyệt người học (cần runner) → xem P2 “Cloud runner”.
- Thanh toán, chứng chỉ có giá trị pháp lý.
- Chấm điểm tự động code của học viên (P2).

## 6. Yêu cầu chức năng
| ID | Yêu cầu | Ưu tiên |
|----|---------|---------|
| FR-01 | Trang chủ, giới thiệu, lộ trình 6 level | P0 |
| FR-02 | Danh sách khoá/bài, điều hướng sidebar, breadcrumb, tìm kiếm | P0 |
| FR-03 | Trang bài học render MDX: lý thuyết, ví dụ code (syntax highlight, copy), callout, hình minh hoạ | P0 |
| FR-04 | Mỗi bài có mục **Kiến thức cần nắm** + **Giải thích dễ hiểu** + **Từ khoá hỏi AI** | P0 |
| FR-05 | **Bôi đen văn bản → popover “Hỏi Google AI”** mở tab mới với prompt (`https://www.google.com/search?udm=50&q=...` hoặc fallback search thường) | P0 |
| FR-06 | Lab App: ≥ 12 domain, mỗi lab gồm đề bài, Business Rules, tài khoản test, trang app | P0 (3 lab) / P1 (12 lab) |
| FR-07 | Mỗi lab có **Test Case Workshop**: bảng test case mẫu, template, gợi ý kỹ thuật thiết kế | P0 |
| FR-08 | **Bug Toggle**: bật bug có chủ đích (query `?bugs=...` hoặc panel) để học viên “bắt” bug bằng automation | P1 |
| FR-09 | Mock REST API + Swagger/OpenAPI page cho API testing | P1 |
| FR-10 | Quiz trắc nghiệm cuối bài, giải thích đáp án | P1 |
| FR-11 | Bài tập có đề, tiêu chí đạt, đáp án mẫu (ẩn/hiện) | P0 |
| FR-12 | Lưu lịch sử học & kết quả quiz/bài tập (IndexedDB, local-first), trang Thống kê, Export/Import JSON | P0 (lưu) / P1 (thống kê) |
| FR-13 | Starter repo template (Playwright + TS + POM + fixture + CI) tải/clone | P0 |
| FR-14 | Dark/Light mode, responsive | P0 |
| FR-15 | Trang “Cheat sheet” (locator, assertion, CLI, config) | P1 |
| FR-16 | Glossary thuật ngữ, link ngược về bài học | P1 |
| FR-17 | Đăng nhập (Supabase, tuỳ chọn), đồng bộ lịch sử qua `StorageAdapter`, bảng điều khiển Mentor | P2 |
| FR-18 | Cloud runner chạy script học viên | P2 |
| FR-19 | **BYO Services**: trang Dịch vụ của tôi, wizard, Test connection, đăng nhập Supabase, khoá lưu server dạng mã hoá (AES-GCM, RLS), proxy allowlist, hướng dẫn step-by-step có ảnh | P1 |
| FR-20 | Fake Inbox (email/SMS), Fake IdP, Fake Payment, DB Inspector built-in làm chế độ mặc định của lab tích hợp | P1 |

## 7. Yêu cầu phi chức năng
| ID | Yêu cầu |
|----|---------|
| NFR-01 | Next.js (App Router) + TypeScript; Tailwind CSS; **ưu tiên component shadcn/ui** |
| NFR-02 | Deploy được trên Vercel và Netlify, chi phí gần 0: không Redis/DB server; state lab + lịch sử học lưu ở trình duyệt (IndexedDB) |
| NFR-03 | Lab App **ổn định, deterministic**: có nút Reset data, seed cố định, không phụ thuộc mạng ngoài |
| NFR-04 | Lab dễ automate: dùng `data-testid`, ARIA role/label chuẩn; riêng lab “khó” có chủ đích dùng selector xấu |
| NFR-05 | A11y WCAG AA cho site học |
| NFR-06 | Nội dung tiếng Việt, thuật ngữ kỹ thuật giữ tiếng Anh |
| NFR-07 | SEO cơ bản (metadata, sitemap, OG) |
| NFR-08 | Dữ liệu học local-first; dữ liệu tài khoản (email, khoá mã hoá) chỉ lưu khi người học đăng nhập để dùng BYO |
| NFR-10 | Chủ site không phải trả phí dịch vụ ngoài; dịch vụ bên thứ 3 do người học tự đăng ký (BYO); khoá chỉ lưu trên server ở dạng mã hoá, không log, không trả về client |
| NFR-09 | Mọi truy cập lưu trữ qua `StorageAdapter` để thay LocalAdapter bằng Supabase mà không sửa UI |

## 8. Cấu trúc nội dung 1 bài học (template)
1. Mục tiêu bài học
2. Kiến thức cần nắm (checklist)
3. Giải thích dễ hiểu (ví dụ đời thường → kỹ thuật)
4. Demo code
5. Lab thực hành + link `/lab/...`
6. Thiết kế test case (nếu bài nghiệp vụ)
7. Lỗi thường gặp / Best practice
8. Quiz + Bài tập + Đáp án
9. Từ khoá để hỏi Google AI

## 9. Roadmap
| Giai đoạn | Nội dung |
|-----------|----------|
| **MVP (M1)** | Site khung, Level 0–2, 3 lab (Login, Todo/Form, E-commerce cart), AI-highlight, starter repo |
| **v0.5 (M2)** | Level 3–4 (POM, API), +4 lab, quiz, tiến độ localStorage |
| **v1.0 (M3)** | Level 5 (CI/CD, BDD, visual…), 12 lab, bug toggle, cheat sheet, glossary |
| **v1.x** | Auth, mentor dashboard, cloud runner, chấm bài tự động |

## 10. Rủi ro
| Rủi ro | Giảm thiểu |
|--------|-----------|
| Lab bị chạy test song song làm vỡ state | State hoàn toàn ở client (mỗi browser context riêng); nút Reset; API stateless |
| Mất dữ liệu khi xoá cache/đổi máy | Export/Import JSON, nhắc sao lưu; Supabase sync ở P2 |
| Google đổi tham số AI Mode | Prompt builder tách riêng, có fallback tìm kiếm thường |
| Nội dung nhiều, tốn công | Template MDX + ưu tiên P0 trước |
| Sao chép nội dung khoá khác | Chỉ tham khảo khung; tự viết nội dung |
