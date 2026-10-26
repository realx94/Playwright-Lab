import { Suspense } from "react";
import { TicketsApp } from "@/components/lab/tickets/tickets-app";

export const metadata = { title: "LAB-11 Ticket hỗ trợ" };

export default function TicketsLabPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">LAB-11 · Hỗ trợ khách hàng (ticket &amp; SLA)</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Tạo ticket kèm tệp, đổi trạng thái theo luồng cho phép, theo dõi SLA theo mức ưu tiên (Khẩn 1 giờ, Cao 4 giờ,
        Trung bình 8 giờ, Thấp 24 giờ) bằng <code>page.clock</code>. Bật bug bằng <code>?bugs=BUG-01,BUG-02,BUG-03</code>.
      </p>
      <div className="mt-8">
        <Suspense>
          <TicketsApp />
        </Suspense>
      </div>
    </div>
  );
}
