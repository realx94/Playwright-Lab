export const TOTP_KEY = "lab:totp";

export const STEP_SECONDS = 30;
export const DIGITS = 6;
export const MAX_FAILS = 3;
export const RECOVERY_COUNT = 10;
export const PASSWORD = "Passw0rd!";
export const ACCOUNT = "user@lab.dev";

export const BUGS = [
  { id: "BUG-01", hint: "Độ lệch thời gian được chấp nhận" },
  { id: "BUG-02", hint: "Mã khôi phục sau khi dùng" },
  { id: "BUG-03", hint: "Dùng lại cùng một mã TOTP" },
];

export interface RecoveryCode {
  code: string;
  used: boolean;
}

export interface TotpState {
  secret: string;
  enabled: boolean;
  recovery: RecoveryCode[];
  lastStep: number;
  fails: number;
  locked: boolean;
  phase: "out" | "password" | "in";
}

export const emptyTotpState: TotpState = {
  secret: "",
  enabled: false,
  recovery: [],
  lastStep: -1,
  fails: 0,
  locked: false,
  phase: "out",
};

const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function randomSecret(length = 16): string {
  const buf = new Uint8Array(length);
  crypto.getRandomValues(buf);
  return Array.from(buf, (b) => B32[b % 32]).join("");
}

export function base32Decode(input: string): Uint8Array {
  const clean = input.replace(/=+$/, "").toUpperCase();
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    const idx = B32.indexOf(ch);
    if (idx < 0) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return new Uint8Array(out);
}

/** RFC 4226 HOTP với HMAC-SHA1 (WebCrypto). */
export async function hotp(secret: string, counter: number): Promise<string> {
  const key = await crypto.subtle.importKey("raw", base32Decode(secret) as BufferSource, { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const msg = new ArrayBuffer(8);
  const view = new DataView(msg);
  view.setUint32(0, Math.floor(counter / 2 ** 32));
  view.setUint32(4, counter >>> 0);
  const h = new Uint8Array(await crypto.subtle.sign("HMAC", key, msg));
  const off = h[h.length - 1] & 0xf;
  const bin = ((h[off] & 0x7f) << 24) | (h[off + 1] << 16) | (h[off + 2] << 8) | h[off + 3];
  return String(bin % 10 ** DIGITS).padStart(DIGITS, "0");
}

export const stepOf = (ms: number) => Math.floor(ms / 1000 / STEP_SECONDS);

/** Trả về bước thời gian khớp với mã (trong cửa sổ ±window), hoặc null. */
export async function matchTotp(secret: string, code: string, nowMs: number, window: number): Promise<number | null> {
  const cur = stepOf(nowMs);
  for (let d = -window; d <= window; d++) {
    if ((await hotp(secret, cur + d)) === code) return cur + d;
  }
  return null;
}

export function makeRecoveryCodes(): RecoveryCode[] {
  return Array.from({ length: RECOVERY_COUNT }, () => {
    const buf = new Uint8Array(4);
    crypto.getRandomValues(buf);
    const hex = Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
    return { code: `${hex.slice(0, 4)}-${hex.slice(4)}`, used: false };
  });
}

export function loadTotp(): TotpState {
  try {
    const raw = localStorage.getItem(TOTP_KEY);
    return raw ? { ...emptyTotpState, ...JSON.parse(raw) } : emptyTotpState;
  } catch {
    return emptyTotpState;
  }
}
