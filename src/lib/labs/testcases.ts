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

const api: Workshop = {
  techniques: ["Equivalence Partitioning", "Boundary Value Analysis", "Decision Table", "State Transition"],
  rules: [
    { id: "BR-01", text: "GET danh sách có phân trang: pageSize mặc định 5, tối đa 50" },
    { id: "BR-02", text: "Tìm theo q không phân biệt hoa thường trong tiêu đề và tác giả" },
    { id: "BR-03", text: "GET theo id trả 200 hoặc 404" },
    { id: "BR-04", text: "Thao tác ghi cần Bearer token: thiếu 401, token chỉ đọc 403" },
    { id: "BR-05", text: "POST hợp lệ trả 201 kèm Location; dữ liệu sai trả 422" },
    { id: "BR-06", text: "ISBN trùng trả 409" },
    { id: "BR-07", text: "PUT cập nhật một phần trả 200; không có sách trả 404" },
    { id: "BR-08", text: "DELETE chỉ admin: 204; không có sách 404" },
    { id: "BR-09", text: "Mỗi phiên có dữ liệu riêng; /api/lab/reset khôi phục ban đầu" },
  ],
  cases: [
    { id: "TC-A-001", title: "Danh sách mặc định", precondition: "Dữ liệu gốc", steps: "GET /api/lab/books", data: "—", expected: "200, page=1, pageSize=5, 5 phần tử, total=12", type: "Happy", priority: "P0", br: ["BR-01"] },
    { id: "TC-A-002", title: "Trang cuối", precondition: "Dữ liệu gốc", steps: "GET ?page=3&pageSize=5", data: "page=3", expected: "200, còn 2 phần tử", type: "BVA", priority: "P1", br: ["BR-01"] },
    { id: "TC-A-003", title: "pageSize vượt tối đa", precondition: "Dữ liệu gốc", steps: "GET ?pageSize=999", data: "999", expected: "pageSize trả về là 50", type: "BVA", priority: "P1", br: ["BR-01"] },
    { id: "TC-A-004", title: "Tìm kiếm không phân biệt hoa thường", precondition: "Dữ liệu gốc", steps: "GET ?q=CLEAN", data: "CLEAN", expected: "total=2 (Clean Code, Clean Architecture)", type: "EP", priority: "P1", br: ["BR-02"] },
    { id: "TC-A-005", title: "Sách không tồn tại", precondition: "Dữ liệu gốc", steps: "GET /api/lab/books/b-999", data: "b-999", expected: "404", type: "Negative", priority: "P0", br: ["BR-03"] },
    { id: "TC-A-006", title: "Tạo sách khi thiếu token", precondition: "Không có Authorization", steps: "POST với body hợp lệ", data: "—", expected: "401", type: "Security", priority: "P0", br: ["BR-04"] },
    { id: "TC-A-007", title: "Tạo sách bằng token chỉ đọc", precondition: "reader-token", steps: "POST với body hợp lệ", data: "reader-token", expected: "403", type: "Security", priority: "P0", br: ["BR-04"] },
    { id: "TC-A-008", title: "Tạo sách hợp lệ", precondition: "admin-token", steps: "POST body hợp lệ", data: "isbn 978-1111111111", expected: "201 và header Location trỏ tới sách mới", type: "Happy", priority: "P0", br: ["BR-05"] },
    { id: "TC-A-009", title: "Giá âm bị từ chối", precondition: "admin-token", steps: "POST với price = -1", data: "-1", expected: "422, errors có field price", type: "BVA", priority: "P1", br: ["BR-05"] },
    { id: "TC-A-010", title: "ISBN trùng", precondition: "admin-token", steps: "POST với isbn của Clean Code", data: "978-0132350884", expected: "409", type: "Negative", priority: "P1", br: ["BR-06"] },
    { id: "TC-A-011", title: "Cập nhật giá", precondition: "Có sách mới tạo", steps: "PUT price = 350000", data: "350000", expected: "200, giá mới được trả về và đọc lại đúng", type: "Happy", priority: "P1", br: ["BR-07"] },
    { id: "TC-A-012", title: "Admin xoá sách", precondition: "Có sách mới tạo", steps: "DELETE rồi GET lại", data: "admin-token", expected: "204; GET sau đó trả 404", type: "State", priority: "P0", br: ["BR-08"] },
    { id: "TC-A-013", title: "Reset khôi phục dữ liệu", precondition: "Đã tạo một sách", steps: "POST /api/lab/reset rồi GET danh sách", data: "—", expected: "204; total quay về 12", type: "State", priority: "P2", br: ["BR-09"] },
  ],
};

const otp: Workshop = {
  techniques: ["State Transition", "Boundary Value Analysis", "Security input", "Decision Table"],
  rules: [
    { id: "BR-01", text: "OTP gồm 6 chữ số, có hiệu lực 5 phút" },
    { id: "BR-02", text: "Nhập sai 3 lần thì mã bị huỷ, phải xin mã mới" },
    { id: "BR-03", text: "Gửi lại cách nhau tối thiểu 60 giây, tối đa 5 lần mỗi giờ" },
    { id: "BR-04", text: "Email chưa đăng ký vẫn nhận thông báo trung tính, không có thư nào được gửi" },
    { id: "BR-05", text: "Xin mã mới thì mã cũ hết hiệu lực" },
    { id: "BR-06", text: "Đăng nhập OTP thành công vào trang chính, mã chỉ dùng một lần" },
  ],
  cases: [
    { id: "TC-O-001", title: "Đăng nhập bằng OTP hợp lệ", precondition: "user@lab.dev đã đăng ký", steps: "Gửi mã, đọc OTP trong hộp thư, nhập mã", data: "OTP trong thư", expected: "Vào trang chính", type: "Happy", priority: "P0", br: ["BR-01", "BR-06"] },
    { id: "TC-O-002", title: "Email chưa đăng ký", precondition: "Hộp thư trống", steps: "Gửi mã cho nobody@lab.dev", data: "nobody@lab.dev", expected: "Thông báo trung tính; hộp thư vẫn trống", type: "Security", priority: "P0", br: ["BR-04"] },
    { id: "TC-O-003", title: "Mã sai lần thứ nhất", precondition: "Đã gửi mã", steps: "Nhập mã sai", data: "111111", expected: "Báo mã không đúng, còn 2 lần", type: "Negative", priority: "P1", br: ["BR-02"] },
    { id: "TC-O-004", title: "Sai 3 lần huỷ mã", precondition: "Đã gửi mã", steps: "Nhập sai ba lần liên tiếp", data: "111111 × 3", expected: "Báo mã đã bị huỷ", type: "State", priority: "P0", br: ["BR-02"] },
    { id: "TC-O-005", title: "Mã đúng sau khi đã bị huỷ", precondition: "Mã đã bị huỷ", steps: "Nhập mã đúng ban đầu", data: "OTP gốc", expected: "Báo không hợp lệ hoặc hết hạn", type: "State", priority: "P0", br: ["BR-02"] },
    { id: "TC-O-006", title: "Mã ở giây 299", precondition: "Đồng hồ giả, vừa gửi mã", steps: "Chuyển thời gian +299 giây rồi nhập mã", data: "+299s", expected: "Đăng nhập thành công", type: "BVA", priority: "P0", br: ["BR-01"] },
    { id: "TC-O-007", title: "Mã ở giây 300", precondition: "Đồng hồ giả, vừa gửi mã", steps: "Chuyển thời gian +300 giây rồi nhập mã", data: "+300s", expected: "Đăng nhập thành công (biên)", type: "BVA", priority: "P0", br: ["BR-01"] },
    { id: "TC-O-008", title: "Mã ở giây 301", precondition: "Đồng hồ giả, vừa gửi mã", steps: "Chuyển thời gian +301 giây rồi nhập mã", data: "+301s", expected: "Báo mã đã hết hạn", type: "BVA", priority: "P0", br: ["BR-01"] },
    { id: "TC-O-009", title: "Nút gửi lại bị khoá", precondition: "Vừa gửi mã", steps: "Quan sát nút Gửi lại mã", data: "—", expected: "Nút bị khoá, hiển thị đếm ngược", type: "State", priority: "P1", br: ["BR-03"] },
    { id: "TC-O-010", title: "Gửi lại sau 61 giây", precondition: "Vừa gửi mã", steps: "Chuyển +61 giây rồi gửi lại", data: "+61s", expected: "Nút mở khoá, có thư thứ hai", type: "BVA", priority: "P1", br: ["BR-03"] },
    { id: "TC-O-011", title: "Mã cũ sau khi xin mã mới", precondition: "Đã gửi lại một lần", steps: "Nhập mã của lần gửi đầu", data: "OTP đầu", expected: "Báo mã không đúng", type: "State", priority: "P0", br: ["BR-05"] },
    { id: "TC-O-012", title: "Vượt 5 lần mỗi giờ", precondition: "Đã gửi 5 lần trong 1 giờ", steps: "Gửi lần thứ 6", data: "—", expected: "Báo yêu cầu quá nhiều lần", type: "BVA", priority: "P2", br: ["BR-03"] },
  ],
};

const todo: Workshop = {
  techniques: ["Equivalence Partitioning", "Boundary Value Analysis", "State Transition", "CRUD"],
  rules: [
    { id: "BR-01", text: "Tên công việc 1–80 ký tự, không chỉ gồm khoảng trắng" },
    { id: "BR-02", text: "Không thêm công việc trùng tên (không phân biệt hoa thường)" },
    { id: "BR-03", text: "Tối đa 20 công việc" },
    { id: "BR-04", text: "Tick hoàn thành chuyển việc sang Hoàn thành; bỏ tick quay lại Đang làm" },
    { id: "BR-05", text: "Xoá một công việc phải qua hộp thoại xác nhận" },
    { id: "BR-06", text: "Bộ lọc Tất cả / Đang làm / Hoàn thành; bộ đếm Còn N việc chỉ tính việc chưa xong" },
    { id: "BR-07", text: "Dữ liệu được giữ sau khi tải lại trang" },
  ],
  cases: [
    { id: "TC-T-001", title: "Thêm công việc hợp lệ", precondition: "Danh sách trống", steps: "Nhập Mua sữa, bấm Thêm", data: "Mua sữa", expected: "Có 1 việc, bộ đếm Còn 1 việc", type: "Happy", priority: "P0", br: ["BR-01"] },
    { id: "TC-T-002", title: "Tên rỗng", precondition: "Danh sách trống", steps: "Bấm Thêm khi ô nhập trống", data: "(rỗng)", expected: "Báo vui lòng nhập tên", type: "EP", priority: "P0", br: ["BR-01"] },
    { id: "TC-T-003", title: "Tên chỉ có khoảng trắng", precondition: "Danh sách trống", steps: "Nhập ba dấu cách, bấm Thêm", data: "   ", expected: "Báo vui lòng nhập tên", type: "EP", priority: "P1", br: ["BR-01"] },
    { id: "TC-T-004", title: "Tên 80 ký tự", precondition: "Danh sách trống", steps: "Nhập 80 ký tự, bấm Thêm", data: "a × 80", expected: "Thêm thành công", type: "BVA", priority: "P1", br: ["BR-01"] },
    { id: "TC-T-005", title: "Tên 81 ký tự", precondition: "Danh sách trống", steps: "Nhập 81 ký tự, bấm Thêm", data: "a × 81", expected: "Báo tối đa 80 ký tự", type: "BVA", priority: "P1", br: ["BR-01"] },
    { id: "TC-T-006", title: "Trùng tên khác hoa thường", precondition: "Đã có Mua sữa", steps: "Thêm mua SỮA", data: "mua SỮA", expected: "Báo công việc đã tồn tại", type: "EP", priority: "P0", br: ["BR-02"] },
    { id: "TC-T-007", title: "Việc thứ 20", precondition: "Đã có 19 việc", steps: "Thêm việc thứ 20", data: "—", expected: "Thêm thành công", type: "BVA", priority: "P0", br: ["BR-03"] },
    { id: "TC-T-008", title: "Việc thứ 21", precondition: "Đã có 20 việc", steps: "Thêm việc thứ 21", data: "—", expected: "Báo tối đa 20, vẫn 20 việc", type: "BVA", priority: "P0", br: ["BR-03"] },
    { id: "TC-T-009", title: "Đánh dấu hoàn thành", precondition: "Có 1 việc đang làm", steps: "Tick checkbox", data: "—", expected: "Việc gạch ngang, bộ đếm Còn 0 việc", type: "State", priority: "P0", br: ["BR-04", "BR-06"] },
    { id: "TC-T-010", title: "Bỏ đánh dấu", precondition: "Có 1 việc đã xong", steps: "Bỏ tick", data: "—", expected: "Việc quay lại Đang làm, bộ đếm Còn 1 việc", type: "State", priority: "P1", br: ["BR-04"] },
    { id: "TC-T-011", title: "Xoá nhưng chọn Giữ lại", precondition: "Có 1 việc", steps: "Bấm Xoá rồi Giữ lại", data: "—", expected: "Việc vẫn còn", type: "Negative", priority: "P1", br: ["BR-05"] },
    { id: "TC-T-012", title: "Xoá và xác nhận", precondition: "Có 1 việc", steps: "Bấm Xoá rồi Xoá hẳn", data: "—", expected: "Việc biến mất, hiện danh sách trống", type: "Happy", priority: "P0", br: ["BR-05"] },
    { id: "TC-T-013", title: "Lọc Hoàn thành", precondition: "Có 1 việc xong, 1 việc đang làm", steps: "Bấm bộ lọc Hoàn thành", data: "—", expected: "Chỉ hiện việc đã xong", type: "Decision", priority: "P1", br: ["BR-06"] },
    { id: "TC-T-014", title: "Tải lại trang", precondition: "Có 2 việc, 1 việc đã xong", steps: "Tải lại trang", data: "—", expected: "Vẫn 2 việc và trạng thái được giữ", type: "State", priority: "P1", br: ["BR-07"] },
  ],
};

const table: Workshop = {
  techniques: ["Equivalence Partitioning", "Boundary Value Analysis", "Decision Table", "Pairwise"],
  rules: [
    { id: "BR-01", text: "Mặc định 10 dòng mỗi trang, sắp theo Tên A→Z, tổng 37 người dùng" },
    { id: "BR-02", text: "Tìm kiếm không phân biệt hoa thường theo tên hoặc email" },
    { id: "BR-03", text: "Đổi bất kỳ bộ lọc hoặc tìm kiếm thì quay về trang 1" },
    { id: "BR-04", text: "Lọc vai trò và trạng thái kết hợp theo phép AND" },
    { id: "BR-05", text: "Bấm tiêu đề cột đổi chiều sắp xếp; Ngày tạo sắp theo thời gian thật" },
    { id: "BR-06", text: "Chọn tất cả chỉ chọn các dòng của trang hiện tại" },
    { id: "BR-07", text: "Khoá/Mở khoá đổi trạng thái; Admin không thể bị khoá" },
    { id: "BR-08", text: "Xuất CSV theo bộ lọc hiện tại, gồm mọi trang" },
  ],
  cases: [
    { id: "TC-U-001", title: "Trạng thái mặc định", precondition: "Dữ liệu gốc", steps: "Mở trang", data: "—", expected: "37 người dùng, Trang 1/4, dòng đầu là Bùi Chi", type: "Happy", priority: "P0", br: ["BR-01"] },
    { id: "TC-U-002", title: "Trang cuối", precondition: "Dữ liệu gốc", steps: "Bấm Trang sau ba lần", data: "—", expected: "Trang 4/4 có 7 dòng, Trang sau bị khoá", type: "BVA", priority: "P0", br: ["BR-01"] },
    { id: "TC-U-003", title: "Đổi số dòng mỗi trang", precondition: "Dữ liệu gốc", steps: "Chọn 20 dòng mỗi trang", data: "20", expected: "Trang 1/2", type: "EP", priority: "P1", br: ["BR-01"] },
    { id: "TC-U-004", title: "Tìm kiếm hoa thường", precondition: "Dữ liệu gốc", steps: "Nhập MINH", data: "MINH", expected: "3 người dùng", type: "EP", priority: "P0", br: ["BR-02"] },
    { id: "TC-U-005", title: "Tìm kiếm không có kết quả", precondition: "Dữ liệu gốc", steps: "Nhập chuỗi không tồn tại", data: "khong-ton-tai", expected: "Hiện thông báo không tìm thấy", type: "Negative", priority: "P1", br: ["BR-02"] },
    { id: "TC-U-006", title: "Đổi bộ lọc quay về trang 1", precondition: "Đang ở trang 2", steps: "Chọn vai trò Editor", data: "editor", expected: "Về Trang 1/2 (11 editor)", type: "State", priority: "P0", br: ["BR-03"] },
    { id: "TC-U-007", title: "Lọc kết hợp", precondition: "Dữ liệu gốc", steps: "Chọn Editor và Đã khoá", data: "editor + locked", expected: "3 người dùng", type: "Decision", priority: "P0", br: ["BR-04"] },
    { id: "TC-U-008", title: "Sắp xếp Ngày tạo tăng dần", precondition: "Dữ liệu gốc", steps: "Bấm tiêu đề Ngày tạo", data: "—", expected: "Dòng đầu là 01/01/2025, các ngày tăng dần theo thời gian", type: "Decision", priority: "P0", br: ["BR-05"] },
    { id: "TC-U-009", title: "Đảo chiều sắp xếp", precondition: "Đang sắp tăng dần", steps: "Bấm lại tiêu đề", data: "—", expected: "aria-sort chuyển sang descending", type: "State", priority: "P1", br: ["BR-05"] },
    { id: "TC-U-010", title: "Chọn tất cả trang này", precondition: "Dữ liệu gốc", steps: "Tick ô chọn tất cả", data: "—", expected: "Đã chọn 10 (không phải 37)", type: "BVA", priority: "P0", br: ["BR-06"] },
    { id: "TC-U-011", title: "Khoá hàng loạt", precondition: "Đã chọn 10 dòng", steps: "Bấm Khoá đã chọn", data: "—", expected: "Tổng số người bị khoá tăng từ 9 lên 13; Admin không bị khoá", type: "Decision", priority: "P0", br: ["BR-07"] },
    { id: "TC-U-012", title: "Nút khoá của Admin", precondition: "Lọc vai trò Admin", steps: "Quan sát nút thao tác", data: "admin", expected: "Mọi nút bị vô hiệu hoá", type: "Negative", priority: "P1", br: ["BR-07"] },
    { id: "TC-U-013", title: "Xuất CSV theo bộ lọc", precondition: "Đang lọc 3 người", steps: "Bấm Xuất CSV", data: "minh", expected: "Tệp nguoi-dung.csv có 1 dòng tiêu đề + 3 dòng", type: "Happy", priority: "P2", br: ["BR-08"] },
  ],
};

const leave: Workshop = {
  techniques: ["Boundary Value Analysis", "State Transition", "Decision Table", "Permission matrix"],
  rules: [
    { id: "BR-01", text: "Đơn gồm loại nghỉ, từ ngày, đến ngày và lý do 10–200 ký tự" },
    { id: "BR-02", text: "Ngày bắt đầu không ở quá khứ; ngày kết thúc từ ngày bắt đầu trở đi" },
    { id: "BR-03", text: "Số ngày nghỉ tính cả ngày đầu và ngày cuối; phép năm còn 12 ngày" },
    { id: "BR-04", text: "Trạng thái: Chờ duyệt → Đã duyệt / Từ chối / Đã huỷ" },
    { id: "BR-05", text: "Chỉ Quản lý được duyệt hoặc từ chối; từ chối bắt buộc có lý do" },
    { id: "BR-06", text: "Chỉ khi được duyệt, phép năm mới bị trừ; đơn đã duyệt không huỷ được" },
    { id: "BR-07", text: "Không cho gửi đơn trùng khoảng ngày với đơn đang chờ hoặc đã duyệt" },
  ],
  cases: [
    { id: "TC-H-001", title: "Gửi đơn hợp lệ", precondition: "Là nhân viên, hôm nay 02/03/2026", steps: "Chọn 09/03 đến 11/03, nhập lý do, gửi", data: "3 ngày", expected: "Đơn Chờ duyệt, số ngày 3, phép năm vẫn 12", type: "Happy", priority: "P0", br: ["BR-01", "BR-03", "BR-06"] },
    { id: "TC-H-002", title: "Ngày bắt đầu ở quá khứ", precondition: "Hôm nay 02/03/2026", steps: "Chọn bắt đầu 01/03", data: "01/03", expected: "Báo ngày bắt đầu không được ở quá khứ", type: "BVA", priority: "P0", br: ["BR-02"] },
    { id: "TC-H-003", title: "Kết thúc trước bắt đầu", precondition: "Là nhân viên", steps: "Bắt đầu 10/03, kết thúc 09/03", data: "—", expected: "Báo ngày kết thúc phải sau hoặc bằng ngày bắt đầu", type: "Negative", priority: "P0", br: ["BR-02"] },
    { id: "TC-H-004", title: "Lý do 9 ký tự", precondition: "Là nhân viên", steps: "Nhập lý do 9 ký tự", data: "9 ký tự", expected: "Báo lý do tối thiểu 10 ký tự", type: "BVA", priority: "P1", br: ["BR-01"] },
    { id: "TC-H-005", title: "Đúng 12 ngày phép", precondition: "Phép năm còn 12", steps: "Gửi đơn 01/04 đến 12/04", data: "12 ngày", expected: "Gửi thành công", type: "BVA", priority: "P0", br: ["BR-03"] },
    { id: "TC-H-006", title: "13 ngày phép", precondition: "Phép năm còn 12", steps: "Gửi đơn 01/04 đến 13/04", data: "13 ngày", expected: "Báo vượt quá phép năm còn lại (12)", type: "BVA", priority: "P0", br: ["BR-03"] },
    { id: "TC-H-007", title: "Nghỉ ốm không bị giới hạn bởi phép năm", precondition: "Phép năm còn 12", steps: "Gửi đơn nghỉ ốm 20 ngày", data: "sick", expected: "Gửi thành công", type: "EP", priority: "P1", br: ["BR-03"] },
    { id: "TC-H-008", title: "Đơn trùng ngày", precondition: "Có đơn 09–11/03 chờ duyệt", steps: "Gửi đơn 11–12/03", data: "11/03", expected: "Báo trùng với một đơn khác", type: "Decision", priority: "P0", br: ["BR-07"] },
    { id: "TC-H-009", title: "Quản lý duyệt đơn", precondition: "Có đơn chờ duyệt, mở tab Quản lý", steps: "Bấm Duyệt", data: "—", expected: "Đơn Đã duyệt; tab nhân viên thấy phép năm giảm đúng số ngày", type: "State", priority: "P0", br: ["BR-04", "BR-06"] },
    { id: "TC-H-010", title: "Từ chối không có lý do", precondition: "Có đơn chờ duyệt", steps: "Từ chối rồi xác nhận khi để trống lý do", data: "(rỗng)", expected: "Báo vui lòng nhập lý do từ chối", type: "Negative", priority: "P1", br: ["BR-05"] },
    { id: "TC-H-011", title: "Nhân viên không có nút Duyệt", precondition: "Có đơn chờ duyệt", steps: "Quan sát danh sách ở vai trò Nhân viên", data: "—", expected: "Không có nút Duyệt/Từ chối", type: "Security", priority: "P0", br: ["BR-05"] },
    { id: "TC-H-012", title: "Huỷ đơn chờ duyệt", precondition: "Có đơn chờ duyệt", steps: "Nhân viên bấm Huỷ đơn", data: "—", expected: "Đơn Đã huỷ", type: "State", priority: "P1", br: ["BR-04"] },
    { id: "TC-H-013", title: "Huỷ đơn đã duyệt", precondition: "Đơn đã được duyệt", steps: "Tìm nút Huỷ đơn", data: "—", expected: "Không có nút Huỷ đơn", type: "State", priority: "P0", br: ["BR-06"] },
  ],
};

const chat: Workshop = {
  techniques: ["Boundary Value Analysis", "State Transition", "Exploratory", "Concurrency"],
  rules: [
    { id: "BR-01", text: "Phải nhập tên hiển thị trước khi vào phòng chat" },
    { id: "BR-02", text: "Tin nhắn 1–200 ký tự sau khi cắt khoảng trắng hai đầu" },
    { id: "BR-03", text: "Tin nhắn đến các tab khác theo thời gian thực" },
    { id: "BR-04", text: "Người khác đang gõ thì hiện “<tên> đang nhập…” rồi tự biến mất" },
    { id: "BR-05", text: "Bộ đếm chưa đọc chỉ tăng khi tab bị ẩn và về 0 khi quay lại" },
    { id: "BR-06", text: "Lịch sử giữ lại khi tải lại trang (tối đa 50 tin)" },
  ],
  cases: [
    { id: "TC-C-101", title: "Vào phòng không nhập tên", precondition: "Mở phòng chat", steps: "Bấm Vào phòng khi để trống tên", data: "(rỗng)", expected: "Báo vui lòng nhập tên hiển thị", type: "Negative", priority: "P0", br: ["BR-01"] },
    { id: "TC-C-102", title: "Gửi tin hợp lệ", precondition: "Hai tab An và Bình", steps: "An gửi Xin chào", data: "Xin chào", expected: "Bình thấy tin ngay, không tải lại", type: "Happy", priority: "P0", br: ["BR-02", "BR-03"] },
    { id: "TC-C-103", title: "Tin nhắn rỗng/khoảng trắng", precondition: "Đã vào phòng", steps: "Gửi ba dấu cách", data: "   ", expected: "Báo không được để trống, không có tin mới", type: "EP", priority: "P1", br: ["BR-02"] },
    { id: "TC-C-104", title: "Tin dài 200 ký tự", precondition: "Đã vào phòng", steps: "Gửi 200 ký tự", data: "a × 200", expected: "Gửi thành công", type: "BVA", priority: "P0", br: ["BR-02"] },
    { id: "TC-C-105", title: "Tin dài 201 ký tự", precondition: "Đã vào phòng", steps: "Gửi 201 ký tự", data: "a × 201", expected: "Báo tối đa 200, không có tin mới", type: "BVA", priority: "P0", br: ["BR-02"] },
    { id: "TC-C-106", title: "Cắt khoảng trắng hai đầu", precondition: "Đã vào phòng", steps: "Gửi “  chào  ”", data: "  chào  ", expected: "Nội dung hiển thị là chào", type: "EP", priority: "P1", br: ["BR-02"] },
    { id: "TC-C-107", title: "Chỉ báo đang nhập", precondition: "Hai tab", steps: "An gõ dở một câu", data: "Xin ch", expected: "Tab Bình hiện An đang nhập…; mất sau khi An gửi", type: "State", priority: "P1", br: ["BR-04"] },
    { id: "TC-C-108", title: "Chưa đọc khi tab ẩn", precondition: "Tab Bình đang ẩn", steps: "An gửi hai tin", data: "2 tin", expected: "Bình có Chưa đọc: 2", type: "State", priority: "P1", br: ["BR-05"] },
    { id: "TC-C-109", title: "Quay lại tab", precondition: "Bình có 2 tin chưa đọc", steps: "Hiện lại tab Bình", data: "—", expected: "Chưa đọc: 0", type: "State", priority: "P1", br: ["BR-05"] },
    { id: "TC-C-110", title: "Tab đang xem không tăng chưa đọc", precondition: "Hai tab đang hiển thị", steps: "An gửi một tin", data: "—", expected: "Bình vẫn Chưa đọc: 0", type: "Negative", priority: "P1", br: ["BR-05"] },
    { id: "TC-C-111", title: "Tải lại giữ lịch sử", precondition: "Có tin nhắn", steps: "Tải lại tab Bình", data: "—", expected: "Vẫn đủ tin nhắn, tên được giữ", type: "State", priority: "P1", br: ["BR-06"] },
  ],
};

export const WORKSHOPS: Record<string, Workshop> = { login, forms, cart, playground, api, otp, todo, table, leave, chat };

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
