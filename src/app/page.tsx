"use client";

import { useState } from "react";
import {
  useSchedules,
  useCreateSchedule,
  useDeleteSchedule,
  useUpdateSchedule,
} from "@/hooks/useSchedules";
import type { Schedule } from "@/types/schedule";

import { ScheduleCalendar } from "@/components/schedule/ScheduleCalendar";
import { ScheduleCalendarSkeleton } from "@/components/schedule/ScheduleCalendarSkeleton";
import { ScheduleModal } from "@/components/schedule/ScheduleModal";
import { ScheduleDetailModal } from "@/components/schedule/ScheduleDetailModal";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null,
  );
  const [defaultDate, setDefaultDate] = useState<string | null>(null);
  const [showDeleteToast, setShowDeleteToast] = useState(false);

  // 현재 보고 있는 달 (초기값: 오늘)
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });

  // 해당 월 데이터만 Fetch
  const { data, isLoading, isError, refetch } = useSchedules(
    viewDate.year,
    viewDate.month,
  );
  const createMutation = useCreateSchedule();
  const deleteMutation = useDeleteSchedule();
  const updateMutation = useUpdateSchedule();

  const schedules = data ?? [];

  const handleAdd = async (
    payload: Omit<Schedule, "id" | "createdAt" | "updatedAt">,
  ) => {
    await createMutation.mutateAsync(payload);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync(id);
    setShowDeleteToast(true);
    setTimeout(() => setShowDeleteToast(false), 2000);
  };

  const isDeleting = deleteMutation.isPending;

  return (
    <main className="h-[100dvh] overflow-hidden flex flex-col py-2 px-2 md:py-8 md:px-4 bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-6xl mx-auto w-full">
        {/* 헤더 */}
        <header className="flex items-center justify-between mb-4">
          <div className="flex items-baseline gap-3">
            <h1 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Fruits Calendar
            </h1>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {isLoading ? "불러오는 중..." : `총 ${schedules.length}개 일정`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {/* 모바일 전용 새로고침 버튼 */}
            <button
              onClick={() => refetch()}
              className="md:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400 transition-colors"
              aria-label="새로고침"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => {
                setDefaultDate(null);
                setIsModalOpen(true);
              }}
              className="bg-indigo-500 hover:bg-indigo-400 text-white shadow-sm rounded-full flex items-center justify-center w-9 h-9 sm:w-auto sm:h-auto sm:px-4 sm:py-2 transition-all"
              aria-label="일정 추가"
            >
              <span className="text-xl sm:text-base sm:mr-1 font-medium leading-none mb-0.5 sm:mb-0">
                +
              </span>
              <span className="hidden sm:inline text-sm font-medium">
                일정 추가
              </span>
            </button>
          </div>
        </header>

        {/* 캘린더 카드 */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-2 md:p-4">
          {isLoading ? (
            <ScheduleCalendarSkeleton />
          ) : isError ? (
            <p className="text-sm text-red-500">
              데이터를 불러오는 중 문제가 발생했습니다.
            </p>
          ) : (
            <ScheduleCalendar
              schedules={schedules}
              year={viewDate.year}
              month={viewDate.month}
              onScheduleClick={setSelectedSchedule}
              onDateClick={(date) => {
                setDefaultDate(date); // "2025-12-11" 이런 형태로 들어옴
                setIsModalOpen(true); // 일정 추가 모달 열기
              }}
              onMonthChange={(year, month) => {
                setViewDate({ year, month });
              }}
            />
          )}
        </section>

        {/* 일정 추가 모달 */}
        {isModalOpen && (
          <ScheduleModal
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleAdd}
            loading={createMutation.isPending}
            defaultDate={defaultDate}
          />
        )}

        {/* 일정 상세 모달 */}
        {selectedSchedule && (
          <ScheduleDetailModal
            schedule={selectedSchedule}
            onClose={() => setSelectedSchedule(null)}
            onDelete={async () => {
              try {
                await handleDelete(selectedSchedule.id);
                setTimeout(() => setSelectedSchedule(null), 350);
              } catch (e) {
                console.error(e);
              }
            }}
            isDeleting={isDeleting}
            onUpdate={async (updated) => {
              const result = await updateMutation.mutateAsync(updated);
              setSelectedSchedule(result);
            }}
          />
        )}
      </div>
      {showDeleteToast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-5 py-2 text-sm text-white shadow-lg">
          일정이 삭제되었습니다
        </div>
      )}
    </main>
  );
}
