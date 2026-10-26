"use client";

import { useEffect } from "react";

/** Địa chỉ callback đã đăng ký: nếu mở từ popup thì gửi kết quả về cửa sổ gốc, ngược lại chuyển về ứng dụng. */
export function OauthCallback() {
  useEffect(() => {
    const search = window.location.search;
    if (window.opener && window.opener !== window) {
      const p = new URLSearchParams(search);
      window.opener.postMessage(
        { type: "oauth-result", code: p.get("code"), state: p.get("state"), error: p.get("error"), bugs: p.get("bugs") },
        window.location.origin,
      );
      window.close();
      return;
    }
    window.location.replace("/lab/oauth" + search);
  }, []);
  return <p className="p-6 text-sm text-muted-foreground">Đang xử lý đăng nhập…</p>;
}
