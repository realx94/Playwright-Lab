import { LabList } from "@/components/site/lab-list";
import { LABS } from "@/lib/labs/registry";

export const metadata = { title: "Lab" };

export default function LabsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 sm:pt-14">
      <p className="text-sm font-semibold uppercase tracking-wider text-primary">Thực hành</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Danh sách Lab</h1>
      <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
        Chọn một tình huống nghiệp vụ, đọc yêu cầu rồi viết test trên ứng dụng mẫu. Lab xếp từ dễ đến khó; hãy học lần lượt theo mức, hoặc lọc theo domain và kỹ năng bạn cần luyện.
      </p>
      <LabList labs={LABS} />
    </div>
  );
}
