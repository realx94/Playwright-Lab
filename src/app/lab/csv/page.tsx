import { Suspense } from "react";
import { CsvApp } from "@/components/lab/csv/csv-app";

export const metadata = { title: "LAB-27 Nhập/xuất CSV" };

export default function CsvLabPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">LAB-27 · Nhập/xuất CSV &amp; đối chiếu dữ liệu</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Tải lên CSV (<code>setInputFiles</code>), xem báo cáo lỗi theo số dòng, rồi xuất lại (<code>download</code>) và
        đối chiếu với giao diện. Bật bug bằng <code>?bugs=BUG-01,BUG-02,BUG-03</code>.
      </p>
      <div className="mt-8">
        <Suspense>
          <CsvApp />
        </Suspense>
      </div>
    </div>
  );
}
