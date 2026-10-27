---
title: "Bài tập lập trình cho QA: mảng, Map và Set"
level: 1
order: 12
minutes: 100
summary: Chín bài toán về mảng và collection hay gặp khi phỏng vấn QA automation (tìm trùng, max/min, sắp xếp, đảo mảng, gộp mảng, đếm tần suất bằng Map, loại trùng bằng Set, nhóm theo khoá, hai số có tổng bằng k) viết bằng TypeScript, kèm áp dụng vào dữ liệu trên trang.
keywords: [bài tập lập trình QA, mảng typescript, Map và Set, phỏng vấn automation tester, two sum, group by, loại phần tử trùng]
---

## Mục tiêu bài học
- Giải được chín bài toán mảng và collection: tìm phần tử trùng, tìm lớn nhất, nhỏ nhất và lớn thứ hai, sắp xếp, đảo mảng, gộp hai mảng, đếm tần suất bằng `Map`, loại trùng bằng `Set`, nhóm theo khoá, tìm hai số có tổng bằng k.
- Chọn đúng cấu trúc dữ liệu: khi nào dùng mảng, khi nào `Map`, khi nào `Set`, và giải thích được sự đánh đổi giữa tốc độ và bộ nhớ.
- Phân biệt hàm **thay đổi mảng gốc** (mutate) với hàm **trả về mảng mới**, và biết cái bẫy của `sort()` mặc định với số.
- Áp dụng vào việc thật của QA: kiểm tra danh sách trên trang đã sắp xếp chưa, có phần tử trùng không, đếm số dòng theo vai trò.

## Bạn cần chuẩn bị
- Đã làm bài 1.11 (xử lý chuỗi): bạn biết cách chạy `npx tsx` trong thư mục `thuc-hanh-js` và đã có hàm `check` để in `PASS` hay `FAIL`. Bài này dùng lại đúng hàm đó.
- Đã làm bài 1.7 (mảng và object) và 1.9 (TypeScript cơ bản, kiểu `T[]`, generic mức nhập môn).
- Phần "Demo code" cần dự án Playwright của bài 0.3 và lab đang chạy; phần này tuỳ chọn.

## Kiến thức cần nắm
- **Mảng** (array): dãy có thứ tự, truy cập theo chỉ số; `push`, `pop`, `slice`, `splice`, `concat`, `sort`, `reverse`, `filter`, `map`.
- **`Set`**: tập hợp không có phần tử trùng, hỏi "có chứa không" (`has`) rất nhanh.
- **`Map`**: bảng khoá và giá trị, khoá có thể là bất kỳ kiểu nào, nhớ thứ tự thêm vào.
- **Mutate** (thay đổi tại chỗ) và **không mutate** (trả bản mới): `sort` và `reverse` thay đổi mảng gốc, còn `filter`, `map`, `slice` thì không.
- **Hàm so sánh** (comparator) của `sort`: `(a, b) => a - b` cho số tăng dần.
- Độ phức tạp: O(n) một lượt, O(n log n) có sắp xếp, O(n²) hai vòng lặp lồng nhau.

## Giải thích dễ hiểu
Hãy hình dung ba dụng cụ lưu trữ trong một cửa hàng. **Mảng** là kệ có đánh số: món thứ 0, thứ 1, thứ 2; tìm một món cụ thể thì phải đi dọc kệ xem từng món (chậm khi kệ dài). **`Set`** là tấm bảng "danh sách khách đã đến": hỏi "anh A đã đến chưa?" là nhìn bảng, không cần đi tìm, và một người không ghi hai lần. **`Map`** là cuốn sổ tra cứu: tra theo tên khách thì ra ngay số lần họ đã mua.

Phần lớn bài mảng trong phỏng vấn có cùng một mô-típ: lời giải ngây thơ dùng hai vòng lặp lồng nhau (O(n²)) vì với mỗi phần tử lại đi tìm nó trong phần còn lại. Lời giải tốt thay vòng lặp trong bằng `Set` hoặc `Map` để "tra" trong khoảng một bước (O(1)), đổi lại tốn thêm bộ nhớ. Nhớ câu: **đổi bộ nhớ lấy tốc độ**.

Với QA, các bài này không xa vời. Một danh sách đơn hàng trên trang có bị trùng mã không? Kết quả sau khi bấm "Sắp xếp theo tên" có đúng thứ tự không? Có bao nhiêu bug mức nghiêm trọng cao trong từng module? Mỗi câu hỏi đó chính là một bài toán trong danh sách dưới đây.

Về quy trình làm bài, dùng lại năm bước của bài 1.11: đọc đề và hỏi ca biên, nêu ví dụ tay, chọn cách nghĩ, viết code, tự kiểm tra bằng `console.log` rồi nêu độ phức tạp. Ca biên của mảng: mảng rỗng, một phần tử, toàn phần tử bằng nhau, số âm, phần tử lặp ở đầu hoặc cuối.

## Thực hành từng bước
Tạo file `thuc-hanh-js/b12-mang.ts`. Dán hàm `check` ở bài 1.11 vào đầu file, sau đó dán nối tiếp từng đoạn dưới đây (mỗi đoạn độc lập về tên hàm). Chạy bằng `npx tsx b12-mang.ts` sau mỗi bước và đếm số dòng `PASS` mới.

```ts
function check(name: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) console.log("  mong đợi:", expected, "nhận được:", actual);
}
```

Nhắc lại: `JSON.stringify` không đọc được `Map` và `Set`; khi cần kiểm tra chúng, đổi sang object hoặc mảng trước.

### Bước 1. Tìm phần tử trùng
Đề: (a) mảng có phần tử trùng không? (b) liệt kê các phần tử bị trùng, mỗi phần tử một lần.

Cách nghĩ: lời giải ngây thơ so từng cặp, O(n²). Tốt hơn: duyệt một lượt, dùng `Set` ghi nhớ phần tử đã gặp; gặp phần tử đã có trong `Set` thì nó trùng.

```ts
function hasDuplicate(items: string[]): boolean {
  const seen = new Set<string>();
  for (const x of items) {
    if (seen.has(x)) return true;
    seen.add(x);
  }
  return false;
}
function findDuplicates(items: string[]): string[] {
  const seen = new Set<string>();
  const dup = new Set<string>();
  for (const x of items) {
    if (seen.has(x)) dup.add(x);
    seen.add(x);
  }
  return [...dup];
}
check("có trùng", hasDuplicate(["o-1", "o-2", "o-1"]), true);
check("không trùng", hasDuplicate(["o-1", "o-2"]), false);
check("mảng rỗng", hasDuplicate([]), false);
check("liệt kê trùng", findDuplicates(["a", "b", "a", "c", "b", "a"]), ["a", "b"]);
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `items: string[]` | Tham số là mảng chuỗi (ví dụ danh sách mã đơn hàng). |
| `seen` | `Set` các phần tử đã gặp. |
| `seen.has(x)` rồi `return true` | Đã gặp rồi, nghĩa là đây là lần xuất hiện thứ hai: có trùng. Thoát ngay, không cần xét tiếp. |
| `dup` | `Set` thứ hai để mỗi phần tử trùng chỉ được báo một lần dù xuất hiện ba lần (`"a"` xuất hiện 3 lần nhưng chỉ có mặt một lần trong kết quả). |
| `[...dup]` | Đổi `Set` thành mảng theo đúng thứ tự thêm vào. |

Độ phức tạp: O(n) thời gian, O(n) bộ nhớ. Bản ngây thơ dùng hai vòng lặp là O(n²) thời gian, O(1) bộ nhớ: khi phỏng vấn hãy nêu cả hai và nói rõ bạn chọn gì.

Kết quả mong đợi: 4 dòng `PASS`.

### Bước 2. Lớn nhất, nhỏ nhất và lớn thứ hai
Đề: tìm số lớn nhất, nhỏ nhất, và số lớn **thứ hai khác nhau** (với `[5, 9, 9, 3]` đáp án là 5, không phải 9). Không dùng `sort` và không dùng `Math.max(...nums)`.

Cách nghĩ: giữ biến `max` và cập nhật khi gặp số lớn hơn. Lớn thứ hai cần hai biến `first` và `second`: gặp số lớn hơn `first` thì `first` cũ tụt xuống làm `second`; gặp số nhỏ hơn `first` nhưng lớn hơn `second` thì thay `second`. Số bằng `first` bị bỏ qua nên "9, 9" không bị tính hai lần. Hỏi lại đề: mảng rỗng trả gì (`undefined`).

```ts
function maxOf(nums: number[]): number | undefined {
  if (nums.length === 0) return undefined;
  let max = nums[0];
  for (const n of nums) {
    if (n > max) max = n;
  }
  return max;
}
function minOf(nums: number[]): number | undefined {
  if (nums.length === 0) return undefined;
  let min = nums[0];
  for (const n of nums) {
    if (n < min) min = n;
  }
  return min;
}
function secondLargest(nums: number[]): number | undefined {
  let first = -Infinity;
  let second = -Infinity;
  for (const n of nums) {
    if (n > first) {
      second = first;
      first = n;
    } else if (n < first && n > second) {
      second = n;
    }
  }
  return second === -Infinity ? undefined : second;
}
check("max", maxOf([3, 9, 2]), 9);
check("min", minOf([3, 9, 2]), 2);
check("max mảng rỗng", maxOf([]), undefined);
check("max số âm", maxOf([-5, -2, -9]), -2);
check("lớn thứ hai", secondLargest([5, 9, 9, 3]), 5);
check("lớn thứ hai: toàn số bằng nhau", secondLargest([4, 4]), undefined);
check("lớn thứ hai: hai phần tử", secondLargest([1, 2]), 1);
```

| Phần code | Ý nghĩa |
|-----------|---------|
| Kiểu trả về `number` hoặc `undefined` | Trong code viết `number`, dấu gạch đứng, `undefined` (kiểu hợp): một số, hoặc `undefined` khi mảng rỗng. |
| `let max = nums[0]` | Khởi tạo bằng phần tử đầu, **không** khởi tạo bằng 0: nếu toàn số âm thì 0 sẽ thắng sai (ca `[-5, -2, -9]`). |
| `-Infinity` | Giá trị nhỏ hơn mọi số, dùng làm "chưa có". |
| `second = first; first = n` | Hai lệnh theo đúng thứ tự: lưu `first` cũ vào `second` trước, rồi mới ghi đè `first`. |
| `n < first && n > second` | Số nằm giữa: không phá kỷ lục `first`, nhưng vượt `second`. Điều kiện `n < first` loại các số bằng `first`. |
| `second === -Infinity ? undefined : second` | Nếu `second` vẫn là "chưa có" thì mảng không có số lớn thứ hai (toàn bằng nhau hoặc quá ngắn). |

Độ phức tạp: O(n) thời gian, O(1) bộ nhớ. Giải bằng sắp xếp rồi lấy phần tử cuối cũng được nhưng O(n log n), nên chậm hơn khi chỉ cần một giá trị.

Kết quả mong đợi: 7 dòng `PASS`.

### Bước 3. Sắp xếp
Đề: sắp xếp mảng số tăng dần, và hiểu cách `sort` hoạt động.

Cách nghĩ: trong phỏng vấn, việc dùng `sort` có sẵn là đúng; người ta thường hỏi thêm **bẫy**: `[10, 9, 1].sort()` ra `[1, 10, 9]` vì `sort` mặc định so sánh như **chuỗi** ("10" đứng trước "9" vì `"1"` nhỏ hơn `"9"`). Muốn đúng với số phải truyền hàm so sánh. Ngoài ra `sort` **thay đổi mảng gốc**, nên nếu cần giữ bản gốc phải sao chép trước (`[...nums]`). Để hiểu cơ chế, hãy tự viết thêm một thuật toán đơn giản như **bubble sort**.

```ts
check("sort mặc định sai với số", [10, 9, 1].sort(), [1, 10, 9]);
check("sort có hàm so sánh", [10, 9, 1].sort((a, b) => a - b), [1, 9, 10]);

const original = [3, 1, 2];
const sortedCopy = [...original].sort((a, b) => a - b);
check("sort bản sao không đổi mảng gốc", original, [3, 1, 2]);
check("bản sao đã sắp", sortedCopy, [1, 2, 3]);

function bubbleSort(nums: number[]): number[] {
  const a = [...nums];
  for (let i = 0; i < a.length - 1; i++) {
    let swapped = false;
    for (let j = 0; j < a.length - 1 - i; j++) {
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swapped = true;
      }
    }
    if (!swapped) break;
  }
  return a;
}
check("bubble sort", bubbleSort([5, 1, 4, 2, 8]), [1, 2, 4, 5, 8]);

const people = [
  { name: "An", age: 30 },
  { name: "Bình", age: 25 },
];
check("sort object theo tuổi", [...people].sort((a, b) => a.age - b.age).map((p) => p.name), ["Bình", "An"]);
check("sort chữ có dấu", ["Đức", "An", "Bình"].sort((a, b) => a.localeCompare(b, "vi")), ["An", "Bình", "Đức"]);

function isSortedAsc(nums: number[]): boolean {
  for (let i = 1; i < nums.length; i++) {
    if (nums[i - 1] > nums[i]) return false;
  }
  return true;
}
check("đã sắp tăng", isSortedAsc([1, 2, 2, 5]), true);
check("chưa sắp", isSortedAsc([1, 3, 2]), false);
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `(a, b) => a - b` | Hàm so sánh: trả số âm nếu `a` đứng trước `b`, dương nếu sau, 0 nếu bằng. `a - b` cho thứ tự tăng; `b - a` cho giảm dần. |
| `[...original].sort(...)` | Sao chép mảng bằng spread rồi mới sắp xếp, nên `original` còn nguyên. |
| Hai vòng `for` của `bubbleSort` | Vòng ngoài là số lượt; mỗi lượt, vòng trong so hai phần tử kề nhau và đổi chỗ nếu sai thứ tự, nên phần tử lớn nhất "nổi" về cuối. Sau lượt `i`, `i + 1` phần tử cuối đã đúng chỗ nên vòng trong ngắn dần (`a.length - 1 - i`). |
| `[a[j], a[j + 1]] = [a[j + 1], a[j]]` | Đổi chỗ hai phần tử bằng destructuring, không cần biến tạm. |
| `swapped` | Nếu cả một lượt không đổi chỗ lần nào thì mảng đã sắp xong, thoát sớm. |
| `a.age - b.age` | Sắp một mảng object theo một trường số. |
| `localeCompare(b, "vi")` | So sánh chuỗi theo quy tắc ngôn ngữ (`"vi"` là tiếng Việt) để chữ `Đ` đứng sau `D` đúng chỗ. So sánh bằng `<` đơn thuần có thể xếp sai chữ có dấu. |
| `isSortedAsc` | Không cần sắp lại: chỉ cần kiểm tra mỗi cặp kề nhau không bị ngược. Cho bài kiểm tra "danh sách trên trang đã sắp chưa". |

Độ phức tạp: `sort` có sẵn là O(n log n); bubble sort là O(n²) trường hợp xấu và O(n) nếu mảng đã sắp (nhờ `swapped`); `isSortedAsc` là O(n).

Kết quả mong đợi: 9 dòng `PASS`.

### Bước 4. Đảo mảng
Đề: đảo thứ tự các phần tử của mảng, **tại chỗ** (không tạo mảng mới).

Cách nghĩ: hai con trỏ như bài palindrome ở bài 1.11: đổi chỗ phần tử ở hai đầu rồi cùng tiến vào giữa. Mảng độ dài lẻ thì phần tử giữa giữ nguyên.

```ts
function reverseInPlace<T>(arr: T[]): void {
  let left = 0;
  let right = arr.length - 1;
  while (left < right) {
    [arr[left], arr[right]] = [arr[right], arr[left]];
    left++;
    right--;
  }
}
const toReverse = [1, 2, 3, 4];
reverseInPlace(toReverse);
check("đảo tại chỗ", toReverse, [4, 3, 2, 1]);
check("đảo bản sao", [...[1, 2, 3]].reverse(), [3, 2, 1]);
const odd = [1, 2, 3];
reverseInPlace(odd);
check("đảo độ dài lẻ", odd, [3, 2, 1]);
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `<T>` và `arr: T[]` | **Generic**: hàm chạy với mảng bất kỳ kiểu gì (số, chuỗi, object); `T` là "kiểu nào đó" được suy ra từ đối số. |
| `: void` | Hàm không trả gì; kết quả nằm ngay trong mảng được truyền vào. |
| `left < right` | Dừng khi hai con trỏ gặp nhau hoặc vượt nhau. |
| Dòng đổi chỗ | Đổi hai phần tử bằng destructuring. |
| `[...[1, 2, 3]].reverse()` | `reverse()` có sẵn cũng thay đổi mảng gốc, nên sao chép bằng spread trước khi dùng nếu cần giữ bản gốc. |

Độ phức tạp: O(n) thời gian, O(1) bộ nhớ vì không tạo mảng mới (cũng là lý do bài hay được hỏi: kiểm tra bạn có hiểu "tại chỗ").

Kết quả mong đợi: 3 dòng `PASS`.

### Bước 5. Gộp mảng
Đề: (a) nối hai mảng thành một; (b) gộp hai mảng **đã sắp tăng** thành một mảng đã sắp, không sắp lại từ đầu.

Cách nghĩ: (a) dùng spread. (b) hai con trỏ, mỗi con trỏ đứng ở đầu một mảng; so hai phần tử đang trỏ, lấy cái nhỏ hơn đưa vào kết quả và tiến con trỏ đó; khi một mảng hết, chép nốt phần còn lại của mảng kia. Đây chính là bước "merge" của thuật toán merge sort.

```ts
function mergeSorted(a: number[], b: number[]): number[] {
  const out: number[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] <= b[j]) out.push(a[i++]);
    else out.push(b[j++]);
  }
  while (i < a.length) out.push(a[i++]);
  while (j < b.length) out.push(b[j++]);
  return out;
}
check("gộp hai mảng đã sắp", mergeSorted([1, 4, 7], [2, 3, 9, 10]), [1, 2, 3, 4, 7, 9, 10]);
check("gộp với mảng rỗng", mergeSorted([], [1, 2]), [1, 2]);
check("nối bằng spread", [...[1, 2], ...[3]], [1, 2, 3]);
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `i`, `j` | Hai con trỏ vào `a` và `b`. |
| `while (i < a.length && j < b.length)` | Chạy khi **cả hai** mảng còn phần tử. |
| `out.push(a[i++])` | `i++` (hậu tố) dùng giá trị `i` hiện tại để lấy phần tử rồi mới tăng `i` lên một. Gộp hai việc "lấy" và "tiến" trong một dòng. |
| `a[i] <= b[j]` | Dùng `<=` để khi hai giá trị bằng nhau, phần tử của `a` đi trước; đảm bảo thứ tự ổn định. |
| Hai vòng `while` cuối | Chỉ một trong hai thực sự chạy: chép phần đuôi còn lại của mảng chưa hết. |
| `[...x, ...y]` | Nối mảng không sắp xếp: tạo mảng mới chứa phần tử của `x` rồi của `y`. |

Độ phức tạp: O(n + m) thời gian và bộ nhớ, với n và m là độ dài hai mảng. Nối rồi `sort` cũng ra kết quả đúng nhưng tốn O((n + m) log (n + m)).

Kết quả mong đợi: 3 dòng `PASS`.

### Bước 6. Đếm tần suất bằng Map
Đề: đếm mỗi giá trị trong mảng xuất hiện mấy lần, rồi tìm giá trị xuất hiện nhiều nhất. Ví dụ danh sách kết quả test `["pass", "fail", "pass", "skip", "pass"]`.

Cách nghĩ: `Map` làm bảng đếm, mẫu code `freq.set(x, (freq.get(x) ?? 0) + 1)` sẽ lặp lại rất nhiều lần trong sự nghiệp của bạn. Tìm phần tử nhiều nhất bằng một lượt duyệt qua các cặp của `Map`.

```ts
function frequency(items: string[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const x of items) {
    freq.set(x, (freq.get(x) ?? 0) + 1);
  }
  return freq;
}
function mostFrequent(items: string[]): string | undefined {
  let best: string | undefined;
  let bestCount = 0;
  for (const [value, count] of frequency(items)) {
    if (count > bestCount) {
      best = value;
      bestCount = count;
    }
  }
  return best;
}
const results = ["pass", "fail", "pass", "skip", "pass"];
check("tần suất kết quả", Object.fromEntries(frequency(results)), { pass: 3, fail: 1, skip: 1 });
check("phổ biến nhất", mostFrequent(results), "pass");
check("phổ biến nhất của mảng rỗng", mostFrequent([]), undefined);
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `Map<string, number>` | Khoá là giá trị trong mảng, giá trị là số lần. |
| `freq.get(x) ?? 0` | Lần đầu thấy `x` thì `get` trả `undefined`, `??` đổi thành 0. |
| `for (const [value, count] of frequency(items))` | Duyệt từng cặp khoá và giá trị; `[value, count]` là destructuring cặp. |
| `count > bestCount` | Dùng `>` (không phải `>=`) nên khi hai giá trị đồng hạng, giá trị gặp **trước** được giữ. Hãy hỏi lại đề: đồng hạng thì trả gì? |
| `Object.fromEntries(map)` | Đổi `Map` thành object để `check` so sánh. |

Độ phức tạp: O(n) thời gian, O(k) bộ nhớ (k là số giá trị khác nhau).

Kết quả mong đợi: 3 dòng `PASS`.

### Bước 7. Loại trùng bằng Set, loại trùng theo khoá, giao và hiệu hai tập
Đề: (a) loại phần tử trùng khỏi mảng số; (b) loại trùng một mảng **object** theo một trường (giữ phần tử đầu tiên của mỗi `id`); (c) tìm phần tử chung của hai tập và phần tử chỉ có ở tập thứ nhất.

Cách nghĩ: (a) `Set` tự loại trùng. (b) `Set` không nhận ra hai object khác tham chiếu là "trùng", nên ta dùng `Set` chứa **khoá** (`id`) đã gặp. (c) đặt phần tử của tập thứ hai vào `Set` rồi `filter` tập thứ nhất theo `has`.

```ts
check("loại trùng bằng Set", [...new Set([1, 2, 2, 3, 1])], [1, 2, 3]);

function uniqueBy<T, K>(items: T[], key: (item: T) => K): T[] {
  const seen = new Set<K>();
  const out: T[] = [];
  for (const item of items) {
    const k = key(item);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(item);
    }
  }
  return out;
}
check("loại trùng theo id", uniqueBy([{ id: 1, n: "a" }, { id: 1, n: "b" }, { id: 2, n: "c" }], (x) => x.id), [
  { id: 1, n: "a" },
  { id: 2, n: "c" },
]);

const A = new Set([1, 2, 3]);
const B = new Set([2, 3, 4]);
check("giao", [...A].filter((x) => B.has(x)), [2, 3]);
check("hiệu", [...A].filter((x) => !B.has(x)), [1]);
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `[...new Set(arr)]` | Câu thần chú loại trùng một dòng: `Set` bỏ trùng, spread đổi lại thành mảng, thứ tự lần xuất hiện đầu được giữ. |
| `<T, K>` | Hai kiểu generic: `T` là kiểu phần tử, `K` là kiểu của khoá (ở ví dụ là `number`). |
| `key: (item: T) => K` | Tham số là **hàm** lấy khoá từ phần tử; người gọi quyết định "trùng" là trùng theo trường nào. |
| `seen.has(k)` | Đã có phần tử mang khoá này chưa? |
| `[...A].filter((x) => B.has(x))` | Giao của hai tập: phần tử của `A` mà `B` cũng có. Dùng `!B.has(x)` cho hiệu `A` trừ `B`. |

Độ phức tạp: loại trùng và `uniqueBy` là O(n); giao và hiệu là O(n + m). Nếu thay `B.has(x)` bằng `bArray.includes(x)` thì mỗi lần tra phải duyệt cả mảng, tổng thể thành O(n × m).

Gắn với QA: so sánh danh sách mã đơn hàng ở hệ thống A và hệ thống B, `hiệu` cho biết đơn nào bị thiếu bên kia.

Kết quả mong đợi: 4 dòng `PASS`.

### Bước 8. Nhóm theo khoá (group by)
Đề: cho danh sách bug, nhóm theo `module` để biết mỗi module có những bug nào; rồi đếm theo mức độ nghiêm trọng.

Cách nghĩ: dùng `Map<khoá, mảng>`. Với mỗi phần tử, lấy khoá; nếu `Map` đã có mảng của khoá đó thì `push` vào, nếu chưa thì tạo mảng mới với một phần tử.

```ts
type Bug = { id: string; severity: "high" | "low"; module: string };
const bugs: Bug[] = [
  { id: "B1", severity: "high", module: "login" },
  { id: "B2", severity: "low", module: "cart" },
  { id: "B3", severity: "high", module: "cart" },
];

function groupBy<T, K>(items: T[], key: (item: T) => K): Map<K, T[]> {
  const groups = new Map<K, T[]>();
  for (const item of items) {
    const k = key(item);
    const list = groups.get(k);
    if (list) list.push(item);
    else groups.set(k, [item]);
  }
  return groups;
}

const byModule = groupBy(bugs, (b) => b.module);
check("nhóm theo module", [...byModule].map(([k, v]) => [k, v.map((b) => b.id)]), [
  ["login", ["B1"]],
  ["cart", ["B2", "B3"]],
]);
check("đếm theo mức độ", [...groupBy(bugs, (b) => b.severity)].map(([k, v]) => [k, v.length]), [
  ["high", 2],
  ["low", 1],
]);
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `type Bug = {...}` | Kiểu của một bug; `severity` chỉ nhận `"high"` hoặc `"low"` (kiểu literal, bài 1.9). |
| `Map<K, T[]>` | Mỗi khoá ứng với một **mảng** các phần tử cùng khoá. |
| `const list = groups.get(k)` | Lấy mảng hiện có của khoá; chưa có thì `undefined`. |
| `if (list) list.push(item)` | Đã có nhóm: thêm vào. Vì `list` là tham chiếu tới mảng nằm trong `Map`, `push` cập nhật luôn nhóm đó. |
| `else groups.set(k, [item])` | Chưa có nhóm: tạo nhóm mới. |
| `[...byModule].map(([k, v]) => ...)` | Duyệt các cặp của `Map` để biến thành mảng dễ so sánh. |

Độ phức tạp: O(n) thời gian, O(n) bộ nhớ.

Ghi chú: các bản Node và TypeScript mới có sẵn `Object.groupBy` và `Map.groupBy` (cần Node từ 21 và cấu hình `lib` của TypeScript đủ mới, `ES2024`); với `target` là `ES2022` như trong `tsconfig.json` của khoá này, TypeScript sẽ báo thiếu kiểu. Phỏng vấn thường yêu cầu bạn tự viết như trên nên hãy nắm bản tự viết trước.

Kết quả mong đợi: 2 dòng `PASS`.

### Bước 9. Hai số có tổng bằng k (two sum)
Đề: cho mảng số và số `k`, trả về **chỉ số** của hai phần tử (khác vị trí) có tổng bằng `k`. Ví dụ `[2, 7, 11, 15]` và `k = 9` trả `[0, 1]`. Không có thì trả `null`. Đây là bài rất kinh điển.

Cách nghĩ: lời giải ngây thơ thử mọi cặp (hai vòng lặp), O(n²). Lời giải tốt: với mỗi số `n`, số cần tìm là `k - n`. Dùng `Map` ghi lại "số đã gặp và chỉ số của nó"; với số hiện tại, hỏi `Map` xem số cần tìm đã gặp chưa. Một lượt duyệt là xong.

```ts
function twoSum(nums: number[], k: number): [number, number] | null {
  const seen = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const need = k - nums[i];
    const j = seen.get(need);
    if (j !== undefined) return [j, i];
    seen.set(nums[i], i);
  }
  return null;
}
check("hai số tổng 9", twoSum([2, 7, 11, 15], 9), [0, 1]);
check("hai số bằng nhau", twoSum([3, 3], 6), [0, 1]);
check("không có cặp", twoSum([1, 2], 10), null);
check("không dùng một phần tử hai lần", twoSum([3, 2, 4], 6), [1, 2]);
check("có số 0 ở đầu", twoSum([0, 4, 3], 3), [0, 2]);
```

| Phần code | Ý nghĩa |
|-----------|---------|
| Kiểu trả về `[number, number]` hoặc `null` | Một **tuple** (cặp cố định hai số), hoặc `null` khi không có cặp nào; trong code nối hai kiểu bằng dấu gạch đứng. |
| `seen` | `Map` từ giá trị đã gặp sang chỉ số của nó. |
| `need = k - nums[i]` | Số đối ứng để cộng với số hiện tại ra `k`. |
| `const j = seen.get(need)` | Tìm chỉ số của số đối ứng trong những số đã duyệt. |
| `j !== undefined` | **Không** viết `if (j)`: chỉ số 0 là giá trị "falsy", sẽ bị bỏ qua nhầm (ca `[0, 4, 3]` bắt lỗi này). |
| `seen.set(nums[i], i)` | Chỉ ghi số hiện tại **sau** khi đã tra, nên một phần tử không bao giờ ghép với chính nó (ca `[3, 2, 4]` với `k = 6`: số 3 không ghép với 3 của chính nó). |

Độ phức tạp: O(n) thời gian, O(n) bộ nhớ. Hãy tự nêu: "tôi đổi bộ nhớ lấy tốc độ".

Kết quả mong đợi: 5 dòng `PASS`. Chạy cả file bạn sẽ thấy tổng 40 dòng `PASS` và không có `FAIL`.

## Demo code
Mục đích: dùng các hàm vừa viết để kiểm tra dữ liệu thật trên trang bảng người dùng `/lab/table`. Tạo `utils/collections.ts` trong dự án Playwright:

```ts
export function isSortedBy(items: string[], compare: (a: string, b: string) => number): boolean {
  for (let i = 1; i < items.length; i++) {
    if (compare(items[i - 1], items[i]) > 0) return false;
  }
  return true;
}

export function frequency(items: string[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const x of items) {
    freq.set(x, (freq.get(x) ?? 0) + 1);
  }
  return freq;
}
```

Tạo `tests/table-collections.spec.ts`:

```ts
import { test, expect } from "@playwright/test";
import { frequency, isSortedBy } from "../utils/collections";

test("bảng người dùng: tên sắp A đến Z, email không trùng, đếm vai trò", async ({ page }) => {
  await page.goto("/lab/table");
  await page.getByTestId("reset-data").click();
  const rows = page.getByTestId("user-row");
  await expect(rows).toHaveCount(10);

  const names = await rows.locator("td:nth-child(2)").allInnerTexts();
  const emails = await rows.locator("td:nth-child(3)").allInnerTexts();
  const roles = await rows.locator("td:nth-child(4)").allInnerTexts();

  expect(isSortedBy(names, (a, b) => a.localeCompare(b, "vi"))).toBe(true);
  expect(new Set(emails).size).toBe(emails.length);
  expect(Object.fromEntries(frequency(roles))).toEqual({ Editor: 3, Viewer: 4, Admin: 3 });
});
```

Giải thích từng phần:

- `rows.locator("td:nth-child(2)")` lấy ô thứ hai (cột Tên) trong mỗi dòng, vì ô đầu là hộp chọn. Tương tự cột 3 là email và cột 4 là vai trò.
- `allInnerTexts()` trả mảng chuỗi, mỗi phần tử là chữ của một ô, đúng dạng đầu vào của các hàm ở trên. Phải gọi sau khi `toHaveCount(10)` đã đảm bảo bảng tải xong.
- `isSortedBy` kiểm tra tên đã sắp tăng theo quy tắc tiếng Việt (bước 3).
- `new Set(emails).size === emails.length` là cách ngắn nhất để khẳng định "không có phần tử trùng" (bước 1 và 7): nếu có trùng thì `Set` ngắn hơn mảng.
- `frequency` đếm số người theo vai trò (bước 6). Dữ liệu mẫu của lab là cố định nên trang đầu có 3 Editor, 4 Viewer, 3 Admin.

Chạy:

```bash
npx playwright test tests/table-collections.spec.ts
```

Kết quả mong đợi: một test xanh. Nếu `toHaveCount(10)` thất bại, trang chưa nạp xong hoặc bạn đã đổi số dòng mỗi trang; nếu `toEqual` thất bại, in `roles` ra bằng `console.log` để so với dữ liệu thật.

## Thử ngay trong lab
Mở `/lab/table`, bấm tiêu đề cột "Tên" để đổi chiều sắp xếp rồi chạy lại đoạn kiểm tra sắp xếp theo chiều giảm (đổi `isSortedBy` thành đảo dấu hàm so sánh). Sau đó chuyển sang trang kế và thử khẳng định "email không trùng" cho **toàn bộ** 37 người dùng: bạn sẽ phải gom dữ liệu qua bốn trang rồi mới đưa vào `Set`.

## Lỗi thường gặp
- **Triệu chứng:** `[10, 9, 1].sort()` ra `[1, 10, 9]`. **Nguyên nhân:** `sort` mặc định so sánh như chuỗi. **Cách sửa:** truyền hàm so sánh `(a, b) => a - b`.
- **Triệu chứng:** mảng gốc bỗng đổi thứ tự sau khi bạn sắp xếp để kiểm tra. **Nguyên nhân:** `sort` và `reverse` thay đổi mảng tại chỗ. **Cách sửa:** sao chép bằng `[...mang]` trước.
- **Triệu chứng:** `twoSum` bỏ sót đáp án khi cặp có phần tử ở chỉ số 0. **Nguyên nhân:** viết `if (j)` thay vì `if (j !== undefined)`; chỉ số 0 là falsy. **Cách sửa:** so sánh rõ với `undefined`.
- **Triệu chứng:** `new Set(arrayOfObjects)` không loại được các object "giống nhau". **Nguyên nhân:** `Set` so sánh object theo tham chiếu, hai object khác nhau luôn là hai phần tử. **Cách sửa:** dùng `Set` chứa khoá (`uniqueBy`), hoặc đổi object thành chuỗi khoá như `` `${a}-${b}` ``.
- **Triệu chứng:** `check` in `FAIL` kèm `{}` cho `Map` hoặc `Set`. **Nguyên nhân:** `JSON.stringify` không đọc được hai kiểu này. **Cách sửa:** `Object.fromEntries(map)` hoặc `[...set]` trước khi so sánh.
- **Triệu chứng:** TypeScript báo `Property 'groupBy' does not exist on type 'ObjectConstructor'`. **Nguyên nhân:** `lib` của `tsconfig` chưa đủ mới (target `ES2022`). **Cách sửa:** tự viết hàm `groupBy` như bước 8, hoặc nâng `lib` và Node tương ứng.
- **Triệu chứng:** `maxOf` trả sai khi toàn số âm. **Nguyên nhân:** khởi tạo `max = 0`. **Cách sửa:** khởi tạo bằng phần tử đầu tiên và kiểm tra mảng rỗng trước.

## Tóm tắt
- Mô-típ chính: thay vòng lặp lồng nhau (O(n²)) bằng `Set` hoặc `Map` để tra nhanh, đổi thêm bộ nhớ lấy tốc độ chạy.
- `Set` cho "đã gặp chưa" và loại trùng; `Map` cho đếm tần suất, nhóm theo khoá và ghi nhớ chỉ số (two sum).
- `sort` mặc định so sánh như chuỗi và thay đổi mảng gốc: luôn truyền hàm so sánh và sao chép trước khi sắp xếp nếu cần giữ bản gốc.
- Hai con trỏ giải gọn các bài đảo mảng tại chỗ và gộp hai mảng đã sắp.
- Ca biên của mảng: rỗng, một phần tử, toàn phần tử bằng nhau, số âm, chỉ số 0 (falsy).
- Trong test Playwright, `allInnerTexts()` kết hợp với các hàm này kiểm tra được thứ tự, trùng lặp và thống kê dữ liệu trên trang.

## Bài tập
1. Viết `minOf` và `maxOf` dùng một hàm chung `extreme(nums, better)` với `better` là hàm so sánh hai số. Xong khi hai hàm cũ chỉ còn một dòng gọi `extreme` và 4 dòng `check` cũ vẫn `PASS`.
2. Viết `sumOf(nums)` bằng `reduce` và `average(nums)` trả `undefined` cho mảng rỗng. Xong khi có ca thử mảng rỗng, một phần tử và số âm.
3. Viết `removeValue(nums, value)` xoá mọi phần tử bằng `value` **không** dùng `filter` mà dùng hai con trỏ ghi đè tại chỗ rồi cắt `length`. Xong khi bạn giải thích được vì sao độ phức tạp bộ nhớ là O(1).
4. Viết `commonElements(a, b)` trả mảng các phần tử có mặt ở cả hai mảng (mỗi phần tử một lần), dùng `Set`. Xong khi bạn so sánh được bản dùng `Set` với bản dùng `includes` về độ phức tạp.
5. Viết `topK(items, k)` trả `k` giá trị xuất hiện nhiều nhất bằng `frequency` rồi sắp xếp các cặp. Xong khi `topK(["a","b","a","c","b","a"], 2)` trả `["a", "b"]`.
6. Thử thách: viết test Playwright trên `/lab/table` thu email của cả 37 người dùng (lặp qua các trang bằng nút "Trang sau") rồi khẳng định không trùng bằng `Set`. Xong khi test xanh và đếm đúng 37 email.
