import { ServicesSettings } from "@/components/site/services-settings";

export const metadata = { title: "Dịch vụ của tôi" };

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Dịch vụ của tôi</h1>
      <p className="mb-6 mt-2 text-muted-foreground">
        Kết nối dịch vụ thật bằng tài khoản miễn phí của chính bạn. Không bắt buộc: mọi lab đều chạy được với bản giả có sẵn.
      </p>
      <ServicesSettings />
    </div>
  );
}
