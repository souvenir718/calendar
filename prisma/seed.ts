// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// YYYY-MM-DD -> Date(UTC) (날짜 밀림 방지)
const toDateOnlyUTC = (y: number, m1: number, d: number) =>
  new Date(Date.UTC(y, m1 - 1, d));

// Date -> YYYY-MM-DD (UTC)
const toYmdUTC = (date: Date) => {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

function nextWeekdayIfWeekend(date: Date) {
  // date는 UTC로 만들었지만, 요일 계산은 로컬/UTC가 섞이면 위험하니 UTC 기준으로만 체크
  while (date.getUTCDay() === 0 || date.getUTCDay() === 6) {
    date.setUTCDate(date.getUTCDate() + 1);
  }
  return date;
}

async function main() {
  const today = new Date();
  const startYear = today.getUTCFullYear();
  const startMonth0 = today.getUTCMonth(); // 0-based
  const endYear = startYear + 1;
  const endMonth0 = 11; // Dec

  let createdCount = 0;
  let skippedCount = 0;

  for (let year = startYear; year <= endYear; year++) {
    const monthFrom = year === startYear ? startMonth0 : 0;
    const monthTo = year === endYear ? endMonth0 : 11;

    for (let month0 = monthFrom; month0 <= monthTo; month0++) {
      // 월급 기준일: 매월 10일
      const base = toDateOnlyUTC(year, month0 + 1, 10);
      const payday = nextWeekdayIfWeekend(base);

      const dateKey = toYmdUTC(payday);

      // 중복 방지: 같은 dateKey에 PAYDAY가 이미 있으면 스킵
      const exists = await prisma.schedule.findFirst({
        where: {
          category: "PAYDAY",
          date: payday, // @db.Date라 날짜만 비교됨
        },
        select: { id: true },
      });

      if (exists) {
        skippedCount++;
        continue;
      }

      await prisma.schedule.create({
        data: {
          title: "💰월급날💰",
          description: "Flex!!",
          category: "PAYDAY",
          date: payday,
          endDate: null,
          time: null,
        },
      });

      createdCount++;
      console.log(`✅ created PAYDAY: ${dateKey}`);
    }
  }

  console.log(`\nDone. created=${createdCount}, skipped=${skippedCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
