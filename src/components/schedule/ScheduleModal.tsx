"use client";

import { FormEvent, useState } from "react";
import type { Schedule } from "@/types/schedule";
import { CATEGORY_OPTIONS } from "@/constants/categoryOptions";

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
  const [categoryOpen, setCategoryOpen] = useState(false);

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
    setCategoryOpen(false);
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
        <div className="relative text-xs">
          <button
            type="button"
            onClick={() => setCategoryOpen((prev) => !prev)}
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:bg-gray-50"
          >
            <span>
              {CATEGORY_OPTIONS.find((opt) => opt.value === category)?.label}
            </span>
            <span className="text-gray-400 text-[10px]">▾</span>
          </button>

          {categoryOpen && (
            <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
              {CATEGORY_OPTIONS.map((opt) => {
                const isActive = opt.value === category;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setCategory(opt.value as Schedule["category"]);
                      setCategoryOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs ${
                      isActive
                        ? "bg-indigo-50 text-indigo-600 font-semibold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isActive && (
                      <span className="text-indigo-500 text-[11px]">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
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
