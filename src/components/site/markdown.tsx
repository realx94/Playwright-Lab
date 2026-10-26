import type { ComponentProps } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { CopyCodeButton } from "@/components/site/copy-code-button";

function Pre({ children, ...props }: ComponentProps<"pre">) {
  return (
    <div className="group relative not-prose my-4">
      <pre {...props} className="overflow-x-auto rounded-lg border bg-muted p-4 text-sm leading-relaxed">
        {children}
      </pre>
      <CopyCodeButton />
    </div>
  );
}

/** Render Markdown của bài học: bảng (GFM), tô màu cú pháp, nút copy cho khối code. */
export function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[[rehypeHighlight, { detect: false, ignoreMissing: true }]]}
      components={{ pre: Pre }}
    >
      {children}
    </ReactMarkdown>
  );
}
