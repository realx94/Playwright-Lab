import type { ReactNode } from "react";

/**
 * Sơ đồ minh hoạ cho bài học (US-02.04). Là SVG nhúng trực tiếp, dùng token màu của theme
 * nên đúng cả chế độ sáng và tối. Trong bài viết bằng khối code có ngôn ngữ `diagram`:
 *
 * ```diagram
 * pyramid
 * ```
 */

const BOX = "fill-muted stroke-border";
const BOX_PRIMARY = "fill-primary/10 stroke-primary";
const TEXT = "fill-foreground";

function Frame({ label, caption, viewBox, children }: { label: string; caption: string; viewBox: string; children: ReactNode }) {
  return (
    <figure className="not-prose my-6 rounded-xl border bg-card p-4" data-testid="diagram">
      <svg viewBox={viewBox} role="img" aria-label={label} className="mx-auto h-auto w-full max-w-2xl" fontFamily="inherit">
        <defs>
          <marker id="dg-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" className="fill-foreground" />
          </marker>
        </defs>
        {children}
      </svg>
      <figcaption className="mt-3 text-center text-sm text-muted-foreground">{caption}</figcaption>
    </figure>
  );
}

function Box({ x, y, w, h, lines, primary = false }: { x: number; y: number; w: number; h: number; lines: string[]; primary?: boolean }) {
  const lh = 17;
  const top = y + h / 2 - ((lines.length - 1) * lh) / 2;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={9} strokeWidth={1.5} className={primary ? BOX_PRIMARY : BOX} />
      {lines.map((t, i) => (
        <text key={i} x={x + w / 2} y={top + i * lh} textAnchor="middle" dominantBaseline="middle" fontSize={i === 0 ? 14 : 12} fontWeight={i === 0 ? 600 : 400} className={TEXT}>
          {t}
        </text>
      ))}
    </g>
  );
}

function Arrow({ x1, y1, x2, y2, label, dashed = false }: { x1: number; y1: number; x2: number; y2: number; label?: string; dashed?: boolean }) {
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={1.6} strokeDasharray={dashed ? "5 4" : undefined} markerEnd="url(#dg-arrow)" className="stroke-foreground" />
      {label && (
        <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 8} textAnchor="middle" fontSize={12} className={TEXT}>
          {label}
        </text>
      )}
    </g>
  );
}

function Pyramid() {
  const layer = (y: number, w: number, lines: string[], primary = false) => (
    <g>
      <rect x={300 - w / 2} y={y} width={w} height={70} rx={9} strokeWidth={1.5} className={primary ? BOX_PRIMARY : BOX} />
      {lines.map((t, i) => (
        <text key={i} x={300} y={y + 26 + i * 20} textAnchor="middle" fontSize={i === 0 ? 14 : 12} fontWeight={i === 0 ? 600 : 400} className={TEXT}>
          {t}
        </text>
      ))}
    </g>
  );
  return (
    <Frame label="Kim tự tháp kiểm thử: nhiều unit test ở đáy, ít test UI ở đỉnh" caption="Càng lên cao test càng chậm, đắt và dễ vỡ nên càng ít; Playwright thường nằm ở hai tầng trên." viewBox="0 0 600 290">
      {layer(10, 200, ["UI / E2E", "ít, chậm, sát người dùng"], true)}
      {layer(90, 380, ["API / Tích hợp", "vừa phải, kiểm tra các thành phần nói chuyện với nhau"], true)}
      {layer(170, 560, ["Unit test", "nhiều, rất nhanh, do lập trình viên viết"])}
      <text x={300} y={266} textAnchor="middle" fontSize={12} className={TEXT}>
        Số lượng tăng dần, tốc độ nhanh dần khi xuống đáy
      </text>
    </Frame>
  );
}

function DomTree() {
  const node = (x: number, y: number, t: string, primary = false) => <Box x={x} y={y} w={104} h={34} lines={[t]} primary={primary} />;
  const link = (x1: number, y1: number, x2: number, y2: number) => <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={1.5} className="stroke-foreground" />;
  return (
    <Frame label="Cây DOM: html chứa head và body, body chứa tiêu đề và form có ô nhập và nút" caption="Trình duyệt biến HTML thành cây phần tử. Locator của Playwright tìm các nút trên cây này." viewBox="0 0 640 300">
      {link(320, 44, 160, 80)}
      {link(320, 44, 440, 80)}
      {link(160, 114, 80, 150)}
      {link(440, 114, 330, 150)}
      {link(440, 114, 550, 150)}
      {link(550, 184, 490, 220)}
      {link(550, 184, 610, 220)}
      {node(268, 10, "<html>")}
      {node(108, 80, "<head>")}
      {node(388, 80, "<body>")}
      {node(28, 150, "<title>")}
      {node(278, 150, "<h1>")}
      {node(498, 150, "<form>", true)}
      {node(438, 220, "<input>", true)}
      {node(558, 220, "<button>", true)}
    </Frame>
  );
}

function GitAreas() {
  return (
    <Frame label="Ba vùng của Git: thư mục làm việc, vùng staging, kho lưu trữ" caption="add đưa thay đổi vào khung hình, commit chụp ảnh cất vào album, restore --staged lấy ra khỏi khung hình." viewBox="0 0 640 190">
      <Box x={10} y={50} w={160} h={80} lines={["Working directory", "file bạn đang sửa"]} />
      <Box x={240} y={50} w={160} h={80} lines={["Staging area", "thay đổi chờ commit"]} primary />
      <Box x={470} y={50} w={160} h={80} lines={["Repository", "lịch sử các commit"]} />
      <Arrow x1={172} y1={78} x2={238} y2={78} label="git add" />
      <Arrow x1={402} y1={78} x2={468} y2={78} label="git commit" />
      <Arrow x1={238} y1={110} x2={172} y2={110} label="restore --staged" dashed />
    </Frame>
  );
}

function Pom() {
  return (
    <Frame label="Page Object Model: file test gọi Page Object, Page Object giữ locator và thao tác trên trang" caption="Giao diện đổi thì chỉ sửa Page Object; các file test vẫn đọc như kịch bản nghiệp vụ." viewBox="0 0 640 230">
      <Box x={10} y={20} w={170} h={70} lines={["Test spec", "login.spec.ts"]} />
      <Box x={235} y={20} w={170} h={70} lines={["Page Object", "LoginPage.ts"]} primary />
      <Box x={460} y={20} w={170} h={70} lines={["Trang web", "page + locator"]} />
      <Arrow x1={182} y1={55} x2={233} y2={55} label="gọi" />
      <Arrow x1={407} y1={55} x2={458} y2={55} label="điều khiển" />
      <Box x={235} y={140} w={170} h={70} lines={["Fixture", "tạo sẵn loginPage"]} />
      <Arrow x1={320} y1={138} x2={320} y2={92} label="cấp" />
      <Arrow x1={235} y1={175} x2={95} y2={92} dashed />
    </Frame>
  );
}

function CiFlow() {
  const steps = ["Push / PR", "checkout", "setup-node", "npm ci", "cài browser", "chạy test", "upload report"];
  const w = 78;
  const gap = 14;
  return (
    <Frame label="Luồng CI: push hoặc PR, checkout, cài Node, cài thư viện và trình duyệt, chạy test, tải báo cáo lên" caption="Mỗi bước là một step trong workflow GitHub Actions; test đỏ thì job đỏ và PR bị chặn." viewBox="0 0 640 190">
      {steps.map((s, i) => (
        <g key={s}>
          <Box x={i * (w + gap)} y={50} w={w} h={64} lines={s.split(" ").length > 1 ? s.split(" ") : [s]} primary={i === 5} />
          {i < steps.length - 1 && <Arrow x1={i * (w + gap) + w + 1} y1={82} x2={(i + 1) * (w + gap) - 1} y2={82} />}
        </g>
      ))}
      <text x={320} y={160} textAnchor="middle" fontSize={12} className={TEXT}>
        Toàn bộ chạy trên máy ảo ubuntu-latest của GitHub, sạch sẽ mỗi lần
      </text>
    </Frame>
  );
}

function LocatorPriority() {
  const items = [
    ["1. getByRole", "vai trò + tên truy cập được"],
    ["2. getByLabel / getByPlaceholder", "ô nhập có nhãn"],
    ["3. getByText", "chữ hiển thị"],
    ["4. getByTestId", "data-testid ổn định"],
    ["5. CSS / XPath", "chỉ khi không còn cách nào"],
  ];
  return (
    <Frame label="Thứ tự ưu tiên chọn locator từ getByRole đến CSS hoặc XPath" caption="Chọn từ trên xuống: càng gần cách người dùng nhìn thấy trang thì test càng bền." viewBox="0 0 640 330">
      {items.map(([a, b], i) => (
        <Box key={a} x={60 + i * 20} y={10 + i * 62} w={520 - i * 40} h={50} lines={[a, b]} primary={i === 0} />
      ))}
    </Frame>
  );
}

const DIAGRAMS: Record<string, () => ReactNode> = {
  pyramid: Pyramid,
  "dom-tree": DomTree,
  "git-areas": GitAreas,
  pom: Pom,
  "ci-flow": CiFlow,
  "locator-priority": LocatorPriority,
};

export const DIAGRAM_NAMES = Object.keys(DIAGRAMS);

export function Diagram({ name }: { name: string }) {
  const Comp = DIAGRAMS[name.trim()];
  if (!Comp) return <p className="my-4 rounded-lg border border-dashed p-3 text-sm text-muted-foreground">Không có sơ đồ “{name.trim()}”.</p>;
  return <Comp />;
}
