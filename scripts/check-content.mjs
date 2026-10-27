// Kiểm tra nội dung (US-13.03): frontmatter, code fence, link nội bộ, tham chiếu bài học trong glossary/interview.
// Chạy: npm run check:content   (CONTENT_ROOT=<thư mục> để kiểm tra thư mục khác, dùng cho test của chính script này)
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const root = process.env.CONTENT_ROOT ? path.resolve(process.env.CONTENT_ROOT) : process.cwd();
const learnDir = path.join(root, "src", "content", "learn");

const STATIC_PAGES = new Set([
  "/", "/learn", "/labs", "/starter", "/stats", "/interview", "/glossary", "/cheatsheet", "/placement",
  "/settings/services", "/lab/inbox", "/lab/sms",
]);
const REQUIRED = ["title", "level", "order", "minutes", "summary", "keywords"];

const errors = [];
const fail = (file, msg) => errors.push(`${path.relative(root, file)}: ${msg}`);

const readIf = (p) => (fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "");

// Slug lab lấy từ registry; slug bài học lấy từ tên file.
const labSlugs = new Set([...readIf(path.join(root, "src", "lib", "labs", "registry.ts")).matchAll(/slug:\s*"([a-z0-9-]+)"/g)].map((m) => m[1]));
const files = fs.existsSync(learnDir) ? fs.readdirSync(learnDir).filter((f) => f.endsWith(".md")) : [];
const lessonSlugs = new Set(files.map((f) => f.replace(/\.md$/, "")));

function validRoute(route) {
  const clean = route.replace(/[?#].*$/, "").replace(/\/$/, "") || "/";
  if (STATIC_PAGES.has(clean)) return true;
  let m = /^\/learn\/([^/]+)$/.exec(clean);
  if (m) return lessonSlugs.has(m[1]);
  m = /^\/labs\/([^/]+)$/.exec(clean);
  if (m) return labSlugs.has(m[1]);
  m = /^\/lab\/([^/]+)(?:\/[^/]+)?$/.exec(clean);
  if (m) return labSlugs.has(m[1]) || ["inbox", "sms"].includes(m[1]);
  return false;
}

const orders = new Map();
for (const f of files) {
  const file = path.join(learnDir, f);
  const raw = fs.readFileSync(file, "utf8");
  const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw);
  if (!fm) {
    fail(file, "thiếu frontmatter");
    continue;
  }
  // YAML hợp lệ (tiêu đề có dấu hai chấm phải bọc nháy) và đúng kiểu: lỗi này làm hỏng build production.
  try {
    const data = matter(raw).data;
    for (const k of ["level", "order", "minutes"]) if (data[k] !== undefined && typeof data[k] !== "number") fail(file, `frontmatter "${k}" phải là số`);
    if (typeof data.title !== "string" || !data.title.trim()) fail(file, 'frontmatter "title" phải là chuỗi');
    if (!Array.isArray(data.keywords)) fail(file, 'frontmatter "keywords" phải là danh sách');
  } catch (e) {
    fail(file, `frontmatter không phải YAML hợp lệ: ${String(e.reason ?? e.message).split(String.fromCharCode(10))[0]}`);
    continue;
  }
  for (const k of REQUIRED) if (!new RegExp(`^${k}:`, "m").test(fm[1])) fail(file, `frontmatter thiếu "${k}"`);
  const level = /^level:\s*(\d+)/m.exec(fm[1])?.[1];
  const order = /^order:\s*(\d+)/m.exec(fm[1])?.[1];
  if (level && order) {
    const key = `${level}.${order}`;
    if (orders.has(key)) fail(file, `trùng level/order ${key} với ${orders.get(key)}`);
    orders.set(key, f);
  }

  const body = raw.slice(fm[0].length);
  const fences = body.split(/\r?\n/).filter((l) => /^\s*(```|~~~)/.test(l)).length;
  if (fences % 2 !== 0) fail(file, "số dòng mở/đóng code fence là số lẻ (có khối code chưa đóng)");

  // Chỉ xét ngoài khối code: link markdown nội bộ và đường dẫn /labs/..., /lab/..., /learn/... trong văn bản.
  const prose = body.replace(/(```|~~~)[\s\S]*?\1/g, "");
  for (const m of prose.matchAll(/\]\((\/[^)\s]*)\)/g)) if (!validRoute(m[1])) fail(file, `link nội bộ hỏng: ${m[1]}`);
  for (const m of prose.matchAll(/`(\/(?:labs?|learn)\/[a-z0-9-]+(?:\/[a-z0-9-]+)?)`/g)) if (!validRoute(m[1])) fail(file, `đường dẫn trong văn bản không tồn tại: ${m[1]}`);
}

// Tham chiếu bài học trong glossary và interview.
for (const rel of [["src", "content", "glossary.ts"], ["src", "content", "interview.ts"]]) {
  const file = path.join(root, ...rel);
  for (const m of readIf(file).matchAll(/lesson:\s*"([^"]+)"/g)) if (!lessonSlugs.has(m[1])) fail(file, `tham chiếu bài học không tồn tại: ${m[1]}`);
}

if (errors.length) {
  console.error(`Phát hiện ${errors.length} lỗi nội dung:\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
console.log(`Nội dung hợp lệ: ${files.length} bài học, ${labSlugs.size} lab.`);
