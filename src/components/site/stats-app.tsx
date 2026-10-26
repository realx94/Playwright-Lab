"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Download, FileCheck, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { attemptFromGrade } from "@/lib/labs/grading";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  storage,
  type AskAiEntry,
  type ExportData,
  type LessonProgress,
  type QuizAttempt,
  type ExerciseAttempt,
} from "@/lib/storage";

export interface LessonRef {
  slug: string;
  title: string;
  level: number;
}

function fmt(sec: number) {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  return m < 60 ? `${m} phút` : `${Math.floor(m / 60)}g ${m % 60}p`;
}

export function StatsApp({ lessons }: { lessons: LessonRef[] }) {
  const [progress, setProgress] = useState<LessonProgress[] | null>(null);
  const [asks, setAsks] = useState<AskAiEntry[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [exercises, setExercises] = useState<ExerciseAttempt[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const gradeRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    setProgress(await storage.listProgress());
    setAsks(await storage.listAsk());
    setExercises((await storage.listExercises()).sort((a, b) => b.takenAt - a.takenAt));
    setAttempts((await storage.listAttempts()).sort((a, b) => b.takenAt - a.takenAt));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh().catch(() => setProgress([]));
  }, [refresh]);

  async function exportData() {
    const data = await storage.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "playwright-lab-data.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importData(file: File) {
    try {
      const data = JSON.parse(await file.text()) as ExportData;
      await storage.importAll(data);
      await refresh();
      toast.success("Đã nhập dữ liệu");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "File không hợp lệ");
    }
  }

  async function importGrade(file: File) {
    try {
      const attempt = attemptFromGrade(JSON.parse(await file.text()));
      await storage.saveExercise(attempt);
      await refresh();
      toast.success(`Đã lưu kết quả chấm: ${attempt.checked}/${attempt.total}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "File kết quả không hợp lệ");
    }
  }

  async function clearAll() {
    if (!window.confirm("Xoá toàn bộ lịch sử học trên trình duyệt này?")) return;
    await storage.clearAll();
    await refresh();
    toast("Đã xoá dữ liệu");
  }

  if (!progress) return null;

  const byId = new Map(progress.map((p) => [p.lessonId, p]));
  const doneCount = lessons.filter((l) => byId.get(l.slug)?.status === "done").length;
  const totalSec = progress.reduce((s, p) => s + p.timeSpentSec, 0);
  const pct = lessons.length ? Math.round((doneCount / lessons.length) * 100) : 0;
  const last = [...progress].sort((a, b) => b.lastViewedAt - a.lastViewedAt)[0];
  const lastLesson = last && lessons.find((l) => l.slug === last.lessonId);
  const levels = [...new Set(lessons.map((l) => l.level))];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Hoàn thành</CardDescription>
            <CardTitle data-testid="stat-done">
              {doneCount}/{lessons.length} bài ({pct}%)
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Thời gian học</CardDescription>
            <CardTitle data-testid="stat-time">{fmt(totalSec)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Số lần hỏi Google AI</CardDescription>
            <CardTitle data-testid="stat-asks">{asks.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {lastLesson && (
        <p className="text-sm">
          Học gần nhất:{" "}
          <Link className="font-medium underline" href={`/learn/${lastLesson.slug}`}>
            {lastLesson.title}
          </Link>
        </p>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Tiến độ theo level</h2>
        {levels.map((lv) => {
          const inLv = lessons.filter((l) => l.level === lv);
          const d = inLv.filter((l) => byId.get(l.slug)?.status === "done").length;
          return (
            <div key={lv} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Level {lv}</span>
                <span>
                  {d}/{inLv.length}
                </span>
              </div>
              <Progress value={(d / inLv.length) * 100} aria-label={`Tiến độ Level ${lv}`} />
            </div>
          );
        })}
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Lịch sử bài học</h2>
        <ul className="divide-y rounded-xl border">
          {lessons.map((l) => {
            const p = byId.get(l.slug);
            return (
              <li key={l.slug} className="flex items-center justify-between gap-3 p-3 text-sm">
                <Link href={`/learn/${l.slug}`} className="hover:underline">
                  {l.title}
                </Link>
                <span className="flex items-center gap-2 text-muted-foreground">
                  {p ? fmt(p.timeSpentSec) : "—"}
                  <Badge variant={p?.status === "done" ? "default" : "outline"}>
                    {p?.status === "done" ? "Xong" : p ? "Đang học" : "Chưa học"}
                  </Badge>
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {attempts.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Lịch sử làm quiz</h2>
          <ul className="divide-y rounded-xl border" data-testid="quiz-history">
            {attempts.slice(0, 10).map((a) => (
              <li key={a.id} className="flex items-center justify-between p-3 text-sm">
                <span>
                  {a.quizId === "placement" ? "Bài kiểm tra đầu vào" : (lessons.find((l) => l.slug === a.quizId)?.title ?? a.quizId)} ·{" "}
                  {new Date(a.takenAt).toLocaleString("vi-VN")}
                </span>
                <Badge variant={a.score === a.total ? "default" : "secondary"}>
                  {a.score}/{a.total} · {fmt(a.durationSec)}
                </Badge>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-2" aria-label="Chấm tự động">
        <h2 className="text-lg font-semibold">Kết quả chấm tự động</h2>
        <p className="text-sm text-muted-foreground">
          Chạy <code>npm run grade -- --exercise &lt;mã bài&gt;</code> trong starter repo, rồi tải file{" "}
          <code>grade-&lt;mã bài&gt;.json</code> lên đây. Kết quả không có máy chủ xác thực nên chỉ dùng để tự học.
        </p>
        <Button variant="outline" onClick={() => gradeRef.current?.click()}>
          <FileCheck className="size-4" /> Tải kết quả chấm
        </Button>
        <input
          ref={gradeRef}
          type="file"
          accept="application/json"
          hidden
          data-testid="grade-input"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) importGrade(f);
            e.target.value = "";
          }}
        />
      </section>

      {exercises.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Lịch sử đánh giá bài tập lab</h2>
          <ul className="divide-y rounded-xl border" data-testid="exercise-history">
            {exercises.slice(0, 10).map((a) => (
              <li key={a.id} className="flex items-center justify-between p-3 text-sm">
                <span>
                  {a.labSlug} · {a.exerciseId} · {new Date(a.takenAt).toLocaleString("vi-VN")}
                </span>
                <span className="flex items-center gap-2">
                  {a.graded && <Badge variant="outline">Chấm tự động</Badge>}
                  {!a.graded && <Badge variant="outline">Tự đánh giá</Badge>}
                  {a.solutionViewed && <Badge variant="outline">Đã xem đáp án</Badge>}
                  <Badge variant={a.checked === a.total ? "default" : "secondary"}>
                    {a.checked}/{a.total}
                  </Badge>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {asks.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Thuật ngữ đã hỏi AI</h2>
          <div className="flex flex-wrap gap-2">
            {[...new Set(asks.map((a) => a.term))].slice(-30).map((t) => (
              <Badge key={t} variant="secondary">
                {t}
              </Badge>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Dữ liệu của bạn</h2>
        <p className="text-sm text-muted-foreground">
          Dữ liệu chỉ lưu trên trình duyệt này. Hãy xuất file để sao lưu hoặc chuyển máy.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportData}>
            <Download className="size-4" /> Xuất JSON
          </Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <Upload className="size-4" /> Nhập JSON
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            hidden
            data-testid="import-input"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importData(f);
              e.target.value = "";
            }}
          />
          <Button variant="destructive" onClick={clearAll}>
            <Trash2 className="size-4" /> Xoá dữ liệu
          </Button>
        </div>
      </section>
    </div>
  );
}
