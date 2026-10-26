import Link from "next/link";
import { Download } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { SetupGuide } from "@/components/site/setup-guide";

export const metadata = { title: "Starter repo & cài đặt" };

export default function StarterPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-10">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Starter repo</h1>
        <p className="text-muted-foreground">
          Project Playwright + TypeScript có sẵn Page Object, fixture và các file bài tập. Tải về, cài
          đặt, trỏ <code>BASE_URL</code> vào website này rồi làm bài.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="/starter-repo.zip"
            download="playwright-lab-starter.zip"
            className={buttonVariants({ size: "lg" })}
            data-testid="download-starter"
          >
            <Download className="size-4" /> Tải starter repo (.zip)
          </a>
          <Link href="/labs" className={buttonVariants({ size: "lg", variant: "outline" })}>
            Xem các lab
          </Link>
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Dùng starter repo</h2>
        <pre tabIndex={0} className="overflow-x-auto rounded-lg bg-muted p-3 text-xs">
          <code>{`unzip playwright-lab-starter.zip   # hoặc giải nén bằng Explorer/Finder
cd playwright-lab-starter
npm install
npx playwright install chromium
cp .env.example .env               # PowerShell: Copy-Item .env.example .env
# mở .env và đặt BASE_URL là địa chỉ website này
npx playwright test 00-smoke`}</code>
        </pre>
        <p className="text-sm text-muted-foreground">
          Mỗi bài tập có một file trong <code>tests/exercises/&lt;lab&gt;/</code>, đang để{" "}
          <code>test.fixme</code>. Đọc đề ở trang lab tương ứng, viết test, rồi quay lại website để tick
          tiêu chí và nộp bài.
        </p>
      </section>

      <SetupGuide />
    </div>
  );
}
