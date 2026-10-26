# Quy tắc viết Quiz

Mục tiêu: người học phải **hiểu** mới trả lời đúng, không đoán được qua hình thức câu chữ.

## Cơ chế chống đoán
| Cơ chế | Cách làm |
|--------|----------|
| Xáo trộn | Mỗi lần làm, thứ tự câu **và** thứ tự đáp án được xáo bằng Fisher–Yates với seed mới (`?seed=n` để cố định khi test) |
| Chọn nhiều đáp án | Tối thiểu 20% số câu là `multi`; phải chọn đúng và đủ mới được điểm, không chấm một phần |
| Câu tình huống | Ưu tiên “Trong tình huống X, nên làm gì?” hơn là hỏi định nghĩa |
| Không nhãn A/B/C | Đáp án hiển thị không kèm chữ cái nên không còn “thói quen chọn C” |
| Giải thích | Sau khi nộp, mỗi câu có giải thích vì sao đúng và vì sao các phương án còn lại sai |

## Quy tắc soạn đáp án
1. 4–5 lựa chọn; đáp án nhiễu phải **hợp lý với người mới** (lỗi hiểu nhầm phổ biến), không được lố bịch.
2. **Độ dài tương đương**: lựa chọn dài nhất không quá 1.5 lần lựa chọn ngắn nhất.
3. Đáp án đúng **không** được hay là dài nhất hay ngắn nhất (≤ 65% số câu).
4. Cấu trúc câu và giọng văn của đáp án đúng và sai phải giống nhau.
5. Cấm cụm làm lộ đáp án: “luôn luôn”, “không bao giờ”, “tất cả các đáp án”, “không đáp án nào”, “cả A và B”.
6. Không đặt đáp án đúng ở cùng vị trí trong dữ liệu gốc (≤ 50% ở vị trí đầu); xáo trộn lúc chạy vẫn là chính.
7. Mỗi câu kiểm tra **một** ý; tránh phủ định kép.
8. Câu multi: số đáp án đúng ≥ 2 và luôn có ít nhất 1 đáp án sai.

## Kiểm tra tự động
`e2e/quiz-bank.spec.ts` chạy trong CI với mọi file `src/content/quiz/*.json`: cấu trúc, cụm lộ đáp án, độ chênh lệch độ dài, thiên hướng dài/ngắn, tỉ lệ câu multi, vị trí đáp án trong dữ liệu gốc. Thêm bài quiz mới mà không đạt sẽ làm CI đỏ.

## Định dạng file
`src/content/quiz/<lesson-slug>.json` với `questions[]`: `id`, `type` (`single|multi`), `prompt`, `options[{id,text}]`, `answer[]`, `explanation`.

## Giới hạn đã biết
Đáp án đúng nằm trong dữ liệu gửi xuống trình duyệt nên người học rành kỹ thuật có thể xem được. Chấp nhận ở giai đoạn này vì quiz là công cụ tự học và không dùng để cấp chứng chỉ. Nếu cần bảo mật, chuyển chấm điểm sang Route Handler.
