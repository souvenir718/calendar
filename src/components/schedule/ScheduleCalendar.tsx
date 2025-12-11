"use client";

import { useState } from "react";
import type { Schedule } from "@/types/schedule";

const CATEGORY_LABEL_MAP: Record<string, string> = {
  MEETING: "미팅",
  DAY_OFF: "연차",
  IMPORTANT: "중요",
  OTHER: "",
};

const CATEGORY_CLASS_MAP: Record<string, string> = {
  MEETING: "bg-blue-100 text-blue-800",
  DAY_OFF: "bg-emerald-100 text-emerald-800",
  IMPORTANT: "bg-rose-100 text-rose-800",
  OTHER: "bg-gray-100 text-gray-800",
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
  onScheduleClick: (schedule: Schedule) => void;
};

export function ScheduleCalendar({
  schedules,
  onScheduleClick,
}: ScheduleCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth(); // 0-11
  const today = new Date();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  // 일요일 시작 기준(0~6, 일:0 ~ 토:6)
  const startWeekday = firstDay.getDay();

  const weeks: { date: Date | null }[][] = [];
  let currentWeek: { date: Date | null }[] = [];

  for (let i = 0; i < startWeekday; i++) {
    currentWeek.push({ date: null });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push({ date: new Date(year, month, day) });
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

  const schedulesByDate = new Map<string, Schedule[]>();

  for (const s of schedules) {
    if (!s.date) continue;
    const key = s.date;
    const list = schedulesByDate.get(key) ?? [];
    list.push(s);
    schedulesByDate.set(key, list);
  }

  const formatDateKey = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  const monthLabel = `${year}년 ${month + 1}월`;
  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div className="flex flex-col gap-2 bg-white">
      {/* 달력 헤더 */}
      <div className="flex items-center justify-between mb-2 gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToday}
            className="text-xs px-3 py-1 rounded-full border border-gray-300 bg-white hover:bg-gray-100 text-gray-700"
          >
            오늘
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="text-xs w-7 h-7 inline-flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-100"
          >
            ◀
          </button>
          <div className="text-base font-semibold text-slate-800">
            {monthLabel}
          </div>
          <button
            type="button"
            onClick={handleNextMonth}
            className="text-xs w-7 h-7 inline-flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-100"
          >
            ▶
          </button>
        </div>
        <div className="w-16" />
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 text-center text-[11px] text-gray-500 mb-1 border-b border-gray-200 pb-1">
        {weekDays.map((day, idx) => {
          const isSunday = idx === 0;
          const isSaturday = idx === 6;

          return (
            <div
              key={day}
              className={`py-1 ${
                isSunday ? "text-red-400" : isSaturday ? "text-blue-500" : ""
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* 달력 바디 */}
      <div className="grid grid-cols-7 gap-[2px] text-[11px]">
        {weeks.map((week, wi) =>
          week.map((cell, di) => {
            if (!cell.date) {
              return (
                <div
                  key={`${wi}-${di}`}
                  className="min-h-[64px] sm:min-h-[72px] md:min-h-[96px] lg:min-h-[110px] bg-gray-100 border border-gray-300 rounded-md"
                />
              );
            }

            const key = formatDateKey(cell.date);
            const daySchedules = schedulesByDate.get(key) ?? [];

            return (
              <div
                key={`${wi}-${di}`}
                className="min-h-[64px] sm:min-h-[72px] md:min-h-[96px] lg:min-h-[110px] bg-white border border-gray-300 rounded-md flex flex-col p-1"
              >
                <div className="flex items-center justify-between mb-1">
                  {(() => {
                    const isToday =
                      cell.date.getFullYear() === today.getFullYear() &&
                      cell.date.getMonth() === today.getMonth() &&
                      cell.date.getDate() === today.getDate();
                    return (
                      <span
                        className={
                          isToday
                            ? "inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-[11px] font-semibold text-white"
                            : "text-[11px] font-semibold text-gray-500"
                        }
                      >
                        {cell.date.getDate()}
                      </span>
                    );
                  })()}
                  {daySchedules.length > 0 && (
                    <span className="text-[10px] text-indigo-500">
                      {daySchedules.length}개
                    </span>
                  )}
                </div>
                <div className="flex-1 space-y-1 overflow-hidden">
                  {daySchedules.slice(0, 3).map((s) => (
                    <div
                      key={s.id}
                      className={`rounded px-1 py-[2px] flex items-start justify-between gap-1 cursor-pointer ${getCategoryClasses(
                        s.category,
                      )}`}
                      onClick={() => onScheduleClick(s)}
                    >
                      <div className="flex-1">
                        <div className="truncate">
                          <span className="text-[10px]">
                            {getCategoryLabel(s.category)}
                            {s.title}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {daySchedules.length > 3 && (
                    <div className="text-[9px] text-gray-500">
                      + {daySchedules.length - 3}개 더
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
