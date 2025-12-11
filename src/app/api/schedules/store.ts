// app/api/schedules/store.ts
import type { Schedule } from "@/types/schedule";

const globalForSchedules = globalThis as unknown as {
  schedules?: Schedule[];
  nextId?: number;
};

if (!globalForSchedules.schedules) {
  globalForSchedules.schedules = [
    {
      id: 1,
      title: "프론트 주간 스프린트 회의",
      description: "이번 주 프론트 작업 정리 및 이슈 공유",
      date: "2025-12-11",
      time: "10:00",
      category: "MEETING",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      title: "연차 - 동혁",
      description: "하루 종일 연차",
      date: "2025-12-12",
      category: "DAY_OFF",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  globalForSchedules.nextId = globalForSchedules.schedules.length + 1;
}

export const schedules = globalForSchedules.schedules!;
export function getNextId() {
  return globalForSchedules.nextId!++;
}
