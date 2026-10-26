"use client";

import { useRef } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/** Nút copy nằm cạnh khối code; lấy văn bản từ thẻ pre liền trước. */
export function CopyCodeButton() {
  const ref = useRef<HTMLButtonElement>(null);

  async function copy() {
    const text = ref.current?.parentElement?.querySelector("pre")?.innerText ?? "";
    try {
      await navigator.clipboard.writeText(text);
      toast("Đã copy");
    } catch {
      toast.error("Không copy được, hãy bôi đen và copy thủ công");
    }
  }

  return (
    <Button
      ref={ref}
      type="button"
      size="icon-sm"
      variant="outline"
      aria-label="Copy code"
      onClick={copy}
      className="absolute right-2 top-2 opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
    >
      <Copy className="size-3.5" />
    </Button>
  );
}
