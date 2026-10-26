// Đóng gói starter-repo thành public/starter-repo.zip (chạy tự động trước `next build`).
import fs from "node:fs";
import path from "node:path";
import { zipSync } from "fflate";

const ROOT = "starter-repo";
const SKIP = new Set(["node_modules", "test-results", "playwright-report", ".env"]);
const files = {};

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else files[path.posix.join("playwright-lab-starter", path.relative(ROOT, full).split(path.sep).join("/"))] = fs.readFileSync(full);
  }
}

walk(ROOT);
fs.mkdirSync("public", { recursive: true });
fs.writeFileSync("public/starter-repo.zip", zipSync(files, { level: 9 }));
console.log(`Đã đóng gói ${Object.keys(files).length} file vào public/starter-repo.zip`);
