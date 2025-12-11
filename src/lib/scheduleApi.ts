import type { Schedule } from "@/types/schedule";

export type UpdateScheduleInput = Omit<Schedule, "createdAt" | "updatedAt">;

let mockData: Schedule[] = [
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
  {
    id: 3,
    title: "릴리즈 점검",
    description: "저녁 배포 전 최종 체크리스트 점검",
    date: "2025-12-13",
    time: "16:00",
    category: "IMPORTANT",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    title: "사내 잡일",
    description: "간단한 정리 및 문서 업데이트",
    date: "2025-12-11",
    time: "15:00",
    category: "OTHER",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let nextId = 5;

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export async function fetchSchedules(): Promise<Schedule[]> {
  await delay(200);
  return mockData;
}

export type CreateScheduleInput = Omit<
  Schedule,
  "id" | "createdAt" | "updatedAt"
>;

export async function createSchedule(
  payload: CreateScheduleInput,
): Promise<Schedule> {
  await delay(200);
  const newItem: Schedule = {
    ...payload,
    id: nextId++,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockData = [...mockData, newItem];
  return newItem;
}

export async function deleteSchedule(id: number): Promise<void> {
  await delay(150);
  mockData = mockData.filter((s) => s.id !== id);
}

export async function updateSchedule(
  payload: UpdateScheduleInput,
): Promise<Schedule> {
  await delay(200);

  // Find existing schedule
  const index = mockData.findIndex((s) => s.id === payload.id);
  if (index === -1) {
    throw new Error("Schedule not found");
  }

  const updated: Schedule = {
    ...mockData[index],
    ...payload,
    updatedAt: new Date().toISOString(),
  };

  mockData[index] = updated;
  return updated;
}
