# Tech & Architecture

## Stack
| Lớp | Lựa chọn |
|-----|----------|
| Framework | Next.js (App Router) + TypeScript |
| UI | Tailwind CSS + **shadcn/ui (ưu tiên dùng component có sẵn)** + lucide-react |
| Nội dung | MDX (`@next/mdx` hoặc `next-mdx-remote`/Contentlayer-alternative) + frontmatter (gray-matter) |
| Code highlight | `shiki` hoặc `rehype-pretty-code` |
| Form/validation trong lab | react-hook-form + zod |
| State | Zustand (tiến độ, lab store), localStorage persist |
| Mock API | Next.js Route Handlers (`app/api/**`) + OpenAPI JSON |
| Test site | Playwright e2e smoke cho chính site & lab |
| Deploy | Vercel (chính) / Netlify (`@netlify/plugin-nextjs`) |

## shadcn/ui – component dự kiến dùng
`button, card, tabs, accordion, badge, input, label, textarea, select, checkbox, radio-group, switch, slider, calendar, popover, dialog, alert-dialog, sheet, dropdown-menu, tooltip, table, pagination, toast/sonner, progress, separator, scroll-area, command (Ctrl+K), breadcrumb, sidebar, skeleton, alert, hover-card, form, toggle, collapsible, resizable`.
Quy tắc: tự viết component chỉ khi shadcn không có (vd. `AskAIPopover`, `SeatMap`, `Canvas`, `ShadowWidget`).

## Cấu trúc thư mục
```
/docs                      # tài liệu sản phẩm
/src
  /app
    /(site)                # trang học
      /learn/[level]/[slug]
      /labs, /cheatsheet, /glossary, /interview
    /lab/[slug]            # Lab App (layout riêng, không chrome của site)
    /api/lab/[slug]/...    # mock API, reset
    /api/openapi
    /api/byo/*             # proxy stateless (allowlist host)
  /components
    /ui                    # shadcn
    /mdx                   # Callout, Quiz, AskAI, TestCaseTable, Solution, LabLink
    /ask-ai                # SelectionPopover
    /lab/<domain>          # component từng lab
  /content
    /learn/*.mdx
    /labs/*.mdx            # mô tả lab + BR + TC
  /lib                     # ask-ai prompt builder, progress store, bug flags
/starter-repo              # template Playwright (hoặc repo riêng)
/e2e                       # test chính site
```

## Tính năng “Bôi đen → Hỏi Google AI”
- Lắng nghe `selectionchange`/`mouseup`/`touchend` trong vùng `.prose`.
- Hiện popover (shadcn `Popover` neo theo `Range.getBoundingClientRect()`).
- URL builder tách riêng `lib/ask-ai.ts`:
  - Chính: `https://www.google.com/search?udm=50&q=<prompt>` (AI Mode).
  - Fallback: `https://www.google.com/search?q=<prompt>`.
- Prompt template có biến thể: ELI5 · ví dụ Playwright TS · so sánh Selenium · câu hỏi phỏng vấn.
- Giới hạn 2–200 ký tự; encode `encodeURIComponent`; mở `noopener,noreferrer`.
- Không gửi dữ liệu nào về server của site.

## Lab App & trạng thái
- Mỗi lab có store riêng (Zustand + persist `localStorage` key `lab:<slug>`), nút Reset.
- **Không dùng Redis/KV/DB phía server** (chi phí thấp). Toàn bộ state lab nằm ở trình duyệt (IndexedDB/localStorage). Mock API là Route Handlers **stateless**: client gửi state/seed kèm request hoặc API chỉ xử lý thuần (validate, tính toán); mọi thay đổi dữ liệu được client lưu lại. Reset = xoá store của lab.
- Feature flags bug: parse `?bugs=` + panel; lưu trong store, truyền qua context.
- Tham số kiểm soát: `?delay=ms`, `?seed=n`, `?role=manager`.

## Deploy
- **Vercel**: import repo, framework Next.js, build `next build`. Preview mỗi PR.
- **Netlify**: `netlify.toml` với plugin Next.js; Node LTS cố định (`.nvmrc`).
- Biến môi trường: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_ANALYTICS_ID` (tuỳ chọn).
- Tránh phụ thuộc runtime-only đặc thù một nền tảng.

## CI
- GitHub Actions: lint, typecheck, build, Playwright e2e smoke (chạy trên preview/`next start`), link-checker nội dung.

## Lưu trữ lịch sử học & kết quả (local-first)
- `StorageAdapter` interface (`getProgress, saveAttempt, listAttempts, stats, exportAll, importAll`).
- MVP: `LocalAdapter` dùng **IndexedDB** (thư viện `idb`/`Dexie`), cài đặt riêng cho settings nhỏ bằng localStorage.
- Bảng dữ liệu: `lessonProgress(lessonId, status, lastViewedAt, timeSpentSec)`, `quizAttempts(id, quizId, score, answers, takenAt, durationSec)`, `exerciseAttempts(id, exerciseId, selfRating, solutionViewed, takenAt)`, `labRuns(id, labSlug, bugsFound[], takenAt)`, `askAiHistory(term, askedAt)`.
- Thống kê: % hoàn thành theo level, điểm quiz theo thời gian, chủ đề yếu, streak học, thời gian học/tuần, số bug đã tìm; biểu đồ bằng shadcn Chart (Recharts).
- Export/Import JSON có `schemaVersion` để sao lưu/chuyển máy.
- P2: `SupabaseAdapter` (Auth GitHub/Google + Postgres + RLS) chạy cùng interface; khi đăng nhập thì đồng bộ (local là nguồn tạm, merge theo `updatedAt`).

## Quyết định đã chốt
1. Nội dung MDX trong repo.
2. State lab và lịch sử học lưu ở trình duyệt, không Redis/KV.
3. Starter repo cùng monorepo (`/starter-repo`); người học chỉ dùng 1 website, thực hành trên các lab nằm trong cùng site.
4. Link Google AI Mode `udm=50` kèm fallback tìm kiếm thường.
5. Supabase (free): Auth + lưu khoá mã hoá + đồng bộ lịch sử, qua `StorageAdapter`; bắt buộc khi làm BYO (P1).
6. Ngôn ngữ UI: tiếng Việt trước, i18n sau.
7. Dịch vụ bên thứ 3 (DB, email, Stripe, OAuth) theo mô hình **BYO**: người học tự đăng ký, khoá lưu mã hoá trong Supabase (đăng nhập), giải mã chỉ ở server khi gọi qua proxy allowlist; không có DB lab dùng chung của chủ site. Chi tiết ở [06-integrations.md](06-integrations.md).
