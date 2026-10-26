import Link from "next/link";

/**
 * Layout của các ứng dụng lab: cố ý KHÔNG có header/thanh tìm kiếm của site để locator của người học
 * không bị trùng với thành phần bên ngoài. Chỉ có một liên kết nhỏ để quay lại.
 */
export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="border-b bg-muted/40">
        <div className="mx-auto flex h-9 max-w-5xl items-center px-4 text-xs text-muted-foreground">
          <Link href="/labs" className="hover:text-foreground">
            ← Danh sách lab
          </Link>
        </div>
      </div>
      <main className="flex-1">{children}</main>
    </>
  );
}
