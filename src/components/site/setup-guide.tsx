"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

const KEY = "setup-checklist";

const OS_STEPS: Record<"windows" | "macos", { title: string; body: string; code?: string }[]> = {
  windows: [
    {
      title: "Cài Git",
      body: "Tải Git for Windows từ git-scm.com, giữ các tuỳ chọn mặc định.",
      code: "git --version",
    },
    {
      title: "Cài NVM for Windows",
      body: "Tải nvm-setup.exe từ trang GitHub của nvm-windows (coreybutler/nvm-windows), cài rồi mở PowerShell mới.",
      code: "nvm --version",
    },
    {
      title: "Cài Node.js LTS",
      body: "Dùng NVM để cài và chọn phiên bản LTS.",
      code: "nvm install lts\nnvm use lts\nnode -v",
    },
    {
      title: "Cài VS Code",
      body: "Tải từ code.visualstudio.com, sau đó cài extension “Playwright Test for VS Code”.",
    },
  ],
  macos: [
    {
      title: "Cài Homebrew và Git",
      body: "Làm theo hướng dẫn trên brew.sh, rồi cài Git.",
      code: "brew install git\ngit --version",
    },
    {
      title: "Cài NVM",
      body: "Cài NVM bằng Homebrew rồi thêm cấu hình vào ~/.zshrc theo thông báo của brew; mở Terminal mới.",
      code: "brew install nvm\nnvm --version",
    },
    {
      title: "Cài Node.js LTS",
      body: "Dùng NVM để cài và chọn phiên bản LTS.",
      code: "nvm install --lts\nnvm use --lts\nnode -v",
    },
    {
      title: "Cài VS Code",
      body: "Tải từ code.visualstudio.com, sau đó cài extension “Playwright Test for VS Code”.",
    },
  ],
};

const CHECKS = [
  "Đã cài Git, Node.js LTS và VS Code",
  "Đã tải và giải nén starter repo",
  "Đã chạy npm install và npx playwright install chromium",
  "Đã đặt BASE_URL trong file .env",
  "Đã chạy xanh test 00-smoke và các ví dụ trong tests/examples",
];

function Steps({ os }: { os: "windows" | "macos" }) {
  return (
    <ol className="space-y-4">
      {OS_STEPS[os].map((s, i) => (
        <li key={s.title} className="flex gap-3">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
            {i + 1}
          </span>
          <div className="space-y-1.5">
            <p className="font-medium">{s.title}</p>
            <p className="text-sm text-muted-foreground">{s.body}</p>
            {s.code && (
              <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs">
                <code>{s.code}</code>
              </pre>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function SetupGuide() {
  const [done, setDone] = useState<boolean[]>(() => CHECKS.map(() => false));

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? "null");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (Array.isArray(saved) && saved.length === CHECKS.length) setDone(saved);
    } catch {}
  }, []);

  function toggle(i: number, v: boolean) {
    const next = done.map((x, j) => (j === i ? v : x));
    setDone(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  }

  const count = done.filter(Boolean).length;

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Cài môi trường</h2>
        <Tabs defaultValue="windows">
          <TabsList>
            <TabsTrigger value="windows">Windows</TabsTrigger>
            <TabsTrigger value="macos">macOS</TabsTrigger>
          </TabsList>
          <TabsContent value="windows" className="pt-4">
            <Steps os="windows" />
          </TabsContent>
          <TabsContent value="macos" className="pt-4">
            <Steps os="macos" />
          </TabsContent>
        </Tabs>
      </section>

      <section className="space-y-3" aria-label="Checklist thiết lập">
        <h2 className="text-xl font-semibold">Checklist thiết lập</h2>
        <Progress value={(count / CHECKS.length) * 100} />
        <p className="text-sm text-muted-foreground" data-testid="setup-progress">
          Đã hoàn thành {count}/{CHECKS.length}
        </p>
        <div className="space-y-2">
          {CHECKS.map((c, i) => (
            <div key={c} className="flex items-start gap-2">
              <Checkbox
                id={`setup-${i}`}
                checked={done[i]}
                onCheckedChange={(v) => toggle(i, v === true)}
                className="mt-0.5"
              />
              <Label htmlFor={`setup-${i}`} className="font-normal leading-snug">
                {c}
              </Label>
            </div>
          ))}
        </div>
        {count === CHECKS.length && (
          <p className="rounded-lg bg-green-500/10 p-3 text-sm" data-testid="setup-done">
            Tuyệt vời! Bạn đã sẵn sàng làm bài tập. Hãy bắt đầu từ trang Lab.
          </p>
        )}
      </section>
    </div>
  );
}
