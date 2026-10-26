import { Suspense } from "react";
import { WebhooksApp } from "@/components/lab/webhooks/webhooks-app";

export const metadata = { title: "LAB-22 Webhook & sự kiện" };

export default function WebhooksLabPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">LAB-22 · Webhook &amp; sự kiện bất đồng bộ</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Hệ thống nhận <code>POST /api/lab/webhook</code> từ đối tác. Chữ ký:{" "}
        <code>x-signature = sha256=HMAC_SHA256(secret, timestamp + &quot;.&quot; + body)</code> với header{" "}
        <code>x-timestamp</code> (giây) và secret <code>whsec_lab_secret</code>. Trạng thái:{" "}
        <code>GET /api/lab/webhook/state</code>. Sự kiện có id bắt đầu bằng <code>evt_flaky</code> bị lỗi 503 hai lần
        đầu. Bật bug bằng <code>?bugs=BUG-01,BUG-02,BUG-03</code>.
      </p>
      <div className="mt-8">
        <Suspense>
          <WebhooksApp />
        </Suspense>
      </div>
    </div>
  );
}
