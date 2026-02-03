import { ScheduleCategory } from "@/types/schedule";

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

type LeaveCategory = Extract<
  ScheduleCategory,
  "DAY_OFF" | "AM_HALF" | "PM_HALF"
>;

export const isLeaveCategory = (c: ScheduleCategory): c is LeaveCategory =>
  c === "DAY_OFF" || c === "AM_HALF" || c === "PM_HALF";

// YYYY-MM-DD -> 2024. 3. 4(월)
const formatKoreanDate = (ymd: string) => {
  const [y, m, d] = ymd.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const dayName = weekdays[date.getUTCDay()];
  return `${y}. ${m}. ${d}(${dayName})`;
};

const sendSlackMessage = async (payload: unknown) => {
  if (!SLACK_WEBHOOK_URL) {
    console.warn("SLACK_WEBHOOK_URL is not defined");
    return;
  }

  try {
    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      console.error("Failed to send slack message", await response.text());
    }
  } catch (e) {
    console.error("Slack notify failed", e);
  }
};

export async function notifySlackLeave(params: {
  title: string;
  date: string;
  endDate?: string;
  isUpdated?: boolean;
  category: LeaveCategory;
}) {
  const range =
    params.endDate && params.endDate !== params.date
      ? `${formatKoreanDate(params.date)} ~ ${formatKoreanDate(params.endDate)}`
      : formatKoreanDate(params.date);

  const action = params.isUpdated ? "로 변경되었습니다" : "사용 예정입니다";
  let leaveLabel = "연차";
  if (params.category === "AM_HALF") leaveLabel = "오전 반차";
  if (params.category === "PM_HALF") leaveLabel = "오후 반차";

  const text = `*${range}* ${leaveLabel} ${action}.\n업무에 참고 부탁드립니다 🙇‍♂️`;

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

  await sendSlackMessage({ attachments });
}

const CATEGORY_LABEL: Record<ScheduleCategory, string> = {
  DAY_OFF: "연차",
  AM_HALF: "오전반차",
  PM_HALF: "오후반차",
  IMPORTANT: "중요",
  MEETING: "미팅",
  PAYDAY: "월급날",
  HOLIDAY: "공휴일",
  OTHER: "기타",
};

export async function notifySlackReminder(params: {
  title: string;
  date: string;
  endDate?: string | null;
  category: ScheduleCategory;
}) {
  const range =
    params.endDate && params.endDate !== params.date
      ? `${formatKoreanDate(params.date)} ~ ${formatKoreanDate(params.endDate)}`
      : formatKoreanDate(params.date);

  const label = CATEGORY_LABEL[params.category] || "일정";
  const text = `*${range}* ${label} 리마인드 드립니다.\n업무에 참고 부탁드립니다 🙇‍♂️`;

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

  await sendSlackMessage({ attachments });
}
