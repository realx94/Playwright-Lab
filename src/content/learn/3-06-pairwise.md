---
title: Kiểm thử tổ hợp cặp (Pairwise)
level: 3
order: 6
minutes: 25
summary: Giảm số tổ hợp tham số cần test mà vẫn phủ mọi cặp giá trị.
keywords: [pairwise testing, combinatorial testing, PICT tool]
---

## Mục tiêu bài học
- Hiểu vì sao không thể test mọi tổ hợp.
- Biết dùng pairwise để chọn tập test nhỏ mà hiệu quả.

## Kiến thức cần nắm
- Số tổ hợp tăng **theo cấp số nhân** khi thêm tham số
- Quan sát thực tế: phần lớn lỗi do **một** hoặc **hai** tham số tương tác
- **Pairwise (2-wise)**: mọi cặp giá trị của hai tham số bất kỳ đều xuất hiện ít nhất một lần
- Công cụ: PICT (Microsoft), các trang tạo pairwise trực tuyến
- Phù hợp: form nhiều lựa chọn, cấu hình, trình duyệt × hệ điều hành × ngôn ngữ

## Giải thích dễ hiểu
Một nhà hàng có 3 loại súp, 3 loại món chính, 3 loại tráng miệng, 3 loại đồ uống: có 81 combo. Bạn không cần ăn đủ 81 bữa để biết mọi **cặp** món có hợp nhau không. Chỉ cần chọn ~9–10 bữa sao cho mỗi cặp (súp A + món chính B, món chính B + tráng miệng C…) đều xuất hiện ít nhất một lần.

## Ví dụ: form LAB-02
Tham số:
- Giới tính: Nam, Nữ, Khác (3)
- Quốc gia: Việt Nam, Hoa Kỳ, Nhật Bản (3)
- Nhận bản tin: Có, Không (2)
- Thành phố: Hà Nội, Đà Nẵng, TP. Hồ Chí Minh (3)

Tổng số tổ hợp đầy đủ: 3 × 3 × 2 × 3 = **54**. Với pairwise chỉ cần khoảng **9–10** test, nhưng vẫn phủ mọi cặp như (Nữ, Nhật Bản), (Khác, Có), (Hoa Kỳ, Đà Nẵng)…

## Cách làm
1. Liệt kê tham số và các giá trị (đã dùng EP để rút gọn).
2. Đưa vào công cụ sinh pairwise.
3. Thêm các test bắt buộc (happy path, các biên quan trọng).
4. Chuyển thành dữ liệu cho test data-driven.

```ts
const combos = [
  { gender: "Nam", country: "vn", newsletter: true, city: "Hà Nội" },
  { gender: "Nữ", country: "us", newsletter: false, city: "Đà Nẵng" },
  // ... các tổ hợp do công cụ sinh ra
];

for (const c of combos) {
  test(`gửi form ${c.gender}/${c.country}/${c.city}`, async ({ page }) => {
    // điền form theo c và kiểm tra kết quả
  });
}
```

## Giới hạn
Pairwise **không phát hiện** lỗi chỉ xảy ra khi ba tham số trở lên cùng một tổ hợp cụ thể. Với chức năng rủi ro cao, tăng lên 3-wise hoặc kết hợp decision table.

## Lỗi thường gặp
- Dùng pairwise cho các tham số có ràng buộc phụ thuộc (quốc gia → thành phố) mà không khai báo ràng buộc.
- Quên các tổ hợp “bắt buộc phải test” theo nghiệp vụ.

## Bài tập
1. Sinh tập pairwise cho 4 tham số của form LAB-02 và đếm số test so với 54.
2. Chọn thêm 2 tổ hợp bắt buộc ngoài pairwise và giải thích vì sao.
