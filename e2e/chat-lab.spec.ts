import { test, expect, type BrowserContext, type Page } from "@playwright/test";

async function join(page: Page, name: string) {
  await page.getByLabel("Tên hiển thị").fill(name);
  await page.getByRole("button", { name: "Vào phòng" }).click();
  await expect(page.getByTestId("chat-me")).toHaveText(name);
}

/** Mở hai tab của hai người dùng trong cùng một context. */
async function twoUsers(page: Page, context: BrowserContext, query = "") {
  await page.goto("/lab/chat" + query);
  await page.getByTestId("reset-data").click();
  await join(page, "An");
  const other = await context.newPage();
  await other.goto("/lab/chat" + query);
  await join(other, "Bình");
  return other;
}

const send = async (p: Page, text: string) => {
  await p.getByLabel("Soạn nội dung").fill(text);
  await p.getByRole("button", { name: "Gửi" }).click();
};

test("bắt buộc nhập tên trước khi vào phòng", async ({ page }) => {
  await page.goto("/lab/chat");
  await page.getByTestId("reset-data").click();
  await page.getByRole("button", { name: "Vào phòng" }).click();
  await expect(page.getByTestId("chat-error")).toHaveText("Vui lòng nhập tên hiển thị");
});

test("tin nhắn đến tab kia theo thời gian thực và hiện chỉ báo đang nhập", async ({ page, context }) => {
  const binh = await twoUsers(page, context);

  await page.getByLabel("Soạn nội dung").pressSequentially("Xin ch");
  await expect(binh.getByTestId("chat-typing")).toHaveText("An đang nhập…");

  await page.getByLabel("Soạn nội dung").fill("Xin chào Bình");
  await page.getByRole("button", { name: "Gửi" }).click();
  await expect(binh.getByTestId("chat-message").last()).toContainText("Xin chào Bình");
  await expect(binh.getByTestId("chat-typing")).toHaveText("");

  await send(binh, "Chào An!");
  await expect(page.getByTestId("chat-message")).toHaveCount(2);
  await expect(page.getByTestId("chat-message").last()).toContainText("Chào An!");
});

test("tin nhắn rỗng, 200 ký tự và 201 ký tự; khoảng trắng hai đầu được cắt", async ({ page, context }) => {
  await twoUsers(page, context);
  await send(page, "   ");
  await expect(page.getByTestId("chat-error")).toHaveText("Tin nhắn không được để trống");

  await send(page, "a".repeat(201));
  await expect(page.getByTestId("chat-error")).toContainText("tối đa 200");
  await expect(page.getByTestId("chat-message")).toHaveCount(0);

  await send(page, "a".repeat(200));
  await expect(page.getByTestId("chat-message")).toHaveCount(1);

  await send(page, "  chào  ");
  const raw = await page.getByTestId("chat-text").last().evaluate((el) => el.textContent);
  expect(raw).toBe("chào");
});

test("bộ đếm chưa đọc chỉ tăng khi tab đang ẩn và về 0 khi quay lại", async ({ page, context }) => {
  const binh = await twoUsers(page, context);
  const setVisibility = (p: Page, state: "hidden" | "visible") =>
    p.evaluate((s) => {
      Object.defineProperty(document, "visibilityState", { configurable: true, get: () => s });
      document.dispatchEvent(new Event("visibilitychange"));
    }, state);

  await send(page, "Tin 1");
  await expect(binh.getByTestId("chat-unread")).toHaveText("Chưa đọc: 0");

  await setVisibility(binh, "hidden");
  await send(page, "Tin 2");
  await send(page, "Tin 3");
  await expect(binh.getByTestId("chat-unread")).toHaveText("Chưa đọc: 2");

  await setVisibility(binh, "visible");
  await expect(binh.getByTestId("chat-unread")).toHaveText("Chưa đọc: 0");
});

test("lịch sử được giữ khi tải lại trang", async ({ page, context }) => {
  const binh = await twoUsers(page, context);
  await send(page, "Còn đó không?");
  await expect(binh.getByTestId("chat-message")).toHaveCount(1);
  await binh.reload();
  await expect(binh.getByTestId("chat-me")).toHaveText("Bình");
  await expect(binh.getByTestId("chat-message")).toHaveCount(1);
});

test("BUG-01/02/03 làm lộ ba lỗi có chủ đích", async ({ page, context }) => {
  const binh = await twoUsers(page, context, "?bugs=BUG-01,BUG-02,BUG-03");

  await send(page, "a".repeat(201));
  await expect(page.getByTestId("chat-message")).toHaveCount(1); // BUG-01: đáng lẽ bị từ chối

  await expect(binh.getByTestId("chat-unread")).toHaveText("Chưa đọc: 1"); // BUG-02: tab đang xem vẫn tăng

  await send(page, "  chào  ");
  const raw = await page.getByTestId("chat-text").last().evaluate((el) => el.textContent);
  expect(raw).toBe("  chào  "); // BUG-03: không cắt khoảng trắng
});
