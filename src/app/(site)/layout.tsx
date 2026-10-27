import { Analytics } from "@vercel/analytics/next";
import { SelectionPopover } from "@/components/ask-ai/selection-popover";
import { SiteHeader } from "@/components/site/site-header";

/** Khung của site học: header, tìm kiếm, bôi đen hỏi AI. Analytics ẩn danh chỉ bật khi chạy trên Vercel và không áp dụng cho /lab/*. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SelectionPopover />
      {process.env.VERCEL ? <Analytics /> : null}
    </>
  );
}
