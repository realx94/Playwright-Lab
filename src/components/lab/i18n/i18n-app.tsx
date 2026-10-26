"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useBugs } from "@/lib/labs/use-bugs";
import {
  BIG_NUMBER,
  LANG_KEY,
  PRODUCTS,
  STRINGS,
  UPDATED_AT,
  detectLang,
  localeOf,
  plural,
  type Lang,
} from "@/lib/labs/i18n-rules";

/** Cửa hàng mẫu đa ngôn ngữ (vi/en) và responsive: thanh điều hướng thu gọn, bảng chuyển thành thẻ ở màn hình hẹp. */
export function I18nApp() {
  const bugs = useBugs();
  const [lang, setLang] = useState<Lang>("vi");
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(LANG_KEY);
    } catch {}
    setLang(saved === "vi" || saved === "en" ? saved : detectLang(navigator.language, bugs));
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [bugs]);

  useEffect(() => {
    if (ready) document.documentElement.lang = lang;
  }, [lang, ready]);

  function choose(l: Lang) {
    setLang(l);
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {}
  }

  if (!ready) return null;

  const t = STRINGS[lang];
  const loc = localeOf(lang);
  // BUG-02: ngày luôn theo định dạng tiếng Việt dù đang chọn tiếng Anh
  const dateLoc = bugs.has("BUG-02") ? "vi-VN" : loc;
  const money = (n: number) => new Intl.NumberFormat(loc, { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);
  const shortDate = new Intl.DateTimeFormat(dateLoc, { timeZone: "UTC", dateStyle: "short" }).format(UPDATED_AT);
  const longDate = new Intl.DateTimeFormat(dateLoc, { timeZone: "UTC", dateStyle: "full" }).format(UPDATED_AT);
  const total = qty * PRODUCTS[0].price;
  const nav = [t.home, t.products, t.contact];

  return (
    <div className="mx-auto max-w-3xl space-y-5" data-testid="i18n-root">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
        <h2 className="text-lg font-semibold" data-testid="store-title">
          {t.title}
        </h2>
        <Button type="button" variant="outline" size="sm" className="sm:hidden" aria-expanded={menuOpen} aria-controls="store-nav" onClick={() => setMenuOpen(!menuOpen)} data-testid="menu-button">
          {menuOpen ? t.closeMenu : t.menu}
        </Button>
        <nav id="store-nav" aria-label="Điều hướng" className={`${menuOpen ? "flex" : "hidden"} w-full flex-col gap-2 sm:flex sm:w-auto sm:flex-row`} data-testid="store-nav">
          {nav.map((n) => (
            <a key={n} href="#" onClick={(e) => e.preventDefault()} className="rounded-md px-2 py-1 text-sm hover:bg-muted">
              {n}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Label htmlFor="lang-select">{t.language}</Label>
          <select id="lang-select" className="h-8 rounded-lg border bg-background px-2 text-sm" value={lang} onChange={(e) => choose(e.target.value as Lang)}>
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
          </select>
        </div>
      </header>

      <section aria-label={t.products} className="rounded-xl border p-4">
        <h2 className="mb-3 text-lg font-semibold">{t.products}</h2>
        {/* ≥ 640px: bảng. BUG-03: bảng có bề rộng tối thiểu nên tràn ngang ở màn hình hẹp. */}
        <table className={`hidden w-full text-sm sm:table ${bugs.has("BUG-03") ? "min-w-[720px]" : ""}`} data-testid="product-table">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th>{t.name}</th>
              <th>{t.price}</th>
              <th>{t.stock}</th>
            </tr>
          </thead>
          <tbody>
            {PRODUCTS.map((p) => (
              <tr key={p.id} data-testid="product-row">
                <td className="py-1">{lang === "vi" ? p.vi : p.en}</td>
                <td>{money(p.price)}</td>
                <td>{p.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* < 640px: danh sách thẻ */}
        <ul className="space-y-2 sm:hidden" data-testid="product-cards">
          {PRODUCTS.map((p) => (
            <li key={p.id} className="rounded-lg border p-3 text-sm" data-testid="product-card">
              <b>{lang === "vi" ? p.vi : p.en}</b>
              <div>
                {t.price}: {money(p.price)}
              </div>
              <div>
                {t.stock}: {p.stock}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label={t.cart} className="space-y-3 rounded-xl border p-4">
        <h2 className="text-lg font-semibold">{t.cart}</h2>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" aria-label={t.dec} onClick={() => setQty(Math.max(0, qty - 1))}>
            −
          </Button>
          <span data-testid="cart-count">{plural(lang, qty)}</span>
          <Button size="sm" variant="outline" aria-label={t.inc} onClick={() => setQty(qty + 1)}>
            +
          </Button>
        </div>
        <p data-testid="cart-total">
          {t.total}: {money(total)}
        </p>
      </section>

      <section aria-label={t.big} className="space-y-1 rounded-xl border p-4 text-sm">
        <p data-testid="big-number">
          {t.big}: {new Intl.NumberFormat(loc).format(BIG_NUMBER)}
        </p>
        <p data-testid="date-short">
          {t.updated}: {shortDate}
        </p>
        <p data-testid="date-long">{longDate}</p>
      </section>
    </div>
  );
}
