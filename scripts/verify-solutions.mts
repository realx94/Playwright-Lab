// Kiểm tra mọi đáp án mẫu của bài tập:
//   1) chạy xanh trên lab sạch;
//   2) với bài "bắt bug" (exercise.bugs), phải ĐỎ khi bật từng bug đó (qua cookie lab_bugs).
// Chạy: npm run verify:solutions
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import { EXERCISES } from "../src/lib/labs/exercises.ts";

const DIR = ".tmp-solutions";
const CONFIG = ".tmp-solutions.config.ts";
const PORT = 3100;

fs.rmSync(DIR, { recursive: true, force: true });
fs.mkdirSync(DIR);
const all = Object.values(EXERCISES).flat();
for (const ex of all) fs.writeFileSync(`${DIR}/${ex.id}.spec.ts`, ex.solution);

// Config đặt ở thư mục gốc để đọc được LAB_BUGS và playwright.config.ts gốc.
fs.writeFileSync(
  CONFIG,
  `import base from "./playwright.config";
import { defineConfig } from "@playwright/test";
export default defineConfig({ ...base, testDir: "./${DIR}", reporter: "list", webServer: undefined });
`,
);

function run(args: string[], env: Record<string, string> = {}) {
  return spawnSync("npx", ["playwright", "test", "-c", CONFIG, ...args], {
    stdio: "pipe",
    shell: true,
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
}

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://localhost:${PORT}/labs`);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("Server không khởi động được");
}

let server: ReturnType<typeof spawn> | undefined;
let failed = 0;

try {
  console.log("Build site…");
  const build = spawnSync("npm", ["run", "build"], { shell: true, stdio: "ignore" });
  if (build.status !== 0) throw new Error("Build thất bại");
  server = spawn("npx", ["next", "start", "-p", String(PORT)], { shell: true, stdio: "ignore" });
  await waitForServer();

  console.log(`\n[1/2] Đáp án phải xanh trên lab sạch (${all.length} bài)`);
  const clean = run([]);
  const summary = clean.stdout.split("\n").filter((l) => /passed|failed|did not run|skipped/.test(l)).join(" | ");
  console.log(`  ${clean.status === 0 ? "OK" : "LỖI"}: ${summary}`);
  if (clean.status !== 0) {
    failed++;
    console.log(clean.stdout.split("\n").slice(-40).join("\n"));
  }

  console.log("\n[2/2] Bài bắt bug phải ĐỎ khi bật đúng bug");
  for (const ex of all.filter((e) => e.bugs?.length)) {
    for (const bug of ex.bugs!) {
      const r = run([`${DIR}/${ex.id}.spec.ts`], { LAB_BUGS: bug });
      const caught = r.status !== 0 && /failed/.test(r.stdout);
      if (!caught) failed++;
      console.log(`  ${caught ? "OK  " : "LỖI"} ${ex.id} bắt ${bug}`);
    }
  }
} finally {
  if (server?.pid) spawnSync("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore", shell: true });
  fs.rmSync(DIR, { recursive: true, force: true });
  fs.rmSync(CONFIG, { force: true });
}

console.log(failed ? `\n${failed} kiểm tra không đạt` : "\nTất cả đáp án đạt yêu cầu");
process.exit(failed ? 1 : 0);
