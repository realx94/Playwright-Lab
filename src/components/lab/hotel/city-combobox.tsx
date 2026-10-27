"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { suggestCities } from "@/lib/labs/hotel-rules";

/**
 * Combobox thành phố có autocomplete (ARIA 1.2): gõ để lọc (không phân biệt dấu),
 * ArrowDown/ArrowUp di chuyển, Enter chọn, Escape đóng. `selected` chỉ có giá trị khi người dùng chọn một gợi ý.
 */
export function CityCombobox({
  text,
  selected,
  onTextChange,
  onSelect,
}: {
  text: string;
  selected: string | null;
  onTextChange: (t: string) => void;
  onSelect: (city: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const options = suggestCities(text);

  function choose(city: string) {
    onSelect(city);
    setOpen(false);
    setActive(-1);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        setActive(0);
      } else if (options.length) setActive((i) => (i + 1) % options.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (open && options.length) setActive((i) => (i <= 0 ? options.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      if (open && active >= 0 && options[active]) {
        e.preventDefault();
        choose(options[active]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
    }
  }

  return (
    <div className="relative space-y-1.5">
      <Label htmlFor="hotel-city">Điểm đến</Label>
      <Input
        id="hotel-city"
        role="combobox"
        autoComplete="off"
        placeholder="Nhập thành phố"
        aria-expanded={open}
        aria-controls="hotel-city-list"
        aria-autocomplete="list"
        aria-activedescendant={open && active >= 0 ? `city-opt-${active}` : undefined}
        value={text}
        data-selected={selected ?? ""}
        onChange={(e) => {
          onTextChange(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
      />
      {open && (
        <ul
          id="hotel-city-list"
          role="listbox"
          aria-label="Gợi ý thành phố"
          data-testid="city-listbox"
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border bg-popover p-1 text-sm shadow-md"
        >
          {options.length === 0 && (
            <li role="presentation" data-testid="city-empty" className="px-2 py-1.5 text-muted-foreground">
              Không có thành phố phù hợp
            </li>
          )}
          {options.map((c, i) => (
            <li
              key={c}
              id={`city-opt-${i}`}
              role="option"
              aria-selected={i === active}
              data-testid="city-option"
              className={`cursor-pointer rounded-md px-2 py-1.5 ${i === active ? "bg-accent text-accent-foreground" : ""}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(c)}
              onMouseEnter={() => setActive(i)}
            >
              {c}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
