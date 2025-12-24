export type ScheduleCategory =
  | "DAY_OFF"
  | "MEETING"
  | "IMPORTANT"
  | "PAYDAY"
  | "HOLIDAY"
  | "OTHER";

export type Schedule = {
  id: number;
  title: string;
  description?: string;
  date: string;
  endDate?: string | null;
  time?: string;
  category?: ScheduleCategory;
  createdAt: string;
  updatedAt: string;
};
