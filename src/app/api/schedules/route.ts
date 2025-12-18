// app/api/schedules/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// YYYY-MM-DD -> Date (UTC 기준, 날짜 밀림 방지)
export const toDateOnly = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

// Date -> YYYY-MM-DD (UTC 기준)
export const toYmd = (d: Date) => {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// GET /api/schedules
export async function GET() {
  const rows = await prisma.schedule.findMany({
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
