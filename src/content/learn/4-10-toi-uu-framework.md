---
title: Tối ưu framework – song song, retry, tag và cấu trúc
level: 4
order: 10
minutes: 30
summary: Chạy song song, sharding, retry hợp lý, gắn tag và tổ chức thư mục để framework bền vững.
keywords: [playwright sharding, playwright parallel workers, test tags]
---

## Mục tiêu bài học
- Làm cho bộ test chạy nhanh và ổn định khi lớn dần.
- Tổ chức dự án để nhiều người cùng làm.

## Kiến thức cần nắm
- **Workers**: số tiến trình chạy song song (`workers`, `fullyParallel`)
- **Sharding**: chia bộ test thành nhiều phần để chạy trên nhiều máy (`--shard=1/4`)
- **Retry**: thử lại test hỏng (`retries`); chỉ là biện pháp tạm, không thay cho sửa flaky
- **Tag**: gắn `@smoke`, `@regression` vào tên test để chạy theo nhóm (`-g`, `--grep-invert`)
- **Cấu trúc thư mục**: `pages/`, `fixtures/`, `utils/`, `tests/<tính năng>/`

## Giải thích dễ hiểu
Bộ test lớn giống **một siêu thị cần tính tiền**: một quầy thì hàng dài. Thêm quầy (workers) giúp nhanh hơn, nhưng nếu mọi khách dùng chung một xe đẩy (dữ liệu dùng chung) thì lại tranh nhau. Chia nhiều siêu thị chi nhánh (sharding) khi một cửa hàng không đủ chỗ.

## Demo code
```ts
// playwright.config.ts
export default defineConfig({
  fullyParallel: true,
  workers: process.env.CI ? 4 : undefined,
  retries: process.env.CI ? 2 : 0,
  forbidOnly: !!process.env.CI,
});
```

```bash
npx playwright test -g "@smoke"                 # chạy tập smoke
npx playwright test --grep-invert "@slow"       # bỏ test chậm
npx playwright test --shard=1/3                 # chạy phần 1 trong 3 phần
```

Gắn tag trong tên test:

```ts
test("đăng nhập hợp lệ @smoke", async ({ page }) => { /* ... */ });
```

## Cấu trúc gợi ý
```text
pages/        Page Object và component
fixtures/     custom fixture
utils/        hàm tiện ích, data builder
tests/
  auth/       test theo tính năng
  cart/
  api/
```

## Nguyên tắc tối ưu
1. Trước hết **làm test độc lập** rồi mới tăng workers.
2. Dùng API để chuẩn bị dữ liệu thay vì thao tác UI.
3. Giữ ít test UI end-to-end, nhiều test ở tầng thấp.
4. Theo dõi test chậm và test flaky trong báo cáo.

## Lỗi thường gặp
- Tăng workers khi test còn dùng chung dữ liệu nên flaky tăng.
- Dựa vào `retries` để “giữ xanh” thay vì tìm nguyên nhân.
- Mọi test nằm chung một thư mục nên khó tìm.

## Bài tập
1. Gắn tag `@smoke` cho 3 test quan trọng và chạy riêng chúng.
2. Chạy `--shard=1/2` và `--shard=2/2` rồi kiểm tra tổng số test.
