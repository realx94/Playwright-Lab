export const CHAT_KEY = "lab:chat";
export const CHANNEL = "lab-chat";
export const NAME_KEY = "lab:chat-name";
export const MAX_LEN = 200;
export const MAX_MESSAGES = 50;
export const TYPING_MS = 1500;

export interface ChatMessage {
  id: string;
  from: string;
  text: string;
  at: number;
}

export const BUGS = [
  { id: "BUG-01", hint: "Giới hạn độ dài tin nhắn" },
  { id: "BUG-02", hint: "Bộ đếm tin chưa đọc" },
  { id: "BUG-03", hint: "Chuẩn hoá khoảng trắng" },
];

/** Trả về nội dung đã chuẩn hoá hoặc thông báo lỗi. BUG-01: cho phép 201 ký tự; BUG-03: không cắt khoảng trắng hai đầu. */
export function prepareMessage(raw: string, bugs: Set<string>): { text: string } | { error: string } {
  const text = bugs.has("BUG-03") ? raw : raw.trim();
  if (text.trim().length === 0) return { error: "Tin nhắn không được để trống" };
  const max = bugs.has("BUG-01") ? MAX_LEN + 1 : MAX_LEN;
  if (text.length > max) return { error: `Tin nhắn tối đa ${MAX_LEN} ký tự` };
  return { text };
}

export function loadMessages(): ChatMessage[] {
  try {
    return JSON.parse(localStorage.getItem(CHAT_KEY) ?? "[]") as ChatMessage[];
  } catch {
    return [];
  }
}
