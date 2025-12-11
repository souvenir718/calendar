// app/api/schedules/[id]/route.ts
import { NextResponse } from "next/server";
import type { Schedule } from "@/types/schedule";
import { schedules } from "@/app/api/schedules/store";

// PATCH /api/schedules/:id
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id: rawId } = await context.params;
    const id = Number(rawId);
    const body = await req.json();
    const store = schedules;

    const index = store.findIndex((s) => s.id === id);
    if (index === -1) {
      return new NextResponse("Not found", { status: 404 });
    }

    const prev = store[index];
    const updated: Schedule = {
      ...prev,
      ...body,
      id,
      updatedAt: new Date().toISOString(),
    };

    store[index] = updated;

    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return new NextResponse("서버 오류", { status: 500 });
  }
}

// DELETE /api/schedules/:id
export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id: rawId } = await context.params;
    const id = Number(rawId);
    const store = schedules;
    const index = store.findIndex((s) => s.id === id);

    if (index === -1) {
      return new NextResponse("Not found", { status: 404 });
    }

    store.splice(index, 1);

    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error(e);
    return new NextResponse("서버 오류", { status: 500 });
  }
}
