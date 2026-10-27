import { Suspense } from "react";
import { KanbanApp } from "@/components/lab/kanban/kanban-app";

export const metadata = { title: "LAB-30 Bảng công việc Kanban" };

export default function KanbanLabPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold">LAB-30 · Bảng công việc Kanban</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Kéo thả thẻ giữa ba cột, sửa tiêu đề tại chỗ, menu chuột phải và phím tắt. Bật bug bằng{" "}
        <code>?bugs=BUG-01,BUG-02,BUG-03</code>.
      </p>
      <div className="mt-8">
        <Suspense>
          <KanbanApp />
        </Suspense>
      </div>
    </div>
  );
}
