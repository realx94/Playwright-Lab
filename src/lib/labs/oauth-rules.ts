export const CLIENT_ID = "lab-app";
export const CALLBACK_PATH = "/lab/oauth/callback";
export const CODE_TTL_MS = 60_000;
export const TOKEN_TTL_MS = 60 * 60_000;

export const STATE_KEY = "lab:oauth:state";
export const CODES_KEY = "lab:oauth:codes";
export const SESSION_KEY = "lab:oauth:session";
export const USERS_KEY = "lab:oauth:users";

export const BUGS = [
  { id: "BUG-01", hint: "Kiểm tra tham số state ở bước callback" },
  { id: "BUG-02", hint: "Số lần dùng được của authorization code" },
  { id: "BUG-03", hint: "Đăng nhập lại bằng cùng một email" },
];

export const IDP_ACCOUNTS = [
  { email: "alice@lab.dev", name: "Alice Nguyễn" },
  { email: "bob@lab.dev", name: "Bob Trần" },
];

export interface CodeEntry {
  email: string;
  name: string;
  issuedAt: number;
  used: boolean;
}

export interface OauthSession {
  email: string;
  name: string;
  expiresAt: number;
}

export function randomState(): string {
  const buf = new Uint8Array(12);
  crypto.getRandomValues(buf);
  return Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function readJson<T>(storage: Storage, key: string, fallback: T): T {
  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson(storage: Storage, key: string, value: unknown) {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {}
}
