// src/constants/categoryOptions.ts
import type { Schedule } from "@/types/schedule";

export const CATEGORY_OPTIONS: {
  value: Schedule["category"];
  label: string;
}[] = [
  { value: "DAY_OFF", label: "연차 / 휴가" },
  { value: "MEETING", label: "미팅" },
  { value: "IMPORTANT", label: "중요" },
  { value: "PAYDAY", label: "월급날" },
  { value: "HOLIDAY", label: "공휴일" },
  { value: "OTHER", label: "기타" },
];
