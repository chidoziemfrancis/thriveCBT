"use client";

import { useEffect, useRef } from "react";

const ITEM_HEIGHT = 44;
const VISIBLE_ROWS = 5;
const PADDING = (ITEM_HEIGHT * (VISIBLE_ROWS - 1)) / 2;

type WheelColumnItem = { label: string; value: number };

export default function WheelColumn({
  items,
  value,
  onChange,
}: {
  items: WheelColumnItem[];
  value: number;
  onChange: (value: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef(false);
  const settleTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const index = items.findIndex((item) => item.value === value);
    if (index === -1 || !containerRef.current) return;

    const target = index * ITEM_HEIGHT;
    if (Math.abs(containerRef.current.scrollTop - target) < 1) return;

    isProgrammaticScroll.current = true;
    containerRef.current.scrollTo({ top: target });
    const timeout = setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 50);
    return () => clearTimeout(timeout);
  }, [value, items]);

  function handleScroll() {
    if (isProgrammaticScroll.current || !containerRef.current) return;
    if (settleTimeout.current) clearTimeout(settleTimeout.current);

    settleTimeout.current = setTimeout(() => {
      if (!containerRef.current) return;
      const index = Math.round(containerRef.current.scrollTop / ITEM_HEIGHT);
      const item = items[index];
      if (item && item.value !== value) onChange(item.value);
    }, 100);
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="h-[220px] flex-1 snap-y snap-mandatory overflow-y-scroll scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ paddingTop: PADDING, paddingBottom: PADDING }}
    >
      {items.map((item) => (
        <div
          key={item.value}
          className={`flex h-11 snap-center items-center justify-center text-lg transition-colors ${
            item.value === value
              ? "font-semibold text-zinc-950"
              : "text-zinc-300"
          }`}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
}
