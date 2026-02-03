import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifySlackReminder } from "@/lib/slack";
import { toYmd } from "@/lib/date";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const scheduleId = parseInt(id, 10);

    if (isNaN(scheduleId)) {
      return new NextResponse("Invalid ID", { status: 400 });
    }

    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule) {
      return new NextResponse("Schedule not found", { status: 404 });
    }

    await notifySlackReminder({
      title: schedule.title,
      date: toYmd(schedule.date),
      endDate: schedule.endDate ? toYmd(schedule.endDate) : undefined,
      category: schedule.category || "OTHER",
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Slack reminder error", e);
    return new NextResponse("Internal API Error", { status: 500 });
  }
}
