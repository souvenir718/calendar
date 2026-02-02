"use client";

import type { Schedule } from "@/types/schedule";
import { useBackExit } from "@/hooks/useBackExit";

type DayScheduleListModalProps = {
    date: string;
    schedules: Schedule[];
    onClose: () => void;
    onScheduleClick: (schedule: Schedule) => void;
};

const CATEGORY_LABEL_MAP: Record<string, string> = {
    MEETING: "미팅",
    DAY_OFF: "연차",
    AM_HALF: "오전반차",
    PM_HALF: "오후반차",
    IMPORTANT: "중요",
    PAYDAY: "월급날",
    HOLIDAY: "공휴일",
    OTHER: "기타",
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
    return CATEGORY_CLASS_MAP[key];
}

export function DayScheduleListModal({
    date,
    schedules,
    onClose,
    onScheduleClick,
}: DayScheduleListModalProps) {
    useBackExit(onClose);
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 modal-overlay-fade"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl w-full max-w-sm mx-4 shadow-xl modal-fade flex flex-col max-h-[80vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-700 shrink-0">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {date} 일정
                        <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
                            총 {schedules.length}개
                        </span>
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm p-1"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-2 overflow-y-auto flex-1">
                    {schedules.length === 0 ? (
                        <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
                            일정이 없습니다.
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {schedules.map((schedule) => (
                                <div
                                    key={schedule.id}
                                    className={`rounded-lg px-3 py-2 cursor-pointer transition-colors flex items-center gap-2 ${getCategoryClasses(
                                        schedule.category,
                                    )} hover:brightness-95`}
                                    onClick={() => {
                                        onScheduleClick(schedule);
                                        // 모바일 UX상 리스트 모달은 닫는 게 자연스러울 수 있으나,
                                        // 사용자가 다시 돌아오고 싶을 수 있으므로 유지하거나 닫는 것은 부모의 결정에 따름.
                                        // 여기서는 단순히 클릭 이벤트만 전달.
                                    }}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium truncate">
                                            {getCategoryLabel(schedule.category)}
                                            {schedule.title}
                                        </div>
                                        {schedule.time && (
                                            <div className="text-xs opacity-80 mt-0.5">
                                                {schedule.time}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-3 border-t border-gray-200 dark:border-slate-700 shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}
