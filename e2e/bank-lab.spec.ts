import { test, expect, type Page } from "@playwright/test";

const A = "0123456789";

async function open(page: Page, query = "") {
  await page.goto("/lab/bank" + query);
  await page.getByTestId("reset-data").click();
}

async function fill(page: Page, account: string, amount: string, note = "") {
  await page.getByLabel("Số tài khoản nhận").fill(account);
  await page.getByLabel("Số tiền (₫)").fill(amount);
  await page.getByLabel("Nội dung chuyển khoản").fill(note);
  await page.getByRole("button", { name: "Tiếp tục" }).click();
}

/** Đi hết các bước: nhập → xác nhận → OTP (đọc mã giả lập trên màn hình) → kết quả. */
async function transfer(page: Page, amount: string, account = A) {
  await fill(page, account, amount);
  await page.getByRole("button", { name: "Xác nhận" }).click();
  const code = (await page.getByTestId("otp-hint").textContent())!;
  await page.getByLabel("Mã OTP").fill(code);
  await page.getByRole("button", { name: "Xác thực" }).click();
  await expect(page.getByTestId("txn-success")).toBeVisible();
  await page.getByRole("button", { name: "Chuyển tiếp" }).click();
}

const wrongOtp = async (page: Page) => ((await page.getByTestId("otp-hint").textContent()) === "111111" ? "222222" : "111111");

test("chuyển tiền thành công qua 4 bước, cập nhật số dư và lịch sử", async ({ page }) => {
  await open(page);
  await expect(page.getByTestId("balance")).toHaveText("10.000.000 ₫");
  await fill(page, A, "1000000", "Tiền nhà");
  await expect(page.getByTestId("confirm-name")).toHaveText("Người nhận: Nguyễn Văn A");
  await expect(page.getByTestId("confirm-fee")).toHaveText("Phí: 3.300 ₫");
  await expect(page.getByTestId("confirm-total")).toHaveText("Tổng trừ: 1.003.300 ₫");

  await page.getByRole("button", { name: "Xác nhận" }).click();
  await page.getByLabel("Mã OTP").fill((await page.getByTestId("otp-hint").textContent())!);
  await page.getByRole("button", { name: "Xác thực" }).click();
  await expect(page.getByTestId("txn-success")).toBeVisible();
  await expect(page.getByTestId("txn-id")).toHaveText("Mã giao dịch: TX0001");
  await expect(page.getByTestId("balance")).toHaveText("8.996.700 ₫");
  await expect(page.getByTestId("history-row")).toHaveText(["TX0001 · tới 0123456789 · 1.000.000 ₫ · phí 3.300 ₫"]);

  await page.reload();
  await expect(page.getByTestId("balance")).toHaveText("8.996.700 ₫");
});

const invalid: [string, string, string, string][] = [
  ["số tài khoản thiếu số", "123", "100000", "Số tài khoản gồm đúng 10 chữ số"],
  ["chuyển cho chính mình", "1122334455", "100000", "Không thể chuyển cho chính mình"],
  ["tài khoản không tồn tại", "5555555555", "100000", "Không tìm thấy tài khoản nhận"],
  ["số tiền không phải số", A, "abc", "Số tiền phải là số nguyên dương"],
  ["dưới mức tối thiểu 1 đồng", A, "9999", "Số tiền tối thiểu 10.000 ₫"],
  ["trên mức tối đa 1 đồng", A, "5000001", "Số tiền tối đa mỗi giao dịch 5.000.000 ₫"],
];
for (const [name, account, amount, message] of invalid) {
  test(`bước 1 từ chối: ${name}`, async ({ page }) => {
    await open(page);
    await fill(page, account, amount);
    await expect(page.getByTestId("transfer-error")).toHaveText(message);
    await expect(page.getByRole("heading", { name: /Bước 2/ })).toHaveCount(0);
  });
}

const fees: [string, string][] = [
  ["10000", "0 ₫"],
  ["499999", "0 ₫"],
  ["500000", "0 ₫"],
  ["500001", "3.300 ₫"],
  ["2000000", "3.300 ₫"],
  ["2000001", "11.000 ₫"],
  ["5000000", "11.000 ₫"],
];
for (const [amount, fee] of fees) {
  test(`phí cho ${amount} ₫ là ${fee}`, async ({ page }) => {
    await open(page);
    await fill(page, A, amount);
    await expect(page.getByTestId("confirm-fee")).toHaveText(`Phí: ${fee}`);
  });
}

test("hạn mức trong ngày cộng dồn và được đặt lại vào ngày hôm sau; số dư không đủ", async ({ page, context }) => {
  const T0 = new Date("2026-03-01T03:00:00Z");
  await context.clock.setFixedTime(T0);
  await open(page);
  await transfer(page, "5000000");
  await fill(page, A, "3000001");
  await expect(page.getByTestId("transfer-error")).toHaveText("Vượt hạn mức chuyển trong ngày 8.000.000 ₫");
  await page.getByLabel("Số tiền (₫)").fill("3000000");
  await page.getByRole("button", { name: "Tiếp tục" }).click();
  await page.getByRole("button", { name: "Xác nhận" }).click();
  await page.getByLabel("Mã OTP").fill((await page.getByTestId("otp-hint").textContent())!);
  await page.getByRole("button", { name: "Xác thực" }).click();
  await expect(page.getByTestId("balance")).toHaveText("1.978.000 ₫"); // 10.000.000 − 5.011.000 − 3.011.000
  await page.getByRole("button", { name: "Chuyển tiếp" }).click();

  await fill(page, A, "10000");
  await expect(page.getByTestId("transfer-error")).toContainText("Vượt hạn mức");

  await context.clock.setFixedTime(new Date(T0.getTime() + 24 * 3600_000)); // ngày hôm sau
  await page.getByRole("button", { name: "Tiếp tục" }).click();
  await expect(page.getByRole("heading", { name: /Bước 2/ })).toBeVisible();
  await page.getByRole("button", { name: "Quay lại" }).click();
  await page.getByLabel("Số tiền (₫)").fill("2000000");
  await page.getByRole("button", { name: "Tiếp tục" }).click();
  await expect(page.getByTestId("transfer-error")).toHaveText("Số dư không đủ"); // 2.000.000 + phí 3.300 > 1.978.000
});

test("OTP sai: đếm số lần, sai 3 lần thì huỷ giao dịch", async ({ page }) => {
  await open(page);
  await fill(page, A, "100000");
  await page.getByRole("button", { name: "Xác nhận" }).click();
  for (const n of [1, 2]) {
    await page.getByLabel("Mã OTP").fill(await wrongOtp(page));
    await page.getByRole("button", { name: "Xác thực" }).click();
    await expect(page.getByTestId("transfer-error")).toHaveText(`Mã OTP không đúng (${n}/3)`);
  }
  await page.getByLabel("Mã OTP").fill(await wrongOtp(page));
  await page.getByRole("button", { name: "Xác thực" }).click();
  await expect(page.getByTestId("transfer-error")).toHaveText("Nhập sai OTP quá 3 lần, giao dịch đã bị huỷ");
  await expect(page.getByRole("heading", { name: /Bước 1/ })).toBeVisible();
  await expect(page.getByTestId("balance")).toHaveText("10.000.000 ₫");
  await expect(page.getByTestId("history-row")).toHaveCount(0);
});

for (const [seconds, ok] of [
  [60, true],
  [61, false],
] as const) {
  test(`OTP ở giây thứ ${seconds} ${ok ? "còn hiệu lực" : "đã hết hạn"}; gửi lại được mã mới`, async ({ page, context }) => {
    const T0 = new Date("2026-03-01T03:00:00Z");
    await context.clock.setFixedTime(T0);
    await open(page);
    await fill(page, A, "100000");
    await page.getByRole("button", { name: "Xác nhận" }).click();
    const code = (await page.getByTestId("otp-hint").textContent())!;

    await context.clock.setFixedTime(new Date(T0.getTime() + seconds * 1000));
    await page.getByLabel("Mã OTP").fill(code);
    await page.getByRole("button", { name: "Xác thực" }).click();
    if (ok) return expect(page.getByTestId("txn-success")).toBeVisible();

    await expect(page.getByTestId("transfer-error")).toHaveText("Mã OTP đã hết hạn, hãy gửi lại");
    await page.getByRole("button", { name: "Gửi lại OTP" }).click();
    await page.getByLabel("Mã OTP").fill((await page.getByTestId("otp-hint").textContent())!);
    await page.getByRole("button", { name: "Xác thực" }).click();
    await expect(page.getByTestId("txn-success")).toBeVisible();
  });
}

test("Quay lại ở bước xác nhận giữ nguyên dữ liệu đã nhập", async ({ page }) => {
  await open(page);
  await fill(page, A, "250000", "Ăn trưa");
  await page.getByRole("button", { name: "Quay lại" }).click();
  await expect(page.getByLabel("Số tài khoản nhận")).toHaveValue(A);
  await expect(page.getByLabel("Số tiền (₫)")).toHaveValue("250000");
  await expect(page.getByLabel("Nội dung chuyển khoản")).toHaveValue("Ăn trưa");
});

test("BUG-01/02/03 làm lộ ba lỗi có chủ đích", async ({ page }) => {
  await open(page, "?bugs=BUG-01,BUG-02,BUG-03");
  await fill(page, A, "500000");
  await expect(page.getByTestId("confirm-fee")).toHaveText("Phí: 3.300 ₫"); // BUG-01: đúng 500.000 bị tính phí
  await page.getByRole("button", { name: "Quay lại" }).click();

  await page.getByLabel("Số tiền (₫)").fill("5000000");
  await page.getByRole("button", { name: "Tiếp tục" }).click();
  await page.getByRole("button", { name: "Xác nhận" }).click();
  await page.getByLabel("Mã OTP").fill((await page.getByTestId("otp-hint").textContent())!);
  await page.getByRole("button", { name: "Xác thực" }).click();
  await page.getByRole("button", { name: "Chuyển tiếp" }).click();
  await fill(page, A, "4000000"); // BUG-02: 5.000.000 + 4.000.000 vượt hạn mức ngày nhưng vẫn qua
  await expect(page.getByRole("heading", { name: /Bước 2/ })).toBeVisible();

  await page.getByRole("button", { name: "Xác nhận" }).click();
  for (let i = 0; i < 4; i++) {
    await page.getByLabel("Mã OTP").fill(await wrongOtp(page));
    await page.getByRole("button", { name: "Xác thực" }).click();
  }
  await expect(page.getByTestId("transfer-error")).toHaveText("Mã OTP không đúng (4/3)"); // BUG-03: không huỷ
});
