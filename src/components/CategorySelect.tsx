import { useState } from "react";
import type { Schedule } from "@/types/schedule";
import { CATEGORY_OPTIONS } from "@/constants/categoryOptions";

export function CategorySelect({
  value,
  onChange,
}: {
  value: Schedule["category"];
  onChange: (v: Schedule["category"]) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative text-[10px]">
      {/* 선택된 값 */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-2 py-1 rounded-md w-24 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-900 dark:text-gray-100 transition-colors"
      >
        {CATEGORY_OPTIONS.find((c) => c.value === value)?.label}
        <span className="text-gray-400">▾</span>
      </button>

      {/* 드롭다운 */}
      {open && (
        <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-slate-800 shadow-lg rounded-lg border border-gray-200 dark:border-slate-700 z-50">
          {CATEGORY_OPTIONS.map((c) => (
            <button
              key={c.value}
              onClick={() => {
                onChange(c.value);
                setOpen(false);
              }}
              className={`w-full px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 text-xs flex items-center transition-colors ${c.value === value
                  ? "text-indigo-600 dark:text-indigo-400 font-semibold"
                  : "text-gray-700 dark:text-gray-300"
                }`}
            >
              <span className="flex-1 text-left">{c.label}</span>
              {c.value === value && (
                <span className="text-indigo-600 dark:text-indigo-400 text-[11px] ml-2">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
