"use client";

import { useState, useEffect } from "react";
import type { Schedule } from "@/types/schedule";

const CATEGORY_LABEL_MAP: Record<string, string> = {
  MEETING: "미팅",
  DAY_OFF: "연차",
  AM_HALF: "오전반차",
  PM_HALF: "오후반차",
  IMPORTANT: "중요",
  PAYDAY: "",
  HOLIDAY: "",
  OTHER: "",
};

const CATEGORY_CLASS_MAP: Record<string, string> = {
  MEETING: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-100",
  DAY_OFF: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-100",
  AM_HALF:
    "bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-900/30 dark:text-sky-200 dark:border-sky-800",
  PM_HALF:
    "bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-200 dark:border-indigo-800",
  IMPORTANT:
    "bg-violet-50 text-violet-700 border border-violet-200 border-l-4 border-l-violet-500 dark:bg-violet-900/30 dark:text-violet-200 dark:border-violet-800 dark:border-l-violet-500",
  PAYDAY:
    "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800",
  HOLIDAY:
    "bg-red-50 text-red-700 border border-red-200 border-l-4 border-l-red-500 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800 dark:border-l-red-500",
  OTHER: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
};

function getCategoryLabel(category?: string) {
  if (!category) return "";
  const label = CATEGORY_LABEL_MAP[category];
  return label ? `[${label}] ` : "";
}

function getCategoryClasses(category?: string) {
  const key = category && CATEGORY_CLASS_MAP[category] ? category : "OTHER";
  const base = CATEGORY_CLASS_MAP[key];
  // 가독성을 위해 약한 hover 효과를 함께 적용
  return `${base} hover:brightness-95`;
}

export type ScheduleCalendarProps = {
  schedules: Schedule[];
  year: number;
  month: number; // 1-based
  onScheduleClick: (schedule: Schedule) => void;
  onDateClick?: (date: string) => void;
  onMonthChange: (year: number, month: number) => void;
};

export function ScheduleCalendar({
  schedules,
  year,
  month,
  onScheduleClick,
  onDateClick,
  onMonthChange,
}: ScheduleCalendarProps) {
  const monthIndex = month - 1;

  const [today, setToday] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      if (now.getDate() !== today.getDate() || now.getMonth() !== today.getMonth()) {
        setToday(now);
      }
    }, 1000 * 60 * 60 * 4); // 4시간마다 체크

    return () => clearInterval(timer);
  }, [today]);

  // Helper to calculate next/prev month and notify parent
  const changeMonth = (offset: number) => {
    // JavaScript Date handles month overflow/underflow automatically
    // e.g. new Date(2025, -1, 1) -> Dec 2024
    const newDate = new Date(year, monthIndex + offset, 1);
    onMonthChange(newDate.getFullYear(), newDate.getMonth() + 1);
  };

  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);
  const daysInMonth = lastDay.getDate();

  // 일요일 시작 기준(0~6, 일:0 ~ 토:6)
  const startWeekday = firstDay.getDay();

  const weeks: { date: Date | null }[][] = [];
  let currentWeek: { date: Date | null }[] = [];

  for (let i = 0; i < startWeekday; i++) {
    currentWeek.push({ date: null });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push({ date: new Date(year, monthIndex, day) });
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({ date: null });
    }
    weeks.push(currentWeek);
  }

  // 항상 6주 높이를 맞추기 위해, 모자란 주만큼 빈 주를 채워넣음
  while (weeks.length < 6) {
    const emptyWeek = Array(7).fill({ date: null });
    weeks.push(emptyWeek);
  }

  const parseDate = (value: string) => {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, (m ?? 1) - 1, d ?? 1);
  };

  const formatDateKey = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  };

  const schedulesByDate = new Map<string, Schedule[]>();

  for (const s of schedules) {
    if (!s.date) continue;

    const start = parseDate(s.date);
    const end = s.endDate ? parseDate(s.endDate) : start;

    const realEnd = end.getTime() < start.getTime() ? start : end;

    for (
      let d = new Date(start.getTime());
      d.getTime() <= realEnd.getTime();
      d.setDate(d.getDate() + 1)
    ) {
      const key = formatDateKey(d);
      const list = schedulesByDate.get(key) ?? [];
      list.push(s);
      schedulesByDate.set(key, list);
    }
  }

  const handlePrevMonth = () => changeMonth(-1);
  const handleNextMonth = () => changeMonth(1);

  const handleToday = () => {
    const now = new Date();
    onMonthChange(now.getFullYear(), now.getMonth() + 1);
  };

  const monthLabel = `${year}년 ${month}월`;
  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div className="flex flex-col gap-2 bg-white dark:bg-slate-800 w-full h-full">
      {/* 달력 헤더 */}
      <div className="flex items-center justify-between mb-2 gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToday}
            className="text-xs px-3 py-1 rounded-full border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            오늘
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="text-xs w-7 h-7 inline-flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-100 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            ◀
          </button>
          <div className="text-sm md:text-base font-semibold text-slate-800 dark:text-slate-100">
            {monthLabel}
          </div>
          <button
            type="button"
            onClick={handleNextMonth}
            className="text-xs w-7 h-7 inline-flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-100 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            ▶
          </button>
        </div>
        <div className="w-16" />
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 text-center text-[11px] text-gray-500 dark:text-gray-400 mb-1 border-b border-gray-200 dark:border-slate-700 pb-1">
        {weekDays.map((day, idx) => {
          const isSunday = idx === 0;
          const isSaturday = idx === 6;

          return (
            <div
              key={day}
              className={`py-1 ${isSunday
                ? "text-red-400 dark:text-red-300"
                : isSaturday
                  ? "text-blue-500 dark:text-blue-400"
                  : ""
                }`}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* 달력 바디: min-h 추가 */}
      <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-[2px] text-[11px] bg-gray-200 dark:bg-slate-700 border border-gray-200 dark:border-slate-700 rounded-md overflow-hidden min-h-[480px]">
        {weeks.map((week, wi) =>
          week.map((cell, di) => {
            if (!cell.date) {
              return (
                <div
                  key={`${wi}-${di}`}
                  className="min-h-0 bg-gray-50 dark:bg-slate-900/50"
                />
              );
            }

            const key = formatDateKey(cell.date);
            const daySchedules = schedulesByDate.get(key) ?? [];

            const handleDateClick = () => {
              if (onDateClick) {
                onDateClick(key);
              }
            };

            return (
              <div
                key={`${wi}-${di}`}
                className="min-h-0 bg-white dark:bg-slate-800 flex flex-col p-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                onClick={handleDateClick}
              >
                <div className="flex items-center justify-between mb-1 shrink-0">
                  {(() => {
                    const isToday =
                      cell.date.getFullYear() === today.getFullYear() &&
                      cell.date.getMonth() === today.getMonth() &&
                      cell.date.getDate() === today.getDate();
                    return (
                      <span
                        className={
                          isToday
                            ? "inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 ml-0.5 mt-0.5 pt-px tabular-nums rounded-full bg-indigo-600 text-[10px] sm:text-xs font-semibold text-white text-center"
                            : `inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 ml-0.5 mt-0.5 pt-px tabular-nums text-[10px] sm:text-xs font-semibold ${cell.date.getDay() === 0
                              ? "text-red-500 dark:text-red-400"
                              : cell.date.getDay() === 6
                                ? "text-blue-500 dark:text-blue-400"
                                : "text-gray-500 dark:text-gray-400"
                            }`
                        }
                      >
                        {cell.date.getDate()}
                      </span>
                    );
                  })()}
                  {daySchedules.length > 0 && (
                    <span className="text-[9px] sm:text-[11px] text-indigo-500 dark:text-indigo-400">
                      {daySchedules.length}개
                    </span>
                  )}
                </div>
                {/* Desktop View (sm 이상) */}
                <div className="hidden sm:block flex-1 space-y-1 overflow-hidden">
                  {daySchedules.slice(0, 3).map((s) => (
                    <div
                      key={s.id}
                      className={`rounded px-1 py-[2px] flex items-start justify-between gap-1 cursor-pointer ${getCategoryClasses(
                        s.category,
                      )}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onScheduleClick(s);
                      }}
                    >
                      <div className="flex-1">
                        <div className="truncate">
                          <span className="text-[11px] font-semibold">
                            {getCategoryLabel(s.category)}
                            {s.title}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {daySchedules.length > 3 && (
                    <div className="text-[10px] text-gray-500 dark:text-gray-400">
                      + {daySchedules.length - 3}개 더
                    </div>
                  )}
                </div>

                {/* Mobile View (sm 미만) - 작은 폰트 모드 */}
                <div className="block sm:hidden flex-1 space-y-[1px] overflow-hidden min-h-0">
                  {daySchedules.slice(0, 4).map((s) => (
                    <div
                      key={s.id}
                      className={`rounded px-[2px] py-[1px] flex items-center cursor-pointer truncate ${getCategoryClasses(
                        s.category,
                      )}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onScheduleClick(s);
                      }}
                    >
                      <span className="text-[7px] leading-tight font-medium truncate">
                        {getCategoryLabel(s.category)}
                        {s.title}
                      </span>
                    </div>
                  ))}
                  {daySchedules.length > 4 && (
                    <div className="text-[7px] text-gray-400 pl-0.5">
                      +{daySchedules.length - 4}
                    </div>
                  )}
                </div>
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}
