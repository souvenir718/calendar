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

export function useSchedules() {
  return useQuery<Schedule[]>({
    queryKey: SCHEDULES_KEY,
    queryFn: fetchSchedules,
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
