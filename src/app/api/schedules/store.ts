// app/api/schedules/store.ts
import type { Schedule } from "@/types/schedule";

const globalForSchedules = globalThis as unknown as {
  schedules?: Schedule[];
  nextId?: number;
};

function formatDateKey(d: Date) {
  const year = d.getFullYear();
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function generateMonthlyPaydays(startId: number): {
  schedules: Schedule[];
  nextId: number;
} {
  const result: Schedule[] = [];
  let nextId = startId;

  const today = new Date();
  const startYear = today.getFullYear();
  const startMonth = today.getMonth(); // 0-based
  const endYear = startYear + 1;
  const endMonth = 11; // December

  for (let year = startYear; year <= endYear; year++) {
    const monthFrom = year === startYear ? startMonth : 0;
    const monthTo = year === endYear ? endMonth : 11;

    for (let month = monthFrom; month <= monthTo; month++) {
      const date = new Date(year, month, 10);

      // 주말(토:6, 일:0)이면 다음 평일까지 이동
      while (date.getDay() === 0 || date.getDay() === 6) {
        date.setDate(date.getDate() + 1);
      }

      result.push({
        id: nextId++,
        title: "💰월급날 💰",
        description: "Flex!!",
        date: formatDateKey(date),
        time: undefined,
        category: "PAYDAY",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  return { schedules: result, nextId };
}

if (!globalForSchedules.schedules) {
  const baseSchedules: Schedule[] = [];

  const { schedules: paydaySchedules, nextId } = generateMonthlyPaydays(
    baseSchedules.length + 1,
  );

  globalForSchedules.schedules = [...baseSchedules, ...paydaySchedules];
  globalForSchedules.nextId = nextId;
}

export const schedules = globalForSchedules.schedules!;
export function getNextId() {
  return globalForSchedules.nextId!++;
}
