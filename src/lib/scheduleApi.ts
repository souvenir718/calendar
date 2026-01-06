import type { Schedule } from "@/types/schedule";

const BASE_URL = "/api/schedules";

export type CreateScheduleInput = Omit<
  Schedule,
  "id" | "createdAt" | "updatedAt"
>;

export type UpdateScheduleInput = Omit<Schedule, "createdAt" | "updatedAt">;

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchSchedules(
  year?: number,
  month?: number,
): Promise<Schedule[]> {
  const params = new URLSearchParams();
  if (year) params.append("year", String(year));
  if (month) params.append("month", String(month));

  const url = `${BASE_URL}?${params.toString()}`;

  const res = await fetch(url, {
    method: "GET",
  });

  return handleResponse<Schedule[]>(res);
}

export async function createSchedule(
  payload: CreateScheduleInput,
): Promise<Schedule> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<Schedule>(res);
}

export async function deleteSchedule(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok && res.status !== 204) {
    const text = await res.text();
    throw new Error(text || `Delete failed: ${res.status}`);
  }
}

export async function updateSchedule(
  payload: UpdateScheduleInput,
): Promise<Schedule> {
  const res = await fetch(`${BASE_URL}/${payload.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<Schedule>(res);
}
