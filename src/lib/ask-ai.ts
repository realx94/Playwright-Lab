export type AskStyle = "eli5" | "playwright" | "selenium" | "interview";

export const ASK_STYLES: { id: AskStyle; label: string }[] = [
  { id: "eli5", label: "Giải thích dễ hiểu" },
  { id: "playwright", label: "Ví dụ Playwright TS" },
  { id: "selenium", label: "So sánh với Selenium" },
  { id: "interview", label: "Câu hỏi phỏng vấn" },
];

const TEMPLATES: Record<AskStyle, (t: string) => string> = {
  eli5: (t) =>
    `Giải thích cho người mới học QA automation: "${t}". Dùng ví dụ đời thường trước, sau đó giải thích kỹ thuật, trả lời bằng tiếng Việt.`,
  playwright: (t) =>
    `Giải thích "${t}" trong Playwright với TypeScript. Cho ví dụ code ngắn chạy được và lỗi thường gặp. Trả lời bằng tiếng Việt.`,
  selenium: (t) =>
    `So sánh "${t}" giữa Playwright và Selenium cho QA. Nêu khác biệt chính và ví dụ code. Trả lời bằng tiếng Việt.`,
  interview: (t) =>
    `Đưa ra 3 câu hỏi phỏng vấn QA automation về "${t}" kèm đáp án ngắn gọn bằng tiếng Việt.`,
};

export const MIN_LEN = 2;
export const MAX_LEN = 200;

export function normalizeSelection(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

export function isValidSelection(text: string): boolean {
  return text.length >= MIN_LEN && text.length <= MAX_LEN;
}

/** Google AI Mode (udm=50); `fallback` dùng tìm kiếm thường nếu tham số đổi. */
export function buildAskUrl(
  text: string,
  style: AskStyle = "eli5",
  fallback = false,
): string {
  const q = encodeURIComponent(TEMPLATES[style](text));
  return fallback
    ? `https://www.google.com/search?q=${q}`
    : `https://www.google.com/search?udm=50&q=${q}`;
}
