// Chấm tự động một bài tập bằng mutation grading.
//   npm run grade -- --exercise login-4
// 1) Chạy spec của bạn trên lab SẠCH: phải xanh (không còn test.fixme, không test nào đỏ).
// 2) Chạy lại với từng bug được bật bằng cookie lab_bugs: phải ĐỎ (test của bạn bắt được lỗi).
// Kết quả ghi ra grade-<id>.json để tải lên trang Thống kê của website.
import { spawnSync } from "node:child_process";
import fs from "node:fs";

const idx = process.argv.indexOf("--exercise");
const id = idx >= 0 ? process.argv[idx + 1] : undefined;
const config = JSON.parse(fs.readFileSync("grading.json", "utf8"));

if (!id || !config.exercises[id]) {
  console.error("Thiếu hoặc sai mã bài tập. Ví dụ: npm run grade -- --exercise login-4");
  console.error("Các mã hợp lệ: " + Object.keys(config.exercises).join(", "));
  process.exit(2);
}

const ex = config.exercises[id];
if (!fs.existsSync(ex.spec)) {
  console.error(`Không thấy file ${ex.spec}`);
  process.exit(2);
}

function run(bugs) {
  const out = `.grade-${process.pid}.json`;
  const env = { ...process.env, PLAYWRIGHT_JSON_OUTPUT_NAME: out };
  if (bugs) env.LAB_BUGS = bugs;
  else delete env.LAB_BUGS;
  const r = spawnSync("npx", ["playwright", "test", ex.spec, "--reporter=json", "--workers=1", "--retries=0"], {
    shell: true,
    encoding: "utf8",
    env,
  });
  let stats = { expected: 0, unexpected: 0, skipped: 0, flaky: 0 };
  try {
    stats = JSON.parse(fs.readFileSync(out, "utf8")).stats;
  } catch {
    stats.error = (r.stderr || r.stdout || "").split("\n").slice(-10).join("\n");
  } finally {
    fs.rmSync(out, { force: true });
  }
  return stats;
}

console.log(`Chấm bài ${id} (${ex.lab})…\n`);
const clean = run();
const cleanPassed = clean.unexpected === 0 && clean.flaky === 0 && clean.skipped === 0 && clean.expected >= 1;

const reasons = [];
if (clean.error) reasons.push("Không chạy được test: " + clean.error);
else if (clean.skipped > 0) reasons.push("Còn test.fixme/skip: hãy xoá .fixme và viết test của bạn.");
else if (clean.expected === 0) reasons.push("Không có test nào chạy.");
else if (clean.unexpected > 0 || clean.flaky > 0) reasons.push("Test chưa xanh ổn định trên lab sạch (có test đỏ hoặc flaky).");

console.log(`[1] Lab sạch: ${cleanPassed ? "XANH ✔" : "CHƯA ĐẠT ✘"}`);
for (const r of reasons) console.log("    " + r);

const bugs = [];
for (const bug of ex.bugs) {
  if (!cleanPassed) {
    bugs.push({ id: bug, caught: false });
    continue;
  }
  const s = run(bug);
  const caught = s.unexpected > 0;
  bugs.push({ id: bug, caught });
  console.log(`[2] Bật ${bug}: ${caught ? "test ĐỎ → đã bắt được bug ✔" : "test vẫn XANH → bug lọt qua ✘"}`);
}

const earned = (cleanPassed ? 1 : 0) + bugs.filter((b) => b.caught).length;
const total = 1 + ex.bugs.length;
const result = {
  version: 1,
  exerciseId: id,
  lab: ex.lab,
  cleanPassed,
  bugs,
  reasons,
  gradedAt: new Date().toISOString(),
};
fs.writeFileSync(`grade-${id}.json`, JSON.stringify(result, null, 2));
console.log(`\nĐiểm: ${earned}/${total}. Đã ghi grade-${id}.json (tải lên mục Thống kê của website để lưu).`);
process.exit(earned === total ? 0 : 1);
