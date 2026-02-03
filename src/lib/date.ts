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
