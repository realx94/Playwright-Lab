import { Suspense } from "react";
import { ChatApp } from "@/components/lab/chat/chat-app";

export const metadata = { title: "LAB-12 Chat thời gian thực" };

export default function ChatLabPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">LAB-12 · Chat thời gian thực giữa các tab</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Mở hai tab trong cùng một context, đặt hai tên khác nhau và trò chuyện. Tin nhắn đến theo thời gian thực
        (BroadcastChannel), có chỉ báo đang nhập và bộ đếm tin chưa đọc khi tab bị ẩn. Bật bug bằng{" "}
        <code>?bugs=BUG-01,BUG-02,BUG-03</code>.
      </p>
      <div className="mt-8">
        <Suspense>
          <ChatApp />
        </Suspense>
      </div>
    </div>
  );
}
