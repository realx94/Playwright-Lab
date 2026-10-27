"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SCHEMA_NAME, TABLES, TEST_USER, maskConnection, parseConnection } from "@/lib/byo/neon";

const KEY = "byo:neon";

type Action = "test" | "schema" | "status" | "drop";
type Status = "none" | "saved" | "ok" | "error";

const STATUS_LABEL: Record<Status, string> = {
  none: "Chưa cấu hình",
  saved: "Đã lưu, chưa kiểm tra",
  ok: "Đã kết nối",
  error: "Lỗi",
};

const load = (): string => {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
};
const save = (v: string) => {
  try {
    if (v) localStorage.setItem(KEY, v);
    else localStorage.removeItem(KEY);
  } catch {}
};

interface Result {
  ok: boolean;
  message: string;
  database?: string;
  tables?: string[];
  mode?: "test" | "real";
}

async function call(url: string, action: Action): Promise<Result> {
  try {
    const res = await fetch("/api/byo/neon", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-neon-url": url },
      body: JSON.stringify({ action }),
    });
    return (await res.json()) as Result;
  } catch {
    return { ok: false, message: "Không gọi được proxy Neon" };
  }
}

/** Database Neon của chính người học: kiểm tra kết nối, tạo/xoá schema mẫu, xuất DATABASE_URL. Chuỗi kết nối chỉ nằm trong trình duyệt. */
export function NeonCard() {
  const [url, setUrl] = useState("");
  const [ready, setReady] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [status, setStatus] = useState<Status>("none");
  const [message, setMessage] = useState<string | null>(null);
  const [tables, setTables] = useState<string[] | null>(null);
  const [busy, setBusy] = useState<Action | null>(null);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const v = load();
    setUrl(v);
    setStatus(v ? "saved" : "none");
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  function change(v: string) {
    const t = v.trim();
    setUrl(t);
    save(t);
    setStatus(t ? "saved" : "none");
    setMessage(null);
    setTables(null);
  }

  async function run(action: Action) {
    const p = parseConnection(url);
    if (!p.ok) {
      setStatus("error");
      return setMessage(p.message);
    }
    if (action === "drop" && !window.confirm(`Xoá toàn bộ schema "${SCHEMA_NAME}" và dữ liệu trong đó? Bảng khác của bạn không bị ảnh hưởng.`)) return;
    setBusy(action);
    const r = await call(url, action);
    setBusy(null);
    setStatus(r.ok ? "ok" : "error");
    setMessage(r.message + (r.ok && r.database ? ` (database ${r.database})` : ""));
    if (r.tables) setTables(r.tables);
    else if (!r.ok) setTables(null);
  }

  if (!ready) return null;

  const parsed = parseConnection(url);
  const envText = [
    "# Dán vào file .env của starter repo (file này đã được .gitignore, đừng commit)",
    `DATABASE_URL=${url || "postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"}`,
  ].join("\n");

  return (
    <>
      <section aria-label="Neon" className="space-y-4 rounded-xl border p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Database Postgres qua Neon</h2>
          <Badge variant={status === "error" ? "destructive" : "secondary"} data-testid="neon-status">
            {STATUS_LABEL[status]}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Dùng database của chính bạn để luyện đối chiếu UI ↔ API ↔ DB: test của bạn <code>SELECT</code> thẳng vào Postgres thật. Site chỉ tạo schema mẫu <code>{SCHEMA_NAME}</code> (8 bảng); chuỗi kết nối chỉ lưu trong trình duyệt này, đi kèm từng request tới proxy và không được lưu hay ghi log ở server. Proxy chỉ nhận host <code>*.neon.tech</code> và chỉ chạy các câu SQL cố định.
        </p>

        <div className="space-y-1.5">
          <Label htmlFor="neon-url">Chuỗi kết nối Neon</Label>
          <div className="flex gap-2">
            <Input
              id="neon-url"
              type={reveal ? "text" : "password"}
              autoComplete="off"
              spellCheck={false}
              placeholder="postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
              value={url}
              onChange={(e) => change(e.target.value)}
            />
            <Button type="button" variant="outline" onClick={() => setReveal((v) => !v)} aria-pressed={reveal}>
              {reveal ? "Ẩn chuỗi" : "Hiện chuỗi"}
            </Button>
          </div>
          {url && (
            <p className="text-xs text-muted-foreground" data-testid="neon-masked">
              Đang lưu: {maskConnection(url)}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => run("test")} disabled={busy !== null}>
            {busy === "test" ? "Đang kiểm tra…" : "Test connection"}
          </Button>
          <Button type="button" variant="outline" onClick={() => run("schema")} disabled={busy !== null}>
            {busy === "schema" ? "Đang tạo…" : "Tạo schema mẫu"}
          </Button>
          <Button type="button" variant="outline" onClick={() => run("status")} disabled={busy !== null}>
            Xem bảng hiện có
          </Button>
          <Button type="button" variant="ghost" onClick={() => run("drop")} disabled={busy !== null}>
            Xoá schema mẫu
          </Button>
          <Button type="button" variant="ghost" onClick={() => change("")} data-testid="neon-remove">
            Xoá chuỗi kết nối
          </Button>
        </div>

        {message && (
          <p role="status" className={status === "error" ? "text-sm text-red-700 dark:text-red-400" : "text-sm text-green-700 dark:text-green-400"} data-testid="neon-message">
            {message}
          </p>
        )}
        {tables && (
          <div className="space-y-1.5" data-testid="neon-tables">
            <p className="text-sm font-medium">
              Bảng trong schema {SCHEMA_NAME}: {tables.length}/{TABLES.length}
            </p>
            {tables.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có bảng nào. Bấm “Tạo schema mẫu”.</p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {tables.map((t) => (
                  <li key={t}>
                    <Badge variant="outline">
                      {SCHEMA_NAME}.{t}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      <section aria-label="Hướng dẫn tạo database Neon" className="space-y-3 rounded-xl border p-5">
        <h2 className="text-lg font-semibold">Tạo database Neon và lấy chuỗi kết nối (khoảng 5 phút)</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm">
          <li>Đăng ký tài khoản trên trang chủ Neon. Tài liệu Neon chưa nói rõ gói free có yêu cầu thẻ tín dụng hay không: hãy đọc trang đăng ký và trang giá của họ trước khi nhập thông tin thanh toán.</li>
          <li>Tạo một project (tên và region tuỳ bạn). Neon tạo sẵn một database và một role chủ database; nhánh mặc định thường tên <code>production</code> nếu tạo trên Console.</li>
          <li>Trên Console bấm <b>Connect</b>, chọn branch, database và role. Để bật “Connection pooling” (host có đuôi <code>-pooler</code>) hoặc tắt đều dùng được ở đây. Sao chép chuỗi dạng <code>postgresql://role:password@ep-…neon.tech/dbname?sslmode=require</code>.</li>
          <li>Dán vào ô phía trên rồi bấm <b>Test connection</b>. Thành công sẽ hiện “Kết nối thành công” và tên database.</li>
          <li>Bấm <b>Tạo schema mẫu</b> để tạo 8 bảng <code>{SCHEMA_NAME}.users</code>, <code>orders</code>, <code>order_items</code>, <code>payments</code>, <code>audit_log</code>, <code>webhook_events</code>, <code>otp_codes</code>, <code>emails_outbox</code> kèm vài dòng dữ liệu mẫu. Bấm lại bao nhiêu lần cũng không nhân đôi dữ liệu.</li>
          <li>Chép khối <code>.env</code> bên dưới vào starter repo, rồi dùng <code>DATABASE_URL</code> trong test (xem ví dụ <code>tests/examples/db.spec.ts</code>).</li>
          <li>Gói free (theo trang Plans của Neon): 1 GB mỗi project, 100 CU-giờ mỗi tháng, compute tự tạm dừng sau 5 phút không hoạt động nên lần kết nối đầu sau khi nghỉ có thể chậm hơn bình thường. Giá và giới hạn có thể thay đổi, hãy kiểm tra lại.</li>
          <li>Học xong: bấm “Xoá schema mẫu” hoặc xoá project trên Neon, rồi bấm “Xoá chuỗi kết nối”. Nếu từng dán nhầm mật khẩu ở nơi khác, hãy đặt lại mật khẩu role trong Console.</li>
        </ol>
        <p className="text-sm text-muted-foreground">
          Chưa muốn đăng ký? Dùng chuỗi thử <code>postgresql://{TEST_USER}:demo@ep-demo.neon.tech/neondb</code> để chạy cả luồng mà không kết nối ra ngoài (mật khẩu <code>invalid</code> luôn bị từ chối để luyện kiểm thử lỗi). Giao diện của Neon có thể thay đổi, các tên nút ở trên lấy từ tài liệu của họ.
        </p>
      </section>

      <section aria-label="Xuất DATABASE_URL" className="space-y-3 rounded-xl border p-5">
        <h2 className="text-lg font-semibold">Xuất DATABASE_URL cho starter repo</h2>
        <pre tabIndex={0} className="overflow-x-auto rounded-lg bg-muted p-3 text-xs" data-testid="neon-env">
          {envText}
        </pre>
        {parsed.ok && <p className="text-xs text-muted-foreground">Chuỗi chứa mật khẩu: chỉ dùng database free/thử nghiệm, không nhập dữ liệu thật.</p>}
      </section>
    </>
  );
}
