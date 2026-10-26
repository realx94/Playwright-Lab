"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBugs } from "@/lib/labs/use-bugs";
import { CATEGORIES, money, summarize, validateRange } from "@/lib/labs/dashboard-rules";

const PRESETS = [
  { label: "7 ngày cuối dữ liệu", from: "2026-03-25", to: "2026-03-31" },
  { label: "30 ngày cuối dữ liệu", from: "2026-03-02", to: "2026-03-31" },
  { label: "Tháng 2", from: "2026-02-01", to: "2026-02-28" },
];

const W = 640;
const H = 220;
const PLOT = 170;

/** Bảng điều khiển doanh thu: KPI, biểu đồ cột SVG và bảng số liệu, lọc theo khoảng ngày và danh mục. */
export function DashboardApp() {
  const bugs = useBugs();
  const [from, setFrom] = useState("2026-03-25");
  const [to, setTo] = useState("2026-03-31");
  const [category, setCategory] = useState("all");
  const [showTable, setShowTable] = useState(false);

  const error = validateRange(from, to);
  const data = useMemo(() => (error ? null : summarize(from, to, category, bugs)), [error, from, to, category, bugs]);
  const catLabel = CATEGORIES.find((c) => c.id === category)!.label;

  const max = data ? Math.max(1, ...data.days.map((d) => d.revenue)) : 1;
  const slot = data && data.days.length ? W / data.days.length : W;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <form aria-label="Bộ lọc" onSubmit={(e) => e.preventDefault()} className="space-y-3 rounded-xl border p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="dash-from">Từ ngày</Label>
            <Input id="dash-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dash-to">Đến ngày</Label>
            <Input id="dash-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dash-cat">Danh mục</Label>
            <select id="dash-cat" className="h-8 w-full rounded-lg border bg-background px-2 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <Button
              key={p.label}
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setFrom(p.from);
                setTo(p.to);
              }}
            >
              {p.label}
            </Button>
          ))}
        </div>
        {error && (
          <p role="alert" className="text-sm text-destructive" data-testid="range-error">
            {error}
          </p>
        )}
      </form>

      {data && (
        <>
          <section aria-label="Chỉ số chính" className="grid gap-3 sm:grid-cols-4">
            {[
              ["Doanh thu", money(data.summary.revenue), "kpi-revenue"],
              ["Số đơn", String(data.summary.orders), "kpi-orders"],
              ["Giá trị TB/đơn", money(data.summary.average), "kpi-average"],
              ["So với kỳ trước", data.summary.growth, "kpi-growth"],
            ].map(([label, value, id]) => (
              <div key={id} className="rounded-xl border p-3">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-semibold" data-testid={id}>
                  {value}
                </p>
              </div>
            ))}
          </section>

          <section aria-label="Biểu đồ doanh thu" className="space-y-2 rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold" data-testid="chart-title">
                Doanh thu theo ngày · {catLabel} · {from} đến {to}
              </h2>
              <Button size="sm" variant="outline" onClick={() => setShowTable(!showTable)} aria-pressed={showTable}>
                {showTable ? "Ẩn bảng" : "Xem dạng bảng"}
              </Button>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Biểu đồ cột doanh thu ${catLabel}`} className="w-full" data-testid="chart">
              <line x1="0" y1={PLOT} x2={W} y2={PLOT} stroke="currentColor" strokeOpacity="0.3" />
              {data.days.map((d, i) => {
                const h = Math.round((d.revenue / max) * (PLOT - 10));
                return (
                  <g key={d.date}>
                    <rect
                      data-testid="bar"
                      data-date={d.date}
                      data-value={d.revenue}
                      x={i * slot + slot * 0.15}
                      y={PLOT - h}
                      width={slot * 0.7}
                      height={h}
                      className="fill-primary"
                    >
                      <title>{`${d.date}: ${money(d.revenue)}`}</title>
                    </rect>
                    {data.days.length <= 12 && (
                      <text x={i * slot + slot / 2} y={PLOT + 16} textAnchor="middle" fontSize="11" fill="currentColor">
                        {d.date.slice(5)}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
            {data.days.length === 0 && <p className="text-sm text-muted-foreground">Không có dữ liệu.</p>}
            {showTable && (
              <table className="w-full text-sm" aria-label="Số liệu theo ngày">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th>Ngày</th>
                    <th>Số đơn</th>
                    <th>Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {data.days.map((d) => (
                    <tr key={d.date} data-testid="chart-row">
                      <td>{d.date}</td>
                      <td>{d.orders}</td>
                      <td>{money(d.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        data-testid="reset-data"
        onClick={() => {
          setFrom("2026-03-25");
          setTo("2026-03-31");
          setCategory("all");
          setShowTable(false);
        }}
      >
        Reset bộ lọc
      </Button>
    </div>
  );
}
