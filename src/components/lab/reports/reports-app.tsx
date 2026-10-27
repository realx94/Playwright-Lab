"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useBugs } from "@/lib/labs/use-bugs";
import { MONTHS, STATUSES, filterOrders, money, summaryByStatus, sumCents, viDate, type Format } from "@/lib/labs/reports-rules";

const EXPORTS: { format: Format; label: string }[] = [
  { format: "xlsx", label: "Xuất Excel" },
  { format: "xml", label: "Xuất XML" },
  { format: "docx", label: "Xuất Word" },
  { format: "pdf", label: "Xuất PDF" },
  { format: "csv", label: "Xuất CSV" },
];

/** Báo cáo đơn hàng: bảng xem trước + các nút tải tệp từ Route Handler theo đúng bộ lọc đang chọn. */
export function ReportsApp() {
  const bugs = useBugs();
  const [month, setMonth] = useState("");
  const [status, setStatus] = useState("");

  const list = filterOrders({ month, status });
  const total = sumCents(list);

  function download(format: Format) {
    const q = new URLSearchParams({ month, status });
    if (bugs.size) q.set("bugs", [...bugs].join(","));
    const a = document.createElement("a");
    a.href = `/api/lab/report/${format}?${q.toString()}`;
    a.download = ""; // tải xuống trực tiếp, không điều hướng trang
    a.click();
  }

  return (
    <div className="space-y-6">
      <section aria-label="Bộ lọc báo cáo" className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="rp-month">Tháng</Label>
          <select id="rp-month" className="h-8 rounded-lg border bg-background px-2 text-sm" value={month} onChange={(e) => setMonth(e.target.value)}>
            <option value="">Tất cả</option>
            {MONTHS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rp-status">Trạng thái đơn</Label>
          <select id="rp-status" className="h-8 rounded-lg border bg-background px-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Tất cả</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setMonth("");
            setStatus("");
          }}
          data-testid="reset-data"
        >
          Reset dữ liệu lab
        </Button>
      </section>

      <section aria-label="Xuất tệp" className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {EXPORTS.map((e) => (
            <Button key={e.format} type="button" variant="outline" size="sm" onClick={() => download(e.format)} data-testid={`export-${e.format}`}>
              {e.label}
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Lưu ý: PDF dùng font chuẩn không có dấu tiếng Việt nên nội dung trong PDF được viết không dấu (ví dụ &quot;Hoan tat&quot;); Word, Excel, XML và CSV giữ nguyên tiếng Việt.
        </p>
      </section>

      <section aria-label="Xem trước báo cáo" className="space-y-2">
        <p className="text-sm" data-testid="report-summary">
          <span data-testid="report-count">{list.length}</span> đơn · Tổng tiền <span data-testid="report-total">{money(total)}</span> ₫
        </p>
        <div className="overflow-x-auto" tabIndex={0}>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th>Mã đơn</th>
                <th>Ngày</th>
                <th>Khách hàng</th>
                <th>Trạng thái</th>
                <th className="text-right">Số tiền (₫)</th>
              </tr>
            </thead>
            <tbody>
              {list.map((o) => (
                <tr key={o.id} data-testid="report-row" data-order={o.id} className="border-t">
                  <td>{o.id}</td>
                  <td>{viDate(o.at)}</td>
                  <td>{o.customer}</td>
                  <td>{o.status}</td>
                  <td className="text-right tabular-nums">{money(o.cents)}</td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-3 text-muted-foreground">
                    Không có đơn nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <ul className="text-sm text-muted-foreground" data-testid="report-by-status">
          {summaryByStatus(list).map((s) => (
            <li key={s.status} data-status={s.status}>
              {s.status}: {s.count} đơn · {money(s.cents)} ₫
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
