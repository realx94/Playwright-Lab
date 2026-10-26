import { SmsApp } from "@/components/lab/otp/sms-app";

export const metadata = { title: "Hộp tin nhắn giả" };

export default function SmsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold">Hộp tin nhắn giả</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Mọi SMS do các lab “gửi” sẽ hiện ở đây. Không có tin nhắn thật nào được gửi; dữ liệu chỉ nằm trong trình duyệt của bạn.
      </p>
      <div className="mt-8">
        <SmsApp />
      </div>
    </div>
  );
}
