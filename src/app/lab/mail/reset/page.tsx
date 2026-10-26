import { Suspense } from "react";
import { ResetPage } from "@/components/lab/mail/mail-pages";

export const metadata = { title: "Đặt lại mật khẩu" };

export default function MailResetPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <Suspense>
        <ResetPage />
      </Suspense>
    </div>
  );
}
