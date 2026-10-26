"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBugs } from "@/lib/labs/use-bugs";
import {
  CHANNEL,
  CHAT_KEY,
  MAX_LEN,
  MAX_MESSAGES,
  NAME_KEY,
  TYPING_MS,
  loadMessages,
  prepareMessage,
  type ChatMessage,
} from "@/lib/labs/chat-rules";

type Event =
  | { kind: "message"; message: ChatMessage }
  | { kind: "typing"; from: string }
  | { kind: "clear" };

/** Chat thời gian thực giữa các tab bằng BroadcastChannel; lịch sử dùng chung qua localStorage. */
export function ChatApp() {
  const bugs = useBugs();
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [typing, setTyping] = useState<string | null>(null);
  const [unread, setUnread] = useState(0);
  const [visible, setVisible] = useState(true);
  const channel = useRef<BroadcastChannel | null>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const nameRef = useRef("");
  const visibleRef = useRef(true);
  const bugsRef = useRef(bugs);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    nameRef.current = name;
    bugsRef.current = bugs;
  }, [name, bugs]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setMessages(loadMessages());
    try {
      const saved = sessionStorage.getItem(NAME_KEY);
      if (saved) {
        setName(saved);
        setJoined(true);
      }
    } catch {}
    /* eslint-enable react-hooks/set-state-in-effect */

    const ch = new BroadcastChannel(CHANNEL);
    channel.current = ch;
    ch.onmessage = (e: MessageEvent<Event>) => {
      const ev = e.data;
      if (ev.kind === "message") {
        setMessages((m) => [...m, ev.message].slice(-MAX_MESSAGES));
        setTyping(null);
        // BUG-02: bộ đếm chưa đọc tăng cả khi tab đang được xem
        if (!visibleRef.current || bugsRef.current.has("BUG-02")) setUnread((n) => n + 1);
      } else if (ev.kind === "typing") {
        setTyping(ev.from);
        clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => setTyping(null), TYPING_MS);
      } else if (ev.kind === "clear") {
        setMessages([]);
        setUnread(0);
      }
    };

    const onVis = () => {
      const v = document.visibilityState === "visible";
      visibleRef.current = v;
      setVisible(v);
      if (v) setUnread(0);
    };
    document.addEventListener("visibilitychange", onVis);
    onVis();

    return () => {
      ch.close();
      clearTimeout(typingTimer.current);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  useEffect(() => {
    bottom.current?.scrollIntoView?.({ block: "end" });
  }, [messages]);

  function join(e: React.FormEvent) {
    e.preventDefault();
    const n = nameDraft.trim();
    if (!n) return setError("Vui lòng nhập tên hiển thị");
    setName(n);
    setJoined(true);
    setError(null);
    try {
      sessionStorage.setItem(NAME_KEY, n);
    } catch {}
  }

  function send(e: React.FormEvent) {
    e.preventDefault();
    const r = prepareMessage(text, bugs);
    if ("error" in r) return setError(r.error);
    const message: ChatMessage = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, from: name, text: r.text, at: Date.now() };
    const next = [...loadMessages(), message].slice(-MAX_MESSAGES);
    try {
      localStorage.setItem(CHAT_KEY, JSON.stringify(next));
    } catch {}
    setMessages(next);
    channel.current?.postMessage({ kind: "message", message } satisfies Event);
    setText("");
    setError(null);
  }

  function onType(v: string) {
    setText(v);
    channel.current?.postMessage({ kind: "typing", from: name } satisfies Event);
  }

  function clearAll() {
    try {
      localStorage.removeItem(CHAT_KEY);
      sessionStorage.removeItem(NAME_KEY);
    } catch {}
    channel.current?.postMessage({ kind: "clear" } satisfies Event);
    setMessages([]);
    setUnread(0);
    setName("");
    setJoined(false);
    setNameDraft("");
    setError(null);
  }

  if (!joined)
    return (
      <form onSubmit={join} noValidate aria-label="Tham gia phòng chat" className="mx-auto max-w-sm space-y-4 rounded-xl border p-6">
        <h2 className="text-lg font-semibold">Tham gia phòng chat</h2>
        <div className="space-y-1.5">
          <Label htmlFor="chat-name">Tên hiển thị</Label>
          <Input id="chat-name" value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} />
        </div>
        {error && (
          <p role="alert" className="text-sm text-destructive" data-testid="chat-error">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full">
          Vào phòng
        </Button>
        <Button type="button" variant="ghost" className="w-full" onClick={clearAll} data-testid="reset-data">
          Reset dữ liệu lab
        </Button>
      </form>
    );

  return (
    <div className="mx-auto max-w-xl space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm">
          Bạn là <b data-testid="chat-me">{name}</b>
        </p>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" data-testid="chat-unread" data-visible={visible}>
            Chưa đọc: {unread}
          </Badge>
          <Button size="sm" variant="ghost" onClick={clearAll} data-testid="reset-data">
            Reset dữ liệu lab
          </Button>
        </div>
      </div>

      <ul aria-label="Danh sách tin nhắn" aria-live="polite" className="h-72 space-y-2 overflow-y-auto rounded-xl border p-3" data-testid="chat-list">
        {messages.length === 0 && <li className="text-sm text-muted-foreground">Chưa có tin nhắn nào.</li>}
        {messages.map((m) => (
          <li key={m.id} data-testid="chat-message" className={m.from === name ? "text-right" : ""}>
            <span className="text-xs text-muted-foreground">{m.from}</span>
            <p className="inline-block rounded-lg bg-muted px-3 py-1.5 text-sm" data-testid="chat-text">
              {m.text}
            </p>
          </li>
        ))}
        <div ref={bottom} />
      </ul>

      <p className="h-5 text-xs text-muted-foreground" data-testid="chat-typing" aria-live="polite">
        {typing ? `${typing} đang nhập…` : ""}
      </p>

      <form onSubmit={send} noValidate aria-label="Gửi tin nhắn" className="flex gap-2">
        <div className="flex-1 space-y-1">
          <Label htmlFor="chat-input" className="sr-only">
            Soạn nội dung
          </Label>
          <Input id="chat-input" placeholder="Nhập tin nhắn" value={text} onChange={(e) => onType(e.target.value)} />
        </div>
        <Button type="submit">Gửi</Button>
      </form>
      <p className="text-xs text-muted-foreground">{text.length}/{MAX_LEN} ký tự</p>
      {error && (
        <p role="alert" className="text-sm text-destructive" data-testid="chat-error">
          {error}
        </p>
      )}
    </div>
  );
}
