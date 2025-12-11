"use client";

import { FormEvent, useState } from "react";
import type { Schedule } from "@/types/schedule";

export type ScheduleModalProps = {
  onClose: () => void;
  onSubmit: (
    payload: Omit<Schedule, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void> | void;
  loading?: boolean;
};

export function ScheduleModal({
  onClose,
  onSubmit,
  loading,
}: ScheduleModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 modal-overlay-fade"
      onClick={onClose}
    >
      <div
        className="bg-white border border-gray-200 rounded-2xl w-full max-w-md mx-4 shadow-xl modal-fade"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold">새 일정 추가</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            ✕
          </button>
        </div>

        <div className="p-4">
          <CreateScheduleForm onAdd={onSubmit} loading={loading} />
        </div>
      </div>
    </div>
  );
}

type CreateScheduleFormProps = {
  onAdd: (
    payload: Omit<Schedule, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void> | void;
  loading?: boolean;
};

function CreateScheduleForm({ onAdd, loading }: CreateScheduleFormProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Schedule["category"]>("OTHER");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;

    await onAdd({
      title,
      date,
      time: time || undefined,
      description: description || undefined,
      category: category || undefined,
    });

    setTitle("");
    setDate("");
    setTime("");
    setDescription("");
    setCategory("OTHER");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      <div className="space-y-1">
        <label className="block text-xs text-gray-500">제목 *</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="예: 주간 스프린트 회의"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="block text-xs text-gray-500">날짜 *</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs text-gray-500">시간</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="block text-xs text-gray-500">유형</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Schedule["category"])}
          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="OTHER">기타</option>
          <option value="MEETING">미팅</option>
          <option value="DAY_OFF">연차 / 휴가</option>
          <option value="IMPORTANT">중요</option>
        </select>
      </div>

      <div className="space-y-1">
        <label className="block text-xs text-gray-500">설명</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          rows={3}
          placeholder="간단한 상세 내용"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-2 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium py-2 rounded-lg shadow transition-all duration-150 active:scale-[0.98] disabled:opacity-60"
      >
        {loading ? "등록 중..." : "일정 추가"}
      </button>
    </form>
  );
}
