"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const HOBBIES = ["Đọc sách", "Du lịch", "Thể thao", "Âm nhạc"];
const CITIES = ["Hà Nội", "Đà Nẵng", "TP. Hồ Chí Minh"];
const GENDERS = [
  ["male", "Nam"],
  ["female", "Nữ"],
  ["other", "Khác"],
];
const MAX_FILE_MB = 2;

type Errors = Partial<Record<string, string>>;

export function FormsApp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [newsletter, setNewsletter] = useState(false);
  const [rating, setRating] = useState([5]);
  const [birth, setBirth] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [bio, setBio] = useState("");
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  function validate(): Errors {
    const e: Errors = {};
    if (!name.trim()) e.name = "Vui lòng nhập họ tên";
    else if (name.length > 50) e.name = "Họ tên tối đa 50 ký tự";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) e.email = "Email không hợp lệ";
    const n = Number(age);
    if (!age || !Number.isInteger(n) || n < 18 || n > 65) e.age = "Tuổi phải từ 18 đến 65";
    if (!gender) e.gender = "Vui lòng chọn giới tính";
    if (hobbies.length === 0) e.hobbies = "Chọn ít nhất 1 sở thích";
    if (!country) e.country = "Vui lòng chọn quốc gia";
    if (!city) e.city = "Vui lòng chọn thành phố";
    if (birth && new Date(birth) > new Date()) e.birth = "Ngày sinh không được ở tương lai";
    if (file) {
      if (!/\.(png|jpe?g|pdf)$/i.test(file.name)) e.file = "Chỉ chấp nhận png, jpg, pdf";
      else if (file.size > MAX_FILE_MB * 1024 * 1024) e.file = `Tệp tối đa ${MAX_FILE_MB}MB`;
    }
    if (bio.length > 200) e.bio = "Giới thiệu tối đa 200 ký tự";
    if (!terms) e.terms = "Bạn phải đồng ý điều khoản";
    return e;
  }

  function submit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return setResult(null);
    setResult({
      name,
      email,
      age: Number(age),
      gender,
      hobbies,
      country,
      city,
      newsletter,
      rating: rating[0],
      birth: birth || null,
      file: file?.name ?? null,
      bio,
    });
  }

  function reset() {
    setName("");
    setEmail("");
    setAge("");
    setGender("");
    setHobbies([]);
    setCountry("");
    setCity("");
    setNewsletter(false);
    setRating([5]);
    setBirth("");
    setFile(null);
    setBio("");
    setTerms(false);
    setErrors({});
    setResult(null);
  }

  const err = (k: string) =>
    errors[k] ? (
      <p className="text-sm text-destructive" data-testid={`${k}-error`}>
        {errors[k]}
      </p>
    ) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <form
        onSubmit={submit}
        noValidate
        aria-label="Đăng ký thông tin"
        className="space-y-5 rounded-xl border p-6"
      >
        <div className="space-y-1.5">
          <Label htmlFor="name">Họ tên</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          {err("name")}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          {err("email")}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="age">Tuổi</Label>
          <Input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
          {err("age")}
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Giới tính</legend>
          <RadioGroup value={gender} onValueChange={setGender} className="flex gap-4">
            {GENDERS.map(([v, l]) => (
              <div key={v} className="flex items-center gap-2">
                <RadioGroupItem value={v} id={`gender-${v}`} />
                <Label htmlFor={`gender-${v}`}>{l}</Label>
              </div>
            ))}
          </RadioGroup>
          {err("gender")}
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Sở thích</legend>
          <div className="flex flex-wrap gap-4">
            {HOBBIES.map((h, i) => (
              <div key={h} className="flex items-center gap-2">
                <Checkbox
                  id={`hobby-${i}`}
                  checked={hobbies.includes(h)}
                  onCheckedChange={(c) =>
                    setHobbies((p) => (c ? [...p, h] : p.filter((x) => x !== h)))
                  }
                />
                <Label htmlFor={`hobby-${i}`}>{h}</Label>
              </div>
            ))}
          </div>
          {err("hobbies")}
        </fieldset>

        <div className="space-y-1.5">
          <Label htmlFor="country">Quốc gia (select native)</Label>
          <select
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="h-9 w-full rounded-lg border bg-background px-2 text-sm"
          >
            <option value="">-- Chọn --</option>
            <option value="vn">Việt Nam</option>
            <option value="us">Hoa Kỳ</option>
            <option value="jp">Nhật Bản</option>
          </select>
          {err("country")}
        </div>

        <div className="space-y-1.5">
          <Label id="city-label">Thành phố (select tuỳ biến)</Label>
          <Select value={city} onValueChange={(v) => setCity(v ?? "")}>
            <SelectTrigger aria-labelledby="city-label" data-testid="city" className="w-full">
              <SelectValue placeholder="-- Chọn --" />
            </SelectTrigger>
            <SelectContent>
              {CITIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {err("city")}
        </div>

        <div className="flex items-center gap-3">
          <Switch id="newsletter" checked={newsletter} onCheckedChange={setNewsletter} />
          <Label htmlFor="newsletter">Nhận bản tin</Label>
        </div>

        <div className="space-y-2">
          <Label id="rating-label">
            Mức hài lòng: <span data-testid="rating-value">{rating[0]}</span>/10
          </Label>
          <Slider
            aria-labelledby="rating-label"
            min={0}
            max={10}
            step={1}
            value={rating}
            onValueChange={(v) => setRating(Array.isArray(v) ? [...v] : [v])}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="birth">Ngày sinh</Label>
          <Input id="birth" type="date" value={birth} onChange={(e) => setBirth(e.target.value)} />
          {err("birth")}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="file">Tệp đính kèm (png, jpg, pdf, tối đa {MAX_FILE_MB}MB)</Label>
          <Input id="file" type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          {err("file")}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bio">Giới thiệu ({bio.length}/200)</Label>
          <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} />
          {err("bio")}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Checkbox id="terms" checked={terms} onCheckedChange={(c) => setTerms(c === true)} />
            <Label htmlFor="terms">Tôi đồng ý điều khoản</Label>
          </div>
          {err("terms")}
        </div>

        <div className="flex gap-3">
          <Button type="submit">Gửi</Button>
          <Button type="button" variant="outline" onClick={reset} data-testid="reset-data">
            Reset
          </Button>
        </div>
      </form>

      <aside aria-live="polite" className="rounded-xl border p-4 text-sm">
        <h2 className="mb-2 font-semibold">Kết quả</h2>
        {result ? (
          <pre data-testid="result" className="overflow-auto whitespace-pre-wrap text-xs">
            {JSON.stringify(result, null, 2)}
          </pre>
        ) : (
          <p className="text-muted-foreground">Chưa có dữ liệu gửi.</p>
        )}
      </aside>
    </div>
  );
}
