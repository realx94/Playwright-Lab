"use client";

import { useState } from "react";
import Link from "next/link";
import { AskAiKeyword } from "@/components/ask-ai/selection-popover";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { INTERVIEW, TOPICS } from "@/content/interview";

export function InterviewBank() {
  const [topic, setTopic] = useState<string>("Tất cả");
  const list = topic === "Tất cả" ? INTERVIEW : INTERVIEW.filter((q) => q.topic === topic);

  return (
    <div className="space-y-6">
      <div role="group" aria-label="Lọc theo chủ đề" className="flex flex-wrap gap-2">
        {["Tất cả", ...TOPICS].map((t) => (
          <Button
            key={t}
            size="sm"
            variant={topic === t ? "default" : "outline"}
            aria-pressed={topic === t}
            onClick={() => setTopic(t)}
          >
            {t}
          </Button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground" data-testid="interview-count">
        {list.length} câu hỏi
      </p>
      <Accordion className="rounded-xl border px-4">
        {list.map((q) => (
          <AccordionItem key={q.id} value={q.id} data-testid="interview-item">
            <AccordionTrigger>
              <span className="flex flex-col items-start gap-1 text-left">
                <Badge variant="secondary">{q.topic}</Badge>
                <span className="font-medium">{q.question}</span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium">Trả lời ngắn</p>
                  <p>{q.short}</p>
                </div>
                <div>
                  <p className="font-medium">Đào sâu</p>
                  <p>{q.deep}</p>
                </div>
                {q.code && (
                  <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs">
                    <code>{q.code}</code>
                  </pre>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  {q.lesson && (
                    <Link className="underline" href={`/learn/${q.lesson}`}>
                      Xem bài học liên quan
                    </Link>
                  )}
                  <AskAiKeyword term={q.question} />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
