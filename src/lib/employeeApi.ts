import type { Employee } from "@/types/schedule";

const BASE_URL = "/api/employees";

export async function fetchEmployees(): Promise<Employee[]> {
  const res = await fetch(BASE_URL, { method: "GET" });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }

  return res.json() as Promise<Employee[]>;
}
