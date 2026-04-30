export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifySlackLeave, isLeaveCategory } from "@/lib/slack";
import { toDateOnly, toYmd } from "@/lib/date";
import { getSchedules } from "@/lib/scheduleService";

// GET /api/schedules
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const yearParam = searchParams.get("year");
  const monthParam = searchParams.get("month");
  const year = yearParam ? parseInt(yearParam, 10) : undefined;
  const month = monthParam ? parseInt(monthParam, 10) : undefined;
  const schedules = await getSchedules({
    year,
    month,
    logLabel: "GET /api/schedules",
  });

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
