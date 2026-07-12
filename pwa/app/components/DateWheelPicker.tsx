"use client";

import WheelColumn from "./WheelColumn";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export type DateValue = { day: number; month: number; year: number };

function daysInMonth(month: number, year: number) {
  return new Date(year, month + 1, 0).getDate();
}

export default function DateWheelPicker({
  value,
  onChange,
  yearsBack = 80,
}: {
  value: DateValue;
  onChange: (value: DateValue) => void;
  yearsBack?: number;
}) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: yearsBack }, (_, i) => currentYear - i);
  const dayCount = daysInMonth(value.month, value.year);
  const days = Array.from({ length: dayCount }, (_, i) => i + 1);

  return (
    <div className="relative flex overflow-hidden rounded-2xl border border-zinc-300 bg-white">
      <div className="pointer-events-none absolute inset-x-3 top-1/2 h-11 -translate-y-1/2 rounded-xl bg-zinc-100" />

      <WheelColumn
        items={days.map((day) => ({ label: String(day), value: day }))}
        value={Math.min(value.day, dayCount)}
        onChange={(day) => onChange({ ...value, day })}
      />
      <WheelColumn
        items={MONTHS.map((label, month) => ({ label, value: month }))}
        value={value.month}
        onChange={(month) =>
          onChange({
            ...value,
            month,
            day: Math.min(value.day, daysInMonth(month, value.year)),
          })
        }
      />
      <WheelColumn
        items={years.map((year) => ({ label: String(year), value: year }))}
        value={value.year}
        onChange={(year) =>
          onChange({
            ...value,
            year,
            day: Math.min(value.day, daysInMonth(value.month, year)),
          })
        }
      />
    </div>
  );
}
