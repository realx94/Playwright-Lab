import { Suspense } from "react";
import { BookingApp } from "@/components/lab/booking/booking-app";

export const metadata = { title: "LAB-06 Đặt vé xem phim" };

export default function BookingLabPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">LAB-06 · Đặt vé xem phim (sơ đồ ghế &amp; giữ chỗ)</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Chọn ghế, giữ chỗ 5 phút rồi thanh toán. Mở hai tab cùng một context để thử hai người tranh một ghế. Dùng{" "}
        <code>page.clock</code> để kiểm soát thời gian giữ chỗ. Bật bug bằng <code>?bugs=BUG-01,BUG-02,BUG-03</code>.
      </p>
      <div className="mt-8">
        <Suspense>
          <BookingApp />
        </Suspense>
      </div>
    </div>
  );
}
