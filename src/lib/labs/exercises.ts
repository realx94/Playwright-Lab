export interface Exercise {
  id: string;
  title: string;
  difficulty: 1 | 2 | 3;
  /** Bug (qua ?bugs= hoặc cookie lab_bugs) mà bài này phải phát hiện; dùng cho chấm tự động. */
  bugs?: string[];
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
    bugs: ["BUG-01"],
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
    bugs: ["BUG-02"],
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
    bugs: ["BUG-01"],
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
    bugs: ["BUG-02"],
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
    bugs: ["BUG-03"],
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
    bugs: ["BUG-01"],
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
    bugs: ["BUG-02"],
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
    bugs: ["BUG-02", "BUG-03"],
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

const otp: Exercise[] = [
  {
    id: "otp-1",
    title: "Đăng nhập bằng OTP đọc từ hộp thư",
    difficulty: 3,
    task: "Gửi mã tới user@lab.dev, mở hộp thư giả ở một tab thứ hai để đọc mã OTP, rồi nhập mã vào tab đăng nhập và xác nhận vào được trang chính.",
    criteria: [
      "Tách việc đọc OTP thành hàm riêng (helper) có thể dùng lại",
      "Mở hộp thư bằng một page mới trong cùng context (cùng localStorage)",
      "Chờ giao diện chuyển sang bước nhập mã trước khi đọc hộp thư",
      "Dùng biểu thức chính quy để lấy đúng 6 chữ số, báo lỗi rõ nếu không tìm thấy",
      ...COMMON_CRITERIA,
    ],
    hints: [
      "Hai page trong cùng một context dùng chung localStorage.",
      "Email nằm trong phần tử có data-testid là email-body.",
      "Dùng innerText() rồi match(/[0-9]{6}/) để lấy mã.",
    ],
    solution: `import { test, expect, type BrowserContext } from "@playwright/test";

async function readOtp(context: BrowserContext): Promise<string> {
  const inbox = await context.newPage();
  await inbox.goto("/lab/inbox");
  const text = await inbox.getByTestId("email-body").first().innerText();
  await inbox.close();
  const match = text.match(/[0-9]{6}/);
  if (!match) throw new Error("Không tìm thấy OTP trong email");
  return match[0];
}

test("đăng nhập bằng OTP đọc từ hộp thư", async ({ page, context }) => {
  await page.goto("/lab/otp");
  await page.getByTestId("reset-data").click();
  await page.getByLabel("Email").fill("user@lab.dev");
  await page.getByRole("button", { name: "Gửi mã" }).click();
  await expect(page.getByLabel("Mã OTP")).toBeVisible();

  const otp = await readOtp(context);
  await page.getByLabel("Mã OTP").fill(otp);
  await page.getByRole("button", { name: "Xác nhận" }).click();
  await expect(page.getByTestId("dashboard")).toBeVisible();
});`,
  },
  {
    id: "otp-2",
    title: "Nhập sai 3 lần và bắt BUG-01",
    difficulty: 3,
    bugs: ["BUG-01"],
    task: "Chứng minh rằng sau 3 lần nhập sai thì mã bị huỷ và ngay cả mã đúng cũng không còn dùng được. Chạy lại với ?bugs=BUG-01 để chắc chắn test của bạn phát hiện được lỗi.",
    criteria: [
      "Kiểm tra thông báo còn lại bao nhiêu lần sau lần sai đầu tiên",
      "Kiểm tra thông báo mã đã bị huỷ sau lần sai thứ ba",
      "Sau đó nhập mã ĐÚNG và khẳng định vẫn bị từ chối",
      "Test xanh trên lab sạch và đỏ khi bật ?bugs=BUG-01",
      ...COMMON_CRITERIA,
    ],
    hints: [
      "Lấy OTP thật từ hộp thư rồi cố ý nhập một mã khác.",
      "Chọn mã sai khác mã thật để tránh vô tình đúng.",
      "Thông báo kết quả nằm trong phần tử có data-testid là otp-message.",
    ],
    solution: `import { test, expect, type BrowserContext, type Page } from "@playwright/test";

async function readOtp(context: BrowserContext): Promise<string> {
  const inbox = await context.newPage();
  await inbox.goto("/lab/inbox");
  const text = await inbox.getByTestId("email-body").first().innerText();
  await inbox.close();
  return text.match(/[0-9]{6}/)![0];
}

async function submit(page: Page, code: string) {
  await page.getByLabel("Mã OTP").fill(code);
  await page.getByRole("button", { name: "Xác nhận" }).click();
}

test("sai 3 lần thì mã đúng cũng bị từ chối", async ({ page, context }) => {
  await page.goto("/lab/otp");   // thêm ?bugs=BUG-01 để thấy test đỏ
  await page.getByTestId("reset-data").click();
  await page.getByLabel("Email").fill("user@lab.dev");
  await page.getByRole("button", { name: "Gửi mã" }).click();
  await expect(page.getByLabel("Mã OTP")).toBeVisible();

  const otp = await readOtp(context);
  const wrong = otp === "111111" ? "222222" : "111111";
  const message = page.getByTestId("otp-message");

  await submit(page, wrong);
  await expect(message).toContainText("Còn 2 lần");
  await submit(page, wrong);
  await submit(page, wrong);
  await expect(message).toContainText("đã bị huỷ");

  await submit(page, otp);
  await expect(message).toContainText("không hợp lệ hoặc đã hết hạn");
  await expect(page.getByTestId("dashboard")).toHaveCount(0);
});`,
  },
  {
    id: "otp-3",
    title: "Biên hết hạn 5 phút với đồng hồ giả",
    difficulty: 3,
    bugs: ["BUG-02"],
    task: "Dùng đồng hồ giả để kiểm tra đúng biên hiệu lực của mã: giây 299 và 300 còn hiệu lực, giây 301 đã hết hạn. Chạy lại với ?bugs=BUG-02 để thấy lỗi.",
    criteria: [
      "Không dùng waitForTimeout hay chờ thật 5 phút",
      "Đặt giờ giả bằng clock của context, không phụ thuộc thời gian thật của máy",
      "Dùng data-driven cho ba mốc 299, 300, 301 giây",
      "Test xanh trên lab sạch, đỏ khi bật ?bugs=BUG-02 (với mốc 301)",
      ...COMMON_CRITERIA,
    ],
    hints: [
      "context.clock.setFixedTime(date) cố định giờ giả và giữ nguyên các timer.",
      "Đặt giờ T0 trước khi gửi mã, rồi đặt T0 + số giây trước khi nhập mã.",
      "Dùng clock.install + fastForward sẽ bị lệch vài giây vì thời gian vẫn chạy thật.",
    ],
    solution: `import { test, expect, type BrowserContext } from "@playwright/test";

async function readOtp(context: BrowserContext): Promise<string> {
  const inbox = await context.newPage();
  await inbox.goto("/lab/inbox");
  const text = await inbox.getByTestId("email-body").first().innerText();
  await inbox.close();
  return text.match(/[0-9]{6}/)![0];
}

const T0 = new Date("2026-03-01T10:00:00");
const cases = [
  { offset: 299, valid: true },
  { offset: 300, valid: true },
  { offset: 301, valid: false },
];

for (const c of cases) {
  test("mã ở giây " + c.offset + (c.valid ? " còn hiệu lực" : " đã hết hạn"), async ({ page, context }) => {
    await context.clock.setFixedTime(T0);
    await page.goto("/lab/otp");   // thêm ?bugs=BUG-02 để thấy test đỏ
    await page.getByTestId("reset-data").click();
    await page.getByLabel("Email").fill("user@lab.dev");
    await page.getByRole("button", { name: "Gửi mã" }).click();
    await expect(page.getByLabel("Mã OTP")).toBeVisible();

    const otp = await readOtp(context);
    await context.clock.setFixedTime(new Date(T0.getTime() + c.offset * 1000));
    await page.getByLabel("Mã OTP").fill(otp);
    await page.getByRole("button", { name: "Xác nhận" }).click();

    if (c.valid) await expect(page.getByTestId("dashboard")).toBeVisible();
    else await expect(page.getByTestId("otp-message")).toContainText("hết hạn");
  });
}`,
  },
  {
    id: "otp-4",
    title: "Gửi lại mã và bắt BUG-03",
    difficulty: 3,
    bugs: ["BUG-03"],
    task: "Kiểm tra nút Gửi lại mã bị khoá 60 giây đầu, mở khoá sau đó, và khi đã xin mã mới thì mã cũ phải bị từ chối. Chạy lại với ?bugs=BUG-03 để thấy lỗi.",
    criteria: [
      "Khẳng định nút bị khoá và có thông báo đếm ngược ngay sau khi gửi",
      "Dùng đồng hồ giả để vượt 60 giây, không chờ thật",
      "Đọc được cả hai mã từ hộp thư và phân biệt mã cũ, mã mới",
      "Mã cũ bị từ chối, mã mới được chấp nhận; đỏ khi bật ?bugs=BUG-03",
      ...COMMON_CRITERIA,
    ],
    hints: [
      "Dùng ?seed=10 để hai mã OTP khác nhau một cách chắc chắn.",
      "Hộp thư xếp thư mới nhất lên đầu; allInnerTexts() không tự chờ nên hãy chờ toHaveCount trước.",
      "context.clock.install() rồi fastForward('01:01') để vượt thời gian khoá.",
    ],
    solution: `import { test, expect, type BrowserContext } from "@playwright/test";

async function readOtps(context: BrowserContext, count: number): Promise<string[]> {
  const inbox = await context.newPage();
  await inbox.goto("/lab/inbox");
  const bodies = inbox.getByTestId("email-body");
  await expect(bodies).toHaveCount(count);   // allInnerTexts() không tự chờ
  const texts = await bodies.allInnerTexts();
  await inbox.close();
  return texts.map((b) => b.match(/[0-9]{6}/)![0]);   // mới nhất đứng đầu
}

test("gửi lại bị khoá 60 giây và mã cũ không còn hiệu lực", async ({ page, context }) => {
  await context.clock.install();
  await page.goto("/lab/otp?seed=10");   // thêm bugs=BUG-03 để thấy test đỏ
  await page.getByTestId("reset-data").click();
  await page.getByLabel("Email").fill("user@lab.dev");
  await page.getByRole("button", { name: "Gửi mã" }).click();
  await expect(page.getByLabel("Mã OTP")).toBeVisible();

  const resend = page.getByRole("button", { name: "Gửi lại mã" });
  await expect(resend).toBeDisabled();
  await expect(page.getByTestId("cooldown")).toContainText("Gửi lại sau");

  await context.clock.fastForward("01:01");
  await expect(resend).toBeEnabled();
  await resend.click();

  const [second, first] = await readOtps(context, 2);
  expect(second).not.toBe(first);

  const message = page.getByTestId("otp-message");
  await page.getByLabel("Mã OTP").fill(first);
  await page.getByRole("button", { name: "Xác nhận" }).click();
  await expect(message).toContainText("Mã không đúng");

  await page.getByLabel("Mã OTP").fill(second);
  await page.getByRole("button", { name: "Xác nhận" }).click();
  await expect(page.getByTestId("dashboard")).toBeVisible();
});`,
  },
];

const todo: Exercise[] = [
  {
    id: "todo-1",
    title: "Thêm, hoàn thành và xoá có xác nhận",
    difficulty: 1,
    task: "Đi hết luồng chính: thêm một công việc, tick hoàn thành, thử xoá rồi chọn Giữ lại, sau đó xoá thật và kiểm tra danh sách trống.",
    criteria: [
      "Dùng getByRole/getByLabel cho mọi thao tác, không dùng CSS dài",
      "Kiểm tra bộ đếm sau khi thêm và sau khi hoàn thành",
      "Kiểm tra cả hai nhánh của hộp thoại xác nhận (Giữ lại và Xoá hẳn)",
      "Reset dữ liệu lab trước khi bắt đầu để test độc lập",
      ...COMMON_CRITERIA,
    ],
    hints: [
      "Checkbox có tên truy cập dạng Hoàn thành: <tên việc>.",
      "Hộp thoại xác nhận là phần tử trong trang, không phải dialog của trình duyệt.",
      "Danh sách trống hiện phần tử có data-testid là todo-empty.",
    ],
    solution: `import { test, expect } from "@playwright/test";

test("thêm, hoàn thành và xoá có xác nhận", async ({ page }) => {
  await page.goto("/lab/todo");
  await page.getByTestId("reset-data").click();

  await page.getByLabel("Công việc mới").fill("Mua sữa");
  await page.getByRole("button", { name: "Thêm", exact: true }).click();
  await expect(page.getByTestId("todo-item")).toHaveCount(1);
  await expect(page.getByTestId("todo-count")).toHaveText("Còn 1 việc");

  await page.getByRole("checkbox", { name: "Hoàn thành: Mua sữa" }).check();
  await expect(page.getByTestId("todo-count")).toHaveText("Còn 0 việc");

  await page.getByRole("button", { name: "Xoá Mua sữa" }).click();
  await page.getByRole("button", { name: "Giữ lại" }).click();
  await expect(page.getByTestId("todo-item")).toHaveCount(1);

  await page.getByRole("button", { name: "Xoá Mua sữa" }).click();
  await page.getByRole("button", { name: "Xoá hẳn" }).click();
  await expect(page.getByTestId("todo-empty")).toBeVisible();
});`,
  },
  {
    id: "todo-2",
    title: "Quy tắc thêm: rỗng, trùng, biên 80 và 20",
    difficulty: 2,
    bugs: ["BUG-01", "BUG-03"],
    task: "Kiểm tra các quy tắc khi thêm việc: tên rỗng/khoảng trắng, tên 80 và 81 ký tự, trùng tên khác hoa thường và giới hạn 20 việc. Chạy lại với ?bugs=BUG-01 và ?bugs=BUG-03 để thấy lỗi.",
    criteria: [
      "Có đủ biên tên 80/81 ký tự và biên số lượng 20/21 việc",
      "Test trùng tên dùng chữ hoa khác chữ thường (Mua sữa và mua SỮA)",
      "Dùng hàm helper để thêm việc, không lặp lại các bước",
      "Test đỏ với BUG-01 (trùng tên) và BUG-03 (giới hạn 21)",
      ...COMMON_CRITERIA,
    ],
    hints: [
      "Dùng chuỗi lặp: 'a'.repeat(81).",
      "Dùng vòng for để thêm 20 việc rồi thêm việc thứ 21.",
      "Thông báo lỗi nằm trong phần tử có data-testid là todo-error.",
    ],
    solution: `import { test, expect, type Page } from "@playwright/test";

async function open(page: Page) {
  await page.goto("/lab/todo");   // thêm ?bugs=BUG-01 hoặc BUG-03 để thấy test đỏ
  await page.getByTestId("reset-data").click();
}

async function add(page: Page, title: string) {
  await page.getByLabel("Công việc mới").fill(title);
  await page.getByRole("button", { name: "Thêm", exact: true }).click();
}

const error = (page: Page) => page.getByTestId("todo-error");

test("tên rỗng, khoảng trắng và biên 80/81", async ({ page }) => {
  await open(page);
  await add(page, "");
  await expect(error(page)).toContainText("Vui lòng nhập");
  await add(page, "   ");
  await expect(error(page)).toContainText("Vui lòng nhập");
  await add(page, "a".repeat(81));
  await expect(error(page)).toContainText("tối đa 80");
  await add(page, "a".repeat(80));
  await expect(page.getByTestId("todo-item")).toHaveCount(1);
});

test("trùng tên không phân biệt hoa thường", async ({ page }) => {
  await open(page);
  await add(page, "Mua sữa");
  await add(page, "mua SỮA");
  await expect(error(page)).toHaveText("Công việc này đã tồn tại");
  await expect(page.getByTestId("todo-item")).toHaveCount(1);
});

test("giới hạn 20 công việc", async ({ page }) => {
  await open(page);
  for (let i = 1; i <= 20; i++) await add(page, "Việc " + i);
  await expect(page.getByTestId("todo-item")).toHaveCount(20);
  await add(page, "Việc 21");
  await expect(error(page)).toContainText("Tối đa 20");
  await expect(page.getByTestId("todo-item")).toHaveCount(20);
});`,
  },
  {
    id: "todo-3",
    title: "Bộ lọc, bộ đếm và dữ liệu sau khi tải lại",
    difficulty: 2,
    bugs: ["BUG-02"],
    task: "Kiểm tra bộ đếm chỉ tính việc chưa xong, ba bộ lọc hoạt động đúng và dữ liệu vẫn còn sau khi tải lại trang. Chạy lại với ?bugs=BUG-02 để thấy lỗi.",
    criteria: [
      "Kiểm tra số lượng và nội dung hiển thị của từng bộ lọc",
      "Kiểm tra bộ đếm trước và sau khi hoàn thành một việc",
      "Sau khi tải lại, xác nhận trạng thái đã xong của việc vẫn được giữ",
      "Test đỏ với BUG-02 (bộ đếm đếm cả việc đã xong)",
      ...COMMON_CRITERIA,
    ],
    hints: [
      "Nút lọc có aria-pressed; dùng getByRole('button', { name, exact: true }).",
      "Bộ lọc không được lưu sau khi tải lại, nhưng danh sách thì có.",
      "toBeChecked() kiểm tra trạng thái của checkbox.",
    ],
    solution: `import { test, expect } from "@playwright/test";

test("bộ lọc, bộ đếm và lưu dữ liệu", async ({ page }) => {
  await page.goto("/lab/todo");   // thêm ?bugs=BUG-02 để thấy test đỏ
  await page.getByTestId("reset-data").click();

  for (const title of ["A", "B", "C"]) {
    await page.getByLabel("Công việc mới").fill(title);
    await page.getByRole("button", { name: "Thêm", exact: true }).click();
  }
  await expect(page.getByTestId("todo-count")).toHaveText("Còn 3 việc");

  await page.getByRole("checkbox", { name: "Hoàn thành: A" }).check();
  await expect(page.getByTestId("todo-count")).toHaveText("Còn 2 việc");

  await page.getByRole("button", { name: "Hoàn thành", exact: true }).click();
  await expect(page.getByTestId("todo-item")).toHaveCount(1);
  await expect(page.getByTestId("todo-title")).toHaveText("A");

  await page.getByRole("button", { name: "Đang làm" }).click();
  await expect(page.getByTestId("todo-item")).toHaveCount(2);

  await page.reload();
  await expect(page.getByTestId("todo-item")).toHaveCount(3);
  await expect(page.getByRole("checkbox", { name: "Hoàn thành: A" })).toBeChecked();
});`,
  },
];

const table: Exercise[] = [
  {
    id: "table-1",
    title: "Tìm kiếm, lọc và tổng số",
    difficulty: 2,
    bugs: ["BUG-01"],
    task: "Kiểm tra tìm kiếm (có kết quả và không có kết quả), lọc vai trò, và lọc kết hợp vai trò với trạng thái. Luôn đối chiếu với tổng số hiển thị.",
    criteria: [
      "Dùng getByLabel cho ô tìm kiếm và các bộ lọc",
      "Kiểm tra tổng số người dùng sau mỗi thay đổi bằng assertion tự thử lại",
      "Có test cho trạng thái không tìm thấy kết quả",
      "Không dùng chờ cố định dù bảng có độ trễ khi tải",
      ...COMMON_CRITERIA,
    ],
    hints: [
      "Bảng hiển thị Đang tải trong một khoảng ngắn sau mỗi thay đổi; assertion tự thử lại sẽ xử lý.",
      "select native dùng selectOption với giá trị như editor hoặc locked.",
      "Tổng số nằm trong phần tử có data-testid là total-count.",
    ],
    solution: `import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/lab/table");
  await page.getByTestId("reset-data").click();
});

test("tìm kiếm không phân biệt hoa thường", async ({ page }) => {
  await page.getByLabel("Tìm kiếm").fill("MINH");
  await expect(page.getByTestId("total-count")).toHaveText("3 người dùng");
  await expect(page.getByTestId("user-row")).toHaveCount(3);
});

test("không có kết quả", async ({ page }) => {
  await page.getByLabel("Tìm kiếm").fill("khong-ton-tai");
  await expect(page.getByTestId("table-empty")).toBeVisible();
  await expect(page.getByTestId("total-count")).toHaveText("0 người dùng");
});

test("lọc vai trò rồi kết hợp trạng thái", async ({ page }) => {
  await page.getByLabel("Vai trò").selectOption("editor");
  await expect(page.getByTestId("total-count")).toHaveText("11 người dùng");
  await page.getByLabel("Trạng thái").selectOption("locked");
  await expect(page.getByTestId("total-count")).toHaveText("3 người dùng");
});`,
  },
  {
    id: "table-2",
    title: "Phân trang và số dòng mỗi trang",
    difficulty: 2,
    task: "Kiểm tra trang đầu, trang cuối (7 dòng), nút Trang trước/sau bị khoá đúng chỗ và đổi số dòng mỗi trang.",
    criteria: [
      "Kiểm tra chỉ số trang hiển thị (Trang x/y) và số dòng thực tế",
      "Có test biên: trang đầu (Trang trước bị khoá) và trang cuối (Trang sau bị khoá)",
      "Có test đổi số dòng mỗi trang về 20",
      ...COMMON_CRITERIA,
    ],
    hints: [
      "37 người dùng với 10 dòng mỗi trang là 4 trang; trang cuối còn 7 dòng.",
      "Dùng toBeDisabled() cho nút bị khoá.",
      "Chỉ số trang nằm trong phần tử có data-testid là page-info.",
    ],
    solution: `import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/lab/table");
  await page.getByTestId("reset-data").click();
});

test("trang đầu: Trang trước bị khoá", async ({ page }) => {
  await expect(page.getByTestId("page-info")).toHaveText("Trang 1/4");
  await expect(page.getByTestId("user-row")).toHaveCount(10);
  await expect(page.getByRole("button", { name: "Trang trước" })).toBeDisabled();
});

test("trang cuối còn 7 dòng và Trang sau bị khoá", async ({ page }) => {
  for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "Trang sau" }).click();
  await expect(page.getByTestId("page-info")).toHaveText("Trang 4/4");
  await expect(page.getByTestId("user-row")).toHaveCount(7);
  await expect(page.getByRole("button", { name: "Trang sau" })).toBeDisabled();
});

test("đổi số dòng mỗi trang", async ({ page }) => {
  await page.getByLabel("Số dòng mỗi trang").selectOption("20");
  await expect(page.getByTestId("page-info")).toHaveText("Trang 1/2");
  await expect(page.getByTestId("user-row")).toHaveCount(20);
});`,
  },
  {
    id: "table-3",
    title: "Sắp xếp theo ngày và bắt BUG-03",
    difficulty: 3,
    bugs: ["BUG-03"],
    task: "Chứng minh cột Ngày tạo sắp xếp đúng theo thời gian: đọc toàn bộ ngày trên trang, chuyển về thời gian thật và so sánh. Chạy lại với ?bugs=BUG-03 để thấy lỗi.",
    criteria: [
      "Kiểm tra aria-sort của tiêu đề cột sau mỗi lần bấm",
      "So sánh các ngày bằng giá trị thời gian (không so sánh chuỗi dd/mm/yyyy)",
      "Chờ bảng tải xong trước khi đọc dữ liệu, không dùng chờ cố định",
      "Test xanh trên lab sạch và đỏ khi bật ?bugs=BUG-03",
      ...COMMON_CRITERIA,
    ],
    hints: [
      "allInnerTexts() không tự chờ: hãy chờ số dòng hoặc phần tử Đang tải biến mất trước.",
      "Ngày hiển thị dạng dd/mm/yyyy; tách bằng split('/') rồi dùng Date.UTC.",
      "Cột Ngày tạo là ô thứ 5 của mỗi dòng.",
    ],
    solution: `import { test, expect } from "@playwright/test";

const toTime = (s: string) => {
  const [d, m, y] = s.split("/").map(Number);
  return Date.UTC(y, m - 1, d);
};

test("sắp theo Ngày tạo đúng thứ tự thời gian", async ({ page }) => {
  await page.goto("/lab/table");   // thêm ?bugs=BUG-03 để thấy test đỏ
  await page.getByTestId("reset-data").click();

  const header = page.getByRole("columnheader", { name: "Ngày tạo" });
  await page.getByRole("button", { name: "Ngày tạo" }).click();
  await expect(header).toHaveAttribute("aria-sort", "ascending");
  await expect(page.getByTestId("table-loading")).toBeHidden();
  await expect(page.getByTestId("user-row")).toHaveCount(10);

  const dates = await page.locator('[data-testid="user-row"] td:nth-child(5)').allInnerTexts();
  const times = dates.map(toTime);
  expect(times).toEqual([...times].sort((a, b) => a - b));

  await page.getByRole("button", { name: "Ngày tạo" }).click();
  await expect(header).toHaveAttribute("aria-sort", "descending");
});`,
  },
  {
    id: "table-4",
    title: "Chọn nhiều và khoá hàng loạt",
    difficulty: 3,
    task: "Chọn tất cả trên trang hiện tại (phải là 10, không phải 37), khoá hàng loạt rồi dùng bộ lọc trạng thái để xác nhận số người bị khoá tăng đúng và Admin không bị khoá.",
    criteria: [
      "Khẳng định số dòng đã chọn là 10 sau khi chọn tất cả",
      "Tính số người bị khoá kỳ vọng từ dữ liệu: 9 ban đầu + 4 người hoạt động không phải Admin ở trang 1 = 13",
      "Kiểm tra riêng rằng Admin vẫn không bị khoá",
      ...COMMON_CRITERIA,
    ],
    hints: [
      "Checkbox chọn tất cả có tên Chọn tất cả trang này.",
      "Sau khi khoá, lọc Trạng thái = locked để đếm.",
      "Lọc vai trò Admin rồi kiểm tra các nút thao tác bị vô hiệu hoá.",
    ],
    solution: `import { test, expect } from "@playwright/test";

test("chọn tất cả chỉ chọn trang hiện tại và khoá hàng loạt", async ({ page }) => {
  await page.goto("/lab/table");
  await page.getByTestId("reset-data").click();

  await page.getByRole("checkbox", { name: "Chọn tất cả trang này" }).check();
  await expect(page.getByTestId("selected-count")).toHaveText("Đã chọn 10");

  await page.getByRole("button", { name: "Khoá đã chọn" }).click();
  await page.getByLabel("Trạng thái").selectOption("locked");
  await expect(page.getByTestId("total-count")).toHaveText("13 người dùng");

  await page.getByLabel("Trạng thái").selectOption("all");
  await page.getByLabel("Vai trò").selectOption("admin");
  await expect(page.getByTestId("total-count")).toHaveText("6 người dùng");
  for (const button of await page.getByRole("button", { name: /^(Khoá|Mở khoá) / }).all())
    await expect(button).toBeDisabled();
});`,
  },
  {
    id: "table-5",
    title: "Bắt BUG-01 và BUG-02",
    difficulty: 3,
    bugs: ["BUG-01", "BUG-02"],
    task: "Viết hai test bắt lỗi: tìm kiếm phải không phân biệt hoa thường (BUG-01) và đổi bộ lọc phải đưa về trang 1 (BUG-02). Mỗi test xanh trên lab sạch và đỏ khi bật bug tương ứng.",
    criteria: [
      "Test tìm kiếm dùng chữ in hoa khác với dữ liệu gốc",
      "Test phân trang đi sang trang 2 rồi mới đổi bộ lọc",
      "Mỗi test đỏ đúng lý do khi bật bug tương ứng, không đỏ vì locator sai",
      ...COMMON_CRITERIA,
    ],
    hints: [
      "Tìm MINH phải ra 3 người giống như tìm minh.",
      "Lọc Editor có 11 người: với 10 dòng mỗi trang thì có 2 trang.",
      "Sau khi đổi bộ lọc, chỉ số trang đúng phải là Trang 1/2.",
    ],
    solution: `import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/lab/table");   // thêm ?bugs=BUG-01 hoặc ?bugs=BUG-02 để thấy test đỏ
  await page.getByTestId("reset-data").click();
});

test("tìm kiếm không phân biệt hoa thường", async ({ page }) => {
  await page.getByLabel("Tìm kiếm").fill("MINH");
  await expect(page.getByTestId("total-count")).toHaveText("3 người dùng");
});

test("đổi bộ lọc đưa về trang 1", async ({ page }) => {
  await page.getByRole("button", { name: "Trang sau" }).click();
  await expect(page.getByTestId("page-info")).toHaveText("Trang 2/4");
  await page.getByLabel("Vai trò").selectOption("editor");
  await expect(page.getByTestId("page-info")).toHaveText("Trang 1/2");
});`,
  },
];

const leave: Exercise[] = [
  {
    id: "leave-1",
    title: "Gửi đơn hợp lệ và kiểm tra ngày",
    difficulty: 2,
    task: "Gửi một đơn phép năm 09/03–11/03 và xác nhận đơn ở trạng thái Chờ duyệt, tính đủ 3 ngày và chưa trừ số dư phép. Đặt giờ giả để không phụ thuộc ngày thật.",
    criteria: [
      "Đặt giờ giả bằng context.clock, không phụ thuộc ngày chạy test",
      "Dùng hàm helper để điền và gửi đơn",
      "Kiểm tra trạng thái, số ngày và số dư phép sau khi gửi",
      ...COMMON_CRITERIA,
    ],
    hints: [
      "context.clock.setFixedTime(date) cố định giờ giả trước khi mở trang.",
      "Ô ngày dùng định dạng YYYY-MM-DD khi fill.",
      "Số ngày và trạng thái có data-testid là leave-days-1 và leave-status-1.",
    ],
    solution: `import { test, expect, type BrowserContext, type Page } from "@playwright/test";

// Giờ giả cố định: thứ Hai 02/03/2026, để ngày trong test luôn hợp lệ.
const NOW = new Date("2026-03-02T09:00:00");

async function open(page: Page, context: BrowserContext) {
  await context.clock.setFixedTime(NOW);
  await page.goto("/lab/leave");
  await page.getByTestId("reset-data").click();
}

async function send(page: Page, from: string, to: string, type = "annual") {
  await page.getByLabel("Loại nghỉ").selectOption(type);
  await page.getByLabel("Từ ngày").fill(from);
  await page.getByLabel("Đến ngày").fill(to);
  await page.getByLabel("Lý do").fill("Đi công tác gia đình xa");
  await page.getByRole("button", { name: "Gửi đơn" }).click();
}

test("gửi đơn hợp lệ", async ({ page, context }) => {
  await open(page, context);
  await send(page, "2026-03-09", "2026-03-11");
  await expect(page.getByTestId("leave-status-1")).toHaveText("Chờ duyệt");
  await expect(page.getByTestId("leave-days-1")).toHaveText("3");
  await expect(page.getByTestId("leave-balance")).toHaveText("Phép năm còn 12/12 ngày");
});`,
  },
  {
    id: "leave-2",
    title: "Hai vai trò trên hai tab",
    difficulty: 3,
    task: "Nhân viên gửi đơn ở tab thứ nhất; mở tab thứ hai chuyển sang vai trò Quản lý để duyệt. Quay lại tab nhân viên xác nhận trạng thái và số dư phép đã cập nhật mà không tải lại trang.",
    criteria: [
      "Dùng hai Page trong cùng một context (dùng chung localStorage)",
      "Chọn vai trò Quản lý ở tab thứ hai bằng selectOption",
      "Kiểm tra cả hai tab đều thấy trạng thái Đã duyệt",
      "Số dư phép giảm đúng 3 ngày sau khi duyệt",
      ...COMMON_CRITERIA,
    ],
    hints: [
      "Vai trò lưu theo từng tab (sessionStorage) còn dữ liệu dùng chung giữa các tab.",
      "context.newPage() mở tab mới trong cùng context.",
      "Tab nhân viên tự cập nhật nhờ sự kiện storage nên assertion tự thử lại sẽ thấy thay đổi.",
    ],
    solution: `import { test, expect, type BrowserContext, type Page } from "@playwright/test";

// Giờ giả cố định: thứ Hai 02/03/2026, để ngày trong test luôn hợp lệ.
const NOW = new Date("2026-03-02T09:00:00");

async function open(page: Page, context: BrowserContext) {
  await context.clock.setFixedTime(NOW);
  await page.goto("/lab/leave");
  await page.getByTestId("reset-data").click();
}

async function send(page: Page, from: string, to: string, type = "annual") {
  await page.getByLabel("Loại nghỉ").selectOption(type);
  await page.getByLabel("Từ ngày").fill(from);
  await page.getByLabel("Đến ngày").fill(to);
  await page.getByLabel("Lý do").fill("Đi công tác gia đình xa");
  await page.getByRole("button", { name: "Gửi đơn" }).click();
}

test("quản lý duyệt, nhân viên thấy cập nhật", async ({ page, context }) => {
  await open(page, context);
  await send(page, "2026-03-09", "2026-03-11");

  const manager = await context.newPage();
  await manager.goto("/lab/leave");
  await manager.getByLabel("Vai trò").selectOption("manager");
  await manager.getByRole("button", { name: "Duyệt đơn #1" }).click();
  await expect(manager.getByTestId("leave-status-1")).toHaveText("Đã duyệt");

  await expect(page.getByTestId("leave-status-1")).toHaveText("Đã duyệt");
  await expect(page.getByTestId("leave-balance")).toHaveText("Phép năm còn 9/12 ngày");
  await expect(page.getByRole("button", { name: "Huỷ đơn #1" })).toHaveCount(0);
});`,
  },
  {
    id: "leave-3",
    title: "Biên số ngày phép và bắt BUG-01",
    difficulty: 3,
    bugs: ["BUG-01"],
    task: "Kiểm tra biên của phép năm (còn 12 ngày): đơn đúng 12 ngày được chấp nhận, đơn 13 ngày bị từ chối, và số ngày hiển thị phải tính cả ngày đầu lẫn ngày cuối. Test phải đỏ khi bật BUG-01.",
    criteria: [
      "Có test đúng biên 12 ngày (chấp nhận) và 13 ngày (từ chối)",
      "Kiểm tra số ngày hiển thị là 12 (tính cả ngày cuối)",
      "Kiểm tra nội dung thông báo lỗi khi vượt số dư",
      "Test xanh trên lab sạch và đỏ khi bật BUG-01",
      ...COMMON_CRITERIA,
    ],
    hints: [
      "Từ 01/04 đến 12/04 là 12 ngày khi tính cả hai đầu.",
      "Thử đơn 13 ngày trước (bị từ chối) rồi mới gửi đơn 12 ngày.",
      "Thông báo vượt số dư nằm trong phần tử data-testid là leave-error.",
    ],
    solution: `import { test, expect, type BrowserContext, type Page } from "@playwright/test";

// Giờ giả cố định: thứ Hai 02/03/2026, để ngày trong test luôn hợp lệ.
const NOW = new Date("2026-03-02T09:00:00");

async function open(page: Page, context: BrowserContext) {
  await context.clock.setFixedTime(NOW);
  await page.goto("/lab/leave");
  await page.getByTestId("reset-data").click();
}

async function send(page: Page, from: string, to: string, type = "annual") {
  await page.getByLabel("Loại nghỉ").selectOption(type);
  await page.getByLabel("Từ ngày").fill(from);
  await page.getByLabel("Đến ngày").fill(to);
  await page.getByLabel("Lý do").fill("Đi công tác gia đình xa");
  await page.getByRole("button", { name: "Gửi đơn" }).click();
}

test("13 ngày bị từ chối, 12 ngày được chấp nhận và tính đủ ngày", async ({ page, context }) => {
  await open(page, context);

  await send(page, "2026-04-01", "2026-04-13");
  await expect(page.getByTestId("leave-error")).toContainText("vượt quá phép năm còn lại (12)");
  await expect(page.getByTestId("leave-empty")).toBeVisible();

  await send(page, "2026-04-01", "2026-04-12");
  await expect(page.getByTestId("leave-status-1")).toHaveText("Chờ duyệt");
  await expect(page.getByTestId("leave-days-1")).toHaveText("12");
});`,
  },
  {
    id: "leave-4",
    title: "Phân quyền và đơn trùng ngày (BUG-02, BUG-03)",
    difficulty: 3,
    bugs: ["BUG-02", "BUG-03"],
    task: "Chứng minh nhân viên không có nút Duyệt/Từ chối còn quản lý thì có, và hệ thống chặn đơn trùng khoảng ngày. Test phải đỏ khi bật BUG-02 hoặc BUG-03.",
    criteria: [
      "Kiểm tra nút Duyệt không tồn tại ở vai trò nhân viên (toHaveCount(0))",
      "Kiểm tra nút Duyệt có ở tab quản lý",
      "Có test đơn trùng ngày bị từ chối kèm đúng thông báo, và đơn không trùng được chấp nhận",
      "Test đỏ với BUG-02 và với BUG-03",
      ...COMMON_CRITERIA,
    ],
    hints: [
      "Với phân quyền, kiểm tra cả hai chiều: nhân viên không có, quản lý có.",
      "Khoảng 11/03–12/03 trùng ngày 11/03 của đơn 09/03–11/03.",
      "Đơn 12/03–13/03 không trùng nên phải được chấp nhận.",
    ],
    solution: `import { test, expect, type BrowserContext, type Page } from "@playwright/test";

// Giờ giả cố định: thứ Hai 02/03/2026, để ngày trong test luôn hợp lệ.
const NOW = new Date("2026-03-02T09:00:00");

async function open(page: Page, context: BrowserContext) {
  await context.clock.setFixedTime(NOW);
  await page.goto("/lab/leave");
  await page.getByTestId("reset-data").click();
}

async function send(page: Page, from: string, to: string, type = "annual") {
  await page.getByLabel("Loại nghỉ").selectOption(type);
  await page.getByLabel("Từ ngày").fill(from);
  await page.getByLabel("Đến ngày").fill(to);
  await page.getByLabel("Lý do").fill("Đi công tác gia đình xa");
  await page.getByRole("button", { name: "Gửi đơn" }).click();
}

test("nhân viên không có nút Duyệt, quản lý thì có", async ({ page, context }) => {
  await open(page, context);
  await send(page, "2026-03-09", "2026-03-10");
  await expect(page.getByRole("button", { name: "Duyệt đơn #1" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Từ chối đơn #1" })).toHaveCount(0);

  const manager = await context.newPage();
  await manager.goto("/lab/leave");
  await manager.getByLabel("Vai trò").selectOption("manager");
  await expect(manager.getByRole("button", { name: "Duyệt đơn #1" })).toBeVisible();
});

test("đơn trùng ngày bị chặn, đơn không trùng được chấp nhận", async ({ page, context }) => {
  await open(page, context);
  await send(page, "2026-03-09", "2026-03-11");
  await send(page, "2026-03-11", "2026-03-12");
  await expect(page.getByTestId("leave-error")).toContainText("trùng với một đơn khác");
  await expect(page.getByTestId("leave-row")).toHaveCount(1);

  await send(page, "2026-03-12", "2026-03-13");
  await expect(page.getByTestId("leave-row")).toHaveCount(2);
});`,
  },
];

const chat: Exercise[] = [
  {
    id: "chat-1",
    title: "Hai người dùng trò chuyện thời gian thực",
    difficulty: 3,
    task: "Mở hai tab cho An và Bình trong cùng một context. An gõ dở một câu và Bình phải thấy chỉ báo đang nhập; sau khi An gửi, Bình thấy tin ngay không cần tải lại; Bình trả lời và An thấy.",
    criteria: [
      "Dùng hai Page trong cùng một context, mỗi tab một tên",
      "Kiểm tra chỉ báo đang nhập ở tab kia và việc nó biến mất sau khi gửi",
      "Dùng assertion tự thử lại để chờ tin đến, không dùng chờ cố định",
      "Viết hàm helper cho thao tác vào phòng và gửi tin",
      ...COMMON_CRITERIA,
    ],
    hints: [
      "Tin nhắn truyền giữa các tab bằng BroadcastChannel nên chỉ hoạt động trong cùng một context.",
      "pressSequentially gõ từng phím và kích hoạt chỉ báo đang nhập.",
      "Chỉ báo có data-testid là chat-typing; nó tự biến mất sau khoảng 1,5 giây.",
    ],
    solution: `import { test, expect, type BrowserContext, type Page } from "@playwright/test";

async function join(page: Page, name: string) {
  await page.getByLabel("Tên hiển thị").fill(name);
  await page.getByRole("button", { name: "Vào phòng" }).click();
  await expect(page.getByTestId("chat-me")).toHaveText(name);
}

// Mở hai tab của hai người dùng trong cùng một context.
async function twoUsers(page: Page, context: BrowserContext) {
  await page.goto("/lab/chat");
  await page.getByTestId("reset-data").click();
  await join(page, "An");
  const binh = await context.newPage();
  await binh.goto("/lab/chat");
  await join(binh, "Bình");
  return binh;
}

async function send(p: Page, text: string) {
  await p.getByLabel("Soạn nội dung").fill(text);
  await p.getByRole("button", { name: "Gửi" }).click();
}

test("trò chuyện giữa hai tab", async ({ page, context }) => {
  const binh = await twoUsers(page, context);

  await page.getByLabel("Soạn nội dung").pressSequentially("Xin ch");
  await expect(binh.getByTestId("chat-typing")).toHaveText("An đang nhập…");

  await send(page, "Xin chào Bình");
  await expect(binh.getByTestId("chat-message").last()).toContainText("Xin chào Bình");
  await expect(binh.getByTestId("chat-typing")).toHaveText("");

  await send(binh, "Chào An!");
  await expect(page.getByTestId("chat-message")).toHaveCount(2);
  await expect(page.getByTestId("chat-message").last()).toContainText("Chào An!");
});`,
  },
  {
    id: "chat-2",
    title: "Giới hạn tin nhắn và chuẩn hoá khoảng trắng",
    difficulty: 3,
    bugs: ["BUG-01", "BUG-03"],
    task: "Kiểm tra biên 200/201 ký tự, tin nhắn chỉ có khoảng trắng và việc cắt khoảng trắng hai đầu. Test phải đỏ khi bật BUG-01 hoặc BUG-03.",
    criteria: [
      "Có test đúng biên 200 (gửi được) và 201 (bị từ chối, không tạo tin mới)",
      "Có test tin chỉ gồm khoảng trắng",
      "Kiểm tra nội dung thô (textContent) để phát hiện khoảng trắng chưa bị cắt",
      "Test đỏ với BUG-01 và với BUG-03",
      ...COMMON_CRITERIA,
    ],
    hints: [
      "toHaveText chuẩn hoá khoảng trắng nên có thể che lỗi; hãy đọc textContent thô bằng evaluate.",
      "Dùng 'a'.repeat(201) để tạo chuỗi dài.",
      "Sau khi tin 201 ký tự bị từ chối, số tin nhắn phải vẫn bằng 0.",
    ],
    solution: `import { test, expect, type BrowserContext, type Page } from "@playwright/test";

async function join(page: Page, name: string) {
  await page.getByLabel("Tên hiển thị").fill(name);
  await page.getByRole("button", { name: "Vào phòng" }).click();
  await expect(page.getByTestId("chat-me")).toHaveText(name);
}

// Mở hai tab của hai người dùng trong cùng một context.
async function twoUsers(page: Page, context: BrowserContext) {
  await page.goto("/lab/chat");
  await page.getByTestId("reset-data").click();
  await join(page, "An");
  const binh = await context.newPage();
  await binh.goto("/lab/chat");
  await join(binh, "Bình");
  return binh;
}

async function send(p: Page, text: string) {
  await p.getByLabel("Soạn nội dung").fill(text);
  await p.getByRole("button", { name: "Gửi" }).click();
}

test("biên 200 và 201 ký tự", async ({ page, context }) => {
  await twoUsers(page, context);
  await send(page, "a".repeat(201));
  await expect(page.getByTestId("chat-error")).toContainText("tối đa 200");
  await expect(page.getByTestId("chat-message")).toHaveCount(0);

  await send(page, "a".repeat(200));
  await expect(page.getByTestId("chat-message")).toHaveCount(1);
});

test("tin chỉ có khoảng trắng bị từ chối", async ({ page, context }) => {
  await twoUsers(page, context);
  await send(page, "   ");
  await expect(page.getByTestId("chat-error")).toHaveText("Tin nhắn không được để trống");
});

test("khoảng trắng hai đầu được cắt", async ({ page, context }) => {
  await twoUsers(page, context);
  await send(page, "  chào  ");
  const raw = await page.getByTestId("chat-text").last().evaluate((el) => el.textContent);
  expect(raw).toBe("chào");
});`,
  },
  {
    id: "chat-3",
    title: "Bộ đếm tin chưa đọc khi tab bị ẩn",
    difficulty: 3,
    bugs: ["BUG-02"],
    task: "Chứng minh bộ đếm chưa đọc không tăng khi tab đang được xem, tăng khi tab bị ẩn và về 0 khi hiện lại. Giả lập tab ẩn bằng code. Test phải đỏ khi bật BUG-02.",
    criteria: [
      "Kiểm tra bộ đếm bằng 0 khi tab đang hiển thị mà nhận tin",
      "Giả lập tab ẩn và tab hiện lại bằng visibilityState và sự kiện visibilitychange",
      "Kiểm tra bộ đếm bằng 2 sau hai tin khi ẩn và về 0 khi hiện lại",
      "Test đỏ với BUG-02",
      ...COMMON_CRITERIA,
    ],
    hints: [
      "Playwright coi mọi tab đều đang hiển thị nên cần tự đổi document.visibilityState trong trang.",
      "Dùng page.evaluate với Object.defineProperty rồi dispatchEvent(new Event('visibilitychange')).",
      "Bộ đếm có data-testid là chat-unread, nội dung dạng Chưa đọc: N.",
    ],
    solution: `import { test, expect, type BrowserContext, type Page } from "@playwright/test";

async function join(page: Page, name: string) {
  await page.getByLabel("Tên hiển thị").fill(name);
  await page.getByRole("button", { name: "Vào phòng" }).click();
  await expect(page.getByTestId("chat-me")).toHaveText(name);
}

// Mở hai tab của hai người dùng trong cùng một context.
async function twoUsers(page: Page, context: BrowserContext) {
  await page.goto("/lab/chat");
  await page.getByTestId("reset-data").click();
  await join(page, "An");
  const binh = await context.newPage();
  await binh.goto("/lab/chat");
  await join(binh, "Bình");
  return binh;
}

async function send(p: Page, text: string) {
  await p.getByLabel("Soạn nội dung").fill(text);
  await p.getByRole("button", { name: "Gửi" }).click();
}

async function setVisibility(p: Page, state: "hidden" | "visible") {
  await p.evaluate((s) => {
    Object.defineProperty(document, "visibilityState", { configurable: true, get: () => s });
    document.dispatchEvent(new Event("visibilitychange"));
  }, state);
}

test("chưa đọc chỉ tăng khi tab bị ẩn", async ({ page, context }) => {
  const binh = await twoUsers(page, context);

  await send(page, "Tin 1");
  await expect(binh.getByTestId("chat-unread")).toHaveText("Chưa đọc: 0");

  await setVisibility(binh, "hidden");
  await send(page, "Tin 2");
  await send(page, "Tin 3");
  await expect(binh.getByTestId("chat-unread")).toHaveText("Chưa đọc: 2");

  await setVisibility(binh, "visible");
  await expect(binh.getByTestId("chat-unread")).toHaveText("Chưa đọc: 0");
});`,
  },
];

export const EXERCISES: Record<string, Exercise[]> = { login, forms, cart, playground, api, otp, todo, table, leave, chat };
