"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";

export const BUG_COOKIE = "lab_bugs";

const subscribe = () => () => {};

function readBugCookie(): string {
  const m = document.cookie.match(new RegExp(`(?:^|; )${BUG_COOKIE}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : "";
}

/**
 * Danh sách bug đang bật cho lab: lấy từ query ?bugs=BUG-01,BUG-02 và từ cookie lab_bugs.
 * Cookie cho phép công cụ chấm điểm tiêm bug mà không cần sửa URL trong test của người học.
 */
export function useBugs(): Set<string> {
  const params = useSearchParams();
  const fromQuery = params.get("bugs") ?? "";
  const fromCookie = useSyncExternalStore(subscribe, readBugCookie, () => "");
  return useMemo(
    () => new Set([...fromQuery.split(","), ...fromCookie.split(",")].map((s) => s.trim()).filter(Boolean)),
    [fromQuery, fromCookie],
  );
}
