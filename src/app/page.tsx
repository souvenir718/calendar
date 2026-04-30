import { HomePageClient } from "@/app/HomePageClient";
import { getSchedules } from "@/lib/scheduleService";

export const dynamic = "force-dynamic";

function getSeoulYearMonth() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "numeric",
  });
  const parts = formatter.formatToParts(new Date());
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  return { year, month };
}

export default async function HomePage() {
  const initialViewDate = getSeoulYearMonth();
  const initialSchedules = await getSchedules({
    year: initialViewDate.year,
    month: initialViewDate.month,
  });

  return (
    <HomePageClient
      initialViewDate={initialViewDate}
      initialSchedules={initialSchedules}
    />
  );
}
