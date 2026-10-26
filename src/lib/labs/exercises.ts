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

const playground: Exercise[] = [
  {
    id: "playground-1",
    title: "Xử lý hộp thoại confirm",
    difficulty: 2,
    task: "Kiểm tra hai nhánh của hộp thoại confirm: chấp nhận hiển thị “Đồng ý”, từ chối hiển thị “Huỷ”. Hộp thoại phải được xử lý bằng code.",
    criteria: [
      "Đăng ký xử lý hộp thoại TRƯỚC khi bấm nút gây ra nó",
      "Có đủ hai nhánh: chấp nhận và từ chối",
      "Kiểm tra nội dung thông báo của hộp thoại (dialog.message())",
      ...COMMON_CRITERIA,
    ],
    hints: [
      "Playwright có sự kiện dialog trên đối tượng page.",
      "Dùng page.once để chỉ xử lý đúng một hộp thoại.",
      "dialog.accept() để đồng ý và dialog.dismiss() để từ chối.",
    ],
    solution: `import { test, expect } from "@playwright/test";

test("confirm: đồng ý", async ({ page }) => {
  await page.goto("/lab/playground");
  page.once("dialog", async (dialog) => {
    expect(dialog.type()).toBe("confirm");
    expect(dialog.message()).toContain("Bạn có chắc không?");
    await dialog.accept();
  });
  await page.getByRole("button", { name: "Hiện confirm" }).click();
  await expect(page.getByTestId("confirm-result")).toHaveText("Đồng ý");
});

test("confirm: huỷ", async ({ page }) => {
  await page.goto("/lab/playground");
  page.once("dialog", (dialog) => dialog.dismiss());
  await page.getByRole("button", { name: "Hiện confirm" }).click();
  await expect(page.getByTestId("confirm-result")).toHaveText("Huỷ");
});`,
  },
  {
    id: "playground-2",
    title: "Tab mới và iframe",
    difficulty: 2,
    task: "Bắt tab mới sau khi bấm liên kết trợ giúp và kiểm tra nội dung của nó; sau đó điền và gửi form nằm trong iframe thanh toán.",
    criteria: [
      "Bắt tab mới bằng sự kiện của context, chạy song song với thao tác bấm",
      "Dùng đối tượng Page của tab mới để kiểm tra tiêu đề",
      "Thao tác trong iframe bằng frameLocator, không dùng page.getBy... trực tiếp",
      ...COMMON_CRITERIA,
    ],
    hints: [
      "Liên kết dùng rel=noopener nên sự kiện popup của page không xảy ra; hãy nghe sự kiện của context.",
      "Dùng Promise.all để vừa chờ sự kiện vừa bấm.",
      "page.frameLocator(...) nhận selector của thẻ iframe, ví dụ theo data-testid.",
    ],
    solution: `import { test, expect } from "@playwright/test";

test("mở trang trợ giúp ở tab mới", async ({ page, context }) => {
  await page.goto("/lab/playground");
  const [popup] = await Promise.all([
    context.waitForEvent("page"),
    page.getByRole("link", { name: "Mở trang trợ giúp" }).click(),
  ]);
  await expect(popup).toHaveURL(/playground\\/help/);
  await expect(popup.getByRole("heading", { name: "Trang trợ giúp" })).toBeVisible();
});

test("thanh toán trong iframe", async ({ page }) => {
  await page.goto("/lab/playground");
  const frame = page.frameLocator('[data-testid="payment-frame"]');
  await frame.getByLabel("Số thẻ").fill("4242 4242 4242 4242");
  await frame.getByRole("button", { name: "Thanh toán" }).click();
  await expect(frame.getByRole("status")).toHaveText("Thanh toán thành công");
});`,
  },
  {
    id: "playground-3",
    title: "Kéo thả và nội dung tải trễ",
    difficulty: 3,
    task: "Kéo Thẻ A vào vùng thả. Sau đó mở trang với ?delay=3000, bấm Tải dữ liệu và chờ kết quả hiện ra mà không dùng chờ cố định.",
    criteria: [
      "Dùng dragTo cho thao tác kéo thả",
      "Kiểm tra kết quả thả bằng assertion, không phải bằng sleep",
      "Chờ nội dung trễ bằng assertion có timeout phù hợp, không dùng waitForTimeout",
      ...COMMON_CRITERIA,
    ],
    hints: [
      "locator.dragTo(target) nhận một locator đích.",
      "Timeout mặc định của expect là 5 giây; độ trễ 3 giây vẫn nằm trong đó nhưng có thể nâng cục bộ.",
      "Dùng toBeVisible({ timeout }) cho phần tử chỉ hiện sau khi tải xong.",
    ],
    solution: `import { test, expect } from "@playwright/test";

test("kéo thẻ A vào vùng thả", async ({ page }) => {
  await page.goto("/lab/playground");
  await page.getByTestId("drag-item").dragTo(page.getByTestId("drop-zone"));
  await expect(page.getByTestId("drop-result")).toHaveText("Thẻ A");
});

test("nội dung tải trễ không cần waitForTimeout", async ({ page }) => {
  await page.goto("/lab/playground?delay=3000");
  await page.getByRole("button", { name: "Tải dữ liệu" }).click();
  await expect(page.getByTestId("delay-result")).toBeVisible({ timeout: 6000 });
});`,
  },
  {
    id: "playground-4",
    title: "Shadow DOM và cuộn vô hạn",
    difficulty: 3,
    task: "Bấm nút nằm trong shadow DOM và kiểm tra kết quả. Sau đó cuộn danh sách tới cuối để tải thêm mục và kiểm tra số lượng tăng đúng.",
    criteria: [
      "Tìm nút trong shadow DOM bằng getByRole (không cần cú pháp đặc biệt)",
      "Cuộn bằng cách tác động lên đúng phần tử cuộn, không cuộn cả trang",
      "Kiểm tra số lượng bằng assertion tự thử lại (toHaveText/toHaveCount)",
      ...COMMON_CRITERIA,
    ],
    hints: [
      "Locator của Playwright tự đi xuyên qua shadow DOM dạng open.",
      "locator.evaluate cho phép chạy code trên phần tử, ví dụ el.scrollTo(0, el.scrollHeight).",
      "Số mục hiển thị trong phần tử có data-testid là scroll-count.",
    ],
    solution: `import { test, expect } from "@playwright/test";

test("bấm nút trong shadow DOM", async ({ page }) => {
  await page.goto("/lab/playground");
  await page.getByRole("button", { name: "Bấm trong shadow" }).click();
  await expect(page.getByText("Đã bấm trong shadow DOM")).toBeVisible();
});

test("cuộn tới cuối để tải thêm mục", async ({ page }) => {
  await page.goto("/lab/playground");
  const list = page.getByTestId("scroll-list");
  await expect(page.getByTestId("scroll-count")).toHaveText("20");
  await list.evaluate((el) => el.scrollTo(0, el.scrollHeight));
  await expect(page.getByTestId("scroll-count")).toHaveText("40");
});`,
  },
];

const api: Exercise[] = [
  {
    id: "api-1",
    title: "GET: danh sách, phân trang và tìm kiếm",
    difficulty: 2,
    task: "Kiểm tra endpoint danh sách: giá trị mặc định, trang cuối, giới hạn pageSize và tìm kiếm không phân biệt hoa thường.",
    criteria: [
      "Kiểm tra cả status, cấu trúc body (page, pageSize, total, data) và số phần tử",
      "Có test cho trang cuối và cho pageSize vượt giới hạn",
      "Test tìm kiếm kiểm tra đúng nội dung từng phần tử trả về",
      "Không dùng trình duyệt: chỉ dùng fixture request",
      ...COMMON_CRITERIA,
    ],
    hints: [
      "Fixture request nhận đường dẫn tương đối nhờ baseURL.",
      "Dữ liệu gốc có 12 cuốn sách, pageSize mặc định là 5.",
      "Dùng res.json() để đọc body rồi expect trên từng trường.",
    ],
    solution: `import { test, expect } from "@playwright/test";

test("danh sách mặc định có phân trang", async ({ request }) => {
  const res = await request.get("/api/lab/books");
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body).toMatchObject({ page: 1, pageSize: 5, total: 12 });
  expect(body.data).toHaveLength(5);
});

test("trang cuối chứa phần còn lại", async ({ request }) => {
  const body = await (await request.get("/api/lab/books?page=3&pageSize=5")).json();
  expect(body.data).toHaveLength(2);
});

test("pageSize bị giới hạn ở 50", async ({ request }) => {
  const body = await (await request.get("/api/lab/books?pageSize=999")).json();
  expect(body.pageSize).toBe(50);
});

test("tìm kiếm không phân biệt hoa thường", async ({ request }) => {
  const body = await (await request.get("/api/lab/books?q=CLEAN")).json();
  expect(body.total).toBe(2);
  for (const b of body.data) expect((b.title + " " + b.author).toLowerCase()).toContain("clean");
});`,
  },
  {
    id: "api-2",
    title: "Xác thực và phân quyền (401, 403)",
    difficulty: 2,
    task: "Chứng minh rằng thao tác ghi bị chặn khi thiếu token (401) hoặc dùng token chỉ đọc (403), và xoá chỉ dành cho admin.",
    criteria: [
      "Có test thiếu token và test token chỉ đọc",
      "Dùng cùng một body hợp lệ để chỉ có yếu tố xác thực thay đổi",
      "Có test kiểm tra xoá bằng token chỉ đọc bị từ chối",
      ...COMMON_CRITERIA,
    ],
    hints: [
      "Truyền header qua tuỳ chọn headers của request.post.",
      "reader-token là token chỉ đọc, admin-token là token đầy đủ.",
      "Viết hàm validBook() trả về body hợp lệ để dùng lại.",
    ],
    solution: `import { test, expect } from "@playwright/test";

const validBook = () => ({
  title: "Playwright in Practice",
  author: "QA Team",
  isbn: "978-1111111111",
  price: 300000,
});

test("thiếu token → 401", async ({ request }) => {
  const res = await request.post("/api/lab/books", { data: validBook() });
  expect(res.status()).toBe(401);
});

test("token chỉ đọc → 403 khi tạo", async ({ request }) => {
  const res = await request.post("/api/lab/books", {
    headers: { Authorization: "Bearer reader-token" },
    data: validBook(),
  });
  expect(res.status()).toBe(403);
});

test("token chỉ đọc → 403 khi xoá", async ({ request }) => {
  const res = await request.delete("/api/lab/books/b-1", {
    headers: { Authorization: "Bearer reader-token" },
  });
  expect(res.status()).toBe(403);
});`,
  },
  {
    id: "api-3",
    title: "Dữ liệu sai: 422 và 409",
    difficulty: 3,
    task: "Kiểm tra validation: giá âm, giá vượt trần, ISBN sai định dạng cho 422 kèm đúng trường lỗi; ISBN trùng cho 409.",
    criteria: [
      "Dùng data-driven cho các trường hợp 422, mỗi trường hợp một test",
      "Kiểm tra mảng errors chứa đúng tên trường bị lỗi",
      "Có test biên cho price: 0 và 10.000.000 hợp lệ, -1 và 10.000.001 không hợp lệ",
      "Có test ISBN trùng trả 409",
      ...COMMON_CRITERIA,
    ],
    hints: [
      "Mỗi test dùng ISBN khác nhau (hoặc gọi reset) để không bị 409 ngoài ý muốn.",
      "Body 422 có dạng { message, errors: [{ field, message }] }.",
      "request trong cùng một test giữ cookie nên dữ liệu đã tạo vẫn còn.",
    ],
    solution: `import { test, expect } from "@playwright/test";

const auth = { Authorization: "Bearer admin-token" };
const book = (over: Record<string, unknown> = {}) => ({
  title: "Sách thử",
  author: "QA Team",
  isbn: "978-2222222222",
  price: 100000,
  ...over,
});

const invalid = [
  { name: "price âm", over: { price: -1 }, field: "price" },
  { name: "price vượt trần", over: { price: 10_000_001 }, field: "price" },
  { name: "isbn sai định dạng", over: { isbn: "123" }, field: "isbn" },
  { name: "title rỗng", over: { title: "" }, field: "title" },
];

for (const c of invalid) {
  test("422: " + c.name, async ({ request }) => {
    const res = await request.post("/api/lab/books", { headers: auth, data: book(c.over) });
    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body.errors.map((e: { field: string }) => e.field)).toContain(c.field);
  });
}

for (const price of [0, 10_000_000]) {
  test("biên hợp lệ: price " + price, async ({ request }) => {
    const res = await request.post("/api/lab/books", { headers: auth, data: book({ price }) });
    expect(res.status()).toBe(201);
  });
}

test("409: isbn trùng", async ({ request }) => {
  const res = await request.post("/api/lab/books", {
    headers: auth,
    data: book({ isbn: "978-0132350884" }),
  });
  expect(res.status()).toBe(409);
});`,
  },
  {
    id: "api-4",
    title: "Vòng đời CRUD và bắt bug",
    difficulty: 3,
    task: "Đi hết vòng đời: tạo → đọc → sửa → xoá → đọc lại (404). Sau đó chạy lại với ?bugs=BUG-02 và ?bugs=BUG-03 để chắc chắn test của bạn phát hiện được lỗi.",
    criteria: [
      "Kiểm tra status của từng bước và header Location sau khi tạo",
      "Dùng id lấy từ phản hồi của lần tạo cho các bước sau",
      "Test đỏ khi bật BUG-02 (tạo trả 200 thay vì 201)",
      "Có test riêng cho DELETE sách không tồn tại, đỏ khi bật BUG-03",
      ...COMMON_CRITERIA,
    ],
    hints: [
      "Cookie giữ trạng thái giữa các lời gọi trong cùng một test.",
      "Truyền bug qua query: request.post('/api/lab/books?bugs=BUG-02', ...).",
      "DELETE một id không tồn tại phải trả 404.",
    ],
    solution: `import { test, expect } from "@playwright/test";

const auth = { Authorization: "Bearer admin-token" };

test("vòng đời tạo – đọc – sửa – xoá", async ({ request }) => {
  const created = await request.post("/api/lab/books", {
    headers: auth,
    data: { title: "Playwright in Practice", author: "QA Team", isbn: "978-1111111111", price: 300000 },
  });
  expect(created.status()).toBe(201);
  const book = await created.json();
  expect(created.headers()["location"]).toContain(book.id);

  const read = await request.get("/api/lab/books/" + book.id);
  expect(read.status()).toBe(200);
  expect((await read.json()).title).toBe("Playwright in Practice");

  const updated = await request.put("/api/lab/books/" + book.id, { headers: auth, data: { price: 350000 } });
  expect(updated.status()).toBe(200);
  expect((await updated.json()).price).toBe(350000);

  const removed = await request.delete("/api/lab/books/" + book.id, { headers: auth });
  expect(removed.status()).toBe(204);
  expect((await request.get("/api/lab/books/" + book.id)).status()).toBe(404);
});

test("xoá sách không tồn tại trả 404", async ({ request }) => {
  const res = await request.delete("/api/lab/books/b-999", { headers: auth });
  expect(res.status()).toBe(404);
});`,
  },
];

export const EXERCISES: Record<string, Exercise[]> = { login, forms, cart, playground, api };
