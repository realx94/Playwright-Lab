import { InterviewBank } from "@/components/site/interview-bank";

export const metadata = { title: "Câu hỏi phỏng vấn" };

export default function InterviewPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Câu hỏi phỏng vấn Playwright</h1>
      <p className="mt-2 text-muted-foreground">
        Mỗi câu có <b>trả lời ngắn</b> để nói trước và <b>đào sâu</b> để ghi điểm. Hãy tự trả lời thành tiếng trước khi
        mở đáp án.
      </p>
      <div className="mt-8">
        <InterviewBank />
      </div>
    </div>
  );
}
