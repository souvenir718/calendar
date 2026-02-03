export const runtime = "nodejs";
// app/api/schedules/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// notifySlackLeave removed, importing from lib/slack
import { notifySlackLeave, isLeaveCategory } from "@/lib/slack";
import { toDateOnly, toYmd } from "@/lib/date";

// GET /api/schedules
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const yearParam = searchParams.get("year");
  const monthParam = searchParams.get("month");

  let whereClause = {};

  if (yearParam && monthParam) {
    const year = parseInt(yearParam, 10);
    const month = parseInt(monthParam, 10);

    // month is 1-based (1~12)
    // RangeStart: 해당 월 1일
    const rangeStart = new Date(Date.UTC(year, month - 1, 1));
    // RangeEnd: 다음 달 1일
    const rangeEnd = new Date(Date.UTC(year, month, 1));

    // Overlap condition:
    // (Schedule Start < Range End) AND (Schedule End >= Range Start)
    // Note: If endDate is null, we assume endDate = date
    whereClause = {
      AND: [
        { date: { lt: rangeEnd } },
        {
          OR: [
            { endDate: { not: null, gte: rangeStart } },
            { endDate: null, date: { gte: rangeStart } },
          ],
        },
      ],
    };
  }

  const rows = await prisma.schedule.findMany({
    where: whereClause,
    orderBy: { date: "asc" },
  });

  const schedules = rows.map((r) => ({
    ...r,
    date: toYmd(r.date),
    endDate: r.endDate ? toYmd(r.endDate) : undefined,
  }));

  return NextResponse.json(schedules);
}

// POST /api/schedules
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.title || !body.date) {
      return new NextResponse("title, date는 필수입니다.", { status: 400 });
    }

    const created = await prisma.schedule.create({
      data: {
        title: body.title,
        description: body.description ?? null,
        date: toDateOnly(body.date),
        endDate: body.endDate ? toDateOnly(body.endDate) : null,
        time: body.time ?? null,
        category: body.category ?? "OTHER",
      },
    });

    // 휴가/반차 등록 시 슬랙 알림
    if (isLeaveCategory(created.category)) {
      await notifySlackLeave({
        title: created.title,
        date: toYmd(created.date),
        endDate: created.endDate ? toYmd(created.endDate) : undefined,
        category: created.category,
      });
    }

    return NextResponse.json(
      {
        ...created,
        date: toYmd(created.date),
        endDate: created.endDate ? toYmd(created.endDate) : undefined,
      },
      { status: 201 },
    );
  } catch (e) {
    console.error(e);
    return new NextResponse("서버 오류", { status: 500 });
  }
}
