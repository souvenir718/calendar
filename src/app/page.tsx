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
import { ScheduleModal } from "@/components/schedule/ScheduleModal";
import { ScheduleDetailModal } from "@/components/schedule/ScheduleDetailModal";

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null,
  );
  const [defaultDate, setDefaultDate] = useState<string | null>(null);

  const { data, isLoading, isError } = useSchedules();
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
  };

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <header className="flex items-center justify-between mb-4">
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-semibold text-slate-900">
              Fruits Calendar
            </h1>
            <span className="text-xs text-slate-500">
              {isLoading ? "불러오는 중..." : `총 ${schedules.length}개 일정`}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setDefaultDate(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-500 hover:bg-indigo-400 text-sm font-medium px-4 py-2 rounded-full text-white shadow-sm"
          >
            + 일정 추가
          </button>
        </header>

        {/* 캘린더 카드 */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
          {isLoading ? (
            <p className="text-sm text-slate-500">로딩 중...</p>
          ) : isError ? (
            <p className="text-sm text-red-500">
              데이터를 불러오는 중 문제가 발생했습니다.
            </p>
          ) : (
            <ScheduleCalendar
              schedules={schedules}
              onScheduleClick={setSelectedSchedule}
              onDateClick={(date) => {
                setDefaultDate(date); // "2025-12-11" 이런 형태로 들어옴
                setIsModalOpen(true); // 일정 추가 모달 열기
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
              await handleDelete(selectedSchedule.id);
              setSelectedSchedule(null);
            }}
            onUpdate={async (updated) => {
              const result = await updateMutation.mutateAsync(updated);
              setSelectedSchedule(result);
            }}
          />
        )}
      </div>
    </main>
  );
}
