import { Suspense } from "react";
import { ClinicApp } from "@/components/lab/clinic/clinic-app";

export const metadata = { title: "LAB-10 Đặt lịch khám" };

export default function ClinicLabPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">LAB-10 · Y tế: đặt lịch khám</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Chọn bác sĩ, ngày và khung giờ (giờ UTC). Khung phải cách bây giờ ít nhất 2 giờ; ngày 2026-03-02 bác sĩ An đã có
        hẹn 08:00 và 09:00, bác sĩ Bình kín cả ngày. Dùng <code>page.clock</code> để cố định “bây giờ”. Bật bug bằng{" "}
        <code>?bugs=BUG-01,BUG-02,BUG-03</code>.
      </p>
      <div className="mt-8">
        <Suspense>
          <ClinicApp />
        </Suspense>
      </div>
    </div>
  );
}
