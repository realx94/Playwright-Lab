"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useBugs } from "@/lib/labs/use-bugs";
import {
  CALLBACK_PATH,
  CLIENT_ID,
  CODES_KEY,
  CODE_TTL_MS,
  SESSION_KEY,
  STATE_KEY,
  TOKEN_TTL_MS,
  USERS_KEY,
  randomState,
  readJson,
  writeJson,
  type CodeEntry,
  type OauthSession,
} from "@/lib/labs/oauth-rules";

/** Ứng dụng đăng nhập bằng LabID theo luồng Authorization Code (có state chống CSRF). */
export function OauthApp() {
  const params = useSearchParams();
  const bugs = useBugs();
  const bugsRef = useRef(bugs);
  const [session, setSession] = useState<OauthSession | null>(null);
  const [users, setUsers] = useState<string[]>([]);
  const [message, setMessage] = useState<{ kind: "error" | "info"; text: string } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    bugsRef.current = bugs;
  }, [bugs]);

  function finish(code: string | null, state: string | null, err: string | null) {
    if (err) return setMessage({ kind: "error", text: err === "access_denied" ? "Bạn đã từ chối cấp quyền" : `Lỗi từ nhà cung cấp: ${err}` });
    if (!code) return;
    // BR-01: state phải khớp. BUG-01: bỏ qua kiểm tra.
    const expected = sessionStorage.getItem(STATE_KEY);
    if (!bugsRef.current.has("BUG-01") && (!state || state !== expected))
      return setMessage({ kind: "error", text: "State không khớp, yêu cầu bị từ chối" });
    const codes = readJson<Record<string, CodeEntry>>(localStorage, CODES_KEY, {});
    const entry = codes[code];
    if (!entry) return setMessage({ kind: "error", text: "Mã xác thực không hợp lệ" });
    // BR-02: code dùng một lần. BUG-02: cho dùng lại.
    if (entry.used && !bugsRef.current.has("BUG-02")) return setMessage({ kind: "error", text: "Mã xác thực đã được sử dụng" });
    if (Date.now() - entry.issuedAt > CODE_TTL_MS) return setMessage({ kind: "error", text: "Mã xác thực đã hết hạn" });
    codes[code] = { ...entry, used: true };
    writeJson(localStorage, CODES_KEY, codes);

    const next: OauthSession = { email: entry.email, name: entry.name, expiresAt: Date.now() + TOKEN_TTL_MS };
    writeJson(localStorage, SESSION_KEY, next);
    // BR-06: cùng email thì dùng lại tài khoản. BUG-03: tạo bản ghi trùng.
    const list = readJson<string[]>(localStorage, USERS_KEY, []);
    if (!list.includes(entry.email) || bugsRef.current.has("BUG-03")) list.push(entry.email);
    writeJson(localStorage, USERS_KEY, list);
    setUsers(list);
    setSession(next);
    setMessage(null);
  }

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const s = readJson<OauthSession | null>(localStorage, SESSION_KEY, null);
    setUsers(readJson<string[]>(localStorage, USERS_KEY, []));
    if (s && s.expiresAt > Date.now()) setSession(s);
    else if (s) {
      localStorage.removeItem(SESSION_KEY);
      setMessage({ kind: "info", text: "Phiên đã hết hạn, vui lòng đăng nhập lại" });
    }
    const code = params.get("code");
    const state = params.get("state");
    const err = params.get("error");
    if (code || err) {
      window.history.replaceState(null, "", "/lab/oauth"); // xoá code khỏi URL ngay để tải lại không xử lý lần hai
      finish(code, state, err);
    }
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */

    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.data?.type !== "oauth-result") return;
      finish(e.data.code, e.data.state, e.data.error);
    };
    window.addEventListener("message", onMessage);
    const t = setInterval(() => {
      const cur = readJson<OauthSession | null>(localStorage, SESSION_KEY, null);
      if (cur && cur.expiresAt <= Date.now()) {
        localStorage.removeItem(SESSION_KEY);
        setSession(null);
        setMessage({ kind: "info", text: "Phiên đã hết hạn, vui lòng đăng nhập lại" });
      }
    }, 1000);
    return () => {
      window.removeEventListener("message", onMessage);
      clearInterval(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function authorizeUrl() {
    const state = randomState();
    sessionStorage.setItem(STATE_KEY, state);
    const u = new URL("/lab/oauth/idp", window.location.origin);
    u.searchParams.set("client_id", CLIENT_ID);
    u.searchParams.set("redirect_uri", window.location.origin + CALLBACK_PATH);
    u.searchParams.set("response_type", "code");
    u.searchParams.set("scope", "profile email");
    u.searchParams.set("state", state);
    const b = [...bugs].join(",");
    if (b) u.searchParams.set("bugs", b);
    return u.toString();
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    setMessage(null);
  }

  function reset() {
    try {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(USERS_KEY);
      localStorage.removeItem(CODES_KEY);
      sessionStorage.removeItem(STATE_KEY);
    } catch {}
    setSession(null);
    setUsers([]);
    setMessage(null);
  }

  if (!ready) return null;

  return (
    <div className="mx-auto max-w-md space-y-4 rounded-xl border p-6">
      <h2 className="text-lg font-semibold">LabApp</h2>
      {message && (
        <p role="alert" className={message.kind === "error" ? "text-sm text-destructive" : "text-sm text-muted-foreground"} data-testid="oauth-message">
          {message.text}
        </p>
      )}
      {session ? (
        <>
          <p data-testid="oauth-welcome">
            Xin chào {session.name} ({session.email})
          </p>
          <Button variant="outline" onClick={logout}>
            Đăng xuất
          </Button>
        </>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => window.location.assign(authorizeUrl())}>Đăng nhập bằng LabID</Button>
          <Button variant="outline" onClick={() => window.open(authorizeUrl(), "labid", "width=480,height=640")}>
            Đăng nhập bằng popup
          </Button>
        </div>
      )}
      <p className="text-sm text-muted-foreground" data-testid="oauth-user-count">
        Tài khoản trong hệ thống: {users.length}
      </p>
      <Button type="button" variant="ghost" size="sm" onClick={reset} data-testid="reset-data">
        Reset dữ liệu lab
      </Button>
    </div>
  );
}
