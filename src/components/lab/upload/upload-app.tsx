"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBugs } from "@/lib/labs/use-bugs";
import {
  MAX_FILES,
  UPLOAD_KEY,
  loadUploads,
  runUpload,
  uniqueName,
  validateFile,
  type UploadItem,
} from "@/lib/labs/upload-rules";

/** Tải tệp lên kho lưu trữ giả: kiểm tra định dạng/dung lượng, tiến trình, huỷ, giới hạn 5 tệp. */
export function UploadApp() {
  const bugs = useBugs();
  const [items, setItems] = useState<UploadItem[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [current, setCurrent] = useState<{ name: string; percent: number } | null>(null);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);
  const signal = useRef({ cancelled: false });
  const itemsRef = useRef<UploadItem[]>([]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const saved = loadUploads();
    itemsRef.current = saved;
    setItems(saved);
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  function persist(list: UploadItem[]) {
    itemsRef.current = list;
    setItems(list);
    try {
      localStorage.setItem(UPLOAD_KEY, JSON.stringify(list));
    } catch {}
  }

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    setErrors([]);
    const errs: string[] = [];
    for (const f of files) {
      const err = validateFile(f, bugs);
      if (err) {
        errs.push(`${f.name}: ${err}`);
        continue;
      }
      if (itemsRef.current.length >= MAX_FILES) {
        errs.push(`${f.name}: Đã đạt tối đa ${MAX_FILES} tệp`);
        continue;
      }
      signal.current = { cancelled: false };
      setCurrent({ name: f.name, percent: 0 });
      const done = await runUpload((percent) => setCurrent({ name: f.name, percent }), signal.current);
      setCurrent(null);
      // BUG-03: huỷ không có tác dụng, tệp vẫn được thêm
      if (!done && !bugs.has("BUG-03")) {
        errs.push(`${f.name}: Đã huỷ tải lên`);
        continue;
      }
      const name = uniqueName(f.name, itemsRef.current.map((i) => i.name));
      const id = `f-${Date.now().toString(36)}-${itemsRef.current.length}`;
      persist([...itemsRef.current, { id, name, size: f.size, url: `https://cdn.lab.dev/files/${id}/${encodeURIComponent(name)}` }]);
      if (f.type.startsWith("image/")) setThumbs((t) => ({ ...t, [id]: URL.createObjectURL(f) }));
    }
    setErrors(errs);
  }

  function reset() {
    signal.current.cancelled = true;
    try {
      localStorage.removeItem(UPLOAD_KEY);
    } catch {}
    persist([]);
    setErrors([]);
    setThumbs({});
    setCurrent(null);
  }

  if (!ready) return null;

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <section aria-label="Tải tệp lên" className="space-y-3 rounded-xl border p-5">
        <h2 className="text-lg font-semibold">Tải tệp lên</h2>
        <p className="text-sm text-muted-foreground">PNG, JPG hoặc PDF; tối đa 2 MB mỗi tệp; tối đa {MAX_FILES} tệp. Chọn được nhiều tệp.</p>
        <div className="space-y-1.5">
          <Label htmlFor="upload-file">Chọn tệp</Label>
          <Input id="upload-file" type="file" multiple accept=".png,.jpg,.jpeg,.pdf" onChange={onFiles} disabled={current !== null} />
        </div>
        {current && (
          <div className="space-y-2" data-testid="upload-progress">
            <p className="text-sm">Đang tải {current.name}…</p>
            <progress className="h-2 w-full" max={100} value={current.percent} aria-label="Tiến trình tải lên" />
            <p className="text-sm" data-testid="upload-percent">
              {current.percent}%
            </p>
            <Button size="sm" variant="outline" onClick={() => (signal.current.cancelled = true)}>
              Huỷ tải lên
            </Button>
          </div>
        )}
        {errors.length > 0 && (
          <ul role="alert" className="space-y-0.5 text-sm text-destructive">
            {errors.map((er) => (
              <li key={er} data-testid="upload-error">
                {er}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label="Tệp đã tải" className="space-y-3 rounded-xl border p-5">
        <h2 className="text-lg font-semibold">Tệp đã tải ({items.length}/{MAX_FILES})</h2>
        {items.length === 0 && <p className="text-sm text-muted-foreground">Chưa có tệp nào.</p>}
        <ul className="space-y-2">
          {items.map((it) => (
            <li key={it.id} data-testid="file-item" className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm">
              <span className="flex min-w-0 items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element -- ảnh xem trước từ blob URL cục bộ */}
                {thumbs[it.id] && <img src={thumbs[it.id]} alt={`Xem trước ${it.name}`} className="size-10 rounded object-cover" data-testid="file-thumb" />}
                <span className="min-w-0">
                  <b data-testid="file-name">{it.name}</b>
                  <span className="block truncate text-xs text-muted-foreground" data-testid="file-url">
                    {it.url}
                  </span>
                </span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-muted-foreground" data-testid="file-size">
                  {it.size.toLocaleString("en-US")} byte
                </span>
                <Button size="sm" variant="ghost" aria-label={`Xoá ${it.name}`} onClick={() => persist(items.filter((x) => x.id !== it.id))}>
                  Xoá
                </Button>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <Button type="button" variant="ghost" size="sm" onClick={reset} data-testid="reset-data">
        Reset dữ liệu lab
      </Button>
    </div>
  );
}
