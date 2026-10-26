export interface TestCase {
  id: string;
  title: string;
  precondition: string;
  steps: string;
  data: string;
  expected: string;
  type: "Happy" | "Negative" | "BVA" | "EP" | "State" | "Decision" | "Security";
  priority: "P0" | "P1" | "P2";
  br: string[];
}

export interface Workshop {
  rules: { id: string; text: string }[];
  techniques: string[];
  cases: TestCase[];
}

const login: Workshop = {
  techniques: ["Equivalence Partitioning", "Boundary Value Analysis", "State Transition", "Security input"],
  rules: [
    { id: "BR-01", text: "Email hợp lệ, tối đa 254 ký tự" },
    { id: "BR-02", text: "Mật khẩu 8–32 ký tự, có hoa/thường/số/đặc biệt" },
    { id: "BR-03", text: "Sai 5 lần → khoá 15 phút" },
    { id: "BR-04", text: "Ghi nhớ đăng nhập giữ phiên 7 ngày" },
  ],
  cases: [
    { id: "TC-L-001", title: "Đăng nhập hợp lệ", precondition: "Ở trang login", steps: "Nhập email, mật khẩu đúng; bấm Đăng nhập", data: "user@lab.dev / Passw0rd!", expected: "Vào dashboard", type: "Happy", priority: "P0", br: ["BR-01", "BR-02"] },
    { id: "TC-L-002", title: "Email sai định dạng", precondition: "Ở trang login", steps: "Nhập email thiếu @; bấm Đăng nhập", data: "userlab.dev", expected: "Báo “Email không hợp lệ”", type: "EP", priority: "P1", br: ["BR-01"] },
    { id: "TC-L-003", title: "Mật khẩu 7 ký tự", precondition: "Ở trang login", steps: "Nhập mật khẩu 7 ký tự đủ loại ký tự", data: "Pass0r!", expected: "Báo tối thiểu 8 ký tự", type: "BVA", priority: "P0", br: ["BR-02"] },
    { id: "TC-L-004", title: "Mật khẩu 8 ký tự (biên)", precondition: "Ở trang login", steps: "Nhập mật khẩu 8 ký tự hợp lệ nhưng sai tài khoản", data: "Pass0rd!", expected: "Qua bước validate; báo sai email/mật khẩu", type: "BVA", priority: "P1", br: ["BR-02"] },
    { id: "TC-L-005", title: "Mật khẩu thiếu ký tự đặc biệt", precondition: "Ở trang login", steps: "Nhập mật khẩu không có ký tự đặc biệt", data: "Passw0rdd", expected: "Báo cần đủ chữ hoa/thường/số/ký tự đặc biệt", type: "EP", priority: "P1", br: ["BR-02"] },
    { id: "TC-L-006", title: "Khoá sau 5 lần sai", precondition: "Chưa bị khoá", steps: "Nhập sai mật khẩu 5 lần liên tiếp", data: "Wrong123!", expected: "Tài khoản bị khoá 15 phút", type: "State", priority: "P0", br: ["BR-03"] },
    { id: "TC-L-007", title: "Lần sai thứ 4 chưa khoá", precondition: "Chưa bị khoá", steps: "Nhập sai 4 lần", data: "Wrong123!", expected: "Chỉ báo sai thông tin, chưa khoá", type: "BVA", priority: "P1", br: ["BR-03"] },
    { id: "TC-L-008", title: "Đăng nhập thành công reset đếm sai", precondition: "Đã sai 3 lần", steps: "Đăng nhập đúng rồi đăng xuất, sai thêm 4 lần", data: "—", expected: "Không bị khoá (đếm bắt đầu lại)", type: "State", priority: "P2", br: ["BR-03"] },
    { id: "TC-L-009", title: "Ghi nhớ đăng nhập", precondition: "Ở trang login", steps: "Tick ghi nhớ rồi đăng nhập", data: "hợp lệ", expected: "Phiên hiển thị 7 ngày", type: "Happy", priority: "P2", br: ["BR-04"] },
    { id: "TC-L-010", title: "Chèn script vào email", precondition: "Ở trang login", steps: "Nhập <script>alert(1)</script> vào email", data: "XSS", expected: "Không thực thi script, báo email không hợp lệ", type: "Security", priority: "P1", br: ["BR-01"] },
  ],
};

const forms: Workshop = {
  techniques: ["Equivalence Partitioning", "Boundary Value Analysis", "Pairwise"],
  rules: [
    { id: "BR-01", text: "Họ tên bắt buộc, tối đa 50 ký tự" },
    { id: "BR-02", text: "Tuổi nguyên 18–65" },
    { id: "BR-03", text: "Chọn ít nhất 1 sở thích" },
    { id: "BR-04", text: "Tệp png/jpg/pdf ≤ 2MB" },
    { id: "BR-05", text: "Ngày sinh không ở tương lai" },
    { id: "BR-06", text: "Bắt buộc đồng ý điều khoản" },
  ],
  cases: [
    { id: "TC-F-001", title: "Gửi form hợp lệ", precondition: "Form trống", steps: "Điền đủ trường bắt buộc; Gửi", data: "hợp lệ", expected: "Hiển thị JSON kết quả", type: "Happy", priority: "P0", br: ["BR-01", "BR-02", "BR-03", "BR-06"] },
    { id: "TC-F-002", title: "Họ tên rỗng", precondition: "Form trống", steps: "Để trống họ tên; Gửi", data: "(rỗng)", expected: "Báo nhập họ tên", type: "EP", priority: "P0", br: ["BR-01"] },
    { id: "TC-F-003", title: "Họ tên 51 ký tự", precondition: "Form trống", steps: "Nhập 51 ký tự", data: "a × 51", expected: "Báo tối đa 50 ký tự", type: "BVA", priority: "P1", br: ["BR-01"] },
    { id: "TC-F-004", title: "Tuổi 17", precondition: "Form trống", steps: "Nhập tuổi 17", data: "17", expected: "Báo tuổi 18–65", type: "BVA", priority: "P0", br: ["BR-02"] },
    { id: "TC-F-005", title: "Tuổi 18 và 65", precondition: "Form trống", steps: "Nhập 18 rồi 65", data: "18, 65", expected: "Không báo lỗi tuổi", type: "BVA", priority: "P0", br: ["BR-02"] },
    { id: "TC-F-006", title: "Tuổi 66", precondition: "Form trống", steps: "Nhập 66", data: "66", expected: "Báo tuổi 18–65", type: "BVA", priority: "P0", br: ["BR-02"] },
    { id: "TC-F-007", title: "Tuổi thập phân", precondition: "Form trống", steps: "Nhập 20.5", data: "20.5", expected: "Báo tuổi không hợp lệ", type: "EP", priority: "P2", br: ["BR-02"] },
    { id: "TC-F-008", title: "Không chọn sở thích", precondition: "Form trống", steps: "Bỏ chọn mọi sở thích; Gửi", data: "—", expected: "Báo chọn ít nhất 1", type: "EP", priority: "P1", br: ["BR-03"] },
    { id: "TC-F-009", title: "Upload .exe", precondition: "Form trống", steps: "Chọn tệp a.exe; Gửi", data: "a.exe", expected: "Báo chỉ chấp nhận png/jpg/pdf", type: "Negative", priority: "P1", br: ["BR-04"] },
    { id: "TC-F-010", title: "Ngày sinh tương lai", precondition: "Form trống", steps: "Chọn ngày ở tương lai", data: "2999-01-01", expected: "Báo không được ở tương lai", type: "Negative", priority: "P2", br: ["BR-05"] },
    { id: "TC-F-011", title: "Không đồng ý điều khoản", precondition: "Form trống", steps: "Không tick điều khoản; Gửi", data: "—", expected: "Báo phải đồng ý điều khoản", type: "Negative", priority: "P0", br: ["BR-06"] },
  ],
};

const cart: Workshop = {
  techniques: ["Decision Table", "Boundary Value Analysis", "State Transition"],
  rules: [
    { id: "BR-01", text: "Mỗi sản phẩm tối đa 10, không vượt tồn kho" },
    { id: "BR-02", text: "SALE10: giảm 10%, tối thiểu 500.000đ, tối đa giảm 100.000đ" },
    { id: "BR-03", text: "Miễn ship khi sau giảm giá ≥ 1.000.000đ, còn lại 30.000đ" },
    { id: "BR-04", text: "VAT 8% sau giảm giá, làm tròn đến đồng" },
    { id: "BR-05", text: "Hết hàng không thêm được" },
    { id: "BR-06", text: "Mới → Đã thanh toán → Đang giao → Hoàn tất; chỉ huỷ khi chưa giao" },
  ],
  cases: [
    { id: "TC-C-001", title: "Thêm sản phẩm còn hàng", precondition: "Giỏ trống", steps: "Bấm Thêm vào giỏ ở Chuột không dây", data: "p2", expected: "Giỏ có 1 sản phẩm", type: "Happy", priority: "P0", br: ["BR-05"] },
    { id: "TC-C-002", title: "Sản phẩm hết hàng", precondition: "Giỏ trống", steps: "Quan sát nút của Tai nghe", data: "p4", expected: "Nút bị vô hiệu hoá", type: "Negative", priority: "P0", br: ["BR-05"] },
    { id: "TC-C-003", title: "Vượt số lượng tối đa", precondition: "Có 10 chuột", steps: "Bấm + lần nữa", data: "qty = 11", expected: "Giữ nguyên 10 và báo tối đa", type: "BVA", priority: "P1", br: ["BR-01"] },
    { id: "TC-C-004", title: "Ship đơn dưới 1 triệu", precondition: "Giỏ 250.000đ", steps: "Xem tổng kết", data: "250.000", expected: "Ship 30.000, VAT 20.000, tổng 300.000", type: "Decision", priority: "P0", br: ["BR-03", "BR-04"] },
    { id: "TC-C-005", title: "Miễn ship đúng ngưỡng 1.000.000", precondition: "Giỏ đúng 1.000.000đ", steps: "Xem phí ship", data: "1.000.000", expected: "Ship 0", type: "BVA", priority: "P0", br: ["BR-03"] },
    { id: "TC-C-006", title: "SALE10 ở biên 500.000", precondition: "Giỏ 500.000đ", steps: "Áp dụng SALE10", data: "500.000", expected: "Giảm 50.000", type: "BVA", priority: "P0", br: ["BR-02"] },
    { id: "TC-C-007", title: "SALE10 dưới ngưỡng", precondition: "Giỏ 250.000đ", steps: "Áp dụng SALE10", data: "250.000", expected: "Báo đơn tối thiểu 500.000đ", type: "Negative", priority: "P1", br: ["BR-02"] },
    { id: "TC-C-008", title: "Giảm giá bị chặn trần", precondition: "Giỏ 3.200.000đ", steps: "Áp dụng SALE10", data: "3.200.000", expected: "Giảm 100.000 (không phải 320.000)", type: "Decision", priority: "P0", br: ["BR-02"] },
    { id: "TC-C-009", title: "VAT làm tròn", precondition: "Tổng sau giảm có VAT lẻ", steps: "So sánh VAT hiển thị với tính tay", data: "—", expected: "Làm tròn gần nhất, không cắt xuống", type: "Decision", priority: "P1", br: ["BR-04"] },
    { id: "TC-C-010", title: "Vòng đời đơn hợp lệ", precondition: "Đã đặt hàng", steps: "Chuyển lần lượt các trạng thái", data: "—", expected: "Mới → Đã thanh toán → Đang giao → Hoàn tất", type: "State", priority: "P0", br: ["BR-06"] },
    { id: "TC-C-011", title: "Không huỷ được đơn đang giao", precondition: "Đơn Đang giao", steps: "Tìm nút Huỷ đơn", data: "—", expected: "Không có nút Huỷ", type: "State", priority: "P0", br: ["BR-06"] },
  ],
};

const playground: Workshop = {
  techniques: ["Exploratory", "State Transition", "Boundary Value Analysis"],
  rules: [
    { id: "BR-01", text: "Hộp thoại confirm: Đồng ý trả về “Đồng ý”, Huỷ trả về “Huỷ”" },
    { id: "BR-02", text: "Liên kết trợ giúp mở ở tab mới" },
    { id: "BR-03", text: "iframe thanh toán: số thẻ từ 12 chữ số mới thành công" },
    { id: "BR-04", text: "Nút trong shadow DOM hiện thông báo khi bấm" },
    { id: "BR-05", text: "Kéo Thẻ A vào vùng thả thì hiển thị Thẻ A" },
    { id: "BR-06", text: "Nội dung hiện sau độ trễ cấu hình bằng ?delay (mặc định 1500 ms)" },
    { id: "BR-07", text: "Cuộn tới cuối tải thêm 20 mục, tối đa 60 mục" },
    { id: "BR-08", text: "Nút tải tệp tạo ra tệp ghi-chu.txt" },
  ],
  cases: [
    { id: "TC-P-001", title: "Confirm: chọn Đồng ý", precondition: "Mở playground", steps: "Bấm Hiện confirm, chấp nhận hộp thoại", data: "—", expected: "Hiển thị “Đồng ý”", type: "Happy", priority: "P0", br: ["BR-01"] },
    { id: "TC-P-002", title: "Confirm: chọn Huỷ", precondition: "Mở playground", steps: "Bấm Hiện confirm, từ chối hộp thoại", data: "—", expected: "Hiển thị “Huỷ”", type: "Negative", priority: "P0", br: ["BR-01"] },
    { id: "TC-P-003", title: "Liên kết mở tab mới", precondition: "Mở playground", steps: "Bấm Mở trang trợ giúp", data: "—", expected: "Có tab mới tới /lab/playground/help", type: "Happy", priority: "P1", br: ["BR-02"] },
    { id: "TC-P-004", title: "iframe: số thẻ hợp lệ", precondition: "Mở playground", steps: "Nhập số thẻ 16 chữ số trong khung, bấm Thanh toán", data: "4242 4242 4242 4242", expected: "Thanh toán thành công", type: "Happy", priority: "P0", br: ["BR-03"] },
    { id: "TC-P-005", title: "iframe: 11 chữ số bị từ chối", precondition: "Mở playground", steps: "Nhập 11 chữ số, bấm Thanh toán", data: "12345678901", expected: "Số thẻ không hợp lệ", type: "BVA", priority: "P1", br: ["BR-03"] },
    { id: "TC-P-006", title: "iframe: 12 chữ số được chấp nhận", precondition: "Mở playground", steps: "Nhập 12 chữ số, bấm Thanh toán", data: "123456789012", expected: "Thanh toán thành công", type: "BVA", priority: "P1", br: ["BR-03"] },
    { id: "TC-P-007", title: "Bấm nút trong shadow DOM", precondition: "Mở playground", steps: "Bấm Bấm trong shadow", data: "—", expected: "Hiện Đã bấm trong shadow DOM", type: "Happy", priority: "P1", br: ["BR-04"] },
    { id: "TC-P-008", title: "Kéo thả Thẻ A", precondition: "Mở playground", steps: "Kéo Thẻ A vào Vùng thả", data: "—", expected: "Hiển thị Đã thả: Thẻ A", type: "Happy", priority: "P1", br: ["BR-05"] },
    { id: "TC-P-009", title: "Nội dung tải trễ 3 giây", precondition: "Mở /lab/playground?delay=3000", steps: "Bấm Tải dữ liệu", data: "delay=3000", expected: "Sau khoảng 3 giây hiện Đã tải xong, không dùng chờ cố định", type: "State", priority: "P1", br: ["BR-06"] },
    { id: "TC-P-010", title: "Cuộn tải thêm tới giới hạn 60", precondition: "Mở playground", steps: "Cuộn danh sách tới cuối hai lần", data: "—", expected: "Số mục tăng 20 → 40 → 60 và dừng ở 60", type: "BVA", priority: "P2", br: ["BR-07"] },
    { id: "TC-P-011", title: "Tải tệp ghi chú", precondition: "Mở playground", steps: "Bấm Tải tệp ghi chú", data: "—", expected: "Tệp ghi-chu.txt được tải xuống", type: "Happy", priority: "P2", br: ["BR-08"] },
  ],
};

export const WORKSHOPS: Record<string, Workshop> = { login, forms, cart, playground };

export function toCsv(cases: TestCase[]): string {
  const head = ["ID", "Tiêu đề", "Tiền điều kiện", "Các bước", "Dữ liệu", "Kết quả mong đợi", "Loại", "Ưu tiên", "BR"];
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const rows = cases.map((c) =>
    [c.id, c.title, c.precondition, c.steps, c.data, c.expected, c.type, c.priority, c.br.join(" ")]
      .map(esc)
      .join(","),
  );
  return "﻿" + [head.map(esc).join(","), ...rows].join("\r\n");
}
