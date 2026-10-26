"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PAGE_SIZE = 20;
const MAX_ITEMS = 60;

const PAYMENT_FRAME = `<!doctype html><html><body style="font-family:sans-serif;padding:8px">
<form id="f">
  <label for="card">Số thẻ</label>
  <input id="card" style="margin:0 8px;padding:4px" />
  <button type="submit">Thanh toán</button>
</form>
<p id="msg" role="status"></p>
<script>
  document.getElementById("f").onsubmit = function (e) {
    e.preventDefault();
    var v = document.getElementById("card").value.replace(/\\s/g, "");
    document.getElementById("msg").textContent =
      v.length >= 12 ? "Thanh toán thành công" : "Số thẻ không hợp lệ";
  };
</script></body></html>`;

function Section({ title, id, children }: { title: string; id: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2 id={id} className="text-base">
            {title}
          </h2>
        </CardTitle>
      </CardHeader>
      <CardContent aria-labelledby={id} role="region" className="space-y-3 text-sm">
        {children}
      </CardContent>
    </Card>
  );
}

function DialogSection() {
  const [result, setResult] = useState("Chưa chọn");
  const [name, setName] = useState("");
  return (
    <Section id="sec-dialog" title="Hộp thoại của trình duyệt">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => window.alert("Xin chào từ alert")}>
          Hiện alert
        </Button>
        <Button
          variant="outline"
          onClick={() => setResult(window.confirm("Bạn có chắc không?") ? "Đồng ý" : "Huỷ")}
        >
          Hiện confirm
        </Button>
        <Button
          variant="outline"
          onClick={() => setName(window.prompt("Nhập tên của bạn", "Khách") ?? "(bỏ qua)")}
        >
          Hiện prompt
        </Button>
      </div>
      <p>
        Bạn đã chọn: <span data-testid="confirm-result">{result}</span>
      </p>
      <p>
        Tên đã nhập: <span data-testid="prompt-result">{name || "—"}</span>
      </p>
    </Section>
  );
}

function ShadowSection() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current;
    if (!el || el.shadowRoot) return;
    const root = el.attachShadow({ mode: "open" });
    root.innerHTML =
      '<button id="b" style="padding:4px 10px">Bấm trong shadow</button> <span id="r" role="status"></span>';
    root.getElementById("b")!.addEventListener("click", () => {
      root.getElementById("r")!.textContent = "Đã bấm trong shadow DOM";
    });
  }, []);
  return (
    <Section id="sec-shadow" title="Shadow DOM">
      <div ref={host} data-testid="shadow-host" />
    </Section>
  );
}

function DragSection() {
  const [dropped, setDropped] = useState<string | null>(null);
  return (
    <Section id="sec-drag" title="Kéo và thả">
      <div className="flex items-center gap-6">
        <div
          draggable
          data-testid="drag-item"
          onDragStart={(e) => e.dataTransfer.setData("text/plain", "Thẻ A")}
          className="cursor-grab rounded-md border bg-muted px-4 py-2"
        >
          Thẻ A
        </div>
        <div
          data-testid="drop-zone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            setDropped(e.dataTransfer.getData("text/plain"));
          }}
          className="flex h-16 w-40 items-center justify-center rounded-md border-2 border-dashed"
        >
          Vùng thả
        </div>
      </div>
      <p>
        Đã thả: <span data-testid="drop-result">{dropped ?? "chưa có"}</span>
      </p>
      <Button size="sm" variant="ghost" onClick={() => setDropped(null)}>
        Đặt lại
      </Button>
    </Section>
  );
}

function DelaySection({ delay }: { delay: number }) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  function load() {
    setState("loading");
    timer.current = setTimeout(() => setState("done"), delay);
  }
  return (
    <Section id="sec-delay" title={`Nội dung tải trễ (${delay} ms)`}>
      <Button variant="outline" onClick={load} disabled={state === "loading"}>
        Tải dữ liệu
      </Button>
      {state === "loading" && <p role="status">Đang tải…</p>}
      {state === "done" && (
        <p role="status" data-testid="delay-result">
          Đã tải xong
        </p>
      )}
    </Section>
  );
}

function ScrollSection() {
  const [count, setCount] = useState(PAGE_SIZE);
  const sentinel = useRef<HTMLDivElement>(null);
  const more = useCallback(() => setCount((c) => Math.min(c + PAGE_SIZE, MAX_ITEMS)), []);
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => entries[0].isIntersecting && more(), {
      root: el.parentElement,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [more, count]);
  return (
    <Section id="sec-scroll" title="Cuộn vô hạn">
      <div
        data-testid="scroll-list"
        tabIndex={0}
        role="region"
        aria-label="Danh sách cuộn vô hạn"
        className="h-40 overflow-auto rounded-md border"
      >
        <ul>
          {Array.from({ length: count }, (_, i) => (
            <li key={i} className="border-b px-3 py-2">
              Mục {i + 1}
            </li>
          ))}
        </ul>
        <div ref={sentinel} className="h-1" />
      </div>
      <p>
        Đã tải <span data-testid="scroll-count">{count}</span>/{MAX_ITEMS} mục
      </p>
    </Section>
  );
}

function DownloadSection() {
  function download() {
    const blob = new Blob(["Ghi chú từ Playwright Lab\n"], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ghi-chu.txt";
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <Section id="sec-download" title="Tải xuống tệp">
      <Button variant="outline" onClick={download}>
        Tải tệp ghi chú
      </Button>
    </Section>
  );
}

export function PlaygroundApp() {
  const params = useSearchParams();
  const raw = Number(params.get("delay"));
  const delay = Number.isFinite(raw) && raw > 0 ? Math.min(raw, 10_000) : 1500;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <DialogSection />
      <Section id="sec-tab" title="Mở tab mới">
        <Link
          href="/lab/playground/help"
          target="_blank"
          rel="noopener"
          className="text-primary underline"
        >
          Mở trang trợ giúp
        </Link>
      </Section>
      <Section id="sec-iframe" title="iframe thanh toán">
        <iframe
          title="Khung thanh toán"
          data-testid="payment-frame"
          srcDoc={PAYMENT_FRAME}
          className="h-28 w-full rounded-md border"
        />
      </Section>
      <ShadowSection />
      <DragSection />
      <DelaySection delay={delay} />
      <ScrollSection />
      <DownloadSection />
    </div>
  );
}
