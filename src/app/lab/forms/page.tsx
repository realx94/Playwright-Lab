import { FormsApp } from "@/components/lab/forms/forms-app";

export const metadata = { title: "LAB-02 Form đa dạng" };

export default function FormsLabPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold">LAB-02 · Form đa dạng</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Luyện locator và action cho: input, number, radio, checkbox, select native và tuỳ biến,
        switch, slider, date, upload, textarea.
      </p>
      <ul className="mt-4 list-disc space-y-1 pl-5 text-sm">
        <li>BR-01 Họ tên bắt buộc, tối đa 50 ký tự.</li>
        <li>BR-02 Tuổi là số nguyên từ 18 đến 65.</li>
        <li>BR-03 Chọn ít nhất 1 sở thích.</li>
        <li>BR-04 Tệp png/jpg/pdf, tối đa 2MB.</li>
        <li>BR-05 Ngày sinh không ở tương lai.</li>
        <li>BR-06 Bắt buộc đồng ý điều khoản.</li>
      </ul>
      <div className="mt-8">
        <FormsApp />
      </div>
    </div>
  );
}
