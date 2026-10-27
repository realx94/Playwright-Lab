import { Suspense } from "react";
import { ReportsApp } from "@/components/lab/reports/reports-app";

export const metadata = { title: "LAB-31 Xuất báo cáo" };

export default function ReportsLabPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold">LAB-31 · Xuất báo cáo nhiều định dạng</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Báo cáo đơn hàng bán lẻ: lọc theo tháng và trạng thái rồi tải về Excel, XML, Word, PDF hoặc CSV từ{" "}
        <code>/api/lab/report/&lt;định-dạng&gt;?month=&amp;status=</code>. Bật bug bằng <code>?bugs=BUG-01,BUG-02,BUG-03</code>.
      </p>
      <div className="mt-8">
        <Suspense>
          <ReportsApp />
        </Suspense>
      </div>
    </div>
  );
}
