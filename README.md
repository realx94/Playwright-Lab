# Playwright Lab

Website học **Playwright Automation từ Zero đến Hero** cho QA: bài học, lab nghiệp vụ, thiết kế test case, bài tập kèm chấm tự động và starter repo.

- **55 bài học** (Level 0–5), mỗi bài có quiz xáo trộn chống đoán mẹo
- **16 lab** trong chính website (`/lab/*`): Login, Form, Giỏ hàng, Todo, Bảng dữ liệu, Playground, Mock API, Email OTP, 2FA TOTP, OAuth giả, Thanh toán thẻ, Đơn hàng & DB, Nghỉ phép (hai vai trò), Chat thời gian thực, CAPTCHA & giới hạn tần suất; mỗi lab có business rule, test case mẫu, bug có chủ đích và bài tập
- **Starter repo** (`starter-repo/`) tải về làm bài, có `npm run grade` chấm bằng mutation grading
- Tra cứu: tìm kiếm `Ctrl+K`, thuật ngữ, cheat sheet; bôi đen bất kỳ chữ nào để **hỏi Google AI**
- Lịch sử học và kết quả lưu ngay trong trình duyệt (IndexedDB), không cần tài khoản

Tài liệu sản phẩm nằm ở [docs/](docs/README.md).

## Chạy local
```bash
npm install
npx playwright install chromium
npm run dev            # http://localhost:3000
```

## Kiểm tra chất lượng
```bash
npm run lint
npx playwright test            # e2e cho site, lab, quiz, trang hướng dẫn (tự build và chạy ở cổng 3100)
npm run verify:solutions       # đáp án mẫu: xanh trên lab sạch, đỏ khi bật đúng bug
npm run starter:stubs          # sinh lại file bài tập và grading.json cho starter repo
```

## Deploy
- **Vercel**: import repo, framework Next.js, không cần cấu hình thêm.
- **Netlify**: đã có `netlify.toml` (plugin `@netlify/plugin-nextjs`).
- Biến môi trường (tuỳ chọn): `NEXT_PUBLIC_SITE_URL` — địa chỉ gốc của site, dùng cho sitemap và metadata.

`public/starter-repo.zip` được tạo tự động ở bước `prebuild`, không cần commit.

## Cấu trúc
```text
src/app/(site)/      trang học (có header, tìm kiếm, bôi đen hỏi AI)
src/app/lab/         ứng dụng lab thuần (không header để locator sạch)
src/app/api/lab/     mock API cho LAB-14
src/content/         bài học (md), quiz (json), thuật ngữ
src/lib/labs/        quy tắc nghiệp vụ, test case mẫu, bài tập, đăng ký lab
src/lib/storage/     StorageAdapter (IndexedDB), sẵn sàng thay bằng Supabase
starter-repo/        project Playwright cho người học
e2e/                 test của chính site
scripts/             công cụ: đóng gói starter, sinh stub, kiểm tra đáp án
docs/                PRD, user stories, curriculum, lab catalog, kiến trúc
```

Quy ước làm việc với Claude Code nằm trong [CLAUDE.md](CLAUDE.md).
