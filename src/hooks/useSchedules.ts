import { useCallback } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
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

type UseSchedulesOptions = {
  enabled?: boolean;
  initialData?: Schedule[];
};

export function useSchedules(
  year?: number,
  month?: number,
  options?: UseSchedulesOptions,
) {
  return useQuery<Schedule[]>({
    queryKey: [...SCHEDULES_KEY, year, month],
    queryFn: () => fetchSchedules(year, month),
    enabled: options?.enabled ?? true,
    initialData: options?.initialData,
    staleTime: 1000 * 60 * 15, // 15분 동안 캐시 유지 (Neon autosuspend 5분보다 길게 유지해 DB Compute 절약)
    refetchInterval: 1000 * 60 * 15, // 15분마다 자동 갱신 (다른 모니터 데이터 최신화 + DB Compute 절약)
    refetchOnWindowFocus: false, // 창 활성화 시 잦은 갱신 방지 (DB Compute 시간 절약)
    placeholderData: keepPreviousData, // 월 전환 시 이전 달 데이터를 유지해 화면이 비지 않도록 함
  });
}

function getAdjacentYearMonth(year: number, month: number, offset: number) {
  const date = new Date(year, month - 1 + offset, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

export function usePrefetchAdjacentSchedules(year?: number, month?: number) {
  const queryClient = useQueryClient();

  return useCallback(() => {
    if (!year || !month) {
      return;
    }

    [-1, 1].forEach((offset) => {
      const { year: adjacentYear, month: adjacentMonth } =
        getAdjacentYearMonth(year, month, offset);

      void queryClient.prefetchQuery({
        queryKey: [...SCHEDULES_KEY, adjacentYear, adjacentMonth],
        queryFn: () => fetchSchedules(adjacentYear, adjacentMonth),
        staleTime: 1000 * 60 * 5,
      });
    });
  }, [queryClient, year, month]);
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
