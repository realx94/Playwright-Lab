import { Suspense } from "react";
import { UploadApp } from "@/components/lab/upload/upload-app";

export const metadata = { title: "LAB-25 Tải tệp lên" };

export default function UploadLabPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">LAB-25 · Tải tệp lên kho lưu trữ</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Thử tệp sai định dạng, rỗng, đúng 2 MB và hơn 2 MB 1 byte, tải nhiều tệp, theo dõi tiến trình và huỷ giữa chừng.
        Bật bug bằng <code>?bugs=BUG-01,BUG-02,BUG-03</code>.
      </p>
      <div className="mt-8">
        <Suspense>
          <UploadApp />
        </Suspense>
      </div>
    </div>
  );
}
