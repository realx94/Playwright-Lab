"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBugs } from "@/lib/labs/use-bugs";
import {
  EXTRAS,
  NCB_OPTIONS,
  PACKAGES,
  STEP_TITLES,
  VEHICLE_FIELDS,
  VEHICLE_TYPES,
  computePremium,
  emptyForm,
  money,
  nextContractNo,
  resetContracts,
  today,
  validateStep1,
  validateStep2,
  validateStep3,
  yearRange,
  type Errors,
  type ExtraId,
  type QuoteForm,
} from "@/lib/labs/insurance-rules";

const selectCls = "h-8 w-full rounded-lg border bg-background px-2 text-sm";

function FieldError({ name, errors }: { name: string; errors: Errors }) {
  if (!errors[name]) return null;
  return (
    <p id={`err-${name}`} data-testid={`err-${name}`} className="text-sm text-red-700 dark:text-red-400">
      {errors[name]}
    </p>
  );
}

const describe = (name: string, errors: Errors) => ({
  "aria-invalid": errors[name] ? true : undefined,
  "aria-describedby": errors[name] ? `err-${name}` : undefined,
});

/** Báo giá bảo hiểm xe: form 4 bước, kiểm tra từng bước, trường điều kiện theo loại xe, tạm tính phí. */
export function InsuranceApp() {
  const bugs = useBugs();
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState<Date>(() => new Date(0));
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<QuoteForm>(emptyForm());
  const [errors, setErrors] = useState<Errors>({});
  const [agree, setAgree] = useState(false);
  const [contract, setContract] = useState<string | null>(null);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setNow(today());
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  if (!ready) return null;

  const set = <K extends keyof QuoteForm>(key: K, value: QuoteForm[K]) => {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === "vehicleType") {
        if (value !== "truck") next.payload = "";
        if (value === "moto" && next.pkg === "full") next.pkg = "";
      }
      return next;
    });
    setErrors((e) => {
      if (!e[key]) return e;
      const rest = { ...e };
      delete rest[key];
      return rest;
    });
  };

  const { min, max } = yearRange(now);
  const premium = computePremium(form, now, bugs);

  function next(e: React.FormEvent) {
    e.preventDefault();
    const errs = step === 1 ? validateStep1(form, now, bugs) : step === 2 ? validateStep2(form, now) : validateStep3(form);
    setErrors(errs);
    if (Object.keys(errs).length === 0) setStep(step + 1);
  }

  function back() {
    setErrors({});
    if (step === 3 && bugs.has("BUG-03")) {
      // BUG-03: quay lại từ bước 3 xoá dữ liệu bước 2.
      setForm((f) => {
        const cleared = { ...f };
        for (const k of VEHICLE_FIELDS) cleared[k] = "";
        return cleared;
      });
    }
    setStep(step - 1);
  }

  function confirm(e: React.FormEvent) {
    e.preventDefault();
    if (!agree) {
      setErrors({ agree: "Bạn phải đồng ý với điều khoản bảo hiểm để tiếp tục" });
      return;
    }
    setContract(nextContractNo(today()));
  }

  function reset() {
    resetContracts();
    setForm(emptyForm());
    setErrors({});
    setAgree(false);
    setContract(null);
    setStep(1);
  }

  const vt = VEHICLE_TYPES.find((v) => v.id === form.vehicleType);
  const pkg = PACKAGES.find((p) => p.id === form.pkg);
  const payUnit = form.billing === "month" ? "tháng" : "năm";

  const quoteBox =
    premium && step >= 3 ? (
      <div data-testid="premium-box" className="rounded-lg border bg-muted/40 p-3 text-sm">
        <p className="font-medium">Tạm tính phí bảo hiểm</p>
        <p>
          Phí năm: <strong data-testid="premium-annual">{money(premium.annual)}</strong>
        </p>
        <p>
          Phải trả mỗi {payUnit}: <strong data-testid="premium-payable">{money(premium.payable)}</strong>
        </p>
        {form.billing === "month" && (
          <p className="text-muted-foreground">Kỳ tháng đã gồm phụ phí 8%</p>
        )}
      </div>
    ) : null;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {!contract && (
        <div>
          <p data-testid="step-label" className="text-sm font-medium">
            Bước {step}/4 · {STEP_TITLES[step - 1]}
          </p>
          <div
            role="progressbar"
            aria-label="Tiến trình báo giá"
            aria-valuemin={1}
            aria-valuemax={4}
            aria-valuenow={step}
            className="mt-2 h-2 w-full rounded bg-muted"
          >
            <div data-testid="progress-fill" className="h-2 rounded bg-primary" style={{ width: `${step * 25}%` }} />
          </div>
          <ol className="mt-2 flex gap-3 text-xs text-muted-foreground">
            {STEP_TITLES.map((t, i) => (
              <li key={t} data-testid={`step-${i + 1}`} aria-current={step === i + 1 ? "step" : undefined} className={step === i + 1 ? "font-semibold text-foreground" : ""}>
                {i + 1}. {t}
              </li>
            ))}
          </ol>
        </div>
      )}

      {contract ? (
        <section aria-label="Kết quả" className="space-y-3 rounded-xl border p-5">
          <h2 className="text-lg font-semibold">Đã tạo hợp đồng</h2>
          <p role="status">
            Số hợp đồng: <strong data-testid="contract-no">{contract}</strong>
          </p>
          <p data-testid="contract-premium">
            Phí {payUnit}: {premium ? money(premium.payable) : ""}
          </p>
          <p className="text-sm text-muted-foreground">Giấy chứng nhận sẽ được gửi tới {form.email}.</p>
          <Button type="button" onClick={reset}>
            Báo giá mới
          </Button>
        </section>
      ) : step === 4 ? (
        <form onSubmit={confirm} noValidate aria-label="Xem lại và xác nhận" className="space-y-4 rounded-xl border p-5">
          <h2 className="text-lg font-semibold">Xem lại thông tin</h2>
          <dl className="grid grid-cols-[10rem_1fr] gap-x-3 gap-y-1 text-sm" data-testid="review">
            <dt className="text-muted-foreground">Chủ xe</dt>
            <dd data-testid="rv-owner">{form.fullName.trim()}</dd>
            <dt className="text-muted-foreground">Ngày sinh</dt>
            <dd data-testid="rv-dob">{form.dob}</dd>
            <dt className="text-muted-foreground">Liên hệ</dt>
            <dd data-testid="rv-contact">
              {form.phone.trim()} · {form.email.trim()}
            </dd>
            <dt className="text-muted-foreground">Xe</dt>
            <dd data-testid="rv-vehicle">
              {vt?.label}
              {form.vehicleType === "truck" ? `, tải trọng ${form.payload.trim()} tấn` : ""}, đời {form.year.trim()}, {form.plate.trim()}
            </dd>
            <dt className="text-muted-foreground">Giá trị xe</dt>
            <dd data-testid="rv-value">{money(Number(form.value.replace(/[.,\s]/g, "")))}</dd>
            <dt className="text-muted-foreground">Gói</dt>
            <dd data-testid="rv-package">{pkg?.label}</dd>
            <dt className="text-muted-foreground">Quyền lợi thêm</dt>
            <dd data-testid="rv-extras">{form.extras.length ? EXTRAS.filter((x) => form.extras.includes(x.id)).map((x) => x.label).join(", ") : "Không"}</dd>
            <dt className="text-muted-foreground">Không bồi thường</dt>
            <dd data-testid="rv-ncb">{NCB_OPTIONS.find((o) => o.value === form.ncb)?.label}</dd>
            <dt className="text-muted-foreground">Kỳ thanh toán</dt>
            <dd data-testid="rv-billing">{form.billing === "month" ? "Theo tháng" : "Theo năm"}</dd>
          </dl>
          {quoteBox}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <input id="agree" type="checkbox" checked={agree} onChange={(e) => { setAgree(e.target.checked); setErrors({}); }} {...describe("agree", errors)} />
              <Label htmlFor="agree">Tôi đồng ý với điều khoản bảo hiểm</Label>
            </div>
            <FieldError name="agree" errors={errors} />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={back}>
              Quay lại
            </Button>
            <Button type="submit">Xác nhận mua bảo hiểm</Button>
          </div>
        </form>
      ) : (
        <form onSubmit={next} noValidate aria-label={`Biểu mẫu bước ${step}`} className="space-y-4 rounded-xl border p-5">
          <h2 className="text-lg font-semibold">{STEP_TITLES[step - 1]}</h2>

          {step === 1 && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Họ và tên</Label>
                <Input id="fullName" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} {...describe("fullName", errors)} />
                <FieldError name="fullName" errors={errors} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dob">Ngày sinh</Label>
                <Input id="dob" type="date" value={form.dob} onChange={(e) => set("dob", e.target.value)} {...describe("dob", errors)} />
                <FieldError name="dob" errors={errors} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input id="phone" inputMode="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} {...describe("phone", errors)} />
                <FieldError name="phone" errors={errors} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={form.email} onChange={(e) => set("email", e.target.value)} {...describe("email", errors)} />
                <FieldError name="email" errors={errors} />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="vehicleType">Loại xe</Label>
                <select id="vehicleType" className={selectCls} value={form.vehicleType} onChange={(e) => set("vehicleType", e.target.value as QuoteForm["vehicleType"])} {...describe("vehicleType", errors)}>
                  <option value="">-- Chọn loại xe --</option>
                  {VEHICLE_TYPES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label}
                    </option>
                  ))}
                </select>
                <FieldError name="vehicleType" errors={errors} />
              </div>
              {form.vehicleType === "truck" && (
                <div className="space-y-1.5">
                  <Label htmlFor="payload">Tải trọng (tấn)</Label>
                  <Input id="payload" inputMode="decimal" value={form.payload} onChange={(e) => set("payload", e.target.value)} {...describe("payload", errors)} />
                  <p className="text-xs text-muted-foreground">Từ 0,5 đến 3,5 tấn</p>
                  <FieldError name="payload" errors={errors} />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="year">Năm sản xuất</Label>
                <Input id="year" inputMode="numeric" value={form.year} onChange={(e) => set("year", e.target.value)} {...describe("year", errors)} />
                <p className="text-xs text-muted-foreground" data-testid="year-hint">
                  Từ {min} đến {max}
                </p>
                <FieldError name="year" errors={errors} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="value">Giá trị xe (VNĐ)</Label>
                <Input id="value" inputMode="numeric" value={form.value} onChange={(e) => set("value", e.target.value)} {...describe("value", errors)} />
                <FieldError name="value" errors={errors} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="plate">Biển số xe</Label>
                <Input id="plate" value={form.plate} onChange={(e) => set("plate", e.target.value)} {...describe("plate", errors)} />
                <FieldError name="plate" errors={errors} />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">Gói bảo hiểm</legend>
                {PACKAGES.filter((p) => !(p.id === "full" && form.vehicleType === "moto")).map((p) => (
                  <div key={p.id} className="flex items-start gap-2">
                    <input id={`pkg-${p.id}`} data-testid={`pkg-${p.id}`} type="radio" name="pkg" className="mt-1" checked={form.pkg === p.id} onChange={() => set("pkg", p.id)} />
                    <div>
                      <Label htmlFor={`pkg-${p.id}`}>{p.label}</Label>
                      <p className="text-xs text-muted-foreground">{p.note}</p>
                    </div>
                  </div>
                ))}
                {form.vehicleType === "moto" && <p className="text-xs text-muted-foreground">Xe máy không có gói Toàn diện.</p>}
                <FieldError name="pkg" errors={errors} />
              </fieldset>

              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">Quyền lợi thêm</legend>
                {EXTRAS.map((x) => (
                  <div key={x.id} className="flex items-center gap-2">
                    <input
                      id={`extra-${x.id}`}
                      type="checkbox"
                      checked={form.extras.includes(x.id)}
                      onChange={(e) => set("extras", e.target.checked ? [...form.extras, x.id as ExtraId] : form.extras.filter((i) => i !== x.id))}
                    />
                    <Label htmlFor={`extra-${x.id}`}>{x.label}</Label>
                    <span className="text-xs text-muted-foreground">+{money(x.price)}</span>
                  </div>
                ))}
              </fieldset>

              <div className="space-y-1.5">
                <Label htmlFor="ncb">Số năm không bồi thường</Label>
                <select id="ncb" className={selectCls} value={form.ncb} onChange={(e) => set("ncb", e.target.value)}>
                  {NCB_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">Kỳ thanh toán</legend>
                <div className="flex items-center gap-2">
                  <input id="bill-year" type="radio" name="billing" checked={form.billing === "year"} onChange={() => set("billing", "year")} />
                  <Label htmlFor="bill-year">Thanh toán theo năm</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input id="bill-month" type="radio" name="billing" checked={form.billing === "month"} onChange={() => set("billing", "month")} />
                  <Label htmlFor="bill-month">Thanh toán theo tháng (phụ phí 8%)</Label>
                </div>
              </fieldset>
              {quoteBox}
            </>
          )}

          <div className="flex gap-2">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={back}>
                Quay lại
              </Button>
            )}
            <Button type="submit">Tiếp tục</Button>
          </div>
        </form>
      )}

      <Button type="button" variant="outline" size="sm" data-testid="reset-data" onClick={reset}>
        Reset dữ liệu lab
      </Button>
    </div>
  );
}
