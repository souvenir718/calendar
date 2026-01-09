import { ScheduleCategory } from "@/types/schedule";

export const runtime = "nodejs";
// app/api/schedules/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

type LeaveCategory = Extract<
  ScheduleCategory,
  "DAY_OFF" | "AM_HALF" | "PM_HALF"
>;

export const isLeaveCategory = (c: ScheduleCategory): c is LeaveCategory =>
  c === "DAY_OFF" || c === "AM_HALF" || c === "PM_HALF";

export async function notifySlackLeave(params: {
  title: string;
  date: string;
  endDate?: string;
  isUpdated?: boolean;
  category: LeaveCategory;
}) {
  if (!SLACK_WEBHOOK_URL) return; // 설정 안 했으면 조용히 스킵

  const formatKoreanDate = (ymd: string) => {
    const [y, m, d] = ymd.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
    const dayName = weekdays[date.getUTCDay()];
    return `${y}년 ${m}월 ${d}일(${dayName})`;
  };

  const range =
    params.endDate && params.endDate !== params.date
      ? `${formatKoreanDate(params.date)} ~ ${formatKoreanDate(params.endDate)}`
      : formatKoreanDate(params.date);

  const action = params.isUpdated ? "로 변경되었습니다" : "사용 예정입니다";
  let leaveLabel = "연차";
  if (params.category === "AM_HALF") leaveLabel = "오전 반차";
  if (params.category === "PM_HALF") leaveLabel = "오후 반차";

  const text = `*${range}* ${leaveLabel} ${action}. 업무에 참고 부탁드립니다 🙇‍♂️`;

  const attachments = [
    {
      color: "#36a64f",
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `🏖 ${params.title}`,
            emoji: true,
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: text,
            },
          ],
        },
      ],
    },
  ];

  try {
    await fetch(SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attachments }),
    });
  } catch (e) {
    // 슬랙 전송 실패가 API 성공/실패를 좌우하지 않도록 한다
    console.error("Slack notify failed", e);
  }
}

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
