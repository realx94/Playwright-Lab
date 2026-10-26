// Xuất đáp án mẫu của mọi bài tập thành spec và chạy thật trên lab sạch.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { EXERCISES } from "../src/lib/labs/exercises.ts";

const DIR = ".tmp-solutions";
fs.rmSync(DIR, { recursive: true, force: true });
fs.mkdirSync(DIR);
for (const list of Object.values(EXERCISES))
  for (const ex of list) fs.writeFileSync(`${DIR}/${ex.id}.spec.ts`, ex.solution);

// Config đặt ở thư mục gốc để webServer chạy đúng cwd.
const CONFIG = ".tmp-solutions.config.ts";
fs.writeFileSync(
  CONFIG,
  `import base from "./playwright.config";
import { defineConfig } from "@playwright/test";
export default defineConfig({ ...base, testDir: "./${DIR}", reporter: "list" });
`,
);

const r = spawnSync("npx", ["playwright", "test", "-c", CONFIG], {
  stdio: "inherit",
  shell: true,
});
fs.rmSync(DIR, { recursive: true, force: true });
fs.rmSync(CONFIG, { force: true });
process.exit(r.status ?? 1);
