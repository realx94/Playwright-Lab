# Playwright Lab – Starter

Project mẫu để làm bài tập trên website **Playwright Lab**: Playwright + TypeScript, có sẵn Page Object, fixture và các file bài tập.

## 1. Yêu cầu
- Node.js LTS (khuyến nghị cài bằng NVM; xem `.nvmrc`)
- Git, VS Code (extension *Playwright Test for VS Code*)

## 2. Cài đặt
```bash
npm install
npx playwright install chromium
cp .env.example .env     # Windows PowerShell: Copy-Item .env.example .env
```
Mở file `.env` và đặt `BASE_URL` là địa chỉ website Playwright Lab bạn đang học (ví dụ `https://your-site.vercel.app`).

## 3. Chạy thử
```bash
npm test                              # chạy tất cả (bài tập đang là fixme nên được bỏ qua)
npx playwright test 00-smoke          # kiểm tra kết nối tới site
npx playwright test examples          # chạy các ví dụ hoàn chỉnh
npm run test:ui                       # UI Mode: xem từng bước, time-travel
npm run report                       # mở HTML report sau khi chạy
```
Cả smoke test và các ví dụ phải xanh trước khi bạn bắt đầu làm bài tập.

## 4. Cấu trúc
```
pages/       Page Object (LoginPage, CartPage) – nơi khai báo locator và hành động nghiệp vụ
fixtures/    Custom fixture: tự mở trang + reset dữ liệu, đưa Page Object vào test
utils/       Hàm tiện ích (parseMoney…)
tests/
  00-smoke.spec.ts   kiểm tra môi trường
  examples/          ví dụ hoàn chỉnh dùng fixture + POM
  exercises/<lab>/   mỗi bài tập một file, đang là test.fixme
```

## 5. Cách làm bài tập
1. Mở trang lab trên website: `/labs/<tên lab>` (đề bài, business rules, bài tập, gợi ý).
2. Mở file tương ứng trong `tests/exercises/<lab>/<id>.spec.ts`, đọc đề trong comment.
3. Xoá `.fixme`, viết test. Dùng `getByRole`/`getByLabel` trước, tránh CSS dài và `waitForTimeout`.
4. Chạy `npx playwright test <id>` đến khi xanh, rồi chạy lại 3 lần.
5. Quay lại website, tick các tiêu chí bạn đã kiểm chứng và bấm **Nộp bài**.
6. Chỉ xem đáp án khi đã thử; website sẽ ghi nhận bạn đã xem.

Bài “bắt bug”: test phải **xanh** ở `/lab/<lab>` và **đỏ** ở `/lab/<lab>?bugs=BUG-xx`. Dùng `await page.goto(path + "?bugs=BUG-01")` hoặc `loginPage.goto(["BUG-01"])` để thử.

## 6. Mẹo
- `npx playwright codegen $BASE_URL/lab/login` để sinh code nháp, sau đó chuyển locator về dạng `getByRole`.
- Test lỗi? Mở trace: `npx playwright show-trace test-results/<thư mục>/trace.zip`.
- Chạy một test: `npx playwright test -g "đăng nhập hợp lệ"`.

## 7. CI (tuỳ chọn)
`.github/workflows/e2e.yml` chạy test mỗi lần push. Thêm biến `BASE_URL` trong *Settings → Secrets and variables → Actions → Variables*.
