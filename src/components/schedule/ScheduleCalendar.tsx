"use client";

import { memo, useEffect, useMemo, useState } from "react";
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
  DAY_OFF:
    "bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-100 dark:border-emerald-800",
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

type CalendarCell = {
  date: Date | null;
  key: string | null;
};

type MultiDaySchedule = {
  schedule: Schedule;
  start: Date;
  end: Date;
};

type WeekSegment = {
  schedule: Schedule;
  startCol: number;
  endCol: number;
  row: number;
  continuesBefore: boolean;
  continuesAfter: boolean;
};

type WeekLayout = {
  barRows: number;
  segments: WeekSegment[];
  reservedHeights: number[];
};

function getCategoryLabel(category?: string) {
  if (!category) return "";
  const label = CATEGORY_LABEL_MAP[category];
  return label ? `[${label}] ` : "";
}

function getCategoryClasses(category?: string) {
  const key = category && CATEGORY_CLASS_MAP[category] ? category : "OTHER";
  const base = CATEGORY_CLASS_MAP[key];
  return `${base} hover:brightness-95`;
}

function getSpanBarClasses(
  category: Schedule["category"],
  continuesBefore: boolean,
  continuesAfter: boolean,
) {
  const radiusClass =
    continuesBefore && continuesAfter
      ? "rounded-none"
      : continuesBefore
        ? "rounded-l-none rounded-r"
        : continuesAfter
          ? "rounded-l rounded-r-none"
          : "rounded";

  return `${getCategoryClasses(category)} ${radiusClass} shadow-none`;
}

function parseDate(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function maxDate(left: Date, right: Date) {
  return left.getTime() >= right.getTime() ? left : right;
}

function minDate(left: Date, right: Date) {
  return left.getTime() <= right.getTime() ? left : right;
}

function getDateRangeDays(start: Date, end: Date) {
  const days: Date[] = [];

  for (
    let current = new Date(start.getTime());
    current.getTime() <= end.getTime();
    current.setDate(current.getDate() + 1)
  ) {
    days.push(new Date(current.getTime()));
  }

  return days;
}

export type ScheduleCalendarProps = {
  schedules: Schedule[];
  year: number;
  month: number;
  onScheduleClick: (schedule: Schedule) => void;
  onDateClick?: (date: string) => void;
  onMonthChange: (year: number, month: number) => void;
  onDateCountClick?: (date: string) => void;
};

export const ScheduleCalendar = memo(function ScheduleCalendar({
  schedules,
  year,
  month,
  onScheduleClick,
  onDateClick,
  onMonthChange,
  onDateCountClick,
}: ScheduleCalendarProps) {
  const monthIndex = month - 1;
  const [today, setToday] = useState(() => new Date());
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      if (
        now.getDate() !== today.getDate() ||
        now.getMonth() !== today.getMonth()
      ) {
        setToday(now);
      }
    }, 1000 * 60 * 60 * 4);

    return () => clearInterval(timer);
  }, [today]);

  const weeks = useMemo(() => {
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startWeekday = firstDay.getDay();
    const nextWeeks: CalendarCell[][] = [];
    let currentWeek: CalendarCell[] = [];

    for (let index = 0; index < startWeekday; index++) {
      currentWeek.push({ date: null, key: null });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, monthIndex, day);
      currentWeek.push({ date, key: formatDateKey(date) });

      if (currentWeek.length === 7) {
        nextWeeks.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({ date: null, key: null });
      }
      nextWeeks.push(currentWeek);
    }

    while (nextWeeks.length < 6) {
      nextWeeks.push(
        Array.from({ length: 7 }, () => ({ date: null, key: null })),
      );
    }

    return nextWeeks;
  }, [monthIndex, year]);

  const { allSchedulesByDate, listSchedulesByDate, multiDaySchedules } =
    useMemo(() => {
      const allMap = new Map<string, Schedule[]>();
      const listMap = new Map<string, Schedule[]>();
      const spanningSchedules: MultiDaySchedule[] = [];

      for (const schedule of schedules) {
        const start = parseDate(schedule.date);
        const end = schedule.endDate ? parseDate(schedule.endDate) : start;
        const realEnd = end.getTime() < start.getTime() ? start : end;
        const isMultiDay = realEnd.getTime() > start.getTime();

        if (isMultiDay) {
          spanningSchedules.push({
            schedule,
            start,
            end: realEnd,
          });
        }

        for (const date of getDateRangeDays(start, realEnd)) {
          const key = formatDateKey(date);
          const allList = allMap.get(key) ?? [];
          allList.push(schedule);
          allMap.set(key, allList);

          if (!isMultiDay) {
            const visibleList = listMap.get(key) ?? [];
            visibleList.push(schedule);
            listMap.set(key, visibleList);
          }
        }
      }

      return {
        allSchedulesByDate: allMap,
        listSchedulesByDate: listMap,
        multiDaySchedules: spanningSchedules,
      };
    }, [schedules]);

  const weekLayouts = useMemo<WeekLayout[]>(() => {
    return weeks.map((week) => {
      const firstCol = week.findIndex((cell) => cell.date);
      const lastCol = week.findLastIndex((cell) => cell.date);

      if (firstCol === -1 || lastCol === -1) {
        return { barRows: 0, segments: [], reservedHeights: Array(7).fill(0) };
      }

      const weekStart = week[firstCol].date!;
      const weekEnd = week[lastCol].date!;
      const rawSegments = multiDaySchedules
        .map((item) => {
          const overlapStart = maxDate(item.start, weekStart);
          const overlapEnd = minDate(item.end, weekEnd);

          if (overlapStart.getTime() > overlapEnd.getTime()) {
            return null;
          }

          const startKey = formatDateKey(overlapStart);
          const endKey = formatDateKey(overlapEnd);
          const startCol = week.findIndex((cell) => cell.key === startKey);
          const endCol = week.findIndex((cell) => cell.key === endKey);

          if (startCol === -1 || endCol === -1) {
            return null;
          }

          return {
            schedule: item.schedule,
            startCol,
            endCol,
            continuesBefore: item.start.getTime() < weekStart.getTime(),
            continuesAfter: item.end.getTime() > weekEnd.getTime(),
          };
        })
        .filter((segment): segment is Omit<WeekSegment, "row"> => segment !== null)
        .sort((left, right) => {
          if (left.startCol !== right.startCol) {
            return left.startCol - right.startCol;
          }

          const leftSpan = left.endCol - left.startCol;
          const rightSpan = right.endCol - right.startCol;

          if (leftSpan !== rightSpan) {
            return rightSpan - leftSpan;
          }

          return left.schedule.id - right.schedule.id;
        });

      const rowEndColumns: number[] = [];
      const segments = rawSegments.map((segment) => {
        let row = 0;
        while (
          rowEndColumns[row] !== undefined &&
          segment.startCol <= rowEndColumns[row]
        ) {
          row += 1;
        }

        rowEndColumns[row] = segment.endCol;

        return {
          ...segment,
          row,
        };
      });

      const reservedRowsByColumn = Array<number>(7).fill(0);
      for (const segment of segments) {
        for (let column = segment.startCol; column <= segment.endCol; column++) {
          reservedRowsByColumn[column] = Math.max(
            reservedRowsByColumn[column],
            segment.row + 1,
          );
        }
      }

      return {
        barRows: rowEndColumns.length,
        segments,
        reservedHeights: reservedRowsByColumn.map((rows) =>
          rows > 0 ? rows * 22 + (rows - 1) * 4 + 4 : 0,
        ),
      };
    });
  }, [multiDaySchedules, weeks]);

  const changeMonth = (offset: number) => {
    const nextDate = new Date(year, monthIndex + offset, 1);
    onMonthChange(nextDate.getFullYear(), nextDate.getMonth() + 1);
  };

  const handleToday = () => {
    const now = new Date();
    onMonthChange(now.getFullYear(), now.getMonth() + 1);
  };

  const monthLabel = `${year}년 ${month}월`;
  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
  const minSwipeDistance = 50;

  const onTouchStart = (event: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(event.targetTouches[0].clientX);
  };

  const onTouchMove = (event: React.TouchEvent) => {
    setTouchEnd(event.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    if (window.innerWidth >= 640) return;

    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) {
      changeMonth(1);
    }
    if (distance < -minSwipeDistance) {
      changeMonth(-1);
    }
  };

  return (
    <div
      className="flex flex-col gap-2 bg-white dark:bg-slate-800 w-full h-full"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
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
            onClick={() => changeMonth(-1)}
            className="text-xs w-7 h-7 inline-flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-100 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            ◀
          </button>
          <div className="text-sm md:text-base font-semibold text-slate-800 dark:text-slate-100">
            {monthLabel}
          </div>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            className="text-xs w-7 h-7 inline-flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-100 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            ▶
          </button>
        </div>
        <div className="w-16" />
      </div>

      <div className="grid grid-cols-7 text-center text-[11px] text-gray-500 dark:text-gray-400 mb-1 border-b border-gray-200 dark:border-slate-700 pb-1">
        {weekDays.map((day, index) => {
          const isSunday = index === 0;
          const isSaturday = index === 6;

          return (
            <div
              key={day}
              className={`py-1 ${
                isSunday
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

      <div className="flex-1 grid grid-rows-6 gap-[2px] text-[11px] bg-gray-200 dark:bg-slate-700 border border-gray-200 dark:border-slate-700 rounded-md overflow-hidden min-h-[540px] md:min-h-[600px]">
        {weeks.map((week, weekIndex) => {
          const layout = weekLayouts[weekIndex];

          return (
            <div
              key={`week-${weekIndex}`}
              className="relative min-h-0 grid grid-cols-7 gap-[2px]"
            >
              {week.map((cell, dayIndex) => {
                if (!cell.date || !cell.key) {
                  return (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className="min-h-0 bg-gray-50 dark:bg-slate-900/50"
                    />
                  );
                }

                const dateKey = cell.key;
                const allDaySchedules = allSchedulesByDate.get(dateKey) ?? [];
                const listSchedules = listSchedulesByDate.get(dateKey) ?? [];
                const isToday =
                  cell.date.getFullYear() === today.getFullYear() &&
                  cell.date.getMonth() === today.getMonth() &&
                  cell.date.getDate() === today.getDate();

                return (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className="min-h-0 bg-white dark:bg-slate-800 flex flex-col p-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                    onClick={() => {
                      if (onDateClick) onDateClick(dateKey);
                    }}
                  >
                    <div className="flex items-center justify-between mb-1 shrink-0">
                      <span
                        className={
                          isToday
                            ? "inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 ml-0.5 mt-0.5 pt-px tabular-nums rounded-full bg-indigo-600 text-[10px] sm:text-xs font-semibold text-white text-center"
                            : `inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 ml-0.5 mt-0.5 pt-px tabular-nums text-[10px] sm:text-xs font-semibold ${
                                cell.date.getDay() === 0
                                  ? "text-red-500 dark:text-red-400"
                                  : cell.date.getDay() === 6
                                    ? "text-blue-500 dark:text-blue-400"
                                    : "text-gray-500 dark:text-gray-400"
                              }`
                        }
                      >
                        {cell.date.getDate()}
                      </span>
                    {allDaySchedules.length > 0 && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            if (onDateCountClick) onDateCountClick(dateKey);
                          }}
                          className="text-[9px] sm:text-[11px] text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium px-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                        >
                          {allDaySchedules.length}개
                        </button>
                      )}
                    </div>

                    {layout.reservedHeights[dayIndex] > 0 && (
                      <div
                        className="shrink-0"
                        style={{ height: `${layout.reservedHeights[dayIndex]}px` }}
                      />
                    )}

                    <div className="hidden sm:block flex-1 space-y-1 overflow-hidden">
                      {listSchedules.slice(0, 3).map((schedule) => (
                        <div
                          key={schedule.id}
                          className={`rounded px-1 py-[2px] flex items-start justify-between gap-1 cursor-pointer ${getCategoryClasses(
                            schedule.category,
                          )}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            onScheduleClick(schedule);
                          }}
                        >
                          <div className="flex-1">
                            <div className="truncate">
                              <span className="text-[11px] font-semibold">
                                {getCategoryLabel(schedule.category)}
                                {schedule.title}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {listSchedules.length > 3 && (
                        <div className="text-[10px] text-gray-500 dark:text-gray-400">
                          + {listSchedules.length - 3}개 더
                        </div>
                      )}
                    </div>

                    <div className="block sm:hidden flex-1 space-y-0.5 overflow-hidden min-h-0">
                      {listSchedules.slice(0, 2).map((schedule) => (
                        <div
                          key={schedule.id}
                          className={`rounded px-[2px] py-1 flex items-center cursor-pointer truncate ${getCategoryClasses(
                            schedule.category,
                          )}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            onScheduleClick(schedule);
                          }}
                        >
                          <span className="text-[7px] leading-tight font-medium truncate">
                            {getCategoryLabel(schedule.category)}
                            {schedule.title}
                          </span>
                        </div>
                      ))}
                      {listSchedules.length > 2 && (
                        <div className="text-[7px] text-gray-400 pl-0.5">
                          +{listSchedules.length - 2}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {layout.segments.length > 0 && (
                <div
                  className="absolute inset-x-0 top-6 sm:top-7 grid grid-cols-7 gap-[2px] pointer-events-none"
                  style={{ gridAutoRows: "22px" }}
                >
                  {layout.segments.map((segment) => (
                    <button
                      key={`segment-${weekIndex}-${segment.schedule.id}`}
                      type="button"
                      onClick={() => onScheduleClick(segment.schedule)}
                      className={`pointer-events-auto h-[22px] px-1 py-[2px] text-left text-[10px] sm:text-[11px] font-semibold truncate ${
                        !segment.continuesBefore ? "ml-1" : ""
                      } ${!segment.continuesAfter ? "mr-1" : ""} ${getSpanBarClasses(
                        segment.schedule.category,
                        segment.continuesBefore,
                        segment.continuesAfter,
                      )}`}
                      style={{
                        gridColumn: `${segment.startCol + 1} / ${segment.endCol + 2}`,
                        gridRow: segment.row + 1,
                      }}
                    >
                      {getCategoryLabel(segment.schedule.category)}
                      {segment.schedule.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
