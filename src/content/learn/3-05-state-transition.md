---
title: Chuyển trạng thái (State Transition)
level: 3
order: 5
minutes: 45
summary: Mô hình hoá vòng đời đối tượng bằng trạng thái và sự kiện, test cả chuyển đổi không hợp lệ.
keywords: [state transition testing, state diagram, invalid transition]
---

## Mục tiêu bài học
- Mô hình hoá vòng đời của một đối tượng (đơn hàng, đơn nghỉ phép) bằng trạng thái, sự kiện và chuyển trạng thái.
- Lập **bảng chuyển trạng thái** đầy đủ (trạng thái nhân sự kiện) và phân loại từng ô là hợp lệ hay không hợp lệ.
- Tính số test theo các mức phủ: mọi trạng thái, mọi chuyển đổi hợp lệ (0-switch), chuỗi hai chuyển đổi (1-switch) và chuyển đổi không hợp lệ.
- Viết spec Playwright kiểm tra cả "nút nào được phép" ở mỗi trạng thái và phát hiện BUG-03 của LAB-03.

## Bạn cần chuẩn bị
- Đã học bài 3.4. Mở `/labs/cart` (BR-06), `/labs/leave` (BR-04, BR-05, BR-06), và hai ứng dụng `/lab/cart`, `/lab/leave`.
- Biết dùng hai tab/hai page trong một context (bài 2.12) cho phần LAB-07.

## Kiến thức cần nắm
- **Trạng thái** (state): tình trạng ổn định của đối tượng (Mới, Đã thanh toán...).
- **Sự kiện** (event) hoặc hành động: điều khiến trạng thái đổi (bấm "Chuyển", "Huỷ đơn", "Duyệt").
- **Chuyển trạng thái** (transition): cặp (trạng thái hiện tại, sự kiện) dẫn đến trạng thái mới.
- **Trạng thái cuối** (terminal): không có chuyển đổi đi ra (Hoàn tất, Đã huỷ).
- **Chuyển đổi không hợp lệ**: sự kiện không được phép ở trạng thái đó; hệ thống phải chặn.
- **0-switch**, **1-switch**: phủ từng chuyển đổi một, hoặc từng cặp hai chuyển đổi liên tiếp.

## Giải thích dễ hiểu
Đơn hàng giống một chuyến tàu đi qua các ga theo đúng lộ trình: Mới, Đã thanh toán, Đang giao, Hoàn tất. Ở một số ga bạn được phép xuống (huỷ), ở ga khác thì không (đã lên tàu giao hàng thì không huỷ được). Kiểm thử chuyển trạng thái trả lời hai câu hỏi: (1) tàu có đi đúng lộ trình khi mọi thứ bình thường? (2) khi hành khách cố làm điều **không được phép** (huỷ lúc đang giao), hệ thống có chặn không?

Câu hỏi (2) rất hay bị bỏ qua vì tester thường thích kiểm "cái gì chạy được". Nhưng nghiệp vụ nằm ở cả những thứ bị **cấm**: đơn đang giao mà vẫn huỷ được nghĩa là kho đã xuất hàng mà tiền được hoàn. Đó là lý do bảng chuyển trạng thái liệt kê **mọi** ô, kể cả ô không hợp lệ.

## Thực hành từng bước
Ví dụ xuyên suốt: đơn hàng của LAB-03 (BR-06: Mới, rồi Đã thanh toán, Đang giao, Hoàn tất; chỉ huỷ khi chưa giao), sau đó mở rộng sang đơn nghỉ phép LAB-07.

### Bước 1. Liệt kê trạng thái
Mục đích: biết đối tượng có những dạng nào.

Từ BR-06 và giao diện `/lab/cart` (sau khi bấm "Đặt hàng" sẽ thấy nhãn trạng thái đơn):

| # | Trạng thái | Loại |
|---|------------|------|
| S1 | Mới | đầu |
| S2 | Đã thanh toán | trung gian |
| S3 | Đang giao | trung gian |
| S4 | Hoàn tất | cuối |
| S5 | Đã huỷ | cuối |

Kết quả mong đợi: 5 trạng thái. Hãy tự đặt đơn trên `/lab/cart` và ghi lại nhãn bạn thấy ở mỗi bước.

### Bước 2. Liệt kê sự kiện
Mục đích: biết người dùng (hoặc hệ thống) có thể làm gì với đơn.

Trên giao diện có hai loại nút: nút "Chuyển: ..." (tiến sang trạng thái tiếp theo) và nút "Huỷ đơn". Nên ta có hai sự kiện:

| Sự kiện | Ý nghĩa |
|---------|---------|
| E1 Tiến | Bấm nút "Chuyển: ..." để sang trạng thái kế tiếp |
| E2 Huỷ | Bấm "Huỷ đơn" |

### Bước 3. Vẽ sơ đồ trạng thái
Mục đích: nhìn toàn cảnh lộ trình.

```text
   [Mới] --Tiến--> [Đã thanh toán] --Tiến--> [Đang giao] --Tiến--> [Hoàn tất]
     |                   |
    Huỷ                 Huỷ
     v                   v
   [Đã huỷ]           [Đã huỷ]
```

Mỗi mũi tên là một chuyển đổi hợp lệ. Có 5 mũi tên: ba mũi tên Tiến và hai mũi tên Huỷ.

### Bước 4. Lập bảng chuyển trạng thái đầy đủ
Mục đích: không bỏ sót ô không hợp lệ.

Bảng gồm số hàng bằng số trạng thái (5) và số cột bằng số sự kiện (2), tổng cộng 10 ô. Mỗi ô ghi trạng thái kế tiếp hoặc "X" nếu không hợp lệ.

| Trạng thái hiện tại | Sự kiện Tiến | Sự kiện Huỷ |
|---------------------|--------------|-------------|
| Mới | Đã thanh toán | Đã huỷ |
| Đã thanh toán | Đang giao | Đã huỷ |
| Đang giao | Hoàn tất | X |
| Hoàn tất | X | X |
| Đã huỷ | X | X |

Đếm: 5 ô hợp lệ (ô có tên trạng thái) và 5 ô không hợp lệ (dấu X). Cả 10 ô đều là test: 5 test chứng minh nút hoạt động, 5 test chứng minh nút **không có** (hoặc không hoạt động).

Chú ý ô "Đang giao, Huỷ" bằng X: nó chính là BR-06 "chỉ huỷ khi chưa giao" và cũng là chỗ BUG-03 của lab phá vỡ.

Kết quả mong đợi: bảng 5 nhân 2 với đủ 10 ô. Nếu bạn thấy giao diện có nút ở ô X, đó là bug.

### Bước 5. Chọn mức phủ và tính số test
Mục đích: quyết định thử bao nhiêu chuỗi.

**Phủ mọi trạng thái** (all-states): mỗi trạng thái được ghé qua ít nhất một lần; một chuỗi Mới, Đã thanh toán, Đang giao, Hoàn tất đã đi qua 4 trạng thái, thêm một chuỗi qua Đã huỷ nên cần 2 kịch bản.

**Phủ mọi chuyển đổi hợp lệ** (0-switch): mỗi mũi tên ít nhất một lần. Có 5 mũi tên, nhưng một kịch bản đi qua nhiều mũi tên nên ta cần ít kịch bản hơn 5. Một cách tối thiểu là 3 kịch bản:

| Kịch bản | Chuỗi | Mũi tên được phủ |
|----------|-------|------------------|
| K1 | Mới, Đã thanh toán, Đang giao, Hoàn tất | 3 (Tiến, Tiến, Tiến) |
| K2 | Mới rồi Huỷ | 1 (Mới, Huỷ) |
| K3 | Mới, Đã thanh toán, rồi Huỷ | 1 mới (Đã thanh toán, Huỷ); mũi tên Mới, Tiến đã phủ ở K1 |

3 kịch bản phủ đủ 5 mũi tên.

**Phủ chuỗi hai chuyển đổi liên tiếp** (1-switch): mỗi cặp (mũi tên vào trạng thái X, mũi tên ra khỏi X). Đếm số cặp: chuyển đổi vào Đã thanh toán có 2 mũi tên ra (Tiến, Huỷ) nên 2 cặp; chuyển đổi vào Đang giao có 1 mũi tên ra (Tiến), 1 cặp; vào Hoàn tất và Đã huỷ không có mũi tên ra, 0 cặp; vào Mới không có mũi tên vào nên bỏ. Tổng 3 cặp: (Tiến vào Đã thanh toán, rồi Tiến), (Tiến vào Đã thanh toán, rồi Huỷ), (Tiến vào Đang giao, rồi Tiến). Cả ba nằm trong K1 và K3, nên 3 kịch bản K1, K2, K3 cũng phủ 1-switch ở LAB này.

**Phủ chuyển đổi không hợp lệ**: 5 ô X. Mỗi ô kiểm "nút không có". Không cần 5 kịch bản riêng: kiểm ngay tại trạng thái đó khi đi ngang qua. Ví dụ: K1 đi đến Đang giao thì kiểm không có "Huỷ đơn"; đến Hoàn tất thì kiểm không còn nút nào; K2 và K3 tới Đã huỷ thì kiểm không còn nút nào. Còn ô "Hoàn tất, Huỷ" và "Đã huỷ, Tiến" kiểm ở cuối K1 và K2.

Bảng tổng: 3 kịch bản hợp lệ, trong đó kiểm đủ 5 ô X; hoặc cách đơn giản hơn trong spec: 5 test, mỗi test đưa đơn tới một trạng thái rồi kiểm các nút hiện có (xem Demo).

### Bước 6. Mở rộng sang vòng đời đơn nghỉ phép (LAB-07)
Mục đích: tập lập bảng với nhiều sự kiện và có yếu tố vai trò.

Trạng thái: Chờ duyệt, Đã duyệt, Từ chối, Đã huỷ. Sự kiện: Duyệt (Quản lý), Từ chối (Quản lý, kèm lý do), Huỷ (Nhân viên).

| Trạng thái hiện tại | Duyệt | Từ chối | Huỷ |
|---------------------|-------|---------|-----|
| Chờ duyệt | Đã duyệt | Từ chối | Đã huỷ |
| Đã duyệt | X | X | X |
| Từ chối | X | X | X |
| Đã huỷ | X | X | X |

Có 4 nhân 3 bằng 12 ô: 3 hợp lệ, 9 không hợp lệ. Ba chuyển đổi hợp lệ đều xuất phát từ "Chờ duyệt", nên mỗi kịch bản chỉ có một bước; 3 kịch bản phủ 3 mũi tên. Chín ô X được kiểm gộp: ở bất kỳ trạng thái khác "Chờ duyệt", cả ba nút (Duyệt, Từ chối, Huỷ) đều biến mất.

Bảng này chưa thể hiện **vai trò**. Mỗi chuyển đổi hợp lệ chỉ hợp lệ cho một vai trò: Nhân viên không thấy nút Duyệt hay Từ chối, Quản lý không thấy Huỷ đơn. Kết hợp trạng thái với vai trò thành ma trận phân quyền sẽ làm ở bài 3.8.

Có thêm một "hiệu ứng phụ" cần kiểm: khi Duyệt, số dư phép giảm đúng số ngày của đơn; khi Từ chối hoặc Huỷ thì số dư không đổi (BR-06). Với đơn 3 ngày: số dư thành "Phép năm còn 9/12 ngày" sau khi duyệt, vẫn "12/12" trong các trường hợp khác.

### Bước 7. Viết test case
Mục đích: biến ô của bảng thành test case chuẩn.

| ID | Tiền điều kiện | Bước | Dữ liệu | Kết quả mong đợi |
|----|----------------|------|---------|------------------|
| TC-ST-01 | Giỏ trống | Thêm chuột, Đặt hàng; bấm "Chuyển: Đã thanh toán", "Chuyển: Đang giao", "Chuyển: Hoàn tất" | — | Trạng thái đi Mới, Đã thanh toán, Đang giao, Hoàn tất; cuối cùng không còn nút nào |
| TC-ST-02 | Giỏ trống | Thêm chuột, Đặt hàng; bấm "Huỷ đơn" | — | Trạng thái "Đã huỷ"; không còn nút nào |
| TC-ST-03 | Giỏ trống | Đặt hàng, chuyển sang Đã thanh toán, bấm "Huỷ đơn" | — | Trạng thái "Đã huỷ" |
| TC-ST-04 | Đơn ở "Đang giao" | Tìm nút "Huỷ đơn" | — | Không có nút "Huỷ đơn"; có nút "Chuyển: Hoàn tất" |
| TC-ST-05 | Đơn ở "Hoàn tất" | Tìm mọi nút thao tác | — | Không có nút "Chuyển: ..." và không có "Huỷ đơn" |

## Demo code
Spec dưới đây kiểm cả 10 ô của bảng bằng 5 test: mỗi test đưa đơn tới một trạng thái rồi kiểm nút hiện có.

```ts
import { test, expect, type Page } from "@playwright/test";

type State = "Mới" | "Đã thanh toán" | "Đang giao" | "Hoàn tất" | "Đã huỷ";

// Đặt hàng bằng một chuột rồi đưa đơn tới trạng thái mong muốn.
async function orderAt(page: Page, target: State) {
  await page.getByTestId("product-p2").getByRole("button", { name: "Thêm vào giỏ" }).click();
  await page.getByRole("button", { name: "Đặt hàng" }).click();
  if (target === "Mới") return;
  if (target === "Đã huỷ") {
    await page.getByRole("button", { name: "Huỷ đơn" }).click();
    return;
  }
  // Đi dọc lộ trình chính cho đến khi tới trạng thái cần.
  const path = ["Đã thanh toán", "Đang giao", "Hoàn tất"];
  for (const s of path.slice(0, path.indexOf(target) + 1)) {
    await page.getByRole("button", { name: `Chuyển: ${s}` }).click();
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto("/lab/cart");
  await page.getByTestId("reset-data").click();
});

// Mỗi dòng = một hàng của bảng chuyển trạng thái: nút Tiến kế tiếp và nút Huỷ có hay không.
const cells: { state: State; next: string | null; cancel: boolean }[] = [
  { state: "Mới", next: "Đã thanh toán", cancel: true },
  { state: "Đã thanh toán", next: "Đang giao", cancel: true },
  { state: "Đang giao", next: "Hoàn tất", cancel: false },
  { state: "Hoàn tất", next: null, cancel: false },
  { state: "Đã huỷ", next: null, cancel: false },
];

for (const c of cells) {
  test(`[ST][BR-06] đơn ở "${c.state}": nút được phép đúng bảng`, async ({ page }) => {
    await orderAt(page, c.state);
    await expect(page.getByTestId("order-status")).toHaveText(c.state);

    // Nút "Chuyển: ..." chỉ có một và đúng tên, hoặc không có nút nào.
    await expect(page.getByRole("button", { name: /^Chuyển:/ })).toHaveCount(c.next ? 1 : 0);
    if (c.next) {
      await expect(page.getByRole("button", { name: `Chuyển: ${c.next}` })).toBeVisible();
    }
    // Nút "Huỷ đơn" chỉ có khi đơn chưa giao.
    await expect(page.getByRole("button", { name: "Huỷ đơn" })).toHaveCount(c.cancel ? 1 : 0);
  });
}
```

Giải thích: `orderAt` là hàm dựng trạng thái; test không dựa vào test khác nên độc lập. `cells` biến bảng ở Bước 4 thành dữ liệu: cột `next` là ô Tiến, cột `cancel` là ô Huỷ. `toHaveCount(0)` là cách web-first để khẳng định "không có nút" (đợi cho đến khi đúng hoặc hết hạn). Nút tên `Chuyển: Đã thanh toán` khớp chính xác nhãn trên giao diện (ví dụ `Chuyển: Đang giao`); regex `/^Chuyển:/` khớp mọi nút Chuyển.

Phần LAB-07, hai vai trò trên cùng page (có thể đổi bằng hộp "Vai trò"):

```ts
import { test, expect } from "@playwright/test";

const NOW = new Date("2026-03-02T09:00:00");

test("[ST][BR-06] đơn đã duyệt: không còn nút Duyệt, Từ chối, Huỷ", async ({ page, context }) => {
  await context.clock.setFixedTime(NOW);
  await page.goto("/lab/leave");
  await page.getByTestId("reset-data").click();

  await page.getByLabel("Từ ngày").fill("2026-03-09");
  await page.getByLabel("Đến ngày").fill("2026-03-10");
  await page.getByLabel("Lý do").fill("Đi công tác gia đình xa");
  await page.getByRole("button", { name: "Gửi đơn" }).click();

  // Quản lý duyệt đơn trên một tab khác dùng chung dữ liệu.
  const mgr = await context.newPage();
  await mgr.goto("/lab/leave");
  await mgr.getByLabel("Vai trò").selectOption("manager");
  await mgr.getByRole("button", { name: "Duyệt đơn #1" }).click();
  await expect(mgr.getByTestId("leave-status-1")).toHaveText("Đã duyệt");

  // 9 ô X của bảng: không còn nút nào ở cả hai vai trò.
  await expect(mgr.getByRole("button", { name: /^(Duyệt|Từ chối) đơn/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^Huỷ đơn/ })).toHaveCount(0);
  await expect(page.getByTestId("leave-balance")).toHaveText("Phép năm còn 10/12 ngày");
});
```

Đơn này 2 ngày (09/03 đến 10/03) nên sau khi duyệt, số dư là 10 trên 12. Hai tab chia sẻ dữ liệu qua `localStorage` và đồng bộ qua sự kiện `storage`, nên tab nhân viên tự cập nhật.

## Thử ngay trong lab
1. Mở `/lab/cart`, đặt đơn và đi hết lộ trình; sau mỗi bước ghi lại danh sách nút đang hiện. Đối chiếu từng hàng với bảng ở Bước 4.
2. Chạy spec trên `/lab/cart?bugs=BUG-03` (đổi URL `goto` trong `beforeEach`): test cho hàng "Đang giao" đỏ vì có nút "Huỷ đơn" (`Expected: 0 Received: 1`). Đó là ô X bị phá.
3. Mở `/lab/leave` với hai tab (nhân viên và quản lý), thử cả ba chuyển đổi hợp lệ và quan sát số dư phép sau mỗi lần. Đối chiếu 13 test case mẫu ở `/labs/leave` (TC-H-009, TC-H-012, TC-H-013 là các ca chuyển trạng thái).

## Lỗi thường gặp
- **Triệu chứng**: chỉ có test cho lộ trình thuận lợi, bug "huỷ được đơn đang giao" lọt qua. **Nguyên nhân**: không liệt kê ô không hợp lệ. **Cách sửa**: lập bảng đủ trạng thái nhân sự kiện, mỗi ô X là một kiểm tra.
- **Triệu chứng**: `Error: locator.click: Test timeout of 30000ms exceeded` ở bước "Chuyển: Hoàn tất". **Nguyên nhân**: đơn chưa ở "Đang giao" do bỏ qua bước trước. **Cách sửa**: đi qua từng trạng thái theo thứ tự (hàm `orderAt`), đừng nhảy cóc.
- **Triệu chứng**: test "không có nút Huỷ đơn" xanh ngay cả khi đơn chưa được tạo. **Nguyên nhân**: `toHaveCount(0)` đúng với trang không có đơn nào. **Cách sửa**: luôn khẳng định trạng thái hiện tại trước (`order-status` có đúng chữ mong đợi), rồi mới khẳng định nút vắng mặt.
- **Triệu chứng**: test hai tab lúc xanh lúc đỏ khi kiểm số dư ở tab nhân viên. **Nguyên nhân**: kiểm ngay trước khi sự kiện `storage` tới tab kia. **Cách sửa**: dùng `expect(...).toHaveText` (tự chờ) thay vì đọc giá trị rồi so ngay.
- **Triệu chứng**: test chuyển trạng thái phụ thuộc test trước (đơn của test A là đầu vào của test B). **Nguyên nhân**: dùng chung dữ liệu. **Cách sửa**: mỗi test tự dựng trạng thái cần có và `reset-data` ở `beforeEach`.

## Tóm tắt
- Trạng thái, sự kiện và chuyển trạng thái là ba thành phần của mô hình; vẽ sơ đồ trước khi viết test.
- Bảng chuyển trạng thái đủ trạng thái nhân sự kiện: đơn hàng LAB-03 có 10 ô (5 hợp lệ, 5 không hợp lệ), đơn nghỉ phép LAB-07 có 12 ô (3 hợp lệ, 9 không hợp lệ).
- Phủ 0-switch của đơn hàng cần 3 kịch bản; 1-switch có 3 cặp, đều nằm trong 3 kịch bản đó.
- Mỗi ô không hợp lệ là một test "nút không có", thường gộp vào kịch bản đang đi qua trạng thái đó.
- Spec hay nhất là spec dữ liệu: mảng `cells` chuyển bảng sang code, nên bảng đổi thì sửa một dòng.
- Phải kiểm cả hiệu ứng phụ (số dư phép chỉ trừ khi duyệt), không chỉ nhãn trạng thái.

## Bài tập
1. Vẽ sơ đồ và lập bảng chuyển trạng thái đầy đủ cho đơn nghỉ phép (4 trạng thái, 3 sự kiện); đếm số ô hợp lệ và không hợp lệ. Xong khi: bạn ra 3 hợp lệ và 9 không hợp lệ, và đối chiếu được với `/labs/leave`.
2. Chạy spec của đơn hàng ở phần Demo trên lab sạch (xanh) và trên `?bugs=BUG-03` (đỏ đúng ở hàng Đang giao). Xong khi: bạn giải thích được vì sao chỉ một test đỏ.
3. Viết test cho TC-H-009: sau khi quản lý duyệt, tab nhân viên thấy "Phép năm còn 9/12 ngày" với đơn 3 ngày (09/03 đến 11/03). Xong khi: test xanh và dùng đồng hồ giả.
4. Mở `/lab/tickets` (LAB-11), đọc BR-03 và vẽ ma trận chuyển trạng thái của ticket. Xong khi: bạn đếm được ô hợp lệ và không hợp lệ, và chọn được kịch bản tối thiểu phủ mọi chuyển đổi hợp lệ.
5. (Nâng cao) Tính số chuỗi 1-switch của đơn hàng nếu cho phép thêm sự kiện "Hoàn tiền" từ trạng thái Hoàn tất sang trạng thái mới "Đã hoàn tiền". Xong khi: bạn liệt kê các cặp và chỉ ra kịch bản mới cần thêm.
