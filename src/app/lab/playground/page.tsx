import { Suspense } from "react";
import { PlaygroundApp } from "@/components/lab/playground/playground-app";

export const metadata = { title: "LAB-13 Tình huống khó" };

export default function PlaygroundLabPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold">LAB-13 · Tình huống khó (Playground)</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Tập hợp các tình huống thường làm test chập chờn. Dùng <code>?delay=3000</code> để đổi thời gian tải trễ.
      </p>
      <div className="mt-8">
        <Suspense>
          <PlaygroundApp />
        </Suspense>
      </div>
    </div>
  );
}
