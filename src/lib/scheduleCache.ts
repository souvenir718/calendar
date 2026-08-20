import { unstable_cache } from "next/cache";
import type { Schedule } from "@/types/schedule";

export const SCHEDULES_CACHE_TAG = "schedules";

export const getCachedSchedules = unstable_cache(
  async (year?: number, month?: number): Promise<Schedule[]> => {
    const { getSchedules } = await import("@/lib/scheduleService");

    return getSchedules({
      year,
      month,
      logLabel: "GET /api/schedules",
    });
  },
  ["schedules"],
  {
    tags: [SCHEDULES_CACHE_TAG],
    revalidate: 60 * 6,
  },
);
