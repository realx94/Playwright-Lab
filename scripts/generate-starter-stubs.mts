// Sinh file bài tập (test.fixme) trong starter-repo từ src/lib/labs/exercises.ts.
// Chạy lại mỗi khi thêm/sửa bài tập: npm run starter:stubs
import fs from "node:fs";
import path from "node:path";
import { EXERCISES } from "../src/lib/labs/exercises.ts";

const OUT = path.join("starter-repo", "tests", "exercises");
const grading: Record<string, { lab: string; spec: string; bugs: string[] }> = {};
fs.rmSync(OUT, { recursive: true, force: true });

for (const [lab, list] of Object.entries(EXERCISES)) {
  fs.mkdirSync(path.join(OUT, lab), { recursive: true });
  for (const ex of list) {
    const criteria = ex.criteria.map((c) => ` *  - ${c}`).join("\n");
    const body = `import { test } from "@playwright/test";

/**
 * ${ex.id} · ${ex.title} ${"★".repeat(ex.difficulty)}
 *
 * ${ex.task}
 *
 * Trang lab: /lab/${lab}  ·  Đề, gợi ý và đáp án: /labs/${lab} trên website
 *
 * Tiêu chí đạt:
${criteria}
 */
// Xoá ".fixme" sau khi bạn bắt đầu viết test.
test.fixme("${ex.title}", async ({ page }) => {
  // TODO: viết test của bạn ở đây
  await page.goto("/lab/${lab}");
});
`;
    fs.writeFileSync(path.join(OUT, lab, `${ex.id}.spec.ts`), body);
    grading[ex.id] = { lab, spec: `tests/exercises/${lab}/${ex.id}.spec.ts`, bugs: ex.bugs ?? [] };
  }
}
fs.writeFileSync(path.join("starter-repo", "grading.json"), JSON.stringify({ version: 1, exercises: grading }, null, 2) + "\n");
console.log("Đã sinh stub bài tập và grading.json vào", OUT);
