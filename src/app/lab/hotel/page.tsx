import { Suspense } from "react";
import { HotelApp } from "@/components/lab/hotel/hotel-app";

export const metadata = { title: "LAB-29 Tìm & đặt phòng khách sạn" };

export default function HotelLabPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold">LAB-29 · Tìm &amp; đặt phòng khách sạn</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Tìm theo thành phố và khoảng ngày trên lịch tuỳ biến, lọc/sắp xếp kết quả, đặt phòng và nhận mã xác nhận. Bật bug bằng{" "}
        <code>?bugs=BUG-01,BUG-02,BUG-03</code>.
      </p>
      <div className="mt-8">
        <Suspense>
          <HotelApp />
        </Suspense>
      </div>
    </div>
  );
}
