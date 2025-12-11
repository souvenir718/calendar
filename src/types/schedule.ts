export type ScheduleCategory = "DAY_OFF" | "MEETING" | "IMPORTANT" | "OTHER";

export type Schedule = {
  id: number;
  title: string;
  description?: string;
  date: string;
  time?: string;
  category?: ScheduleCategory;
  createdAt: string;
  updatedAt: string;
};
