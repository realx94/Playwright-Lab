import { isValidElement, type ComponentProps } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { CopyCodeButton } from "@/components/site/copy-code-button";
import { Diagram } from "@/components/site/diagrams";

/** Khối code có ngôn ngữ `diagram` được vẽ thành sơ đồ SVG (xem diagrams.tsx) thay vì hiện như code. */
function diagramName(children: ComponentProps<"pre">["children"]): string | null {
  const child = Array.isArray(children) ? children[0] : children;
  if (!isValidElement(child)) return null;
  const p = child.props as { className?: string; children?: unknown };
  if (typeof p.className !== "string" || !p.className.split(" ").includes("language-diagram")) return null;
  return Array.isArray(p.children) ? p.children.join("") : String(p.children ?? "");
}

function Pre({ children, ...props }: ComponentProps<"pre">) {
  const diagram = diagramName(children);
  if (diagram !== null) return <Diagram name={diagram} />;
  return (
    <div className="group relative not-prose my-4">
      <pre {...props} tabIndex={0} className="overflow-x-auto rounded-lg border bg-muted p-4 text-sm leading-relaxed">
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
