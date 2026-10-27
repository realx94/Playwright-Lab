"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBugs } from "@/lib/labs/use-bugs";
import {
  AMENITIES,
  BREAKFAST_FEE,
  PAGE_SIZE,
  SORTS,
  bookingCode,
  filterHotels,
  formatDate,
  hotelById,
  money,
  nightsBetween,
  quote,
  sortHotels,
  todayIso,
  validateContact,
  validateSearch,
  type Amenity,
  type Hotel,
  type SortKey,
} from "@/lib/labs/hotel-rules";
import { CityCombobox } from "./city-combobox";
import { DateRangePicker } from "./date-range-picker";

const selectCls = "h-8 w-full rounded-lg border bg-background px-2 text-sm";

interface Query {
  city: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
}

type Step = "search" | "summary" | "contact" | "done";

export function hotelImage(h: Hotel): string {
  const hue = (h.id.charCodeAt(0) * 37 + Number(h.id.slice(1)) * 53) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="110"><rect width="160" height="110" fill="hsl(${hue},45%,70%)"/><rect x="40" y="30" width="80" height="60" fill="hsl(${hue},40%,35%)"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function Stars({ n }: { n: number }) {
  return (
    <span role="img" aria-label={`${n} trên 5 sao`} data-testid="hotel-stars" className="text-amber-600">
      {"★".repeat(n)}
      <span className="text-muted-foreground">{"☆".repeat(5 - n)}</span>
    </span>
  );
}

export function HotelApp() {
  const bugs = useBugs();
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setToday(todayIso());
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const [cityText, setCityText] = useState("");
  const [city, setCity] = useState<string | null>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [searchError, setSearchError] = useState("");
  const [query, setQuery] = useState<Query | null>(null);

  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [minStars, setMinStars] = useState(0);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<SortKey>("relevance");
  const [page, setPage] = useState(1);

  const [step, setStep] = useState<Step>("search");
  const [chosen, setChosen] = useState<string | null>(null);
  const [breakfast, setBreakfast] = useState(false);
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [code, setCode] = useState("");

  function reset() {
    setCityText("");
    setCity(null);
    setCheckIn("");
    setCheckOut("");
    setAdults(2);
    setChildren(0);
    setRooms(1);
    setSearchError("");
    setQuery(null);
    setAmenities([]);
    setMinStars(0);
    setMinPrice("");
    setMaxPrice("");
    setSort("relevance");
    setPage(1);
    setStep("search");
    setChosen(null);
    setBreakfast(false);
    setContact({ name: "", email: "", phone: "" });
    setErrors({});
    setCode("");
  }

  if (!today) return null;

  function search(e: React.FormEvent) {
    e.preventDefault();
    const err = validateSearch({ city, checkIn, checkOut, guests: { adults, children, rooms } }, bugs);
    setSearchError(err ?? "");
    if (err) {
      setQuery(null);
      return;
    }
    setQuery({ city: city!, checkIn, checkOut, adults, children, rooms });
    setPage(1);
  }

  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut, bugs) : null;

  const num = (s: string) => (s.trim() === "" ? null : Number(s));
  const minP = num(minPrice);
  const maxP = num(maxPrice);
  const priceError = minP !== null && maxP !== null && minP > maxP ? "Giá tối thiểu không được lớn hơn giá tối đa" : "";
  const results = query
    ? sortHotels(
        filterHotels(
          query.city,
          { amenities, minStars, minPrice: priceError ? null : minP, maxPrice: priceError ? null : maxP },
          bugs,
        ),
        sort,
      )
    : [];
  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const curPage = Math.min(page, pageCount);
  const visible = results.slice((curPage - 1) * PAGE_SIZE, curPage * PAGE_SIZE);

  const hotel = chosen ? hotelById(chosen) : undefined;
  const bookNights = query ? nightsBetween(query.checkIn, query.checkOut, bugs) : 0;
  const q = hotel && query ? quote(hotel, bookNights, query.rooms, breakfast) : null;

  function submitContact(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateContact(contact);
    setErrors(errs);
    if (Object.keys(errs).length || !hotel || !query) return;
    setCode(bookingCode(hotel, query.checkIn));
    setStep("done");
  }

  const toggleAmenity = (a: Amenity) => {
    setAmenities((cur) => (cur.includes(a) ? cur.filter((x) => x !== a) : [...cur, a]));
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      {step === "search" && (
        <>
          <form onSubmit={search} noValidate data-testid="search-form" className="grid gap-3 rounded-xl border p-5 sm:grid-cols-2">
            <h2 className="text-lg font-semibold sm:col-span-2">Tìm khách sạn</h2>
            <CityCombobox
              text={cityText}
              selected={city}
              onTextChange={(t) => {
                setCityText(t);
                setCity(null);
              }}
              onSelect={(c) => {
                setCityText(c);
                setCity(c);
              }}
            />
            <div className="hidden sm:block" />
            <DateRangePicker
              today={today}
              checkIn={checkIn}
              checkOut={checkOut}
              bugs={bugs}
              onChange={(a, b) => {
                setCheckIn(a);
                setCheckOut(b);
              }}
            />
            <p className="text-sm sm:col-span-2" data-testid="nights" data-nights={nights ?? ""}>
              {nights === null ? "Chưa chọn ngày" : `${nights} đêm`}
            </p>

            <div className="space-y-1.5">
              <Label htmlFor="hotel-adults">Người lớn</Label>
              <select id="hotel-adults" className={selectCls} value={adults} onChange={(e) => setAdults(Number(e.target.value))}>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hotel-rooms">Số phòng</Label>
              <select id="hotel-rooms" className={selectCls} value={rooms} onChange={(e) => setRooms(Number(e.target.value))}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div role="group" aria-labelledby="children-title" className="space-y-1.5">
              <div id="children-title" className="text-sm font-medium">
                Trẻ em
              </div>
              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" size="sm" aria-label="Bớt 1 trẻ" data-testid="children-dec" disabled={children <= 0} onClick={() => setChildren((c) => Math.max(0, c - 1))}>
                  −
                </Button>
                <span data-testid="children-count" aria-live="polite" className="w-6 text-center">
                  {children}
                </span>
                <Button type="button" variant="outline" size="sm" aria-label="Thêm 1 trẻ" data-testid="children-inc" disabled={children >= 4} onClick={() => setChildren((c) => Math.min(4, c + 1))}>
                  +
                </Button>
              </div>
            </div>

            {searchError && (
              <p role="alert" data-testid="search-error" className="text-sm text-red-700 sm:col-span-2 dark:text-red-400">
                {searchError}
              </p>
            )}
            <div className="flex items-center gap-3 sm:col-span-2">
              <Button type="submit">Tìm khách sạn</Button>
              <Button type="button" variant="ghost" size="sm" onClick={reset} data-testid="reset-data">
                Reset dữ liệu lab
              </Button>
            </div>
          </form>

          {query && (
            <div className="grid gap-5 md:grid-cols-[14rem_1fr]">
              <aside data-testid="filters" className="space-y-4 rounded-xl border p-4 text-sm">
                <h2 className="font-semibold">Bộ lọc</h2>
                <fieldset className="space-y-1.5">
                  <legend className="mb-1 font-medium">Tiện nghi</legend>
                  {AMENITIES.map((a) => (
                    <label key={a.id} className="flex items-center gap-2">
                      <input type="checkbox" checked={amenities.includes(a.id)} onChange={() => toggleAmenity(a.id)} />
                      {a.label}
                    </label>
                  ))}
                </fieldset>
                <fieldset className="space-y-1.5">
                  <legend className="mb-1 font-medium">Hạng sao</legend>
                  {[
                    { v: 0, t: "Tất cả" },
                    { v: 3, t: "3 sao trở lên" },
                    { v: 4, t: "4 sao trở lên" },
                    { v: 5, t: "5 sao" },
                  ].map((o) => (
                    <label key={o.v} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="stars"
                        checked={minStars === o.v}
                        onChange={() => {
                          setMinStars(o.v);
                          setPage(1);
                        }}
                      />
                      {o.t}
                    </label>
                  ))}
                </fieldset>
                <div className="space-y-1.5">
                  <div className="font-medium">Giá mỗi đêm (₫)</div>
                  <Label htmlFor="price-min">Giá tối thiểu</Label>
                  <Input id="price-min" type="number" min={0} value={minPrice} onChange={(e) => { setMinPrice(e.target.value); setPage(1); }} />
                  <Label htmlFor="price-max">Giá tối đa</Label>
                  <Input id="price-max" type="number" min={0} value={maxPrice} onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }} />
                  {priceError && (
                    <p role="alert" data-testid="filter-error" className="text-red-700 dark:text-red-400">
                      {priceError}
                    </p>
                  )}
                </div>
              </aside>

              <section data-testid="results" className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p data-testid="result-count" data-count={results.length} aria-live="polite">
                    {results.length} khách sạn tại {query.city}
                  </p>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="hotel-sort">Sắp xếp</Label>
                    <select id="hotel-sort" className="h-8 rounded-lg border bg-background px-2 text-sm" value={sort} onChange={(e) => { setSort(e.target.value as SortKey); setPage(1); }}>
                      {SORTS.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {results.length === 0 ? (
                  <p data-testid="no-results" className="rounded-xl border p-6 text-center text-muted-foreground">
                    Không tìm thấy khách sạn phù hợp. Hãy thử bỏ bớt bộ lọc.
                  </p>
                ) : (
                  <ul className="space-y-3" data-testid="hotel-list">
                    {visible.map((h) => (
                      <li
                        key={h.id}
                        data-testid="hotel-card"
                        data-id={h.id}
                        data-price={h.price}
                        data-rating={h.rating}
                        data-stars={h.stars}
                        data-amenities={h.amenities.join(",")}
                        className="flex gap-4 rounded-xl border p-3"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={hotelImage(h)} alt={`Ảnh khách sạn ${h.name}`} width={120} height={82} className="h-[82px] w-[120px] rounded-md" />
                        <div className="flex-1 space-y-1">
                          <h3 className="font-semibold" data-testid="hotel-name">
                            {h.name}
                          </h3>
                          <div className="flex items-center gap-3 text-sm">
                            <Stars n={h.stars} />
                            <span data-testid="hotel-rating">{h.rating.toFixed(1)}/10</span>
                          </div>
                          <ul className="flex flex-wrap gap-1 text-xs text-muted-foreground" aria-label={`Tiện nghi của ${h.name}`}>
                            {h.amenities.map((a) => (
                              <li key={a} className="rounded border px-1.5 py-0.5">
                                {AMENITIES.find((x) => x.id === a)!.label}
                              </li>
                            ))}
                          </ul>
                          <a className="text-sm underline" href={`/lab/hotel/${h.id}`} data-testid="hotel-link">
                            Xem chi tiết
                          </a>
                        </div>
                        <div className="flex flex-col items-end justify-between">
                          <div className="text-right">
                            <div className="font-semibold" data-testid="hotel-price">
                              {money(h.price)}
                            </div>
                            <div className="text-xs text-muted-foreground">mỗi đêm</div>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            aria-label={`Đặt phòng ${h.name}`}
                            data-testid="book-btn"
                            onClick={() => {
                              setChosen(h.id);
                              setBreakfast(false);
                              setStep("summary");
                            }}
                          >
                            Đặt phòng
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {results.length > PAGE_SIZE && (
                  <nav aria-label="Phân trang kết quả" className="flex items-center justify-center gap-2" data-testid="pagination">
                    <Button type="button" variant="outline" size="sm" disabled={curPage <= 1} onClick={() => setPage(curPage - 1)}>
                      Trang trước
                    </Button>
                    {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                      <Button key={n} type="button" size="sm" variant={n === curPage ? "default" : "outline"} aria-current={n === curPage ? "page" : undefined} data-testid={`page-${n}`} onClick={() => setPage(n)}>
                        {n}
                      </Button>
                    ))}
                    <Button type="button" variant="outline" size="sm" disabled={curPage >= pageCount} onClick={() => setPage(curPage + 1)}>
                      Trang sau
                    </Button>
                    <span className="text-sm text-muted-foreground" data-testid="page-info">
                      Trang {curPage}/{pageCount}
                    </span>
                  </nav>
                )}
              </section>
            </div>
          )}
        </>
      )}

      {step === "summary" && hotel && query && q && (
        <section data-testid="summary" className="space-y-3 rounded-xl border p-5">
          <h2 className="text-lg font-semibold">Tóm tắt đặt phòng</h2>
          <dl className="grid grid-cols-[10rem_1fr] gap-y-1 text-sm">
            <dt>Khách sạn</dt>
            <dd data-testid="sum-hotel">{hotel.name}</dd>
            <dt>Thời gian</dt>
            <dd data-testid="sum-dates">
              {formatDate(query.checkIn)} → {formatDate(query.checkOut)}
            </dd>
            <dt>Số đêm</dt>
            <dd data-testid="sum-nights">{bookNights}</dd>
            <dt>Phòng / khách</dt>
            <dd data-testid="sum-guests">
              {query.rooms} phòng, {query.adults} người lớn, {query.children} trẻ em
            </dd>
            <dt>Giá phòng</dt>
            <dd data-testid="sum-subtotal">{money(q.subtotal)}</dd>
            <dt>Bữa sáng</dt>
            <dd data-testid="sum-breakfast">{money(q.breakfast)}</dd>
            <dt>Thuế (10%)</dt>
            <dd data-testid="sum-tax">{money(q.tax)}</dd>
            <dt className="font-semibold">Tổng cộng</dt>
            <dd className="font-semibold" data-testid="sum-total">
              {money(q.total)}
            </dd>
          </dl>
          {hotel.amenities.includes("breakfast") ? (
            <p className="text-sm text-muted-foreground">Giá đã bao gồm bữa sáng.</p>
          ) : (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={breakfast} onChange={(e) => setBreakfast(e.target.checked)} />
              Thêm bữa sáng ({money(BREAKFAST_FEE)}/đêm/phòng)
            </label>
          )}
          <div className="flex gap-3">
            <Button type="button" onClick={() => setStep("contact")}>
              Tiếp tục
            </Button>
            <Button type="button" variant="outline" onClick={() => setStep("search")}>
              Quay lại kết quả
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={reset} data-testid="reset-data">
              Reset dữ liệu lab
            </Button>
          </div>
        </section>
      )}

      {step === "contact" && hotel && (
        <form onSubmit={submitContact} noValidate data-testid="contact-form" className="space-y-3 rounded-xl border p-5">
          <h2 className="text-lg font-semibold">Thông tin liên hệ</h2>
          {(
            [
              ["name", "Họ tên", "text"],
              ["email", "Email", "email"],
              ["phone", "Số điện thoại", "tel"],
            ] as const
          ).map(([k, label, type]) => (
            <div key={k} className="space-y-1.5">
              <Label htmlFor={`contact-${k}`}>{label}</Label>
              <Input id={`contact-${k}`} type={type} value={contact[k]} onChange={(e) => setContact({ ...contact, [k]: e.target.value })} aria-invalid={!!errors[k]} />
              {errors[k] && (
                <p data-testid={`error-${k}`} className="text-sm text-red-700 dark:text-red-400">
                  {errors[k]}
                </p>
              )}
            </div>
          ))}
          <div className="flex gap-3">
            <Button type="submit">Xác nhận đặt phòng</Button>
            <Button type="button" variant="outline" onClick={() => setStep("summary")}>
              Quay lại
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={reset} data-testid="reset-data">
              Reset dữ liệu lab
            </Button>
          </div>
        </form>
      )}

      {step === "done" && hotel && query && (
        <section data-testid="confirmation" className="space-y-2 rounded-xl border p-5">
          <h2 className="text-lg font-semibold">Đặt phòng thành công</h2>
          <p>
            Mã xác nhận: <strong data-testid="booking-code">{code}</strong>
          </p>
          <p className="text-sm text-muted-foreground">
            {hotel.name}, {formatDate(query.checkIn)} → {formatDate(query.checkOut)} ({bookNights} đêm). Chúng tôi đã gửi xác nhận tới {contact.email}.
          </p>
          <Button type="button" variant="ghost" size="sm" onClick={reset} data-testid="reset-data">
            Reset dữ liệu lab
          </Button>
        </section>
      )}
    </div>
  );
}
