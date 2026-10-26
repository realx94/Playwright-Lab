import { InboxApp } from "@/components/lab/otp/inbox-app";

export const metadata = { title: "Hộp thư giả" };

export default function InboxPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold">Hộp thư giả</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Mọi email do các lab “gửi” sẽ hiện ở đây. Dữ liệu chỉ nằm trong trình duyệt của bạn.
      </p>
      <div className="mt-8">
        <InboxApp />
      </div>
    </div>
  );
}
