// app/api/schedules/route.ts
import { NextResponse } from "next/server";
import type { Schedule } from "@/types/schedule";
import { getNextId, schedules } from "@/app/api/schedules/store";

// GET /api/schedules
export async function GET() {
  // 나중에 여기서 DB에서 읽어오면 됨
  return NextResponse.json(schedules);
}

// POST /api/schedules
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.title || !body.date) {
      return new NextResponse("title, date는 필수입니다.", { status: 400 });
    }

    const now = new Date().toISOString();

    const newSchedule: Schedule = {
      id: getNextId(),
      title: body.title,
      description: body.description ?? undefined,
      date: body.date,
      endDate: body.endDate ?? null,
      time: body.time ?? undefined,
      category: body.category ?? "OTHER",
      createdAt: now,
      updatedAt: now,
    };

    schedules.push(newSchedule);

    return NextResponse.json(newSchedule, { status: 201 });
  } catch (e) {
    console.error(e);
    return new NextResponse("서버 오류", { status: 500 });
  }
}
