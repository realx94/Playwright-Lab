"use client";

import { useState } from "react";
import { Download, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WORKSHOPS, toCsv } from "@/lib/labs/testcases";

export function TestCaseWorkshop({ lab }: { lab: string }) {
  const ws = WORKSHOPS[lab];
  const [shown, setShown] = useState(false);
  if (!ws) return null;

  function download() {
    const blob = new Blob([toCsv(ws.cases)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `test-cases-${lab}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section aria-label="Test Case Workshop" className="mt-12 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold">Test Case Workshop</h2>
          <p className="text-sm text-muted-foreground">
            Tự thiết kế test case trước, rồi mới bấm hiện đáp án để đối chiếu. Kỹ thuật gợi ý:{" "}
            {ws.techniques.join(", ")}.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShown((v) => !v)}>
            {shown ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            {shown ? "Ẩn đáp án" : "Hiện đáp án"}
          </Button>
          <Button variant="outline" size="sm" onClick={download} disabled={!shown}>
            <Download className="size-4" /> Tải CSV
          </Button>
        </div>
      </div>

      {!shown ? (
        <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
          <p className="mb-2 font-medium text-foreground">Business Rules cần phủ:</p>
          <ul className="list-disc space-y-1 pl-5">
            {ws.rules.map((r) => (
              <li key={r.id}>
                <b>{r.id}</b> {r.text}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <Tabs defaultValue="cases">
          <TabsList>
            <TabsTrigger value="cases">Test case mẫu ({ws.cases.length})</TabsTrigger>
            <TabsTrigger value="matrix">Ma trận BR × TC</TabsTrigger>
          </TabsList>
          <TabsContent value="cases">
            <div className="overflow-x-auto rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Các bước</TableHead>
                    <TableHead>Dữ liệu</TableHead>
                    <TableHead>Kết quả mong đợi</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Ưu tiên</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ws.cases.map((c) => (
                    <TableRow key={c.id} data-testid={`tc-${c.id}`}>
                      <TableCell className="font-mono text-xs">{c.id}</TableCell>
                      <TableCell className="font-medium">{c.title}</TableCell>
                      <TableCell className="whitespace-normal">{c.steps}</TableCell>
                      <TableCell className="whitespace-normal">{c.data}</TableCell>
                      <TableCell className="whitespace-normal">{c.expected}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{c.type}</Badge>
                      </TableCell>
                      <TableCell>{c.priority}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          <TabsContent value="matrix">
            <div className="overflow-x-auto rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business Rule</TableHead>
                    <TableHead>Test case phủ</TableHead>
                    <TableHead>Số TC</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ws.rules.map((r) => {
                    const ids = ws.cases.filter((c) => c.br.includes(r.id)).map((c) => c.id);
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="whitespace-normal">
                          <b>{r.id}</b> {r.text}
                        </TableCell>
                        <TableCell className="whitespace-normal font-mono text-xs">
                          {ids.join(", ") || "—"}
                        </TableCell>
                        <TableCell>{ids.length}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </section>
  );
}
