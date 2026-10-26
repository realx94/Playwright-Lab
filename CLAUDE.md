@AGENTS.md

# Playwright Lab – hướng dẫn cho Claude

Website học Playwright (Zero → Hero) cho QA: bài học + lab nghiệp vụ + thiết kế test case. Next.js App Router, Tailwind v4, **ưu tiên component shadcn/ui**.

## BẮT BUỘC: tham chiếu tài liệu trước khi triển khai
Trước khi làm bất kỳ tính năng, lab, bài học hay quiz mới, **đọc tài liệu liên quan trong `docs/`** và làm đúng theo đó. Không tự suy diễn yêu cầu.

| Làm việc gì | Đọc trước |
|-------------|-----------|
| Tính năng mới / thay đổi hành vi | [docs/02-user-stories.md](docs/02-user-stories.md) (tìm US-xx.yy + Acceptance Criteria) và [docs/01-prd.md](docs/01-prd.md) (FR/NFR) |
| Lab mới hoặc sửa lab | [docs/04-lab-catalog.md](docs/04-lab-catalog.md) (Business Rules BR-xx, bug gợi ý, nguyên tắc thiết kế lab) |
| Bài học mới | [docs/03-curriculum.md](docs/03-curriculum.md) (kiến thức cần nắm, từ khoá hỏi AI) và template bài học ở mục 8 của PRD |
| Quiz mới | [docs/07-quiz-guidelines.md](docs/07-quiz-guidelines.md) |
| Dịch vụ bên thứ 3, email/OTP, DB, lưu khoá | [docs/06-integrations.md](docs/06-integrations.md) |
| Kiến trúc, thư mục, lưu trữ, deploy | [docs/05-tech-architecture.md](docs/05-tech-architecture.md) |

Quy trình mỗi lần triển khai:
1. Xác định US/FR/LAB ID liên quan và nêu trong tin nhắn commit hoặc phần trả lời.
2. Nếu code **khác** tài liệu (hoặc tài liệu thiếu/mâu thuẫn): dừng, hỏi người dùng hoặc **cập nhật docs cùng commit**. Không để code và docs lệch nhau (ví dụ BR của lab đổi → sửa `04-lab-catalog.md`).
3. Tuân thủ Definition of Done ở cuối `docs/02-user-stories.md`.
4. Quyết định đã chốt (không bàn lại nếu người dùng không đề cập): state lab và lịch sử học **local-first** (IndexedDB) qua `StorageAdapter`; không Redis/KV; mô hình **BYO Services**; starter repo cùng monorepo; link Google AI Mode `udm=50` có fallback.

## Quy ước kỹ thuật
- **Một commit cho mỗi phần việc hoàn chỉnh**, chạy `npm run lint` và `npx playwright test` xanh trước khi commit. Thông điệp commit dạng `feat(lab): ...`, `feat(quiz): ...`, `docs: ...`.
- Component UI dùng shadcn/ui (`src/components/ui`). shadcn bản này dựa trên `@base-ui/react`: **`Button` không có `asChild`** → dùng `buttonVariants` với `Link`. Radio/checkbox/switch có `<input>` ẩn nên trong test dùng `getByRole(...)`, không dùng `getByLabel`.
- `id` của phần tử (dùng cho `htmlFor`) **không chứa dấu cách hay ký tự có dấu**; dùng chỉ số hoặc slug.
- Mọi truy cập lưu trữ đi qua `src/lib/storage` (`StorageAdapter`), không gọi IndexedDB/localStorage trực tiếp trong UI (trừ cấu hình nhỏ của từng lab).
- Lab: có nút **Reset**, `data-testid` ổn định, bug bật bằng `?bugs=BUG-xx`, spec đáp án trong `e2e/<lab>-lab.spec.ts`, test case mẫu trong `src/lib/labs/testcases.ts`.
- Quiz: file `src/content/quiz/<slug>.json`; `e2e/quiz-bank.spec.ts` phải xanh.
- Bài tập lab: dữ liệu ở `src/lib/labs/exercises.ts`; **đáp án mẫu phải chạy xanh** (`npm run verify:solutions`). Trang `/lab/<slug>` chỉ chứa ứng dụng; BR, workshop và bài tập đặt ở `/labs/<slug>` để không gây trùng locator.
- Nội dung tiếng Việt, thuật ngữ kỹ thuật giữ tiếng Anh. Không sao chép nội dung của khoá học khác.
- Không commit khoá/API key; `.env*` đã được git bỏ qua.

## Lệnh thường dùng
- `npm run dev` – chạy dev; `npm run build` – build; `npm run lint`
- `npx playwright test` – e2e (tự build và chạy `next start -p 3100`)
- `npm run verify:solutions` – chạy thật mọi đáp án mẫu của bài tập

## Lưu ý với Bash trên Windows
Không dán nội dung file lớn (tiếng Việt, nhiều dấu nháy) vào heredoc; dùng công cụ Write để tạo file.
