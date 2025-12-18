"use client";

import { useState } from "react";
import type { Schedule } from "@/types/schedule";
import type { UpdateScheduleInput } from "@/lib/scheduleApi";
import { CategorySelect } from "@/components/CategorySelect";

const CATEGORY_DISPLAY: Record<
  NonNullable<Schedule["category"]>,
  { label: string; className: string }
> = {
  DAY_OFF: {
    label: "연차",
    className: "bg-red-50 text-red-600 border border-red-100",
  },
  IMPORTANT: {
    label: "중요",
    className: "bg-amber-50 text-amber-600 border border-amber-100",
  },
  MEETING: {
    label: "미팅",
    className: "bg-indigo-50 text-indigo-600 border border-indigo-100",
  },
  PAYDAY: {
    label: "월급날",
    className: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  OTHER: {
    label: "기타",
    className: "bg-slate-50 text-slate-600 border border-slate-200",
  },
};
export type ScheduleDetailModalProps = {
  schedule: Schedule;
  isDeleting?: boolean;
  onClose: () => void;
  onDelete: () => void | Promise<void>;
  onUpdate?: (updated: UpdateScheduleInput) => void | Promise<unknown>;
};

export function ScheduleDetailModal({
  schedule,
  onClose,
  onDelete,
  onUpdate,
  isDeleting = false,
}: ScheduleDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(schedule.title);
  const [date, setDate] = useState(schedule.date ?? "");
  const [endDate, setEndDate] = useState(schedule.endDate ?? "");
  const [time, setTime] = useState(schedule.time ?? "");
  const [description, setDescription] = useState(schedule.description ?? "");
  const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState<Schedule["category"]>(
    schedule.category ?? "OTHER",
  );
  const [dateError, setDateError] = useState("");

  const categoryKey = (schedule.category ?? "OTHER") as NonNullable<
    Schedule["category"]
  >;
  const categoryMeta = CATEGORY_DISPLAY[categoryKey];

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setTitle(schedule.title);
    setDate(schedule.date ?? "");
    setEndDate(schedule.endDate ?? "");
    setTime(schedule.time ?? "");
    setDescription(schedule.description ?? "");
    setCategory(schedule.category ?? "OTHER");
    setDateError("");
  };

  const handleSave = async () => {
    if (!onUpdate) {
      setIsEditing(false);
      return;
    }

    const trimmedTitle = title.trim();
    if (!trimmedTitle || !date) {
      return;
    }

    if (endDate && endDate < date) {
      setDateError("종료일은 시작일보다 앞설 수 없습니다.");
      return;
    } else {
      setDateError("");
    }

    setSaving(true);
    await onUpdate({
      id: schedule.id,
      title: trimmedTitle,
      date,
      endDate: endDate || undefined,
      time: time || undefined,
      description: description || undefined,
      category,
    });
    setSaving(false);
    setIsEditing(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 modal-overlay-fade"
      onClick={isDeleting ? undefined : onClose}
    >
      <div
        className="bg-white border border-gray-200 rounded-2xl w-full max-w-md mx-4 shadow-xl modal-fade"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">일정 상세</h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className={`text-sm ${
              isDeleting
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-4 text-sm">
          {/* 제목 영역 */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-medium text-indigo-600">
                일정
              </div>
              {isEditing ? (
                <CategorySelect value={category} onChange={setCategory} />
              ) : (
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    categoryMeta?.className ?? ""
                  }`}
                >
                  {categoryMeta?.label ?? "기타"}
                </span>
              )}
            </div>
            {isEditing ? (
              <input
                className="w-full text-base font-semibold text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="일정 제목을 입력하세요"
              />
            ) : (
              <div className="text-base font-semibold text-gray-900 break-words">
                {schedule.title}
              </div>
            )}
          </div>

          {/* 날짜 / 시간 영역 */}
          <div className="rounded-xl bg-gray-50 px-3 py-2 space-y-1">
            <div className="flex items-center text-xs text-gray-600">
              <span className="mr-2">📅</span>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <span className="text-gray-400 text-[11px]">~</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              ) : (
                <span>
                  {schedule.endDate && schedule.endDate !== schedule.date
                    ? `${schedule.date} ~ ${schedule.endDate}`
                    : schedule.date}
                </span>
              )}
            </div>
            {dateError && (
              <div className="text-[11px] text-red-500 mt-1">{dateError}</div>
            )}
            <div className="flex items-center text-xs text-gray-600">
              <span className="mr-2">⏰</span>
              {isEditing ? (
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="border border-gray-300 rounded-md px-2 py-1 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : schedule.time ? (
                <span>{schedule.time}</span>
              ) : (
                <span className="text-gray-400">시간 정보 없음</span>
              )}
            </div>
          </div>

          {/* 설명 영역 */}
          <div className="space-y-1">
            <div className="text-xs text-gray-500">설명</div>
            {isEditing ? (
              <textarea
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 whitespace-pre-wrap focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="설명을 입력하세요."
              />
            ) : schedule.description ? (
              <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 whitespace-pre-wrap">
                {schedule.description}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 px-3 py-2 text-xs text-gray-400">
                설명이 없습니다.
              </div>
            )}
          </div>

          {/* 액션 버튼 */}
          <div className="flex justify-end gap-2 pt-3">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs text-gray-700 hover:bg-gray-100"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !title.trim() || !date}
                  className="px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-xs font-medium text-white"
                >
                  {saving ? "저장 중..." : "저장"}
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  disabled={isDeleting}
                  className={`inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-white ${
                    isDeleting
                      ? "bg-red-300 cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  {isDeleting && (
                    <span
                      aria-hidden
                      className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"
                    />
                  )}
                  {isDeleting ? "삭제 중..." : "삭제"}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isDeleting}
                  className={`px-3 py-1.5 rounded-lg border text-xs ${
                    isDeleting
                      ? "border-gray-200 text-gray-300 cursor-not-allowed"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  닫기
                </button>
                <button
                  type="button"
                  onClick={handleStartEdit}
                  disabled={isDeleting}
                  className={`px-3 py-1.5 rounded-lg border text-xs ${
                    isDeleting
                      ? "border-indigo-200 text-indigo-300 cursor-not-allowed"
                      : "border-indigo-500 text-indigo-600 hover:bg-indigo-50"
                  }`}
                >
                  수정
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  disabled={isDeleting}
                  className={`inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-white ${
                    isDeleting
                      ? "bg-red-300 cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  {isDeleting && (
                    <span
                      aria-hidden
                      className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"
                    />
                  )}
                  {isDeleting ? "삭제 중..." : "삭제"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
