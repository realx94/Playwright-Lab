import { Suspense } from "react";
import { TodoApp } from "@/components/lab/todo/todo-app";

export const metadata = { title: "LAB-04 Quản lý công việc" };

export default function TodoLabPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">LAB-04 · Quản lý công việc (CRUD)</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Bật bug bằng <code>?bugs=BUG-01,BUG-02,BUG-03</code>. Dữ liệu được giữ trong trình duyệt.
      </p>
      <div className="mt-8">
        <Suspense>
          <TodoApp />
        </Suspense>
      </div>
    </div>
  );
}
