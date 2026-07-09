import { useQuery } from "@tanstack/react-query";
import { fetchEmployees } from "@/lib/employeeApi";
import type { Employee } from "@/types/schedule";

export function useEmployees() {
  return useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: fetchEmployees,
    staleTime: 1000 * 60 * 30, // 사원 목록은 자주 안 바뀌므로 30분 캐시
    refetchOnWindowFocus: false,
  });
}
