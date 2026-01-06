import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchSchedules,
  createSchedule,
  deleteSchedule,
  type CreateScheduleInput,
  UpdateScheduleInput,
  updateSchedule,
} from "@/lib/scheduleApi";
import type { Schedule } from "@/types/schedule";

const SCHEDULES_KEY = ["schedules"];

export function useSchedules(year?: number, month?: number) {
  return useQuery<Schedule[]>({
    queryKey: [...SCHEDULES_KEY, year, month],
    queryFn: () => fetchSchedules(year, month),
    refetchInterval: 60000, // 1분마다 자동 갱신
    refetchOnWindowFocus: true, // 창 활성화 시 갱신
  });
}

export function useCreateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateScheduleInput) => createSchedule(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCHEDULES_KEY });
    },
  });
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCHEDULES_KEY });
    },
  });
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateScheduleInput) => updateSchedule(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCHEDULES_KEY });
    },
  });
}
