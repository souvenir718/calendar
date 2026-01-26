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
  defaultDate?: string | null;
};

export function ScheduleModal({
  onClose,
  onSubmit,
  loading,
  defaultDate,
}: ScheduleModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 modal-overlay-fade"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl w-full max-w-md mx-4 shadow-xl modal-fade"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">새 일정 추가</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
          >
            ✕
          </button>
        </div>

        <div className="p-4">
          <CreateScheduleForm
            onAdd={onSubmit}
            loading={loading}
            defaultDate={defaultDate}
          />
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
  defaultDate?: string | null;
};

function CreateScheduleForm({
  onAdd,
  loading,
  defaultDate,
}: CreateScheduleFormProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(defaultDate ?? "");
  const [endDate, setEndDate] = useState(defaultDate ?? "");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Schedule["category"]>("OTHER");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [dateError, setDateError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title || !date) {
      setDateError("제목과 시작일을 입력해주세요.");
      return;
    } else {
      setDateError("");
    }

    if (endDate && endDate < date) {
      setDateError("종료일은 시작일보다 앞설 수 없습니다.");
      return;
    } else {
      setDateError("");
    }

    await onAdd({
      title,
      date,
      endDate: endDate || undefined,
      time: time || undefined,
      description: description || undefined,
      category: category || undefined,
    });

    setTitle("");
    setDate("");
    setEndDate("");
    setTime("");
    setDescription("");
    setCategory("OTHER");
    setCategoryOpen(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      <div className="space-y-1">
        <label className="block text-xs text-gray-500 dark:text-gray-400">제목 *</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          placeholder="예: 주간 스프린트 회의"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="block text-xs text-gray-500 dark:text-gray-400">시작일 *</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs text-gray-500 dark:text-gray-400">종료일</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>
      {dateError && (
        <div className="text-[11px] text-red-500 mt-1">{dateError}</div>
      )}
      <div className="space-y-1">
        <label className="block text-xs text-gray-500 dark:text-gray-400">시간</label>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-gray-100"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-xs text-gray-500 dark:text-gray-400">유형</label>
        <div className="relative text-xs">
          <button
            type="button"
            onClick={() => setCategoryOpen((prev) => !prev)}
            className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-900 dark:text-gray-100 transition-colors"
          >
            <span>
              {CATEGORY_OPTIONS.find((opt) => opt.value === category)?.label}
            </span>
            <span className="text-gray-400 text-[10px]">▾</span>
          </button>

          {categoryOpen && (
            <div className="absolute z-20 mt-1 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg max-h-48 overflow-auto">
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
                    className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs transition-colors ${isActive
                        ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                      }`}
                  >
                    <span>{opt.label}</span>
                    {isActive && (
                      <span className="text-indigo-500 dark:text-indigo-400 text-[11px] ml-2">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-xs text-gray-500 dark:text-gray-400">설명</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
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
