export const runtime = "nodejs";

// app/api/schedules/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { isLeaveCategory, notifySlackLeave } from "@/lib/slack";
import { toDateOnly, toYmd } from "@/lib/date";

type Ctx = { params: Promise<{ id: string }> };

// PATCH /api/schedules/:id
export async function PATCH(req: Request, context: Ctx) {
  try {
    const { id: rawId } = await context.params;
    const id = Number(rawId);

    if (!Number.isFinite(id)) {
      return new NextResponse("Invalid id", { status: 400 });
    }

    const body = await req.json();

    const updated = await prisma.schedule.update({
      where: { id },
      data: {
        // 필드가 없으면 업데이트하지 않도록 undefined 유지
        title: body.title ?? undefined,
        description: body.description ?? undefined,
        time: body.time ?? undefined,
        category: body.category ?? undefined,
        date: body.date ? toDateOnly(body.date) : undefined,
        endDate:
          body.endDate === null
            ? null
            : body.endDate
              ? toDateOnly(body.endDate)
              : undefined,
      },
    });

    // 연차(DAY_OFF)로 수정된 경우 슬랙 알림
    if (isLeaveCategory(updated.category)) {
      await notifySlackLeave({
        title: updated.title,
        date: toYmd(updated.date),
        endDate: updated.endDate ? toYmd(updated.endDate) : undefined,
        isUpdated: true,
        category: updated.category,
      });
    }

    return NextResponse.json({
      ...updated,
      date: toYmd(updated.date),
      endDate: updated.endDate ? toYmd(updated.endDate) : undefined,
    });
  } catch (e: unknown) {
    // Prisma: record not found
    if (e instanceof PrismaClientKnownRequestError && e.code === "P2025") {
      return new NextResponse("Not found", { status: 404 });
    }
    console.error(e);
    return new NextResponse("서버 오류", { status: 500 });
  }
}

// DELETE /api/schedules/:id
export async function DELETE(_req: Request, context: Ctx) {
  try {
    const { id: rawId } = await context.params;
    const id = Number(rawId);

    if (!Number.isFinite(id)) {
      return new NextResponse("Invalid id", { status: 400 });
    }

    const result = await prisma.schedule.deleteMany({ where: { id } });

    if (result.count === 0) {
      return new NextResponse("Not found", { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (e: unknown) {
    if (e instanceof PrismaClientKnownRequestError && e.code === "P2025") {
      return new NextResponse("Not found", { status: 404 });
    }
    console.error(e);
    return new NextResponse("서버 오류", { status: 500 });
  }
}
