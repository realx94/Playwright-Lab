"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBugs } from "@/lib/labs/use-bugs";
import { CSV_KEY, MAX_BYTES, importRows, loadCustomers, parseCsv, toCsv, type Customer, type ImportResult } from "@/lib/labs/csv-rules";

/** Nhập/xuất danh bạ khách hàng bằng CSV: kiểm tra từng dòng, báo lỗi theo số dòng, xuất đúng chuẩn RFC 4180. */
export function CsvApp() {
  const bugs = useBugs();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [fatal, setFatal] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setCustomers(loadCustomers());
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  function save(list: Customer[]) {
    setCustomers(list);
    try {
      localStorage.setItem(CSV_KEY, JSON.stringify(list));
    } catch {}
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    setResult(null);
    setFatal(null);
    if (!file) return;
    // BR-05: chỉ nhận .csv không quá 100 KB
    if (!file.name.toLowerCase().endsWith(".csv") || file.size > MAX_BYTES) return setFatal("Chỉ chấp nhận tệp .csv tối đa 100 KB");
    const out = importRows(parseCsv(await file.text()), customers, bugs);
    if ("fatal" in out) return setFatal(out.fatal);
    save(out.list);
    setResult(out.result);
  }

  function exportCsv() {
    // BUG-01: không escape dấu phẩy và dấu nháy trong dữ liệu
    const blob = new Blob([toCsv(customers, !bugs.has("BUG-01"))], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customers.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function reset() {
    try {
      localStorage.removeItem(CSV_KEY);
    } catch {}
    setCustomers([]);
    setResult(null);
    setFatal(null);
  }

  if (!ready) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <section aria-label="Nhập CSV" className="space-y-3 rounded-xl border p-5">
        <h2 className="text-lg font-semibold">Nhập danh sách từ CSV</h2>
        <p className="text-sm text-muted-foreground">
          Tiêu đề bắt buộc: <code>name,email,phone</code>. Tối đa 100 dòng, tệp .csv tối đa 100 KB.
        </p>
        <div className="space-y-1.5">
          <Label htmlFor="csv-file">Chọn tệp CSV</Label>
          <Input id="csv-file" type="file" accept=".csv,text/csv" onChange={onFile} />
        </div>
        {fatal && (
          <p role="alert" className="text-sm text-destructive" data-testid="csv-fatal">
            {fatal}
          </p>
        )}
        {result && (
          <div className="space-y-1" data-testid="csv-result">
            <p className="text-sm font-medium" data-testid="csv-summary">
              Đã nhập {result.imported} dòng, bỏ qua {result.skipped} dòng lỗi
            </p>
            <ul className="space-y-0.5 text-sm text-destructive">
              {result.errors.map((er) => (
                <li key={er} data-testid="csv-error">
                  {er}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section aria-label="Khách hàng" className="space-y-3 rounded-xl border p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Khách hàng ({customers.length})</h2>
          <Button size="sm" variant="outline" onClick={exportCsv} disabled={customers.length === 0}>
            Xuất CSV
          </Button>
        </div>
        {customers.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có khách hàng.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-1">Tên</th>
                <th>Email</th>
                <th>Điện thoại</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c, i) => (
                <tr key={i} data-testid="customer-row">
                  <td className="py-1">{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <Button type="button" variant="ghost" size="sm" onClick={reset} data-testid="reset-data">
        Reset dữ liệu lab
      </Button>
    </div>
  );
}
