export interface LabInfo {
  slug: string;
  id: string;
  title: string;
  domain: string;
  difficulty: 1 | 2 | 3;
  skills: string[];
  ready: boolean;
}

export const LABS: LabInfo[] = [
  { slug: "login", id: "LAB-01", title: "Login & Đăng ký", domain: "Auth", difficulty: 1, skills: ["getByLabel", "fill", "assertion", "BVA"], ready: true },
  { slug: "forms", id: "LAB-02", title: "Form đa dạng", domain: "Web elements", difficulty: 1, skills: ["radio", "checkbox", "select", "upload"], ready: true },
  { slug: "cart", id: "LAB-03", title: "Giỏ hàng & Checkout", domain: "E-commerce", difficulty: 2, skills: ["data-driven", "decision table"], ready: true },
  { slug: "playground", id: "LAB-13", title: "Tình huống khó (Playground)", domain: "Edge cases", difficulty: 3, skills: ["dialog", "iframe", "shadow DOM", "drag & drop", "tab mới", "cuộn vô hạn"], ready: true },
  { slug: "api", id: "LAB-14", title: "Mock REST API (Sách)", domain: "API", difficulty: 2, skills: ["request", "status code", "422/409", "phân quyền", "CRUD"], ready: true },
  { slug: "otp", id: "LAB-17", title: "Đăng nhập Email OTP", domain: "Auth nâng cao", difficulty: 3, skills: ["hộp thư giả", "nhiều tab", "page.clock", "OTP hết hạn"], ready: true },
  { slug: "todo", id: "LAB-04", title: "Quản lý công việc (CRUD)", domain: "Productivity", difficulty: 1, skills: ["CRUD", "dialog xác nhận", "bộ lọc", "localStorage"], ready: true },
  { slug: "table", id: "LAB-08", title: "Bảng dữ liệu động (Quản lý người dùng)", domain: "Admin", difficulty: 2, skills: ["bảng", "sắp xếp", "lọc", "phân trang", "chọn nhiều", "tải CSV"], ready: true },
  { slug: "leave", id: "LAB-07", title: "Nghỉ phép & duyệt đơn (HR)", domain: "HR", difficulty: 3, skills: ["nhiều vai trò", "hai tab", "trạng thái đơn", "ngày tháng", "phân quyền"], ready: true },
  { slug: "chat", id: "LAB-12", title: "Chat thời gian thực giữa các tab", domain: "Realtime", difficulty: 3, skills: ["nhiều tab", "BroadcastChannel", "auto-wait", "visibilitychange"], ready: true },
  { slug: "totp", id: "LAB-18", title: "Đăng nhập 2FA (TOTP)", domain: "Auth nâng cao", difficulty: 3, skills: ["TOTP", "page.clock", "mã khôi phục", "replay", "khóa tài khoản"], ready: true },
  { slug: "oauth", id: "LAB-19", title: "Đăng nhập OAuth (Fake IdP)", domain: "Bên thứ 3", difficulty: 3, skills: ["redirect", "popup", "state/CSRF", "authorization code", "page.clock"], ready: true },
  { slug: "pay", id: "LAB-20", title: "Thanh toán thẻ (kiểu Stripe test mode)", domain: "Payment", difficulty: 3, skills: ["frameLocator", "thẻ test", "3D Secure", "webhook trễ", "hoàn tiền"], ready: true },
  { slug: "orders", id: "LAB-21", title: "Đơn hàng & xác minh DB", domain: "Data", difficulty: 3, skills: ["API + DB", "SELECT chỉ-đọc", "rollback", "idempotency", "xoá mềm", "UI ↔ API ↔ DB"], ready: true },
  { slug: "guard", id: "LAB-24", title: "CAPTCHA & giới hạn tần suất", domain: "Security", difficulty: 3, skills: ["429 + Retry-After", "CAPTCHA test mode", "backoff", "expect.poll", "brute-force"], ready: true },
  { slug: "webhooks", id: "LAB-22", title: "Webhook & sự kiện bất đồng bộ", domain: "Integration", difficulty: 3, skills: ["chữ ký HMAC", "idempotency", "retry/backoff", "replay", "expect.poll"], ready: true },
  { slug: "rbac", id: "LAB-26", title: "Phân quyền RBAC & multi-tenant", domain: "Authorization", difficulty: 3, skills: ["ma trận quyền", "IDOR", "403 vs 404", "nhiều context", "tách tổ chức"], ready: true },
  { slug: "timezone", id: "LAB-28", title: "Đặt lịch theo múi giờ & đồng hồ", domain: "Time", difficulty: 3, skills: ["timezoneId", "page.clock", "DST", "biên thời gian", "đếm ngược"], ready: true },
  { slug: "csv", id: "LAB-27", title: "Nhập/xuất CSV & đối chiếu dữ liệu", domain: "Reporting", difficulty: 2, skills: ["setInputFiles", "download", "parse CSV", "RFC 4180", "round trip"], ready: true },
  { slug: "mail", id: "LAB-23", title: "Email giao dịch (xác nhận đơn, đặt lại mật khẩu)", domain: "Notification", difficulty: 2, skills: ["đọc email", "nội dung động", "liên kết trong email", "định dạng tiền", "token hết hạn"], ready: true },
  { slug: "upload", id: "LAB-25", title: "Tải tệp lên kho lưu trữ", domain: "Storage", difficulty: 2, skills: ["setInputFiles", "biên dung lượng", "định dạng", "tiến trình", "huỷ", "nhiều tệp"], ready: true },
  { slug: "bank", id: "LAB-05", title: "Ngân hàng: chuyển tiền nhiều bước", domain: "Banking", difficulty: 3, skills: ["multi-step", "OTP giả", "biểu phí", "hạn mức ngày", "page.clock"], ready: true },
  { slug: "booking", id: "LAB-06", title: "Đặt vé xem phim (sơ đồ ghế & giữ chỗ)", domain: "Travel", difficulty: 2, skills: ["sơ đồ ghế", "timer giữ chỗ", "hai người tranh ghế", "hết vé", "page.clock"], ready: true },
  { slug: "dashboard", id: "LAB-15", title: "Dashboard doanh thu & biểu đồ", domain: "BI", difficulty: 2, skills: ["oracle độc lập", "assertion biểu đồ SVG", "bộ lọc ngày", "KPI", "nhất quán số liệu"], ready: true },
  { slug: "clinic", id: "LAB-10", title: "Y tế: đặt lịch khám", domain: "Healthcare", difficulty: 2, skills: ["date picker", "khung giờ", "page.clock", "biên 2 giờ / 24 giờ", "validation"], ready: true },
  { slug: "tickets", id: "LAB-11", title: "Hỗ trợ khách hàng (ticket & SLA)", domain: "CRM", difficulty: 2, skills: ["setInputFiles", "luồng trạng thái", "ma trận chuyển đổi", "SLA + page.clock", "bình luận"], ready: true },
];
