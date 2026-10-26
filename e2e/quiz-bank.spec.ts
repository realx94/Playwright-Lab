import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

interface Q {
  id: string;
  type: "single" | "multi";
  prompt: string;
  options: { id: string; text: string }[];
  answer: string[];
  explanation: string;
}

const DIR = path.join(process.cwd(), "src", "content", "quiz");
const banks = fs
  .readdirSync(DIR)
  .filter((f) => f.endsWith(".json"))
  .map((f) => ({
    file: f,
    questions: JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")).questions as Q[],
  }));

// Từ/cụm làm lộ đáp án (cực đoan hoặc "tất cả/không đáp án nào").
const GIVEAWAYS = [/luôn luôn/i, /không bao giờ/i, /tất cả các đáp án/i, /không đáp án nào/i, /cả a và b/i];

test.describe("chất lượng ngân hàng câu hỏi", () => {
  for (const { file, questions } of banks) {
    test(`${file}: cấu trúc hợp lệ`, () => {
      expect(questions.length).toBeGreaterThanOrEqual(6);
      const ids = new Set<string>();
      for (const q of questions) {
        expect(ids.has(q.id), `trùng id ${q.id}`).toBe(false);
        ids.add(q.id);
        expect(q.options.length, `${q.id} số lựa chọn`).toBeGreaterThanOrEqual(4);
        expect(new Set(q.options.map((o) => o.text)).size, `${q.id} lựa chọn trùng`).toBe(q.options.length);
        const optIds = q.options.map((o) => o.id);
        for (const a of q.answer) expect(optIds, `${q.id} đáp án ngoài danh sách`).toContain(a);
        if (q.type === "single") expect(q.answer.length, `${q.id} single`).toBe(1);
        else {
          expect(q.answer.length, `${q.id} multi tối thiểu 2`).toBeGreaterThanOrEqual(2);
          expect(q.answer.length, `${q.id} multi phải có đáp án sai`).toBeLessThan(q.options.length);
        }
        expect(q.explanation.length, `${q.id} thiếu giải thích`).toBeGreaterThan(30);
      }
    });

    test(`${file}: không lộ đáp án qua cách diễn đạt`, () => {
      for (const q of questions)
        for (const o of q.options)
          for (const re of GIVEAWAYS) expect(o.text, `${q.id}/${o.id}`).not.toMatch(re);
    });

    test(`${file}: các lựa chọn có độ dài tương đương`, () => {
      for (const q of questions) {
        const lens = q.options.map((o) => o.text.length);
        const ratio = Math.max(...lens) / Math.min(...lens);
        expect(ratio, `${q.id} chênh lệch độ dài ${ratio.toFixed(2)}`).toBeLessThanOrEqual(1.5);
      }
    });

    test(`${file}: đáp án đúng không thiên về dài nhất/ngắn nhất`, () => {
      let longest = 0;
      let shortest = 0;
      for (const q of questions) {
        const correct = q.options.filter((o) => q.answer.includes(o.id)).map((o) => o.text.length);
        const wrong = q.options.filter((o) => !q.answer.includes(o.id)).map((o) => o.text.length);
        if (Math.max(...correct) > Math.max(...wrong)) longest++;
        if (Math.min(...correct) < Math.min(...wrong)) shortest++;
      }
      // Ngẫu nhiên kỳ vọng ~ 1/4–1/2; vượt 65% là thiên hướng dễ nhận biết.
      expect(longest / questions.length, "đáp án đúng quá hay là dài nhất").toBeLessThanOrEqual(0.65);
      expect(shortest / questions.length, "đáp án đúng quá hay là ngắn nhất").toBeLessThanOrEqual(0.65);
    });

    test(`${file}: có câu chọn nhiều đáp án`, () => {
      const multi = questions.filter((q) => q.type === "multi").length;
      expect(multi / questions.length).toBeGreaterThanOrEqual(0.2);
    });

    test(`${file}: đáp án đúng không dồn ở lựa chọn đầu tiên của dữ liệu gốc`, () => {
      const firstIsCorrect = questions.filter((q) => q.answer.includes(q.options[0].id)).length;
      expect(firstIsCorrect / questions.length).toBeLessThanOrEqual(0.5);
    });
  }
});
