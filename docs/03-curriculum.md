# Curriculum – Zero to Hero

Mỗi bài liệt kê **kiến thức phải làm chủ**. Cột *Hỏi AI* là các từ khoá để bôi đen / dán vào Google AI Mode (xem US-03.x). Khung tham khảo từ khoá hoctest.com, nội dung tự biên soạn và mở rộng.

> Mẹo học: gặp thuật ngữ lạ → bôi đen → “Hỏi Google AI”. Prompt gợi ý:
> *“Giải thích cho người mới học QA: `<thuật ngữ>`. Cho ví dụ đời thường và ví dụ code Playwright TypeScript.”*

---
## Level 0 – Chuẩn bị (≈ 3 bài)
| Bài | Kiến thức cần làm chủ | Hỏi AI |
|-----|----------------------|--------|
| 0.1 Tổng quan Automation Testing | Manual vs Automation, khi nào nên/không nên automate, test pyramid, ROI | test automation pyramid, flaky test |
| 0.2 Cài đặt môi trường (Win/Mac) | NVM, Node.js LTS, npm, VS Code + extension Playwright, Git | nvm là gì, npm vs npx |
| 0.3 Chạy test đầu tiên | `npm init playwright@latest`, cấu trúc project, `npx playwright test`, HTML report | playwright.config.ts, headed vs headless |

## Level 1 – Nền tảng lập trình & Git (≈ 10 bài)
| Bài | Kiến thức | Hỏi AI |
|-----|-----------|--------|
| 1.1 Git cơ bản | Repo, working dir/staging/commit, `init/add/commit/status/log`, `.gitignore` | git staging area |
| 1.2 Git nhánh & GitHub | branch, merge, remote, SSH key, push/pull, PR | git merge vs rebase |
| 1.3 Git xử lý conflict, amend, review code | resolve conflict, `commit --amend`, quy trình review | git conflict markers |
| 1.4 Markdown | viết README, bảng, code block | markdown cheatsheet |
| 1.5 JavaScript: biến, kiểu dữ liệu, toán tử | `let/const`, string/number/boolean, `===` | var let const khác nhau |
| 1.6 JavaScript: điều kiện & vòng lặp | `if/else/switch`, `for/while/for…of` | for of vs forEach |
| 1.7 JavaScript: string, array, object | method thường dùng, destructuring, spread | array map filter |
| 1.8 JavaScript: function & class | arrow function, `this`, class, constructor, kế thừa (`extends`) | arrow function this |
| 1.9 TypeScript cơ bản | type, interface, generic nhẹ, enum, union | type vs interface |
| 1.10 Async/await & Promise | event loop, Promise, `await`, vì sao Playwright toàn `await` | javascript promise là gì |

## Level 2 – Web & Playwright cơ bản (≈ 14 bài)
| Bài | Kiến thức | Hỏi AI |
|-----|-----------|--------|
| 2.1 HTML & DOM | cây DOM, tag/attr, element phổ biến (input, radio, checkbox, select, table, iframe, dialog) | DOM là gì, shadow DOM |
| 2.2 CSS Selector | tag/class/id, thuộc tính, tổ hợp, pseudo (`:nth-child`) | css selector cheatsheet |
| 2.3 XPath | trục, `contains`, `text()`, khi nào dùng | xpath vs css |
| 2.4 Cấu trúc Playwright test | `test`, `expect`, `page`, `describe`, chạy 1 test/tag/grep | playwright test structure |
| 2.5 Locator hướng người dùng | `getByRole`, `getByText`, `getByLabel`, `getByPlaceholder`, `getByAltText`, `getByTestId` | getByRole aria role |
| 2.6 Locator nâng cao | `locator()`, filter, `nth`, chaining, frame, shadow | playwright filter locator |
| 2.7 Actions | click, fill, type, press, check, selectOption, hover, upload, drag & drop | playwright fill vs type |
| 2.8 Assertions | web-first assertion, `toBeVisible`, `toHaveText`, soft assertion, polling | expect auto-retrying |
| 2.9 Auto-wait & timeout | actionability, `waitFor`, tại sao tránh `waitForTimeout` | playwright auto waiting |
| 2.10 Dialog, popup, new tab, iframe | `page.on('dialog')`, `context.waitForEvent('page')`, `frameLocator` | playwright handle dialog |
| 2.11 Hooks & nhóm test | `beforeEach/afterEach/beforeAll`, `describe`, serial/parallel, `test.step` | playwright hooks |
| 2.12 Browser/Context/Page | cô lập session, multi-context, storageState | browser context isolation |
| 2.13 Debug | Inspector, UI Mode, Trace Viewer, Codegen, `--debug` | playwright trace viewer |
| 2.14 Báo cáo, screenshot, video | reporter, `screenshot`, `video`, `trace` option | playwright reporters |

## Level 3 – Tư duy kiểm thử & nghiệp vụ (≈ 10 bài) ⭐ điểm khác biệt
| Bài | Kiến thức | Hỏi AI |
|-----|-----------|--------|
| 3.1 Phân tích yêu cầu | actor, use case, business rule, acceptance criteria, ambiguity | acceptance criteria là gì |
| 3.2 Equivalence Partitioning | chia lớp tương đương hợp lệ/không hợp lệ | equivalence partitioning ví dụ |
| 3.3 Boundary Value Analysis | min/max, ±1, 2-value vs 3-value | boundary value analysis |
| 3.4 Decision Table | điều kiện/hành động, rút gọn bảng | decision table testing |
| 3.5 State Transition | trạng thái, sự kiện, chuyển trạng thái không hợp lệ | state transition testing |
| 3.6 Pairwise / Combinatorial | tổ hợp tham số, công cụ PICT | pairwise testing |
| 3.7 Viết test case chuẩn | cấu trúc TC, ưu tiên, tag, traceability | test case template |
| 3.8 Negative / Security / A11y cơ bản | XSS, SQLi input, phân quyền, tab order | OWASP top 10 cho tester |
| 3.9 Chọn test nào để automate | tiêu chí, smoke/regression/sanity | regression vs smoke vs sanity |
| 3.10 Từ test case → Playwright spec | map BR→TC→spec, data-driven | data driven testing playwright |

## Level 4 – Framework & kiến trúc (≈ 10 bài)
| Bài | Kiến thức | Hỏi AI |
|-----|-----------|--------|
| 4.1 Page Object Model | class, locator trong constructor, method nghiệp vụ, không assert lẫn lộn | page object model |
| 4.2 POM nâng cao | component object, base page, composition vs inheritance | POM component |
| 4.3 Custom Fixture | `test.extend`, fixture scope, auto fixture | playwright fixtures |
| 4.4 Biến môi trường & config | `dotenv`, project theo env, `baseURL`, secrets | dotenv là gì |
| 4.5 Data-driven & test data | JSON/CSV, factory (faker), tạo/xoá data | faker js |
| 4.6 Auth & storageState | login 1 lần, tái sử dụng, global setup | playwright storageState |
| 4.7 API Testing | REST, method, status, header, body, JSON schema; fixture `request` | REST API là gì |
| 4.8 POM cho API & kết hợp UI+API | API helper, seed data qua API, `page.route` mock | playwright route mock |
| 4.9 Visual comparison & emulation | `toHaveScreenshot`, device, geolocation, locale, timezone | visual regression testing |
| 4.10 Tối ưu framework | parallel, sharding, retry, tag, tổ chức thư mục | playwright sharding |

## Level 5 – Chuyên nghiệp (≈ 8 bài)
| Bài | Kiến thức | Hỏi AI |
|-----|-----------|--------|
| 5.1 CI/CD GitHub Actions | workflow YAML, cache, matrix, artifact, cron | github actions workflow |
| 5.2 Reporting nâng cao | Allure/HTML, gửi Slack/Teams | allure report playwright |
| 5.3 BDD & Gherkin | Given/When/Then, step definition, best practice | gherkin là gì |
| 5.4 Accessibility testing | `@axe-core/playwright` | axe core |
| 5.5 Performance cơ bản | Web Vitals, Lighthouse, đo thời gian | core web vitals |
| 5.6 Flaky test & độ ổn định | nguyên nhân, cách chẩn đoán | cách giảm flaky test |
| 5.7 Dùng AI hiệu quả | prompt viết test, Playwright MCP/agents, review output AI | playwright mcp |
| 5.8 Capstone & phỏng vấn | xây framework từ đầu; câu hỏi phỏng vấn | playwright interview questions |

## Câu hỏi phỏng vấn (ngân hàng)
Chia chủ đề: Tổng quan · Cài đặt/cấu trúc · Browser/context/page · Locator · CI/CD & sharding · Shadow DOM · TypeScript · POM · Env · API & fixture. Mỗi câu: đáp án ngắn + đáp án sâu + ví dụ code.

## Chuẩn kiến thức “làm chủ” (mastery checklist)
Học viên đạt Hero khi có thể: (1) phân tích BR & thiết kế ≥ 30 TC cho 1 module; (2) tự dựng framework POM + fixture + env + CI; (3) test UI + API kết hợp; (4) debug flaky bằng trace; (5) giải thích được vì sao chọn mỗi locator/kỹ thuật.
