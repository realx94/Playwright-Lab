import { SelectionPopover } from "@/components/ask-ai/selection-popover";
import { SiteHeader } from "@/components/site/site-header";

/** Khung của site học: header, tìm kiếm, bôi đen hỏi AI. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SelectionPopover />
    </>
  );
}
