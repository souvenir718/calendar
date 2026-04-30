import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { toYmd } from "@/lib/date";
import type { Schedule } from "@/types/schedule";

type GetSchedulesOptions = {
  year?: number;
  month?: number;
  logLabel?: string;
};

function buildMonthWhereClause(
  year?: number,
  month?: number,
): Prisma.ScheduleWhereInput {
  if (!year || !month) {
    return {};
  }

  const rangeStart = new Date(Date.UTC(year, month - 1, 1));
  const rangeEnd = new Date(Date.UTC(year, month, 1));

  return {
    AND: [
      { date: { lt: rangeEnd } },
      {
        OR: [
          { endDate: { not: null, gte: rangeStart } },
          { endDate: null, date: { gte: rangeStart } },
        ],
      },
    ],
  };
}

function logQueryDuration(
  label: string,
  durationMs: number,
  year?: number,
  month?: number,
  count?: number,
) {
  if (process.env.NODE_ENV === "production" && durationMs < 200) {
    return;
  }

  const targetMonth =
    year && month ? `${year}-${String(month).padStart(2, "0")}` : "all";

  console.info(
    `[schedules] ${label} month=${targetMonth} count=${count ?? "?"} duration=${durationMs.toFixed(2)}ms`,
  );
}

export async function getSchedules({
  year,
  month,
  logLabel,
}: GetSchedulesOptions = {}): Promise<Schedule[]> {
  const whereClause = buildMonthWhereClause(year, month);
  const startedAt = performance.now();

  const rows = await prisma.schedule.findMany({
    where: whereClause,
    orderBy: [{ date: "asc" }, { id: "asc" }],
  });

  const durationMs = performance.now() - startedAt;

  if (logLabel) {
    logQueryDuration(logLabel, durationMs, year, month, rows.length);
  }

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    date: toYmd(row.date),
    endDate: row.endDate ? toYmd(row.endDate) : undefined,
    time: row.time ?? undefined,
    category: row.category,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }));
}
