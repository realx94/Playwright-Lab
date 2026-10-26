export interface Exercise {
  id: string;
  title: string;
  difficulty: 1 | 2 | 3;
  task: string;
  /** Tiêu chí đạt: khách quan, người học tự kiểm chứng được. */
  criteria: string[];
  /** Gợi ý mở dần, từ mơ hồ đến cụ thể. */
  hints: string[];
  solution: string;
}

const COMMON_CRITERIA = ["Test chạy xanh 3 lần liên tiếp", "Không dùng waitForTimeout hoặc sleep cố định"];

const login: Exercise[] = [
  {
    id: "login-1",
    title: "Đăng nhập thành công",
    difficulty: 1,
    task: "Viết test đăng nhập bằng tài khoản hợp lệ và xác nhận người dùng vào được trang chính.",
    criteria: [
      "Lấy ô nhập bằng getByLabel hoặc getByRole, không dùng CSS selector dài",
      "Có assertion web-first (expect(...).toBeVisible hoặc tương đương)",
      ...COMMON_CRITERIA,
    ],
    hints: [
      "Hai ô nhập đều có label hiển thị trên giao diện.",
      "Sau khi đăng nhập có phần tử data-testid là dashboard.",
      "Dùng await expect(page.getByTestId(...)).toBeVisible() để kiểm tra.",
    ],
    solution: `import { test, expect } from "@playwright/test";

test("đăng nhập hợp lệ", async ({ page }) => {
  await page.goto("/lab/login");
  await page.getByLabel("Email").fill("user@lab.dev");
  await page.getByLabel("Mật khẩu").fill("Passw0rd!");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(page.getByTestId("dashboard")).toBeVisible();
});`,
  },
  {
    id: "login-2",
    title: "Data-driven: các lỗi mật khẩu",
    difficulty: 2,
    task: "Tách dữ liệu khỏi logic: sinh nhiều test từ một mảng dữ liệu, mỗi trường hợp kiểm tra đúng thông báo lỗi mật khẩu.",
    criteria: [
      "Mỗi bộ dữ liệu là một test riêng có tên mô tả",
      "Có ít nhất 5 trường hợp, gồm biên 7 ký tự và 33 ký tự",
      "Dữ liệu nằm trong một mảng, logic không bị lặp lại",
      "Assert đúng nội dung thông báo lỗi, không chỉ kiểm tra có lỗi",
      ...COMMON_CRITERIA,
    ],
    hints: [
      "Dùng vòng for...of bao quanh lời gọi test(...).",
      "Mật khẩu 7 và 33 ký tự là hai biên của khoảng 8–32.",
      "Dùng toContainText với một đoạn đặc trưng của thông báo.",
    ],
    solution: `import { test, expect } from "@playwright/test";

const cases = [
  { name: "7 ký tự", pw: "Pass0r!", error: "tối thiểu 8" },
  { name: "33 ký tự", pw: "Aa1!" + "a".repeat(29), error: "tối đa 32" },
  { name: "thiếu ký tự đặc biệt", pw: "Passw0rdd", error: "ký tự đặc biệt" },
  { name: "thiếu chữ hoa", pw: "passw0rd!", error: "chữ hoa" },
  { name: "thiếu số", pw: "Password!", error: "số" },
];

for (const c of cases) {
  test("mật khẩu " + c.name + " bị từ chối", async ({ page }) => {
    await page.goto("/lab/login");
    await page.getByLabel("Email").fill("user@lab.dev");
    await page.getByLabel("Mật khẩu").fill(c.pw);
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    await expect(page.getByTestId("password-error")).toContainText(c.error);
  });
}`,
  },
  {
    id: "login-3",
    title: "Khoá tài khoản sau 5 lần sai",
    difficulty: 3,
    task: "Kiểm tra quy tắc khoá: lần sai thứ 4 chưa khoá, lần sai thứ 5 thì khoá. Tránh lặp code và luôn bắt đầu từ trạng thái sạch.",
    criteria: [
      "Kiểm tra cả lần sai thứ 4 (chưa khoá) và lần thứ 5 (khoá)",
      "Dùng hàm helper hoặc Page Object, không lặp lại các bước đăng nhập",
      "Có beforeEach đưa dữ liệu lab về trạng thái ban đầu",
      "Dùng test.step để báo cáo dễ đọc",
      ...COMMON_CRITERIA,
    ],
    hints: [
      "Có nút reset dữ liệu lab với data-testid là reset-data.",
      "Tạo hàm loginWith(page, pw) và gọi lặp trong vòng for.",
      "Sau lần 4 chỉ có thông báo sai thông tin; lần 5 thông báo chứa chữ 'khoá'.",
    ],
    solution: `import { test, expect, type Page } from "@playwright/test";

async function loginWith(page: Page, password: string) {
  await page.getByLabel("Email").fill("user@lab.dev");
  await page.getByLabel("Mật khẩu").fill(password);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/lab/login");
  await page.getByTestId("reset-data").click();
});

test("khoá ở lần sai thứ 5, chưa khoá ở lần 4", async ({ page }) => {
  await test.step("4 lần sai chưa bị khoá", async () => {
    for (let i = 0; i < 4; i++) await loginWith(page, "Wrong123!");
    await expect(page.getByTestId("form-error")).not.toContainText("khoá");
  });
  await test.step("lần thứ 5 bị khoá", async () => {
    await loginWith(page, "Wrong123!");
    await expect(page.getByTestId("form-error")).toContainText("bị khoá");
  });
});`,
  },
  {
    id: "login-4",
    title: "Bắt bug: mật khẩu 7 ký tự được chấp nhận",
    difficulty: 3,
    task: "Viết một test PASS trên lab bình thường nhưng FAIL khi bật bug bằng ?bugs=BUG-01. Đây là cách kiểm tra test của bạn có thật sự phát hiện lỗi hay không.",
    criteria: [
      "Test xanh khi mở /lab/login",
      "Test đỏ khi mở /lab/login?bugs=BUG-01",
      "Test đỏ vì đúng lý do (thiếu thông báo lỗi), không phải do timeout hay lỗi locator",
      "Dùng dữ liệu ở biên: mật khẩu đúng 7 ký tự",
    ],
    hints: [
      "Bug cho phép mật khẩu ngắn hơn quy định một ký tự.",
      "Nhập mật khẩu 7 ký tự đủ loại ký tự và kiểm tra có thông báo lỗi mật khẩu.",
      "Dùng await expect(page.getByTestId('password-error')).toBeVisible(); đổi URL để chạy với bug.",
    ],
    solution: `import { test, expect } from "@playwright/test";

test("mật khẩu 7 ký tự phải bị từ chối", async ({ page }) => {
  await page.goto("/lab/login");          // thêm ?bugs=BUG-01 để thấy test đỏ
  await page.getByLabel("Email").fill("user@lab.dev");
  await page.getByLabel("Mật khẩu").fill("Pass0r!");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(page.getByTestId("password-error")).toContainText("tối thiểu 8");
});`,
  },
];

const forms: Exercise[] = [
  {
    id: "forms-1",
    title: "Điền form hợp lệ bằng đúng locator",
    difficulty: 1,
    task: "Điền toàn bộ các trường bắt buộc (input, radio, checkbox, select native, select tuỳ biến, switch) rồi gửi và kiểm tra kết quả.",
    criteria: [
      "Radio, checkbox và switch dùng getByRole",
      "Select native dùng selectOption, select tuỳ biến dùng click rồi chọn option",
      "Assert kết quả JSON chứa đúng ít nhất 3 trường đã nhập",
      ...COMMON_CRITERIA,
    ],
    hints: [
      "Thành phần radio/checkbox/switch có thẻ input ẩn, nên getByLabel gặp 2 phần tử.",
      "Select tuỳ biến mở danh sách option sau khi click vào trigger.",
      "Khối kết quả có data-testid là result.",
    ],
    solution: `import { test, expect } from "@playwright/test";

test("điền đủ form và gửi thành công", async ({ page }) => {
  await page.goto("/lab/forms");
  await page.getByLabel("Họ tên").fill("Nguyễn Văn A");
  await page.getByLabel("Email").fill("a@lab.dev");
  await page.getByLabel("Tuổi").fill("30");
  await page.getByRole("radio", { name: "Nam" }).click();
  await page.getByRole("checkbox", { name: "Đọc sách" }).check();
  await page.getByLabel("Quốc gia (select native)").selectOption("vn");
  await page.getByTestId("city").click();
  await page.getByRole("option", { name: "Đà Nẵng" }).click();
  await page.getByRole("switch", { name: "Nhận bản tin" }).click();
  await page.getByRole("checkbox", { name: "Tôi đồng ý điều khoản" }).check();
  await page.getByRole("button", { name: "Gửi" }).click();
  const result = page.getByTestId("result");
  await expect(result).toContainText('"country": "vn"');
  await expect(result).toContainText('"city": "Đà Nẵng"');
  await expect(result).toContainText('"newsletter": true');
});`,
  },
  {
    id: "forms-2",
    title: "Biên của trường Tuổi (18–65)",
    difficulty: 2,
    task: "Áp dụng Boundary Value Analysis: kiểm tra các giá trị 17, 18, 65, 66 và xác nhận chỉ hai giá trị ngoài khoảng bị báo lỗi.",
    criteria: [
      "Có đủ 4 giá trị biên: 17, 18, 65, 66",
      "Dùng data-driven thay vì bốn đoạn code lặp lại",
      "Với giá trị hợp lệ, assert lỗi tuổi KHÔNG xuất hiện",
      ...COMMON_CRITERIA,
    ],
    hints: [
      "Tạo mảng các cặp [giá trị, hợp lệ?].",
      "Lỗi tuổi có data-testid là age-error.",
      "Dùng toHaveCount(0) để khẳng định phần tử không tồn tại.",
    ],
    solution: `import { test, expect } from "@playwright/test";

const cases = [
  { age: "17", valid: false },
  { age: "18", valid: true },
  { age: "65", valid: true },
  { age: "66", valid: false },
];

for (const c of cases) {
  test("tuổi " + c.age + (c.valid ? " hợp lệ" : " bị từ chối"), async ({ page }) => {
    await page.goto("/lab/forms");
    await page.getByLabel("Tuổi").fill(c.age);
    await page.getByRole("button", { name: "Gửi" }).click();
    await expect(page.getByTestId("age-error")).toHaveCount(c.valid ? 0 : 1);
  });
}`,
  },
  {
    id: "forms-3",
    title: "Upload tệp hợp lệ và không hợp lệ",
    difficulty: 2,
    task: "Kiểm tra quy tắc tệp đính kèm: .exe bị từ chối, .png hợp lệ được chấp nhận. Không dùng tệp có sẵn trên ổ đĩa.",
    criteria: [
      "Tạo tệp ngay trong test bằng buffer, không phụ thuộc đường dẫn máy",
      "Có cả trường hợp sai định dạng và đúng định dạng",
      "Assert thông báo lỗi đúng nội dung ở trường hợp sai",
      ...COMMON_CRITERIA,
    ],
    hints: [
      "locator.setInputFiles nhận đối tượng { name, mimeType, buffer }.",
      "Lỗi tệp có data-testid là file-error.",
      "Với tệp .png hợp lệ, lỗi tệp không được xuất hiện sau khi gửi.",
    ],
    solution: `import { test, expect } from "@playwright/test";

test("tệp .exe bị từ chối", async ({ page }) => {
  await page.goto("/lab/forms");
  await page.getByLabel(/Tệp đính kèm/).setInputFiles({
    name: "a.exe",
    mimeType: "application/octet-stream",
    buffer: Buffer.from("x"),
  });
  await page.getByRole("button", { name: "Gửi" }).click();
  await expect(page.getByTestId("file-error")).toContainText("png, jpg, pdf");
});

test("tệp .png được chấp nhận", async ({ page }) => {
  await page.goto("/lab/forms");
  await page.getByLabel(/Tệp đính kèm/).setInputFiles({
    name: "a.png",
    mimeType: "image/png",
    buffer: Buffer.from("x"),
  });
  await page.getByRole("button", { name: "Gửi" }).click();
  await expect(page.getByTestId("file-error")).toHaveCount(0);
});`,
  },
];

const cart: Exercise[] = [
  {
    id: "cart-1",
    title: "Tính tiền đơn dưới 1 triệu",
    difficulty: 2,
    task: "Thêm Chuột không dây (250.000đ) vào giỏ và kiểm tra phí ship, VAT và tổng cộng theo business rules.",
    criteria: [
      "Có hàm helper đọc số tiền từ giao diện thành number",
      "Assert 3 giá trị: ship, VAT và tổng",
      "Tính kỳ vọng từ quy tắc (ship 30.000, VAT 8%), không sao chép giá trị đang hiển thị",
      ...COMMON_CRITERIA,
    ],
    hints: [
      "Giá trị tiền hiển thị dạng 250.000đ nên cần loại ký tự không phải số.",
      "Các phần tử có data-testid: shipping, vat, total.",
      "VAT = 8% của tạm tính sau giảm giá, ở đây tạm tính là 250.000.",
    ],
    solution: `import { test, expect, type Page } from "@playwright/test";

const num = async (page: Page, id: string) =>
  Number((await page.getByTestId(id).innerText()).replace(/[^\\d-]/g, ""));

test.beforeEach(async ({ page }) => {
  await page.goto("/lab/cart");
  await page.getByTestId("reset-data").click();
});

test("đơn dưới 1 triệu tính ship và VAT", async ({ page }) => {
  await page.getByTestId("product-p2").getByRole("button", { name: "Thêm vào giỏ" }).click();
  const subtotal = 250_000;
  const vat = Math.round(subtotal * 0.08);
  expect(await num(page, "shipping")).toBe(30_000);
  expect(await num(page, "vat")).toBe(vat);
  expect(await num(page, "total")).toBe(subtotal + vat + 30_000);
});`,
  },
  {
    id: "cart-2",
    title: "Mã SALE10 quanh các ngưỡng",
    difficulty: 2,
    task: "Kiểm tra mã SALE10 ở ngưỡng tối thiểu 500.000đ và mức giảm tối đa 100.000đ (decision table).",
    criteria: [
      "Có trường hợp đúng 500.000đ (giảm 50.000)",
      "Có trường hợp dưới ngưỡng bị từ chối kèm thông báo",
      "Có trường hợp đơn 3.200.000đ bị chặn trần giảm 100.000",
      ...COMMON_CRITERIA,
    ],
    hints: [
      "Chuột không dây giá 250.000đ nên bấm tăng một lần để đạt 500.000đ.",
      "Màn hình 24 inch giá 3.200.000đ; 10% là 320.000đ nhưng có trần.",
      "Thông báo từ chối có data-testid là cart-message.",
    ],
    solution: `import { test, expect, type Page } from "@playwright/test";

const num = async (page: Page, id: string) =>
  Number((await page.getByTestId(id).innerText()).replace(/[^\\d-]/g, ""));

async function add(page: Page, id: string, times = 1) {
  const card = page.getByTestId("product-" + id);
  await card.getByRole("button", { name: "Thêm vào giỏ" }).click();
  for (let i = 1; i < times; i++) await card.getByRole("button", { name: /^Tăng/ }).click();
}

async function applyCoupon(page: Page) {
  await page.getByLabel("Mã giảm giá").fill("SALE10");
  await page.getByRole("button", { name: "Áp dụng" }).click();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/lab/cart");
  await page.getByTestId("reset-data").click();
});

test("đúng ngưỡng 500.000 được giảm 50.000", async ({ page }) => {
  await add(page, "p2", 2);
  await applyCoupon(page);
  expect(await num(page, "discount")).toBe(-50_000);
});

test("dưới ngưỡng bị từ chối", async ({ page }) => {
  await add(page, "p2");
  await applyCoupon(page);
  await expect(page.getByTestId("cart-message")).toContainText("tối thiểu");
});

test("giảm giá bị chặn trần 100.000", async ({ page }) => {
  await add(page, "p3");
  await applyCoupon(page);
  expect(await num(page, "discount")).toBe(-100_000);
});`,
  },
  {
    id: "cart-3",
    title: "Vòng đời đơn và bắt BUG-03",
    difficulty: 3,
    task: "Kiểm tra đơn đi đúng chuỗi trạng thái và KHÔNG huỷ được khi đang giao. Sau đó chạy lại với ?bugs=BUG-03 để chắc chắn test của bạn phát hiện được lỗi.",
    criteria: [
      "Đi qua đủ: Mới → Đã thanh toán → Đang giao",
      "Khẳng định nút Huỷ đơn không tồn tại khi Đang giao",
      "Test xanh trên lab sạch và đỏ khi bật ?bugs=BUG-03",
      "Test đỏ vì đúng lý do (nút Huỷ xuất hiện), không phải do locator sai",
      ...COMMON_CRITERIA,
    ],
    hints: [
      "Trạng thái hiện tại có data-testid là order-status.",
      "Nút chuyển trạng thái có tên dạng 'Chuyển: Đã thanh toán'.",
      "Dùng expect(...).toHaveCount(0) cho nút Huỷ đơn.",
    ],
    solution: `import { test, expect } from "@playwright/test";

test("không huỷ được đơn đang giao", async ({ page }) => {
  await page.goto("/lab/cart");        // thêm ?bugs=BUG-03 để thấy test đỏ
  await page.getByTestId("reset-data").click();
  await page.getByTestId("product-p2").getByRole("button", { name: "Thêm vào giỏ" }).click();
  await page.getByRole("button", { name: "Đặt hàng" }).click();

  const status = page.getByTestId("order-status");
  await expect(status).toHaveText("Mới");
  await page.getByRole("button", { name: /Chuyển: Đã thanh toán/ }).click();
  await page.getByRole("button", { name: /Chuyển: Đang giao/ }).click();
  await expect(status).toHaveText("Đang giao");
  await expect(page.getByRole("button", { name: "Huỷ đơn" })).toHaveCount(0);
});`,
  },
];

export const EXERCISES: Record<string, Exercise[]> = { login, forms, cart };
