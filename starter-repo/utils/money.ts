/** "1.234.000đ" → 1234000, "-100.000đ" → -100000. Giữ dấu trừ, bỏ mọi ký tự không phải số. */
export function parseMoney(text: string): number {
  return Number(text.replace(/[^\d-]/g, ""));
}
