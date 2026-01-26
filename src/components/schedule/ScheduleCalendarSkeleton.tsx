export function ScheduleCalendarSkeleton() {
    return (
        <div className="flex flex-col gap-2 bg-white dark:bg-slate-800 animate-pulse">
            {/* 달력 헤더 스켈레톤 */}
            <div className="flex items-center justify-between mb-2 gap-2">
                <div className="flex items-center gap-2">
                    <div className="w-12 h-6 bg-gray-200 dark:bg-slate-700 rounded-full" />
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-slate-700" />
                    <div className="w-24 h-6 bg-gray-200 dark:bg-slate-700 rounded" />
                    <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-slate-700" />
                </div>
                <div className="w-16" />
            </div>

            {/* 요일 헤더 스켈레톤 */}
            <div className="grid grid-cols-7 text-center mb-1 border-b border-gray-200 dark:border-slate-700 pb-1">
                {[...Array(7)].map((_, i) => (
                    <div key={i} className="flex justify-center py-1">
                        <div className="w-4 h-4 bg-gray-200 dark:bg-slate-700 rounded" />
                    </div>
                ))}
            </div>

            {/* 달력 바디 스켈레톤 (6주 고정) */}
            <div className="grid grid-cols-7 gap-[2px] bg-gray-200 dark:bg-slate-700 border border-gray-200 dark:border-slate-700 rounded-md overflow-hidden">
                {[...Array(6)].map((_, weekIndex) =>
                    [...Array(7)].map((_, dayIndex) => (
                        <div
                            key={`${weekIndex}-${dayIndex}`}
                            className="min-h-[64px] sm:min-h-[72px] md:min-h-[96px] lg:min-h-[110px] bg-white dark:bg-slate-800 p-1"
                        >
                            {/* 날짜 숫자 위치 홀더 */}
                            <div className="flex justify-between mb-1">
                                <div className="w-5 h-5 bg-gray-100 dark:bg-slate-700 rounded-full" />
                            </div>
                            {/* 일정 바 홀더 (랜덤하게 일부만 보이게 하거나 비워둠) */}
                            <div className="hidden sm:block space-y-1 mt-1">
                                <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-3/4" />
                                <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-1/2" />
                            </div>
                            <div className="block sm:hidden space-y-[1px] mt-1">
                                <div className="h-[10px] bg-gray-100 dark:bg-slate-700 rounded w-full" />
                                <div className="h-[10px] bg-gray-100 dark:bg-slate-700 rounded w-2/3" />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
