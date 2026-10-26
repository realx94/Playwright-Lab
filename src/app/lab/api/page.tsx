import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata = { title: "LAB-14 Mock REST API" };

const ENDPOINTS = [
  ["GET", "/api/lab/books", "Danh sách có phân trang. Query: page, pageSize (mặc định 5, tối đa 50), q", "200"],
  ["GET", "/api/lab/books/{id}", "Chi tiết một sách", "200, 404"],
  ["POST", "/api/lab/books", "Tạo sách (cần token ghi)", "201, 400, 401, 403, 409, 422"],
  ["PUT", "/api/lab/books/{id}", "Cập nhật một phần (cần token ghi)", "200, 400, 401, 403, 404, 409, 422"],
  ["DELETE", "/api/lab/books/{id}", "Xoá sách (chỉ admin)", "204, 401, 403, 404"],
  ["POST", "/api/lab/reset", "Đặt lại dữ liệu của phiên hiện tại", "204"],
];

export default function ApiLabPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10">
      <header>
        <h1 className="text-2xl font-bold">LAB-14 · Mock REST API (Sách)</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          API giả lập để luyện test API bằng fixture <code>request</code>. Dữ liệu thay đổi của bạn được giữ
          trong một cookie (mỗi người một bản riêng), nên không ảnh hưởng người khác.
        </p>
      </header>

      <section aria-label="Danh sách endpoint">
        <h2 className="mb-3 text-lg font-semibold">Endpoint</h2>
        <div className="overflow-x-auto rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Method</TableHead>
                <TableHead>Đường dẫn</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ENDPOINTS.map(([m, p, d, s]) => (
                <TableRow key={m + p}>
                  <TableCell className="font-mono text-xs">{m}</TableCell>
                  <TableCell className="font-mono text-xs">{p}</TableCell>
                  <TableCell className="whitespace-normal">{d}</TableCell>
                  <TableCell className="whitespace-normal font-mono text-xs">{s}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Xác thực</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Thao tác ghi cần header <code>Authorization: Bearer &lt;token&gt;</code>.</p>
            <ul className="list-disc space-y-1 pl-5">
              <li><code>admin-token</code>: được tạo, sửa, xoá</li>
              <li><code>reader-token</code>: chỉ đọc, thao tác ghi trả 403</li>
              <li>Thiếu hoặc sai token: 401</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quy tắc dữ liệu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <ul className="list-disc space-y-1 pl-5">
              <li>title: 1–100 ký tự; author: bắt buộc</li>
              <li>isbn: dạng <code>978-xxxxxxxxxx</code>, không được trùng (409)</li>
              <li>price: số nguyên 0–10.000.000; stock: số nguyên ≥ 0</li>
              <li>Dữ liệu sai: 422 kèm danh sách <code>errors</code></li>
              <li>Tối đa 10 sách tự tạo mỗi phiên</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <section aria-label="Ví dụ" className="space-y-2">
        <h2 className="text-lg font-semibold">Ví dụ</h2>
        <pre className="overflow-x-auto rounded-lg border bg-muted p-4 text-xs">
          <code>{`curl "$BASE_URL/api/lab/books?pageSize=2"

curl -X POST "$BASE_URL/api/lab/books" \\
  -H "Authorization: Bearer admin-token" -H "Content-Type: application/json" \\
  -d '{"title":"Playwright in Practice","author":"QA Team","isbn":"978-1111111111","price":300000}'`}</code>
        </pre>
        <p className="text-sm text-muted-foreground">
          Bật bug bằng <code>?bugs=BUG-01,BUG-02,BUG-03</code> (hoặc header <code>x-lab-bugs</code>).
        </p>
      </section>
    </div>
  );
}
