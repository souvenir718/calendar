// prisma/seed.ts
import { PrismaClient, ScheduleCategory } from "@prisma/client";

const prisma = new PrismaClient();

// YYYY-MM-DD -> Date(UTC) (날짜 밀림 방지)
const toDateOnlyUTC = (y: number, m1: number, d: number) =>
  new Date(Date.UTC(y, m1 - 1, d));

// 2026년 대한민국 공휴일 (대체공휴일 포함)
const HOLIDAYS: Array<{ title: string; month: number; day: number }> = [
  // 신정
  { title: "신정", month: 1, day: 1 }, // 01-01 (목)

  // 설날
  { title: "설날 연휴", month: 2, day: 16 }, // 02-16 (월)
  { title: "설날", month: 2, day: 17 }, // 02-17 (화)
  { title: "설날 연휴", month: 2, day: 18 }, // 02-18 (수)

  // 삼일절
  { title: "삼일절", month: 3, day: 1 }, // 03-01 (일)
  { title: "대체공휴일(삼일절)", month: 3, day: 2 }, // 03-02 (월)

  // 어린이날
  { title: "어린이날", month: 5, day: 5 }, // 05-05 (화)

  // 부처님 오신 날
  { title: "부처님 오신 날", month: 5, day: 24 }, // 05-24 (일)
  { title: "대체공휴일(부처님 오신 날)", month: 5, day: 25 }, // 05-25 (월)

  // 현충일
  { title: "현충일", month: 6, day: 6 }, // 06-06 (토)

  // 광복절
  { title: "광복절", month: 8, day: 15 }, // 08-15 (토)
  { title: "대체공휴일(광복절)", month: 8, day: 17 }, // 08-17 (월)

  // 추석
  { title: "추석 연휴", month: 9, day: 24 }, // 09-24 (목)
  { title: "추석", month: 9, day: 25 }, // 09-25 (금)
  { title: "추석 연휴", month: 9, day: 26 }, // 09-26 (토)

  // 개천절
  { title: "개천절", month: 10, day: 3 }, // 10-03 (토)
  { title: "대체공휴일(개천절)", month: 10, day: 5 }, // 10-05 (월)

  // 한글날
  { title: "한글날", month: 10, day: 9 }, // 10-09 (금)

  // 크리스마스
  { title: "크리스마스", month: 12, day: 25 }, // 12-25 (금)
];

async function main() {
  for (const h of HOLIDAYS) {
    const date = toDateOnlyUTC(2026, h.month, h.day);

    const exists = await prisma.schedule.findFirst({
      where: {
        category: ScheduleCategory.HOLIDAY,
        date,
      },
      select: { id: true },
    });

    if (!exists) {
      await prisma.schedule.create({
        data: {
          title: `🎌 ${h.title}`,
          description: "공휴일",
          category: ScheduleCategory.HOLIDAY,
          date,
          endDate: null,
          time: null,
        },
      });
    }
  }
  console.log("[seed] HOLIDAY seeding completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
