import { Suspense } from "react";
import { I18nApp } from "@/components/lab/i18n/i18n-app";

export const metadata = { title: "LAB-16 Đa ngôn ngữ & responsive" };

export default function I18nLabPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold">LAB-16 · Đa ngôn ngữ &amp; responsive</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Mặc định theo <code>navigator.language</code> (đổi bằng <code>locale</code> của context), chọn thủ công thì ghi
        nhớ. Điểm gãy bố cục là 640 px (<code>viewport</code> / <code>devices[...]</code>). Bật bug bằng{" "}
        <code>?bugs=BUG-01,BUG-02,BUG-03</code>.
      </p>
      <div className="mt-8">
        <Suspense>
          <I18nApp />
        </Suspense>
      </div>
    </div>
  );
}
