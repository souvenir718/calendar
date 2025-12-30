export type ScheduleCategory =
  | "DAY_OFF" // 연차(종일)
  | "AM_HALF" // 오전반차
  | "PM_HALF" // 오후반차
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
