---
title: CI/CD với GitHub Actions
level: 5
order: 1
minutes: 35
summary: Chạy Playwright tự động mỗi lần push, lưu báo cáo và chạy theo lịch.
keywords: [github actions workflow, ci cd là gì, playwright github actions]
---

## Mục tiêu bài học
- Hiểu CI/CD và vai trò của nó với automation.
- Viết workflow chạy test, upload báo cáo và chạy theo lịch.

## Kiến thức cần nắm
- **CI** (Continuous Integration): tự động build và chạy test mỗi khi có thay đổi
- **Workflow** YAML trong `.github/workflows/`: `on` (khi nào chạy), `jobs`, `steps`
- Action thường dùng: `actions/checkout`, `actions/setup-node`, `actions/upload-artifact`
- `npm ci` (cài đúng theo lockfile), `npx playwright install --with-deps`
- **Secrets / Variables** của repo để truyền cấu hình và bí mật
- **Cron** chạy theo lịch (ví dụ 6 giờ sáng hằng ngày)

## Giải thích dễ hiểu
CI giống **một nhân viên kiểm tra đứng ở cửa nhà máy**: mỗi lô hàng (commit) đi qua đều được kiểm tra tự động trước khi vào kho. Bạn không phải nhớ chạy test; hễ ai đẩy code hỏng thì cửa báo đỏ ngay.

## Demo code
```yaml
# .github/workflows/e2e.yml
name: e2e
on:
  push:
  pull_request:
  schedule:
    - cron: "0 23 * * *"        # 23:00 UTC = 6:00 sáng giờ Việt Nam

jobs:
  test:
    runs-on: ubuntu-latest
    env:
      BASE_URL: ${{ vars.BASE_URL }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 14
```

Chia nhỏ để chạy nhanh hơn (sharding) bằng `strategy.matrix`:

```yaml
strategy:
  matrix:
    shard: [1, 2, 3]
steps:
  - run: npx playwright test --shard=${{ matrix.shard }}/3
```

## Thực hành tốt
1. Chạy `npm run typecheck` và lint trước khi chạy test.
2. Luôn upload báo cáo/trace kể cả khi test đỏ (`if: ${{ !cancelled() }}`).
3. Bí mật để trong **Secrets**, không in ra log.
4. Đặt `forbidOnly` và `retries` ở chế độ CI.

## Lỗi thường gặp
- Test xanh ở máy nhưng đỏ ở CI vì khác hệ điều hành, font hoặc múi giờ.
- Quên cài trình duyệt (`playwright install --with-deps`) trên runner.
- Không lưu báo cáo nên không biết vì sao đỏ.

## Bài tập
1. Thêm workflow chạy test cho starter repo và quan sát lần chạy đầu trên GitHub.
2. Thêm lịch chạy hằng ngày và upload báo cáo làm artifact.
