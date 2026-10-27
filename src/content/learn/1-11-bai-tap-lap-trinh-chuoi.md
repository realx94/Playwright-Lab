---
title: "Bài tập lập trình cho QA: xử lý chuỗi"
level: 1
order: 11
minutes: 90
summary: Bảy bài toán chuỗi hay gặp khi phỏng vấn QA automation (đảo chuỗi, palindrome, đếm, anagram, ký tự lặp, loại trùng, ngoặc cân bằng) viết bằng TypeScript và gắn với việc chuẩn hoá text trên trang.
keywords: [bài tập lập trình QA, xử lý chuỗi typescript, phỏng vấn automation tester, palindrome, anagram, kiểm tra ngoặc cân bằng]
---

## Mục tiêu bài học
- Giải được bảy bài toán chuỗi kinh điển: đảo chuỗi, palindrome, đếm ký tự và từ, anagram, ký tự lặp đầu tiên, loại ký tự trùng, kiểm tra dấu ngoặc cân bằng.
- Với mỗi bài, nói được **cách nghĩ** trước khi viết code và tính được **độ phức tạp** ở mức đủ để trả lời phỏng vấn (O(n), O(n log n), O(1) bộ nhớ hay O(n) bộ nhớ).
- Tự viết các ca kiểm tra bằng `console.log`, gồm cả ca biên: chuỗi rỗng, một ký tự, hoa thường lẫn lộn, ký tự đặc biệt.
- Dùng hàm chuẩn hoá chuỗi trước khi so sánh text trên trang web trong test Playwright, thay vì so sánh trực tiếp và bị đỏ vì một khoảng trắng thừa.

## Bạn cần chuẩn bị
- Đã làm bài 1.5 đến 1.9: có thư mục `thuc-hanh-js` với `tsx` và `tsconfig.json`. Mỗi bước dưới đây tạo hoặc sửa một file và chạy bằng `npx tsx <tên file>` trong thư mục đó.
- Nắm cú pháp vòng lặp `for`, `for...of`, hàm có kiểu tham số và kiểu trả về (bài 1.6, 1.8, 1.9).
- Phần "Demo code" cuối bài cần dự án Playwright của bài 0.3 và lab đang chạy; phần này tuỳ chọn.

## Kiến thức cần nắm
- **Chuỗi** (string) trong JavaScript đọc được theo chỉ số (`s[0]`), lặp được bằng `for...of`, và **bất biến** (immutable): mọi thao tác "sửa" đều tạo ra chuỗi mới.
- **Độ phức tạp thời gian** cho biết số bước chạy tăng thế nào khi chuỗi dài ra: O(n) là một lượt duyệt, O(n log n) là có sắp xếp, O(n²) là hai vòng lặp lồng nhau.
- **Độ phức tạp bộ nhớ** cho biết lời giải dùng thêm bao nhiêu chỗ nhớ phụ ngoài dữ liệu đầu vào.
- **Ca biên** (edge case): chuỗi rỗng, một ký tự, toàn khoảng trắng, hoa thường, ký tự có dấu.
- Ba "công cụ" lặp đi lặp lại trong bài này: hai con trỏ (đi từ hai đầu vào giữa), `Map` đếm tần suất, `Set` ghi nhớ "đã gặp".

## Giải thích dễ hiểu
Phỏng vấn QA automation thường có một vòng "viết code" ngắn. Người phỏng vấn không cần bạn thuộc thuật toán cao siêu; họ muốn biết bạn có **suy nghĩ có hệ thống** khi gặp một bài toán nhỏ không: hiểu đề, hỏi lại ca biên, chọn cách làm hợp lý, viết code gọn, tự kiểm tra bằng vài ca thử. Đó cũng đúng là kỹ năng bạn dùng hằng ngày khi viết test: chữ lấy từ trang web hiếm khi sạch (thừa khoảng trắng, xuống dòng, khác hoa thường), và bạn phải xử lý chuỗi trước khi `expect`.

Một quy trình năm bước dùng cho mọi bài trong này:

1. **Đọc đề và hỏi lại**: đầu vào là gì, có phân biệt hoa thường không, chuỗi rỗng trả về gì?
2. **Nêu ví dụ tay**: viết 2 đến 3 ví dụ vào và ra bằng giấy trước khi gõ code.
3. **Chọn cách nghĩ**: duyệt một lượt, hai con trỏ, hay dùng `Map`/`Set`? Nói to lý do.
4. **Viết code**, đặt tên biến có nghĩa, hàm có kiểu rõ ràng.
5. **Tự kiểm tra** bằng `console.log` với ca thường, ca biên, ca sai. Cuối cùng nêu độ phức tạp.

Về độ phức tạp, hãy hình dung bạn đếm số bước. Duyệt một chuỗi dài n ký tự đúng một lần là n bước, ký hiệu O(n). Nếu với mỗi ký tự lại duyệt cả chuỗi để so sánh thì n nhân n bước, ký hiệu O(n²), chậm rất nhanh khi n lớn. `Map` và `Set` cho phép hỏi "ký tự này đã gặp chưa?" trong khoảng một bước (O(1)), nhờ vậy nhiều bài từ O(n²) rút xuống O(n), đổi lại tốn thêm bộ nhớ.

## Thực hành từng bước
Tạo file `thuc-hanh-js/b11-chuoi.ts` và **dán nối tiếp** mọi đoạn ở các bước dưới vào cùng file này (mỗi đoạn đứng độc lập, không trùng tên hàm). Ở đầu file, dán hàm `check` ở Bước 0. Cuối mỗi bước bạn chạy `npx tsx b11-chuoi.ts` và thấy thêm các dòng `PASS` tương ứng.

### Bước 0. Hàm `check` để tự kiểm tra bằng `console.log`
Mục đích: có một công cụ nhỏ in ra `PASS` hoặc `FAIL` thay vì phải đọc kết quả bằng mắt.

```ts
function check(name: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) console.log("  mong đợi:", expected, "nhận được:", actual);
}
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `check(name, actual, expected)` | Ba tham số: tên ca thử, kết quả thật, kết quả mong đợi. `unknown` nghĩa là chấp nhận mọi kiểu. |
| `JSON.stringify(actual) === JSON.stringify(expected)` | So sánh hai giá trị bằng cách đổi cả hai ra chuỗi JSON. Cách này đủ cho chuỗi, số, mảng, object đơn giản (không dùng cho `Map`, `Set`). |
| `console.log(...)` | In `PASS` hoặc `FAIL` kèm tên ca. Nếu sai, in thêm giá trị mong đợi và giá trị nhận được để bạn thấy ngay chỗ lệch. |

Kết quả mong đợi: chưa in gì vì chưa gọi `check`. Đây chính là phiên bản mini của `expect(...).toBe(...)` mà bạn sẽ dùng trong Playwright.

### Bước 1. Chuẩn hoá chuỗi trước khi so sánh
Mục đích: viết hàm `normalizeText`, dùng lại ở nhiều bài sau và trong test thật. Đề: gộp mọi cụm khoảng trắng, xuống dòng, tab thành đúng một dấu cách và cắt hai đầu.

```ts
function normalizeText(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}
check("chuẩn hoá khoảng trắng", normalizeText("  Tổng   tiền:\n 450.000 đ "), "Tổng tiền: 450.000 đ");
check("chuỗi rỗng", normalizeText("   "), "");
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `s.replace(/\s+/g, " ")` | `/\s+/g` là biểu thức chính quy: `\s` là một ký tự trắng (dấu cách, tab, xuống dòng), `+` là "một hay nhiều lần liên tiếp", `g` là thay **mọi** chỗ khớp chứ không chỉ chỗ đầu tiên. Mọi cụm trắng bị đổi thành một dấu cách. |
| `.trim()` | Cắt khoảng trắng ở đầu và cuối chuỗi. |

Cách nghĩ: chữ trên trang qua `innerText` có thể mang theo xuống dòng và dấu cách thừa do cách bố trí giao diện. Chuẩn hoá cả hai vế trước khi so sánh giúp test không đỏ vì chuyện trình bày. Độ phức tạp: O(n) thời gian, O(n) bộ nhớ (chuỗi mới).

Kết quả mong đợi khi chạy:

```text
PASS  chuẩn hoá khoảng trắng
PASS  chuỗi rỗng
```

### Bước 2. Đảo chuỗi
Đề: nhận `"abc"` trả về `"cba"`. Tên gọi quen thuộc trong phỏng vấn: *reverse a string*.

Cách nghĩ: ký tự cuối thành ký tự đầu. Duyệt từ chỉ số cuối về 0 và nối từng ký tự vào kết quả. Nên hỏi lại: chuỗi rỗng trả về gì (chuỗi rỗng).

```ts
function reverseString(s: string): string {
  let result = "";
  for (let i = s.length - 1; i >= 0; i--) {
    result += s[i];
  }
  return result;
}
check("đảo abc", reverseString("abc"), "cba");
check("đảo chuỗi rỗng", reverseString(""), "");
check("đảo 1 ký tự", reverseString("a"), "a");
check("đảo có khoảng trắng", reverseString("a b"), "b a");
check("cách ngắn gọn", [..."QA"].reverse().join(""), "AQ");
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `let result = ""` | Chuỗi kết quả, bắt đầu rỗng. |
| `let i = s.length - 1` | Bắt đầu từ chỉ số của ký tự cuối. Chuỗi n ký tự có chỉ số 0 đến n - 1. |
| `i >= 0; i--` | Chạy lùi đến hết chỉ số 0. |
| `result += s[i]` | Nối ký tự ở vị trí `i` vào cuối kết quả. |
| `[..."QA"].reverse().join("")` | Cách ngắn: dải chuỗi thành mảng ký tự (`...`), đảo mảng (`reverse`), nối lại (`join`). Khi phỏng vấn nên viết bản vòng lặp trước để cho thấy bạn hiểu, rồi nhắc bản ngắn. |

Độ phức tạp: O(n) thời gian; O(n) bộ nhớ vì tạo chuỗi mới (chuỗi bất biến nên không thể đảo "tại chỗ"). Lưu ý nhỏ: `s[i]` đọc theo "đơn vị mã" UTF-16 nên với biểu tượng cảm xúc (một ký tự nhìn thấy nhưng chiếm hai đơn vị) kết quả bị vỡ; bản `[...s]` và `for...of` duyệt theo ký tự thật nên an toàn hơn. Với bài phỏng vấn thông thường, nêu ra điều này đã là điểm cộng.

Kết quả mong đợi: thêm 5 dòng `PASS`.

### Bước 3. Palindrome
Đề: kiểm tra chuỗi đọc xuôi và ngược giống nhau, bỏ qua hoa thường và dấu câu. `"racecar"` đúng, `"A man, a plan, a canal: Panama"` đúng, `"playwright"` sai.

Cách nghĩ: **hai con trỏ**. Một con trỏ ở đầu, một ở cuối, so sánh rồi cùng tiến vào giữa; gặp cặp khác nhau thì kết luận sai ngay. Trước đó phải làm sạch chuỗi: về chữ thường và bỏ ký tự không phải chữ cái hay chữ số.

```ts
function isPalindrome(s: string): boolean {
  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, "");
  let left = 0;
  let right = cleaned.length - 1;
  while (left < right) {
    if (cleaned[left] !== cleaned[right]) return false;
    left++;
    right--;
  }
  return true;
}
check("racecar", isPalindrome("racecar"), true);
check("câu có dấu câu", isPalindrome("A man, a plan, a canal: Panama"), true);
check("playwright", isPalindrome("playwright"), false);
check("rỗng", isPalindrome(""), true);
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `toLowerCase()` | Đưa về chữ thường để `A` và `a` coi như nhau. |
| `.replace(/[^a-z0-9]/g, "")` | `[^a-z0-9]` nghĩa là "mọi ký tự **không** thuộc a đến z hay 0 đến 9"; thay bằng chuỗi rỗng tức là xoá. Lưu ý: chữ có dấu tiếng Việt cũng bị xoá, nên bản này chỉ hợp với chuỗi tiếng Anh; xem bài tập 5. |
| `left`, `right` | Hai con trỏ ở đầu và cuối. |
| `while (left < right)` | Chạy đến khi hai con trỏ gặp nhau hoặc vượt nhau. Khi gặp nhau ở giữa thì không cần so sánh một ký tự với chính nó. |
| `return false` | Một cặp khác nhau là đủ để kết luận sai, không cần xét tiếp. |
| `return true` | Qua hết vòng lặp mà không có cặp nào khác nhau. Chuỗi rỗng cũng trả `true`: không có cặp nào để vi phạm. |

Độ phức tạp: O(n) thời gian; O(n) bộ nhớ cho chuỗi đã làm sạch (phần so sánh chỉ cần O(1)). Ca biên nên thử: chuỗi rỗng, một ký tự, độ dài chẵn và lẻ.

Kết quả mong đợi: thêm 4 dòng `PASS`.

### Bước 4. Đếm ký tự, đếm từ, bảng tần suất
Đề: (a) đếm một ký tự xuất hiện bao nhiêu lần, (b) đếm số từ trong câu, (c) lập bảng "ký tự và số lần xuất hiện".

Cách nghĩ: (a) duyệt một lượt và tăng biến đếm. (b) từ là các cụm chữ cách nhau bởi khoảng trắng; cắt hai đầu rồi `split` theo cụm khoảng trắng, nhưng chuỗi toàn khoảng trắng phải trả 0. (c) dùng `Map` làm bảng đếm: gặp ký tự thì cộng một vào ô của nó.

```ts
function countChar(s: string, ch: string): number {
  let count = 0;
  for (const c of s) {
    if (c === ch) count++;
  }
  return count;
}
function countWords(s: string): number {
  const trimmed = s.trim();
  if (trimmed === "") return 0;
  return trimmed.split(/\s+/).length;
}
function charFrequency(s: string): Map<string, number> {
  const freq = new Map<string, number>();
  for (const c of s) {
    freq.set(c, (freq.get(c) ?? 0) + 1);
  }
  return freq;
}
check("đếm chữ a", countChar("banana", "a"), 3);
check("đếm ký tự vắng mặt", countChar("banana", "z"), 0);
check("đếm từ", countWords("  xin   chào  QA "), 3);
check("đếm từ chuỗi trắng", countWords("   "), 0);
check("tần suất", Object.fromEntries(charFrequency("hello")), { h: 1, e: 1, l: 2, o: 1 });
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `for (const c of s)` | Duyệt từng ký tự của chuỗi, không cần quản lý chỉ số. |
| `if (trimmed === "") return 0` | Lý do phải chặn riêng: `"".split(/\s+/)` trả về `[""]`, một mảng có **một** phần tử rỗng, nên độ dài là 1 chứ không phải 0. Đây là bẫy phổ biến. |
| `trimmed.split(/\s+/)` | Cắt chuỗi tại mỗi cụm khoảng trắng. Dùng `/\s+/` thay vì `" "` để nhiều dấu cách liền nhau không sinh ra phần tử rỗng. |
| `new Map<string, number>()` | Bảng khoá là ký tự, giá trị là số lần. |
| `freq.get(c) ?? 0` | Lấy số lần hiện tại; chưa có thì `get` trả `undefined`, toán tử `??` thay bằng 0. |
| `freq.set(c, ... + 1)` | Ghi lại số lần mới. |
| `Object.fromEntries(map)` | Đổi `Map` sang object thường để `check` so sánh được qua JSON. |

Độ phức tạp: (a) O(n) thời gian, O(1) bộ nhớ. (b) O(n) và O(n) vì mảng các từ. (c) O(n) thời gian, O(k) bộ nhớ với k là số ký tự khác nhau.

Gắn với QA: đếm từ giúp kiểm tra giới hạn "tối đa 100 từ" của một ô mô tả; bảng tần suất hữu ích khi so khớp nội dung hai báo cáo hoặc kiểm tra mật khẩu có đủ loại ký tự.

Kết quả mong đợi: thêm 5 dòng `PASS`.

### Bước 5. Anagram
Đề: hai chuỗi là **anagram** nếu cùng bộ chữ cái với cùng số lần, chỉ khác thứ tự. `"listen"` và `"silent"` đúng; `"abc"` và `"abd"` sai; `"aab"` và `"abb"` sai (cùng chữ nhưng khác số lần).

Cách nghĩ: có hai hướng. Hướng 1: sắp xếp chữ của hai chuỗi rồi so sánh, O(n log n), viết rất ngắn. Hướng 2: đếm tần suất chuỗi thứ nhất bằng `Map`, rồi **trừ dần** theo chuỗi thứ hai; gặp ký tự không còn lượt thì sai. Hướng 2 là O(n). Chuẩn hoá trước: chữ thường, bỏ khoảng trắng.

```ts
function isAnagram(a: string, b: string): boolean {
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, "");
  const x = norm(a);
  const y = norm(b);
  if (x.length !== y.length) return false;

  const counts = new Map<string, number>();
  for (const c of x) counts.set(c, (counts.get(c) ?? 0) + 1);
  for (const c of y) {
    const n = counts.get(c);
    if (!n) return false;
    counts.set(c, n - 1);
  }
  return true;
}
check("listen/silent", isAnagram("listen", "silent"), true);
check("có khoảng trắng và hoa", isAnagram("Dormitory", "dirty room"), true);
check("khác chữ", isAnagram("abc", "abd"), false);
check("cùng chữ khác số lần", isAnagram("aab", "abb"), false);
check("cách sort", [..."listen"].sort().join("") === [..."silent"].sort().join(""), true);
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `const norm = (s: string) => ...` | Hàm nhỏ khai báo ngay trong hàm, dùng cho cả hai chuỗi để chuẩn hoá giống nhau. |
| `if (x.length !== y.length) return false` | Độ dài khác nhau thì chắc chắn không phải anagram; thoát sớm cho nhanh. |
| `counts` | Bảng đếm của chuỗi thứ nhất. |
| `const n = counts.get(c); if (!n) return false` | Với mỗi ký tự của chuỗi thứ hai: không có trong bảng (`undefined`) hoặc đã về 0 thì chuỗi thứ hai có thừa ký tự, trả `false`. |
| `counts.set(c, n - 1)` | Dùng đi một lượt của ký tự đó. |
| `return true` | Vì hai chuỗi cùng độ dài và không ký tự nào bị thừa, mọi lượt đã được trừ hết. |
| Dòng "cách sort" | `[...s].sort()` sắp xếp các ký tự theo thứ tự chữ cái rồi `join`; hai chuỗi anagram sẽ cho cùng kết quả. O(n log n). |

Độ phức tạp: bản `Map` là O(n) thời gian và O(k) bộ nhớ; bản sắp xếp là O(n log n). Trả lời phỏng vấn tốt: nêu cả hai, chọn bản `Map` khi chuỗi dài.

Gắn với QA: kiểm tra danh sách tag hoặc từ khoá sau khi hệ thống đổi thứ tự hiển thị, nội dung có "cùng bộ" nhưng không nên so sánh theo thứ tự.

Kết quả mong đợi: thêm 5 dòng `PASS`.

### Bước 6. Ký tự lặp đầu tiên và ký tự duy nhất đầu tiên
Đề: (a) trả về ký tự đầu tiên **xuất hiện lần thứ hai** khi đọc từ trái sang (`"abcdba"` trả `"b"`); (b) trả về ký tự đầu tiên **chỉ xuất hiện đúng một lần** (`"swiss"` trả `"w"`). Không có thì trả `null`.

Cách nghĩ: (a) dùng `Set` ghi nhớ ký tự đã gặp; gặp ký tự đã có trong `Set` thì đó là đáp án. Một lượt duyệt. (b) hai lượt: lượt 1 đếm tần suất, lượt 2 đi lại từ đầu tìm ký tự có tần suất bằng 1. Thứ tự "đầu tiên" lấy theo vị trí trong chuỗi nên lượt 2 phải duyệt chuỗi gốc, không duyệt `Map`.

```ts
function firstRepeatedChar(s: string): string | null {
  const seen = new Set<string>();
  for (const c of s) {
    if (seen.has(c)) return c;
    seen.add(c);
  }
  return null;
}
function firstUniqueChar(s: string): string | null {
  const freq = new Map<string, number>();
  for (const c of s) freq.set(c, (freq.get(c) ?? 0) + 1);
  for (const c of s) {
    if (freq.get(c) === 1) return c;
  }
  return null;
}
check("lặp đầu tiên", firstRepeatedChar("abcdba"), "b");
check("không có ký tự lặp", firstRepeatedChar("abc"), null);
check("duy nhất đầu tiên", firstUniqueChar("swiss"), "w");
check("không có ký tự duy nhất", firstUniqueChar("aabb"), null);
```

| Phần code | Ý nghĩa |
|-----------|---------|
| Kiểu trả về `string` hoặc `null` | Viết là `string`, dấu gạch đứng, `null` (kiểu hợp, bài 1.9): hoặc là một ký tự, hoặc `null` khi không có. TypeScript buộc người gọi xử lý trường hợp `null`. |
| `new Set<string>()` | Tập hợp các ký tự đã gặp, không chứa phần tử trùng. |
| `seen.has(c)` | Hỏi "đã gặp `c` chưa?", trả lời trong khoảng một bước. |
| `seen.add(c)` | Ghi nhớ đã gặp. |
| `freq.get(c) === 1` | Ký tự chỉ xuất hiện đúng một lần trong toàn chuỗi. |

Độ phức tạp: cả hai là O(n) thời gian, O(k) bộ nhớ. Nếu không dùng `Set`/`Map` mà so từng cặp thì O(n²); đây là lý do `Set` được nhắc đến liên tục khi phỏng vấn.

Gắn với QA: tìm giá trị bị lặp trong cột "mã đơn hàng" lẽ ra phải duy nhất; ký tự lặp ở đây là minh hoạ nhỏ của bài toán "phát hiện trùng" (bài 1.12 làm với mảng).

Kết quả mong đợi: thêm 4 dòng `PASS`.

### Bước 7. Loại ký tự trùng, giữ thứ tự xuất hiện
Đề: `"programming"` thành `"progamin"` (giữ lần xuất hiện đầu tiên của mỗi ký tự).

Cách nghĩ: duyệt một lượt; ký tự nào chưa có trong `Set` thì thêm vào `Set` và nối vào kết quả.

```ts
function removeDuplicateChars(s: string): string {
  const seen = new Set<string>();
  let result = "";
  for (const c of s) {
    if (!seen.has(c)) {
      seen.add(c);
      result += c;
    }
  }
  return result;
}
check("loại trùng", removeDuplicateChars("programming"), "progamin");
check("cách Set", [...new Set("programming")].join(""), "progamin");
check("rỗng", removeDuplicateChars(""), "");
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `!seen.has(c)` | Chỉ xử lý ký tự **chưa** gặp. |
| `result += c` | Nối ký tự vào kết quả theo đúng thứ tự gặp. |
| `[...new Set("programming")].join("")` | Cách ngắn: `Set` tự loại trùng và giữ thứ tự thêm vào; dải ra mảng rồi nối lại. |

Độ phức tạp: O(n) thời gian, O(k) bộ nhớ. Không nên viết bằng `result.includes(c)` trong vòng lặp: mỗi lần `includes` lại duyệt kết quả nên tổng thể O(n²) (vẫn đúng, chỉ chậm).

Kết quả mong đợi: thêm 3 dòng `PASS`.

### Bước 8. Kiểm tra dấu ngoặc cân bằng
Đề: chuỗi chứa `()`, `[]`, `{}` có **cân bằng** không: mỗi ngoặc mở có ngoặc đóng cùng loại, đúng thứ tự lồng nhau. `"{[()]}"` đúng; `"{[(])}"` sai (đóng sai thứ tự); `"(("` sai (thiếu đóng); `"))"` sai (thừa đóng).

Cách nghĩ: ngoặc mở gần nhất phải được đóng trước, giống chồng đĩa: đĩa đặt sau lấy ra trước. Cấu trúc đó là **stack** (ngăn xếp). Gặp ngoặc mở thì đẩy vào stack. Gặp ngoặc đóng thì lấy đỉnh stack ra, phải đúng là ngoặc mở tương ứng. Hết chuỗi mà stack còn phần tử thì còn ngoặc mở chưa đóng. Trong JavaScript, stack chính là mảng với `push` và `pop`.

```ts
function isBalanced(s: string): boolean {
  const pairs: Record<string, string> = { ")": "(", "]": "[", "}": "{" };
  const stack: string[] = [];
  for (const c of s) {
    if (c === "(" || c === "[" || c === "{") {
      stack.push(c);
    } else if (c in pairs) {
      if (stack.pop() !== pairs[c]) return false;
    }
  }
  return stack.length === 0;
}
check("cân bằng", isBalanced("{[()]}"), true);
check("đóng sai thứ tự", isBalanced("{[(])}"), false);
check("thiếu ngoặc đóng", isBalanced("(("), false);
check("thừa ngoặc đóng", isBalanced("))"), false);
check("rỗng", isBalanced(""), true);
check("có chữ xen kẽ", isBalanced("a(b)c"), true);
check("JSON hợp lệ", isBalanced('{"a":[1,2,{"b":3}]}'), true);
```

| Phần code | Ý nghĩa |
|-----------|---------|
| `pairs` | Bảng tra: ngoặc đóng ánh xạ về ngoặc mở tương ứng. |
| `stack.push(c)` | Đẩy ngoặc mở lên đỉnh stack. |
| `c in pairs` | Đúng khi `c` là một trong ba ngoặc đóng; các ký tự khác (chữ, số, dấu phẩy) được bỏ qua. |
| `stack.pop()` | Lấy và bỏ phần tử ở đỉnh; stack rỗng thì trả `undefined`, khác mọi ngoặc mở nên rơi vào `return false` (ca `"))"`). |
| `stack.length === 0` | Cuối chuỗi, stack phải rỗng, nếu không là thiếu ngoặc đóng (ca `"(("`). |

Độ phức tạp: O(n) thời gian, O(n) bộ nhớ trong trường hợp xấu nhất (toàn ngoặc mở).

Gắn với QA: kiểm tra một chuỗi JSON hoặc biểu thức công thức do người dùng nhập có đóng mở đủ không; ý tưởng stack cũng nằm sau việc trình duyệt kiểm tra thẻ HTML lồng nhau.

Kết quả mong đợi: thêm 7 dòng `PASS`. Chạy cả file bạn sẽ thấy tổng cộng 35 dòng `PASS` và không có `FAIL`. Dòng đầu và dòng cuối:

```text
PASS  chuẩn hoá khoảng trắng
...
PASS  JSON hợp lệ
```

## Demo code
Mục đích: dùng ngay `normalizeText` và một hàm đổi tiền thành số trong test Playwright trên lab của site. Chữ trên trang ví dụ `"300.000đ"` là chuỗi, cần đổi thành số 300000 trước khi so sánh.

Tạo `utils/strings.ts` trong dự án Playwright:

```ts
export function normalizeText(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

/** "300.000đ" thành 300000; giữ dấu trừ nếu có. */
export function parseMoney(s: string): number {
  return Number(s.replace(/[^\d-]/g, ""));
}
```

Tạo `tests/string-utils.spec.ts`:

```ts
import { test, expect } from "@playwright/test";
import { normalizeText, parseMoney } from "../utils/strings";

test("lời chào sau đăng nhập, bỏ qua khoảng trắng thừa", async ({ page }) => {
  await page.goto("/lab/login");
  await page.getByLabel("Email").fill("user@lab.dev");
  await page.getByLabel("Mật khẩu").fill("Passw0rd!");
  await page.getByRole("button", { name: "Đăng nhập" }).click();

  const raw = await page.getByRole("heading", { level: 2 }).innerText();
  expect(normalizeText(raw)).toBe("Chào mừng, user@lab.dev");
});

test("tổng tiền đổi thành số để so sánh", async ({ page }) => {
  await page.goto("/lab/cart");
  await page.getByTestId("reset-data").click();
  await page.getByTestId("product-p2").getByRole("button", { name: "Thêm vào giỏ" }).click();

  const raw = await page.getByTestId("total").innerText();
  expect(parseMoney(raw)).toBe(300_000);
});
```

Giải thích: test đầu lấy chữ của tiêu đề cấp 2 (`innerText` trả về chữ như người dùng thấy) rồi chuẩn hoá và so sánh. Test sau lấy chuỗi tổng tiền, `parseMoney` xoá mọi ký tự không phải chữ số hoặc dấu trừ (`[^\d-]`) rồi đổi sang số; số 300.000 là tổng của một sản phẩm 250.000 cộng phí ship 30.000 và VAT 8% theo quy tắc của lab giỏ hàng. Chạy:

```bash
npx playwright test tests/string-utils.spec.ts
```

Kết quả mong đợi: hai test xanh. Nếu thấy `net::ERR_CONNECTION_REFUSED`, site lab chưa chạy hoặc `BASE_URL` sai (xem bài 0.3).

## Thử ngay trong lab
Mở `/lab/cart`, thêm vài sản phẩm và đọc các con số tiền (tạm tính, ship, VAT, tổng) trong DevTools bằng `$0.innerText`. Hãy thử viết `parseMoney` chịu được số có dấu chấm ngăn cách hàng nghìn, và nghĩ xem điều gì xảy ra nếu giao diện đổi sang định dạng `1,234.50`: hàm bỏ mất dấu thập phân. Đây là ca biên thật mà QA phải nêu ra khi xử lý tiền.

## Lỗi thường gặp
- **Triệu chứng:** `countWords("")` trả 1 thay vì 0. **Nguyên nhân:** `"".split(/\s+/)` cho mảng một phần tử rỗng. **Cách sửa:** `trim()` rồi kiểm tra `=== ""` trước khi `split`.
- **Triệu chứng:** `isPalindrome("Madam")` trả `false`. **Nguyên nhân:** quên đưa về chữ thường nên `M` khác `m`. **Cách sửa:** `toLowerCase()` trước khi so sánh.
- **Triệu chứng:** thông báo TypeScript `'string | null' is not assignable to type 'string'` khi gán kết quả của `firstRepeatedChar` vào biến kiểu `string`. **Nguyên nhân:** hàm có thể trả `null`. **Cách sửa:** kiểm tra `null` trước (`if (result !== null)`) hoặc khai báo biến kiểu `string | null`.
- **Triệu chứng:** `expect(await locator.innerText()).toBe("Tổng tiền: 450.000 đ")` đỏ dù nhìn trên màn hình giống hệt. **Nguyên nhân:** `innerText` có xuống dòng hoặc dấu cách thừa, hoặc ký tự cách không ngắt (non-breaking space, mã `\u00A0`). **Cách sửa:** chuẩn hoá bằng `normalizeText` (biểu thức `\s` cũng khớp `\u00A0`), hoặc dùng `toHaveText` với chuỗi vì nó tự chuẩn hoá khoảng trắng.
- **Triệu chứng:** vòng lặp đảo chuỗi chạy sai hoặc `s[-1]` ra `undefined`. **Nguyên nhân:** chỉ số bắt đầu từ `s.length` (ngoài giới hạn) thay vì `s.length - 1`. **Cách sửa:** chuỗi n ký tự có chỉ số cuối là n - 1.
- **Triệu chứng:** `check` in `FAIL` với `Map` hoặc `Set` dù nội dung đúng. **Nguyên nhân:** `JSON.stringify` biến `Map` và `Set` thành `{}`. **Cách sửa:** đổi sang object hoặc mảng trước (`Object.fromEntries`, `[...set]`).

## Tóm tắt
- Mọi bài chuỗi bắt đầu bằng đọc đề, hỏi ca biên và nêu ví dụ tay; code chỉ là bước thứ tư.
- Ba công cụ đáng nhớ: hai con trỏ (palindrome), `Map` đếm tần suất (anagram, ký tự duy nhất), `Set` ghi nhớ đã gặp (ký tự lặp, loại trùng), cộng thêm stack cho bài ngoặc cân bằng.
- `Map` và `Set` đổi bộ nhớ lấy tốc độ: nhiều bài từ O(n²) xuống O(n).
- Chuỗi rỗng, một ký tự, hoa thường và khoảng trắng thừa là các ca biên nên thử trước tiên.
- Trong test thật, chuẩn hoá chữ (`normalizeText`) và đổi tiền thành số (`parseMoney`) trước khi `expect` giúp tránh test đỏ vì chuyện trình bày.

## Bài tập
1. Viết `countVowels(s)` đếm nguyên âm `a e i o u` không phân biệt hoa thường. Xong khi `countVowels("Playwright")` trả 2 và `countVowels("")` trả 0, với ít nhất 4 dòng `check`.
2. Viết `capitalizeWords(s)` đổi chữ cái đầu mỗi từ thành chữ hoa (`"xin chào qa"` thành `"Xin Chào Qa"`), chuẩn hoá khoảng trắng thừa trước. Xong khi chuỗi rỗng và chuỗi có nhiều dấu cách đều cho kết quả đúng.
3. Viết `longestWord(s)` trả từ dài nhất trong câu (nếu hai từ bằng nhau lấy từ đứng trước). Xong khi bạn nêu được độ phức tạp và có ca thử câu rỗng.
4. Viết `isRotation(a, b)` kiểm tra `b` có phải `a` quay vòng không (`"abcde"` và `"cdeab"` đúng). Gợi ý: nối `a + a` rồi tìm `b` trong đó. Xong khi có ca độ dài khác nhau trả `false`.
5. Mở rộng `isPalindrome` để bỏ dấu tiếng Việt trước khi so sánh. Gợi ý: `s.normalize("NFD")` tách dấu thành ký tự riêng (mã từ `̀` đến `ͯ`) để bạn xoá bằng `replace`; chữ `đ` không tách được nên cần thay riêng bằng `d`. Xong khi chuỗi tự nghĩ ra `"Âm mâ"` (không cần nghĩa) cho `true` và bạn giải thích được vì sao.
6. Thử thách: viết test Playwright trên `/lab/table` đọc tên 10 người dùng ở trang đầu bằng `allInnerTexts()`, dùng một hàm bạn viết để kiểm tra không có tên trùng. Xong khi test xanh và bạn dùng `Set` thay vì hai vòng lặp lồng nhau.
