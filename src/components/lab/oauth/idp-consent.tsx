"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CALLBACK_PATH,
  CLIENT_ID,
  CODES_KEY,
  IDP_ACCOUNTS,
  readJson,
  writeJson,
  type CodeEntry,
} from "@/lib/labs/oauth-rules";

/** Trang đồng ý của nhà cung cấp danh tính giả (Fake IdP). */
export function IdpConsent() {
  const params = useSearchParams();
  const clientId = params.get("client_id");
  const redirectUri = params.get("redirect_uri") ?? "";
  const state = params.get("state") ?? "";
  const bugs = params.get("bugs");
  const scope = params.get("scope") ?? "profile email";
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  // BR-04: chỉ chấp nhận đúng redirect_uri đã đăng ký, nếu sai thì không chuyển hướng.
  let redirectOk = false;
  try {
    const u = new URL(redirectUri, window.location.origin);
    redirectOk = u.origin === window.location.origin && u.pathname === CALLBACK_PATH;
  } catch {}

  if (clientId !== CLIENT_ID)
    return (
      <p role="alert" className="rounded-xl border p-6 text-destructive" data-testid="idp-error">
        Lỗi: client_id không hợp lệ.
      </p>
    );
  if (!redirectOk)
    return (
      <p role="alert" className="rounded-xl border p-6 text-destructive" data-testid="idp-error">
        Lỗi: redirect_uri không khớp với địa chỉ đã đăng ký.
      </p>
    );

  function go(extra: Record<string, string>) {
    const u = new URL(redirectUri, window.location.origin);
    for (const [k, v] of Object.entries(extra)) u.searchParams.set(k, v);
    u.searchParams.set("state", state);
    if (bugs) u.searchParams.set("bugs", bugs);
    window.location.assign(u.toString());
  }

  function allow() {
    const acc = IDP_ACCOUNTS.find((a) => a.email === email);
    if (!acc) return setError("Vui lòng chọn một tài khoản");
    const code = `c-${Math.random().toString(36).slice(2, 10)}`;
    const codes = readJson<Record<string, CodeEntry>>(localStorage, CODES_KEY, {});
    codes[code] = { email: acc.email, name: acc.name, issuedAt: Date.now(), used: false };
    writeJson(localStorage, CODES_KEY, codes);
    go({ code });
  }

  return (
    <div className="mx-auto max-w-md space-y-4 rounded-xl border p-6">
      <h2 className="text-lg font-semibold">LabID — Cấp quyền truy cập</h2>
      <p className="text-sm">
        Ứng dụng <b>LabApp</b> muốn truy cập: <span data-testid="idp-scope">{scope}</span>
      </p>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Chọn tài khoản</legend>
        {IDP_ACCOUNTS.map((a, i) => (
          <label key={a.email} htmlFor={`acc-${i}`} className="flex items-center gap-2 text-sm">
            <input id={`acc-${i}`} type="radio" name="account" value={a.email} checked={email === a.email} onChange={() => setEmail(a.email)} />
            {a.name} ({a.email})
          </label>
        ))}
      </fieldset>
      {error && (
        <p role="alert" className="text-sm text-destructive" data-testid="idp-message">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <Button onClick={allow}>Cho phép</Button>
        <Button variant="outline" onClick={() => go({ error: "access_denied" })}>
          Từ chối
        </Button>
      </div>
    </div>
  );
}
