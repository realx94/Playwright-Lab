# User Stories

Định dạng: **Là một `<persona>`, tôi muốn `<mục tiêu>` để `<giá trị>`.** + Acceptance Criteria (AC).
Persona: **L** = Learner (QA), **M** = Mentor, **A** = Admin/Content author.

## Tổng quan Epic
| Epic | Tên | Ưu tiên |
|------|-----|---------|
| EP-01 | Khám phá & lộ trình học | P0 |
| EP-02 | Đọc bài học & giải thích kiến thức | P0 |
| EP-03 | Hỏi AI từ văn bản bôi đen | P0 |
| EP-04 | Lab App nghiệp vụ | P0 |
| EP-05 | Thiết kế test case (Test Case Workshop) | P0 |
| EP-06 | Thực hành Playwright & bài tập | P0 |
| EP-07 | API testing lab | P1 |
| EP-08 | Bug hunting | P1 |
| EP-09 | Quiz, tiến độ, thành tích | P1 |
| EP-10 | Tra cứu (Cheat sheet, Glossary, Search) | P1 |
| EP-11 | Starter repo, CI/CD & nâng cao | P0/P1 |
| EP-12 | Mentor & tài khoản | P2 |
| EP-13 | Nội dung & vận hành | P0 |
| EP-14 | Giao diện, hiệu năng, a11y, deploy | P0 |
| EP-15 | Lịch sử học & thống kê | P0/P1 |
| EP-16 | Dịch vụ của tôi (BYO Services) & hướng dẫn đăng ký | P1 |

---

## EP-01 Khám phá & lộ trình học
**US-01.01 (P0)** – Là L, tôi muốn xem trang chủ nêu rõ mục tiêu “Zero to Hero” và lộ trình để biết bắt đầu từ đâu.
- AC: có CTA “Bắt đầu học”; hiển thị 6 level với số bài & thời lượng ước tính.

**US-01.02 (P0)** – Là L, tôi muốn xem danh sách level/bài với trạng thái (chưa học/đang học/xong) để theo dõi.
- AC: sidebar cây bài học; highlight bài hiện tại; có nút Bài trước/Bài sau.

**US-01.03 (P1)** – Là L, tôi muốn làm bài *placement test* ngắn để được gợi ý level phù hợp.
- AC: 10 câu; kết quả đề xuất level 0–3; có thể bỏ qua.

**US-01.04 (P0)** – Là L, tôi muốn lọc lab theo domain/độ khó/kỹ năng để chọn bài luyện đúng nhu cầu.
- AC: filter đa chọn; hiển thị tag (Form, Table, iframe, API…).
- Đã làm: `/labs` xếp theo độ khó (Dễ → Vừa → Khó) rồi theo mã lab, chia nhóm có tiêu đề; lọc đa chọn theo độ khó và domain, ô tìm theo tên/kỹ năng (không phân biệt hoa thường và dấu), nút Xoá bộ lọc, đếm số lab hiển thị.

## EP-02 Đọc bài học & giải thích kiến thức
**US-02.01 (P0)** – Là L, tôi muốn bài học có mục tiêu và checklist kiến thức để biết cần nắm gì.
- AC: mỗi bài có “Kiến thức cần nắm” (3–8 mục).

**US-02.02 (P0)** – Là L, tôi muốn giải thích bằng ví dụ đời thường rồi mới đến kỹ thuật để dễ hiểu.
- AC: mục “Giải thích dễ hiểu” có ví dụ ẩn dụ + ví dụ code ngắn.

**US-02.03 (P0)** – Là L, tôi muốn code block có highlight và nút copy để thử ngay.
- AC: hỗ trợ ts, js, bash, json, gherkin; copy 1 click; toast “Đã copy”.

**US-02.04 (P1)** – Là L, tôi muốn xem sơ đồ/hình minh hoạ (DOM tree, kiến trúc POM, flow CI) để hình dung.
- AC: ảnh/SVG/Mermaid hiển thị tốt cả dark/light.

**US-02.05 (P1)** – Là L, tôi muốn có “Lỗi thường gặp” để tránh sai lầm phổ biến (flaky, wait cứng…).

## EP-03 Hỏi AI từ văn bản bôi đen
**US-03.01 (P0)** – Là L, tôi muốn bôi đen một thuật ngữ trong bài để hiện popover “Hỏi Google AI” và nhận giải thích.
- AC: chọn 2–200 ký tự → popover gần vùng chọn; click mở tab mới Google AI Mode với prompt “Giải thích cho người mới học QA automation: «<text>». Có ví dụ Playwright/TypeScript”; có fallback search thường.
- AC: hoạt động mobile (long-press) và phím tắt `Ctrl+Shift+A`.

**US-03.02 (P0)** – Là L, tôi muốn các từ khoá cuối bài là link “Hỏi AI” sẵn để đào sâu.
- AC: mỗi từ khoá là nút mở Google với prompt dựng sẵn.

**US-03.03 (P1)** – Là L, tôi muốn chọn kiểu giải thích (ELI5 / ví dụ code / so sánh với Selenium / câu hỏi phỏng vấn) để phù hợp trình độ.
- AC: dropdown trong popover; ghi nhớ lựa chọn.

**US-03.04 (P2)** – Là L, tôi muốn lưu lại các từ đã hỏi vào “Sổ tay của tôi”.

## EP-04 Lab App nghiệp vụ
**US-04.01 (P0)** – Là L, tôi muốn mỗi lab có trang mô tả bài toán (bối cảnh, actor, business rules, luồng) để hiểu trước khi test.
- AC: gồm Context, User Roles, Business Rules (đánh số BR-xx), Flow, Out-of-scope, tài khoản test.

**US-04.02 (P0)** – Là L, tôi muốn mở ứng dụng lab chạy ngay trên website (không cần cài backend) để viết test chạy trên URL ổn định.
- AC: route `/lab/<domain>`; có URL base dùng cho `baseURL` trong config.

**US-04.03 (P0)** – Là L, tôi muốn nút **Reset data** để đưa lab về trạng thái ban đầu trước mỗi lần chạy.
- AC: reset < 1s; hỗ trợ gọi qua API `POST /api/lab/<domain>/reset` để dùng trong `beforeEach`.

**US-04.04 (P0)** – Là L, tôi muốn các lab có `data-testid`/role chuẩn ở cấp “Dễ” để học locator đúng cách.

**US-04.05 (P1)** – Là L, tôi muốn lab cấp “Khó” có tình huống thực tế: iframe, shadow DOM, popup, new tab, dialog, dynamic table, infinite scroll, loading delay, drag & drop, upload/download, date picker, canvas.

**US-04.06 (P1)** – Là L, tôi muốn đặt độ trễ/ngẫu nhiên có kiểm soát (`?delay=2000`, `?seed=1`) để luyện auto-wait và xử lý flaky.

**US-04.07 (P0)** – Là L, tôi muốn có đủ domain nghiệp vụ đa dạng (xem [Lab Catalog](04-lab-catalog.md)) để mở rộng tư duy.

## EP-05 Thiết kế test case (Test Case Workshop)
**US-05.01 (P0)** – Là L, tôi muốn học các kỹ thuật thiết kế test (EP, BVA, decision table, state transition, pairwise, use-case) với ví dụ trên lab để tạo test case chất lượng.
- AC: mỗi kỹ thuật có bài riêng + ví dụ áp vào một lab.

**US-05.02 (P0)** – Là L, tôi muốn xem bảng test case mẫu (ID, tiền điều kiện, bước, dữ liệu, kết quả mong đợi, ưu tiên, loại) để đối chiếu.
- AC: hiển thị dạng bảng shadcn; có nút “Ẩn/Hiện đáp án”.

**US-05.03 (P0)** – Là L, tôi muốn tải template test case (CSV/Markdown) để điền và nộp.

**US-05.04 (P1)** – Là L, tôi muốn có Traceability: Business Rule → Test Case → Playwright spec để thấy độ phủ.
- AC: bảng ma trận BR × TC trong mỗi lab.

**US-05.05 (P1)** – Là L, tôi muốn checklist tự đánh giá test case (đủ happy/negative/boundary/security/a11y?) để cải thiện.

**US-05.06 (P2)** – Là L, tôi muốn nhập test case của mình và nhận phản hồi về độ phủ so với BR.

## EP-06 Thực hành Playwright & bài tập
**US-06.01 (P0)** – Là L, tôi muốn hướng dẫn từng bước cài Node/NVM, VS Code, Playwright, Git (Windows & macOS) để setup môi trường.
- AC: 2 tab OS; checklist “Đã chạy được test đầu tiên”. (Đã làm ở trang `/starter`; checklist lưu localStorage.)

**US-06.02 (P0)** – Là L, tôi muốn bài tập có đề, tiêu chí đạt, gợi ý, đáp án mẫu để tự học.
- AC: đáp án ẩn mặc định; có nhãn độ khó.
- AC (đã chốt, giai đoạn 1 – tự đánh giá): tiêu chí đạt là checklist khách quan, người học tự kiểm chứng rồi bấm Nộp; gợi ý mở dần từng cái; xem đáp án cần xác nhận và được ghi cờ “đã xem đáp án”; mỗi lần nộp lưu (số tiêu chí đạt/tổng, số gợi ý đã mở, cờ xem đáp án) vào lịch sử và hiện ở trang Thống kê.
- AC: mỗi đáp án mẫu phải chạy xanh trên lab sạch (`npm run verify:solutions`).
- AC: bài tập và test case nằm ở trang hướng dẫn `/labs/<slug>`, trang ứng dụng `/lab/<slug>` không chứa thành phần phụ để locator của người học không bị trùng.

**US-06.03 (P0)** – Là L, tôi muốn học tuần tự: locator → action → assertion → auto-wait → hooks → POM → fixture → config → report.

**US-06.04 (P1)** – Là L, tôi muốn bài tập “Nâng cấp dần”: cùng một lab viết 3 lần (script thẳng → POM → fixture + data-driven) để thấy lợi ích refactor.

**US-06.05 (P1)** – Là L, tôi muốn bài học Trace Viewer, UI Mode, Codegen, Debug Inspector để tự điều tra lỗi.

**US-06.06 (P1)** – Là L, tôi muốn học visual comparison, screenshot, video, emulation (mobile, geolocation, locale) để test đa dạng.

**US-06.07 (P1)** – Là L, tôi muốn học BDD (Gherkin + playwright-bdd/Cucumber) để dùng khi dự án yêu cầu.

**US-06.09 (P2)** – Là L, tôi muốn chấm điểm tự động spec của mình bằng mutation grading để biết test có thật sự bắt được lỗi.
- AC: lệnh `npm run grade -- --lab <slug> --spec <file>` trong starter repo chạy spec trên lab sạch (phải xanh) rồi lần lượt với từng bug `?bugs=BUG-xx` (phải đỏ); điểm = số bug bắt được / tổng số bug, trừ điểm nếu đỏ do timeout/locator sai.
- AC: xuất file JSON kết quả; người học tải lên site để lưu vào lịch sử (không có server chấm nên chỉ để tự học, không cấp chứng chỉ).
- Phụ thuộc: starter repo (US-11.01); lab đọc bug từ cookie `lab_bugs` ngoài query để cấu hình runner tiêm bug được.
- Trạng thái: **đã làm**. `npm run grade -- --exercise <id>` trong starter repo; bài tập khai báo `bugs` cần bắt; trang Thống kê nhập file `grade-<id>.json` (kiểm tra khớp phiên bản bài tập). `npm run verify:solutions` chứng minh mọi đáp án mẫu xanh trên lab sạch và đỏ khi bật đúng bug.

**US-06.08 (P2)** – Là L, tôi muốn học dùng AI (Copilot/Claude, Playwright MCP, agents) để tăng tốc viết test mà vẫn kiểm soát chất lượng.

## EP-07 API testing lab
**US-07.01 (P1)** – Là L, tôi muốn Mock REST API (CRUD, auth token, phân trang, lỗi 4xx/5xx) để luyện API test.
- AC: trang tài liệu endpoint (OpenAPI); có API key/Bearer demo.

**US-07.02 (P1)** – Là L, tôi muốn học dùng fixture `request` để assert status, headers, body, schema.

**US-07.03 (P1)** – Là L, tôi muốn kết hợp API + UI (tạo data bằng API, verify trên UI; mock route với `page.route`) để test nhanh và ổn định.

**US-07.04 (P2)** – Là L, tôi muốn so sánh Postman và Playwright cho cùng một kịch bản.

## EP-08 Bug hunting
**US-08.01 (P1)** – Là L, tôi muốn bật các bug có chủ đích (ví dụ BUG-03: làm tròn sai tiền) để viết test làm test **fail đúng chỗ**.
- AC: panel “Bug Toggle” hoặc `?bugs=BUG-01,BUG-03`; danh sách bug **ẩn mô tả** cho tới khi bấm “Tiết lộ”.

**US-08.02 (P1)** – Là L, tôi muốn viết bug report chuẩn (tiêu đề, bước, expected/actual, evidence) từ trace/screenshot.

**US-08.03 (P2)** – Là L, tôi muốn bảng xếp hạng “số bug tìm được” (local).

## EP-09 Quiz, tiến độ, thành tích
**US-09.01 (P1)** – Là L, tôi muốn quiz cuối bài kèm giải thích để kiểm tra hiểu bài.
**US-09.02 (P1)** – Là L, tôi muốn thấy % hoàn thành theo level và huy hiệu (badge) để có động lực.
- AC: dữ liệu lấy từ EP-15 (IndexedDB).
**US-09.03 (P1)** – Là L, tôi muốn bộ **câu hỏi phỏng vấn Playwright** (theo chủ đề) để chuẩn bị đi làm.
**US-09.04 (P2)** – Là L, tôi muốn capstone project (xây framework hoàn chỉnh trên 1 domain) và checklist đánh giá.

## EP-10 Tra cứu
**US-10.01 (P1)** – Là L, tôi muốn tìm kiếm toàn site (bài, lab, thuật ngữ) bằng `Ctrl+K`.
**US-10.02 (P1)** – Là L, tôi muốn Cheat sheet: locator, assertion, action, CLI, `playwright.config.ts`.
**US-10.03 (P1)** – Là L, tôi muốn Glossary thuật ngữ (DOM, XPath, flaky, fixture, POM, sharding…) kèm nút Hỏi AI.

## EP-11 Starter repo, CI/CD & nâng cao
**US-11.01 (P0)** – Là L, tôi muốn clone **starter repo** (Playwright + TS + eslint/prettier + cấu trúc `pages/ fixtures/ tests/ utils/`) trỏ tới Lab để bắt đầu nhanh.
- AC (đã làm): thư mục `starter-repo/` cùng monorepo; có `BasePage`, `LoginPage`, `CartPage`, custom fixture, `utils/money.ts`, smoke test, ví dụ hoàn chỉnh trong `tests/examples/`, mỗi bài tập một file `test.fixme` trong `tests/exercises/<lab>/` (sinh bằng `npm run starter:stubs`), workflow GitHub Actions mẫu, README tiếng Việt.
- AC: trang `/starter` cho tải `starter-repo.zip` (tạo tự động trước `next build` bằng `scripts/pack-starter.mjs`, không cần repo riêng).
- AC: ví dụ và smoke test của starter phải xanh khi trỏ `BASE_URL` vào site đang chạy.
**US-11.02 (P1)** – Là L, tôi muốn học Git/GitHub (branch, PR, conflict, amend, review) đủ dùng cho automation.
**US-11.03 (P1)** – Là L, tôi muốn mẫu GitHub Actions (chạy theo PR, schedule, sharding, upload report) để tích hợp CI.
**US-11.04 (P1)** – Là L, tôi muốn học quản lý biến môi trường (`.env`, secrets), multi-env (dev/stage).
**US-11.05 (P1)** – Là L, tôi muốn học debug flaky test, retry, tối ưu tốc độ, parallel, tag/grep.

## EP-12 Mentor & tài khoản (P2)
**US-12.01** – Là L, tôi muốn đăng nhập (GitHub/Google) để đồng bộ tiến độ nhiều thiết bị.
**US-12.02** – Là M, tôi muốn tạo lớp, mời học viên, giao bài và xem tiến độ.
**US-12.03** – Là M, tôi muốn nhận bài nộp (link repo/PR) và comment.
**US-12.04** – Là L, tôi muốn runner chạy test trên cloud và trả report.

## EP-13 Nội dung & vận hành
**US-13.01 (P0)** – Là A, tôi muốn viết bài bằng MDX với frontmatter (title, level, thời lượng, tags, keywords) để thêm nội dung không cần sửa code.
**US-13.02 (P0)** – Là A, tôi muốn component MDX tái sử dụng (`<Callout>`, `<Quiz>`, `<TestCaseTable>`, `<AskAI>`, `<LabLink>`, `<Solution>`) để nhất quán.
**US-13.03 (P1)** – Là A, tôi muốn kiểm tra link hỏng/lint nội dung trong CI.
**US-13.04 (P1)** – Là A, tôi muốn **chính site Lab được test bởi Playwright e2e** (smoke) để không vỡ lab khi cập nhật.

## EP-14 Giao diện, hiệu năng, a11y, deploy
**US-14.01 (P0)** – Là L, tôi muốn giao diện sạch, dark/light, responsive (shadcn/ui + Tailwind).
**US-14.02 (P0)** – Là A, tôi muốn deploy tự động lên Vercel/Netlify từ GitHub (preview mỗi PR).
**US-14.03 (P1)** – Là L, tôi muốn điều hướng bàn phím và screen-reader đạt WCAG AA.
**US-14.04 (P1)** – Là A, tôi muốn analytics ẩn danh (Vercel Analytics/Plausible) để biết bài nào khó.

---

## EP-15 Lịch sử học & thống kê
**US-15.01 (P0)** – Là L, tôi muốn hệ thống tự lưu lịch sử học (bài đã xem, thời gian, lần cuối) ngay trên trình duyệt để học tiếp đúng chỗ dừng.
- AC: nút “Tiếp tục học”; dữ liệu lưu IndexedDB, không cần đăng nhập.

**US-15.02 (P0)** – Là L, tôi muốn lưu lịch sử mỗi lần làm quiz/bài tập (điểm, đáp án, thời lượng, ngày) để xem lại.
- AC: xem danh sách lần làm, mở lại chi tiết đúng/sai.

**US-15.03 (P1)** – Là L, tôi muốn trang Thống kê: % hoàn thành theo level, điểm quiz theo thời gian, chủ đề yếu, streak, thời gian học/tuần, số bug đã tìm.
- AC: biểu đồ shadcn Chart; lọc 7/30/90 ngày.

**US-15.04 (P1)** – Là L, tôi muốn Export/Import JSON toàn bộ dữ liệu để sao lưu hoặc đổi máy.
- AC: file có `schemaVersion`; import hợp nhất, cảnh báo ghi đè; nút “Xoá toàn bộ dữ liệu”.

**US-15.05 (P1)** – Là L, tôi muốn gợi ý ôn tập dựa trên câu sai và chủ đề điểm thấp.

**US-15.06 (P2)** – Là L, tôi muốn đăng nhập (Supabase) để đồng bộ lịch sử nhiều thiết bị; Mentor xem thống kê lớp.
- AC: dùng chung `StorageAdapter`; merge theo `updatedAt`; vẫn dùng được khi không đăng nhập.

## EP-16 Dịch vụ của tôi (BYO Services)
**US-16.01 (P1)** – Là L, tôi muốn trang Cài đặt → Dịch vụ của tôi liệt kê các dịch vụ có thể kết nối (DB, email, Stripe, OAuth…) với trạng thái từng dịch vụ để tự thiết lập.
- AC: mỗi dịch vụ có trạng thái Chưa cấu hình/Đã kết nối/Lỗi; biết lab nào cần dịch vụ nào.

**US-16.02 (P1)** – Là L, tôi muốn wizard hướng dẫn từng bước tạo tài khoản free và lấy khoá để không bị lạc.
- AC: ảnh minh hoạ, thời gian ước tính, nhắc dùng quyền tối thiểu/sandbox.

**US-16.03 (P1)** – Là L, tôi muốn nút Test connection báo rõ lỗi (sai key, hết quota, bị chặn) để sửa nhanh.

**US-16.04 (P1)** – Là L, tôi muốn đăng nhập để khoá của tôi được lưu mã hoá trên server và dùng lại ở mọi thiết bị.
- AC: AES-256-GCM, RLS theo user, khoá không bao giờ trả về client (chỉ hiện `****abcd`); nút Xoá khoá, Xoá tài khoản + dữ liệu; trang ghi rõ chủ site giữ master key và khuyến cáo chỉ dùng khoá free/sandbox.

**US-16.05 (P1)** – Là L, tôi muốn nút “Tạo schema mẫu” trên Neon của tôi và xem connection string để dùng trong test.

**US-16.06 (P1)** – Là L, tôi muốn xuất file `.env` cho starter repo từ khoá đã nhập để chạy test trên máy.

**US-16.07 (P1)** – Là L, tôi muốn lab tự rơi về chế độ built-in khi thiếu dịch vụ để vẫn học được mà không phải đăng ký.

**US-16.08 (P1)** – Là L chưa đăng nhập, tôi muốn dùng khoá tạm trong trình duyệt hoặc tầng built-in để học thử mà không cần tài khoản.

**US-16.10 (P1)** – Là L, tôi muốn có hướng dẫn đăng ký từng dịch vụ **step-by-step kèm hình ảnh** (Neon, Resend, Mailtrap, OAuth, Stripe…) để làm theo không bị lạc.
- AC: mỗi bước có 1 ảnh chú thích, quyền tối thiểu, lỗi thường gặp, cách thu hồi key, ngày kiểm tra cuối.

**US-16.11 (P1)** – Là A, tôi muốn xoay vòng master key (key_version) và cron giữ Supabase không bị tạm dừng để vận hành ổn định.

**US-16.09 (P0)** – Là A, tôi muốn proxy chỉ cho phép host allowlist, chặn IP nội bộ, rate limit và không ghi log khoá để tránh SSRF/lộ khoá.

## Definition of Done (chung)
- Có AC đạt, UI dùng shadcn/ui, responsive + dark mode.
- Không lỗi lint/type; build Vercel & Netlify thành công.
- Lab mới: có đề bài, BR, test case mẫu, ≥ 3 bài tập, spec đáp án chạy xanh trên starter repo.
- Bài học mới: đủ template mục 8 trong PRD.
