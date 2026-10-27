/** Giới hạn tần suất theo IP trong bộ nhớ của instance. Chỉ là lớp chặn cơ bản trên môi trường serverless. */
export function createLimiter(max: number, windowMs: number) {
  const hits = new Map<string, number[]>();
  return (ip: string, now: number): boolean => {
    const recent = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
    recent.push(now);
    hits.set(ip, recent);
    if (hits.size > 5000) hits.clear();
    return recent.length > max;
  };
}

export const clientIp = (req: Request) => req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
