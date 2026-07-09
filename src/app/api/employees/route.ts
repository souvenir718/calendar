export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toYmd } from "@/lib/date";

// GET /api/employees
export async function GET() {
  const employees = await prisma.employee.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json(
    employees.map((e) => ({
      id: e.id,
      name: e.name,
      email: e.email ?? undefined,
      joinedAt: e.joinedAt ? toYmd(e.joinedAt) : undefined,
    })),
  );
}
