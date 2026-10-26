import { Suspense } from "react";
import { TimezoneApp } from "@/components/lab/timezone/timezone-app";

export const metadata = { title: "LAB-28 Đặt lịch theo múi giờ" };

export default function TimezoneLabPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">LAB-28 · Đặt lịch theo múi giờ &amp; đồng hồ</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Mười hai khung giờ cố định theo UTC (01:00–12:00) được hiển thị theo múi giờ chọn hoặc múi giờ trình duyệt
        (đổi bằng <code>timezoneId</code>). Khung giờ đã qua không đặt được, và đóng đặt trước giờ bắt đầu 2 giờ. Điều
        khiển “bây giờ” bằng <code>page.clock</code>. Ngày 2026-03-08 là ngày nước Mỹ chuyển giờ mùa hè. Bật bug bằng{" "}
        <code>?bugs=BUG-01,BUG-02,BUG-03</code>.
      </p>
      <div className="mt-8">
        <Suspense>
          <TimezoneApp />
        </Suspense>
      </div>
    </div>
  );
}
