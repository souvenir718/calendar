"use client";

import { memo, useMemo, useState, useSyncExternalStore } from "react";
import type { Schedule } from "@/types/schedule";

const SEOUL_TIME_ZONE = "Asia/Seoul";
const EMPTY_DATE_KEY = "";

type SeoulToday = {
  year: number;
  month: number; // 0-based, matches Date#getMonth()
  day: number;
};

function getSeoulDateKey() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: SEOUL_TIME_ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
  return formatter.format(new Date());
}

function getServerDateKey() {
  return EMPTY_DATE_KEY;
}

function getMsUntilSeoulMidnight() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: SEOUL_TIME_ZONE,
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  });
  const parts = formatter.formatToParts(new Date());
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  const hour = get("hour") % 24;
  const minute = get("minute");
  const second = get("second");
  const msPastMidnight = ((hour * 60 + minute) * 60 + second) * 1000;

  return 24 * 60 * 60 * 1000 - msPastMidnight;
}

function subscribeToSeoulDateChange(callback: () => void) {
  let timer: ReturnType<typeof setTimeout>;

  const scheduleNext = () => {
    // add a 1s buffer so the timer fires just after midnight, not before it
    timer = setTimeout(() => {
      callback();
      scheduleNext();
    }, getMsUntilSeoulMidnight() + 1000);
  };

  scheduleNext();

  return () => clearTimeout(timer);
}

function useSeoulToday(): SeoulToday | null {
  const dateKey = useSyncExternalStore(
    subscribeToSeoulDateChange,
    getSeoulDateKey,
    getServerDateKey,
  );

  return useMemo(() => {
    if (dateKey === EMPTY_DATE_KEY) {
      return null;
    }

    const [year, month, day] = dateKey.split("-").map(Number);
    return { year, month: month - 1, day };
  }, [dateKey]);
}

const CATEGORY_LABEL_MAP: Record<string, string> = {
  MEETING: "미팅",
  DAY_OFF: "연차",
  AM_HALF: "오전반차",
  PM_HALF: "오후반차",
  BIRTHDAY_HALF: "생일반차",
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
  BIRTHDAY_HALF:
    "bg-pink-50 text-pink-700 border border-pink-200 dark:bg-pink-900/30 dark:text-pink-200 dark:border-pink-800",
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

const MAX_VISIBLE_SCHEDULE_ROWS = 3;
const SCHEDULE_BAR_HEIGHT = 20;
const SCHEDULE_BAR_GAP = 3;

type WeekLayout = {
  barRows: number;
  segments: WeekSegment[];
  reservedRows: number[];
  visibleMultiDayCounts: number[];
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
  const today = useSeoulToday();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const monthPrefix = `${year}-${String(month).padStart(2, "0")}`;
  const todayKey = today
    ? `${today.year}-${String(today.month + 1).padStart(2, "0")}-${String(today.day).padStart(2, "0")}`
    : null;
  const activeDate = selectedDate?.startsWith(monthPrefix + "-")
    ? selectedDate
    : todayKey?.startsWith(monthPrefix + "-")
      ? todayKey
      : `${monthPrefix}-01`;
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

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
        return {
          barRows: 0,
          segments: [],
          reservedRows: Array(7).fill(0),
          visibleMultiDayCounts: Array(7).fill(0),
        };
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
        .filter(
          (segment): segment is Omit<WeekSegment, "row"> => segment !== null,
        )
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

      const visibleSegments = segments.filter(
        (segment) => segment.row < MAX_VISIBLE_SCHEDULE_ROWS,
      );
      const reservedRowsByColumn = Array<number>(7).fill(0);
      const visibleMultiDayCountByColumn = Array<number>(7).fill(0);

      for (const segment of visibleSegments) {
        for (
          let column = segment.startCol;
          column <= segment.endCol;
          column++
        ) {
          reservedRowsByColumn[column] = Math.max(
            reservedRowsByColumn[column],
            segment.row + 1,
          );
          visibleMultiDayCountByColumn[column] += 1;
        }
      }

      return {
        barRows: Math.min(rowEndColumns.length, MAX_VISIBLE_SCHEDULE_ROWS),
        segments: visibleSegments,
        reservedRows: reservedRowsByColumn,
        visibleMultiDayCounts: visibleMultiDayCountByColumn,
      };
    });
  }, [multiDaySchedules, weeks]);

  const changeMonth = (offset: number) => {
    const nextDate = new Date(year, monthIndex + offset, 1);
    onMonthChange(nextDate.getFullYear(), nextDate.getMonth() + 1);
  };

  const handleToday = () => {
    setSelectedDate(null);
    const [year, month] = getSeoulDateKey().split("-").map(Number);
    onMonthChange(year, month);
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
      className="flex-1 min-h-0 flex flex-col gap-1.5 bg-white dark:bg-slate-800 w-full h-full"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="flex items-center justify-between mb-1 gap-2 shrink-0">
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
            aria-label="이전 달"
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
            aria-label="다음 달"
            onClick={() => changeMonth(1)}
            className="text-xs w-7 h-7 inline-flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-100 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            ▶
          </button>
        </div>
        <div className="w-16" />
      </div>

      <div className="grid grid-cols-7 text-center text-[11px] text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-slate-700 pb-1 shrink-0">
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

      <div className="hidden sm:grid flex-1 min-h-0 grid-rows-6 gap-[2px] text-[11px] bg-gray-200 dark:bg-slate-700 border border-gray-200 dark:border-slate-700 rounded-md overflow-hidden">
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
                const reservedRows = layout.reservedRows[dayIndex];
                const maxSingleCount = Math.max(
                  0,
                  MAX_VISIBLE_SCHEDULE_ROWS - reservedRows,
                );
                const visibleListSchedules = listSchedules.slice(
                  0,
                  maxSingleCount,
                );
                const visibleCount =
                  layout.visibleMultiDayCounts[dayIndex] +
                  visibleListSchedules.length;
                const hiddenCount = Math.max(
                  0,
                  allDaySchedules.length - visibleCount,
                );
                const hasContentBelowMultiDay =
                  visibleListSchedules.length > 0 || hiddenCount > 0;
                const reservedHeight =
                  reservedRows > 0
                    ? reservedRows * SCHEDULE_BAR_HEIGHT +
                      (reservedRows - 1) * SCHEDULE_BAR_GAP +
                      (hasContentBelowMultiDay ? SCHEDULE_BAR_GAP : 0)
                    : 0;
                const isToday =
                  today !== null &&
                  cell.date.getFullYear() === today.year &&
                  cell.date.getMonth() === today.month &&
                  cell.date.getDate() === today.day;

                return (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className="relative min-h-0 bg-white dark:bg-slate-800 flex flex-col p-1 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors overflow-hidden"
                  >
                    <button
                      type="button"
                      aria-label={`${dateKey} 일정 추가`}
                      className="absolute inset-0 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500"
                      onClick={() => onDateClick?.(dateKey)}
                    />
                    <div className="relative pointer-events-none flex items-center justify-between mb-1 shrink-0">
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
                          aria-label={`${dateKey} 일정 ${allDaySchedules.length}개 보기`}
                          className="pointer-events-auto text-[9px] sm:text-[11px] text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium px-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                        >
                          {allDaySchedules.length}개
                        </button>
                      )}
                    </div>

                    {reservedHeight > 0 && (
                      <div
                        className="shrink-0"
                        style={{
                          height: `${reservedHeight}px`,
                        }}
                      />
                    )}

                    <div className="relative pointer-events-none hidden sm:block flex-1 min-h-0 space-y-[3px] overflow-hidden">
                      {visibleListSchedules.map((schedule) => (
                        <button
                          type="button"
                          key={schedule.id}
                          className={`pointer-events-auto w-full h-5 text-left rounded px-1 flex items-center justify-between gap-1 cursor-pointer ${getCategoryClasses(
                            schedule.category,
                          )}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            onScheduleClick(schedule);
                          }}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="truncate leading-none">
                              <span className="text-[11px] font-semibold leading-none">
                                {getCategoryLabel(schedule.category)}
                                {schedule.title}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                      {hiddenCount > 0 && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onDateCountClick?.(dateKey);
                          }}
                          className="pointer-events-auto block text-left text-[10px] leading-none pt-0.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium cursor-pointer"
                        >
                          + {hiddenCount}개 더
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {layout.segments.length > 0 && (
                <div
                  className="absolute inset-x-0 top-[26px] sm:top-[30px] grid grid-cols-7 gap-x-[2px] gap-y-[3px] pointer-events-none"
                  style={{ gridAutoRows: `${SCHEDULE_BAR_HEIGHT}px` }}
                >
                  {layout.segments.map((segment) => (
                    <button
                      key={`segment-${weekIndex}-${segment.schedule.id}`}
                      type="button"
                      onClick={() => onScheduleClick(segment.schedule)}
                      className={`pointer-events-auto h-5 px-1 flex items-center text-left text-[10px] sm:text-[11px] font-semibold leading-none truncate ${
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
                      <span className="truncate">
                        {getCategoryLabel(segment.schedule.category)}
                        {segment.schedule.title}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="sm:hidden">
        <div className="grid grid-cols-7 gap-1" aria-label="날짜 선택">
          {weeks
            .filter((week) => week.some((cell) => cell.date))
            .flat()
            .map((cell, index) => {
              if (!cell.key || !cell.date)
                return <div key={`empty-${index}`} />;
              const key = cell.key;
              const count = allSchedulesByDate.get(key)?.length ?? 0;
              const selected = key === activeDate;
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={selected}
                  aria-current={key === todayKey ? "date" : undefined}
                  aria-label={`${key}, 일정 ${count}개`}
                  onClick={() => setSelectedDate(key)}
                  className={`min-h-14 rounded-xl flex flex-col items-center justify-center gap-1 border text-sm focus-visible:outline-2 focus-visible:outline-indigo-500 ${selected ? "bg-indigo-600 border-indigo-600 text-white" : "border-transparent hover:bg-gray-100 dark:hover:bg-slate-700 " + (cell.date.getDay() === 0 ? "text-red-500 dark:text-red-400" : cell.date.getDay() === 6 ? "text-blue-600 dark:text-blue-400" : "text-slate-800 dark:text-slate-100")}`}
                >
                  <span
                    className={
                      key === todayKey
                        ? "font-bold underline underline-offset-4"
                        : "font-medium"
                    }
                  >
                    {cell.date.getDate()}
                  </span>
                  <span
                    className={`text-[11px] ${selected ? "text-indigo-100" : "text-slate-500 dark:text-slate-400"}`}
                  >
                    {count ? `${count}개` : " "}
                  </span>
                </button>
              );
            })}
        </div>
        <section
          className="mt-5 border-t border-slate-200 dark:border-slate-700 pt-4"
          aria-label="선택한 날짜의 일정"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2
              className="text-base font-semibold text-slate-900 dark:text-slate-100"
              aria-live="polite"
            >
              {Number(activeDate.slice(5, 7))}월 {Number(activeDate.slice(8))}일{" "}
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                · {allSchedulesByDate.get(activeDate)?.length ?? 0}개
              </span>
            </h2>
            <button
              type="button"
              onClick={() => onDateClick?.(activeDate)}
              className="min-h-11 px-3 text-sm font-medium text-indigo-600 dark:text-indigo-300 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-700"
            >
              + 일정 추가
            </button>
          </div>
          <div className="space-y-2">
            {(allSchedulesByDate.get(activeDate) ?? []).map((schedule) => (
              <button
                key={schedule.id}
                type="button"
                onClick={() => onScheduleClick(schedule)}
                className={`w-full text-left rounded-xl px-4 py-3 focus-visible:outline-2 focus-visible:outline-indigo-500 ${getCategoryClasses(schedule.category)}`}
              >
                <span className="block text-xs mb-1">
                  {CATEGORY_LABEL_MAP[schedule.category ?? "OTHER"] ||
                    (schedule.category === "HOLIDAY"
                      ? "공휴일"
                      : schedule.category === "PAYDAY"
                        ? "월급날"
                        : "기타")}{" "}
                  · {schedule.time || "종일"}
                  {schedule.endDate && schedule.endDate !== schedule.date && (
                    <span className="whitespace-nowrap">
                      {" "}
                      (
                      {schedule.date.slice(0, 4) !==
                      schedule.endDate.slice(0, 4)
                        ? `${schedule.date} ~ ${schedule.endDate}`
                        : `${Number(schedule.date.slice(5, 7))}/${Number(schedule.date.slice(8))} ~ ${Number(schedule.endDate.slice(5, 7))}/${Number(schedule.endDate.slice(8))}`}
                      )
                    </span>
                  )}
                </span>
                <span className="block text-base font-semibold break-words">
                  {schedule.title}
                </span>
              </button>
            ))}
            {!allSchedulesByDate.get(activeDate)?.length && (
              <p className="py-6 text-sm text-center text-slate-500 dark:text-slate-400">
                등록된 일정이 없습니다. 새 일정을 추가해보세요.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
});
