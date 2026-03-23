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
    staleTime: 1000 * 60 * 5, // 5분 동안 캐시 유지 (불필요한 중복 호출 방지)
    refetchInterval: 1000 * 60 * 60 * 12, // 12시간마다 자동 갱신
    refetchOnWindowFocus: false, // 창 활성화 시 잦은 갱신 방지 (DB Compute 시간 절약)
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
