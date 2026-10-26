import { test, expect, type APIRequestContext, type Page } from "@playwright/test";

const DOCS = "/api/lab/rbac/docs";
const as = (user: string) => ({ Authorization: `Bearer ${user}` });
const ids = async (request: APIRequestContext, user: string, q = "") =>
  ((await (await request.get(DOCS + q, { headers: as(user) })).json()) as { data: { id: string }[] }).data.map((d) => d.id);

test("không có token hoặc token lạ trả 401", async ({ request }) => {
  expect((await request.get(DOCS)).status()).toBe(401);
  expect((await request.get(DOCS, { headers: as("ai-do") })).status()).toBe(401);
});

test("mỗi người chỉ thấy tài liệu của tổ chức mình", async ({ request }) => {
  expect(await ids(request, "alice")).toEqual(["d-a1", "d-a2", "d-a3"]);
  expect(await ids(request, "erin")).toEqual(["d-b1", "d-b2"]);
});

test("IDOR: đổi id sang tài liệu của tổ chức khác đều trả 404, không phải 403", async ({ request }) => {
  expect((await request.get(`${DOCS}/d-a1`, { headers: as("alice") })).status()).toBe(200);
  expect((await request.get(`${DOCS}/d-b1`, { headers: as("alice") })).status()).toBe(404);
  expect((await request.get(`${DOCS}/d-a1`, { headers: as("erin") })).status()).toBe(404);
  expect((await request.patch(`${DOCS}/d-b1`, { headers: as("alice"), data: { title: "hack" } })).status()).toBe(404);
  expect((await request.delete(`${DOCS}/d-b2`, { headers: as("alice") })).status()).toBe(404);
  expect(await ids(request, "erin")).toEqual(["d-b1", "d-b2"]);
});

// Ma trận quyền: [người dùng, tạo, sửa tài liệu của người khác (d-a1), sửa tài liệu của chính mình hoặc d-a1, xoá d-a2]
const matrix = [
  ["alice", 201, 200, 204],
  ["bob", 201, 200, 403],
  ["carol", 201, 403, 403],
  ["dave", 403, 403, 403],
] as const;

for (const [user, create, edit, del] of matrix) {
  test(`ma trận quyền của ${user}`, async ({ request }) => {
    const h = as(user);
    expect((await request.post(DOCS, { headers: h, data: { title: "Tài liệu mới" } })).status()).toBe(create);
    expect((await request.patch(`${DOCS}/d-a1`, { headers: h, data: { title: "Sửa thử" } })).status()).toBe(edit);
    expect((await request.delete(`${DOCS}/d-a2`, { headers: h })).status()).toBe(del);
  });
}

test("staff chỉ sửa được tài liệu do chính mình tạo", async ({ request }) => {
  const h = as("carol");
  expect((await request.patch(`${DOCS}/d-a3`, { headers: h, data: { title: "Của Carol (sửa)" } })).status()).toBe(200);
  const created = await (await request.post(DOCS, { headers: h, data: { title: "Mới" } })).json();
  expect((await request.patch(`${DOCS}/${created.id}`, { headers: h, data: { title: "Mới (sửa)" } })).status()).toBe(200);
  expect((await request.patch(`${DOCS}/d-a2`, { headers: h, data: { title: "x" } })).status()).toBe(403);
});

test("dữ liệu đầu vào không hợp lệ trả 422", async ({ request }) => {
  expect((await request.post(DOCS, { headers: as("alice"), data: { title: "   " } })).status()).toBe(422);
  expect((await request.patch(`${DOCS}/d-a1`, { headers: as("alice"), data: { title: "" } })).status()).toBe(422);
});

async function signIn(page: Page, who: string) {
  await page.goto("/lab/rbac");
  await page.getByLabel("Người dùng").selectOption(who);
  await page.getByRole("button", { name: "Vào hệ thống" }).click();
  await expect(page.getByTestId("rbac-me")).toBeVisible();
}

test("UI: nút hiện theo vai trò và hai người dùng cùng lúc ở hai tab", async ({ context }) => {
  const adminTab = await context.newPage();
  await signIn(adminTab, "alice");
  await adminTab.getByTestId("reset-data").click();

  const guestTab = await context.newPage();
  await signIn(guestTab, "dave");
  await expect(guestTab.getByTestId("doc-row")).toHaveCount(3);
  await expect(guestTab.getByRole("button", { name: /^Sửa|^Xoá/ })).toHaveCount(0);
  await expect(guestTab.getByRole("button", { name: "Tạo", exact: true })).toHaveCount(0);

  await expect(adminTab.getByRole("button", { name: "Xoá d-a2" })).toBeVisible();
  await adminTab.getByRole("button", { name: "Xoá d-a2" }).click();
  await expect(adminTab.getByTestId("rbac-message")).toHaveText("Xoá d-a2: thành công");

  await guestTab.reload();
  await expect(guestTab.getByTestId("doc-row")).toHaveCount(2);
});

test("UI: staff chỉ thấy nút Sửa trên tài liệu của mình; erin chỉ thấy tổ chức B", async ({ context }) => {
  const carol = await context.newPage();
  await signIn(carol, "carol");
  await expect(carol.getByRole("button", { name: /^Sửa/ })).toHaveCount(1);
  await expect(carol.getByRole("button", { name: "Sửa d-a3" })).toBeVisible();

  const erin = await context.newPage();
  await signIn(erin, "erin");
  await expect(erin.getByTestId("doc-row")).toHaveCount(2);
  await expect(erin.getByTestId("doc-row").first()).toContainText("tổ chức B");
});

test("BUG-01/02/03 làm lộ ba lỗi có chủ đích", async ({ request }) => {
  const q = "?bugs=BUG-01,BUG-02,BUG-03";
  // BUG-01: IDOR đọc theo id
  expect((await request.get(`${DOCS}/d-b1${q}`, { headers: as("alice") })).status()).toBe(200);
  // BUG-02: danh sách lộ cả tổ chức khác
  expect(await ids(request, "alice", q)).toEqual(["d-a1", "d-a2", "d-a3", "d-b1", "d-b2"]);
  // BUG-03: manager xoá được
  expect((await request.delete(`${DOCS}/d-a2${q}`, { headers: as("bob") })).status()).toBe(204);
});
