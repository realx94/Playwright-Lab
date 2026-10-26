export const UPLOAD_KEY = "lab:uploads";
export const MAX_BYTES = 2 * 1024 * 1024;
export const MAX_FILES = 5;
export const UPLOAD_MS = 1500;
export const ALLOWED = ["png", "jpg", "jpeg", "pdf"];
export const MIME: Record<string, string[]> = {
  png: ["image/png"],
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  pdf: ["application/pdf"],
};

export const BUGS = [
  { id: "BUG-01", hint: "Giới hạn dung lượng đúng 2 MB" },
  { id: "BUG-02", hint: "Phần mở rộng viết hoa" },
  { id: "BUG-03", hint: "Huỷ khi đang tải lên" },
];

export interface UploadItem {
  id: string;
  name: string;
  size: number;
  url: string;
}

/** Trả về thông báo lỗi hoặc null nếu hợp lệ. */
export function validateFile(f: { name: string; size: number; type: string }, bugs: Set<string>): string | null {
  const m = /\.([^.]+)$/.exec(f.name);
  const raw = m?.[1] ?? "";
  // BR-01: phần mở rộng không phân biệt hoa thường (BUG-02: phân biệt)
  const ext = bugs.has("BUG-02") ? raw : raw.toLowerCase();
  if (!ALLOWED.includes(ext) || (f.type && !MIME[ext]?.includes(f.type))) return "Định dạng không được hỗ trợ (chỉ PNG, JPG, PDF)";
  if (f.size === 0) return "Tệp rỗng";
  // BR-02: tối đa đúng 2 MB (BUG-01: loại luôn tệp đúng 2 MB)
  if (bugs.has("BUG-01") ? f.size >= MAX_BYTES : f.size > MAX_BYTES) return "Tệp vượt quá 2 MB";
  return null;
}

/** Chạy mô phỏng tải lên trong UPLOAD_MS; trả về true nếu hoàn tất, false nếu bị huỷ. */
export function runUpload(onProgress: (percent: number) => void, signal: { cancelled: boolean }): Promise<boolean> {
  const start = Date.now();
  return new Promise((resolve) => {
    const t = setInterval(() => {
      if (signal.cancelled) {
        clearInterval(t);
        return resolve(false);
      }
      const percent = Math.min(100, Math.floor(((Date.now() - start) / UPLOAD_MS) * 100));
      onProgress(percent);
      if (percent >= 100) {
        clearInterval(t);
        resolve(true);
      }
    }, 100);
  });
}

export function uniqueName(name: string, taken: string[]): string {
  if (!taken.includes(name)) return name;
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : "";
  let i = 1;
  while (taken.includes(`${base} (${i})${ext}`)) i++;
  return `${base} (${i})${ext}`;
}

export function loadUploads(): UploadItem[] {
  try {
    return JSON.parse(localStorage.getItem(UPLOAD_KEY) ?? "[]") as UploadItem[];
  } catch {
    return [];
  }
}
