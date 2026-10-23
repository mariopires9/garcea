// Server only: reads Vercel Web Analytics through Vercel's REST API for the
// /manage/analytics page. Needs a Vercel access token (VERCEL_ANALYTICS_TOKEN,
// a secret - never NEXT_PUBLIC_) and the team id (VERCEL_ANALYTICS_TEAM_ID).
// Results are cached for a few minutes so reloading the page doesn't hit the
// API every time.

const API = "https://api.vercel.com/v1/query/web-analytics/visits";
const CACHE_SECONDS = 600;

export type Totals = { pageviews: number; visitors: number };
export type DailyRow = Totals & { day: string };
export type RankedRow = Totals & { key: string };

export type AnalyticsDimension = "requestPath" | "referrerHostname" | "country" | "deviceType";

export type AnalyticsSummary = {
  since: string;
  until: string;
  totals: Totals;
  daily: DailyRow[];
  top: Record<AnalyticsDimension, RankedRow[]>;
};

export type AnalyticsResult =
  | { status: "ok"; summary: AnalyticsSummary }
  | { status: "not-configured" }
  | { status: "error"; httpStatus: number | null; message: string };

const DIMENSIONS: AnalyticsDimension[] = ["requestPath", "referrerHostname", "country", "deviceType"];

class AnalyticsApiError extends Error {
  constructor(
    readonly httpStatus: number | null,
    message: string,
  ) {
    super(message);
  }
}

function config() {
  const token = process.env.VERCEL_ANALYTICS_TOKEN?.trim();
  const teamId = process.env.VERCEL_ANALYTICS_TEAM_ID?.trim();
  const projectId = process.env.VERCEL_ANALYTICS_PROJECT_ID?.trim() || "garcea";
  return token && teamId ? { token, teamId, projectId } : null;
}

async function query<T>(
  endpoint: "count" | "aggregate",
  params: Record<string, string>,
  { token, teamId, projectId }: NonNullable<ReturnType<typeof config>>,
): Promise<T> {
  const search = new URLSearchParams({ projectId, teamId, ...params });
  let response: Response;
  try {
    response = await fetch(`${API}/${endpoint}?${search}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: CACHE_SECONDS },
    });
  } catch (error) {
    throw new AnalyticsApiError(null, error instanceof Error ? error.message : String(error));
  }
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new AnalyticsApiError(response.status, body.slice(0, 300));
  }
  const json = (await response.json()) as { data: T };
  return json.data;
}

function toDayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

/** Visits for the last `days` days (today included), as shown on /manage/analytics. */
export async function getAnalyticsSummary(days: number): Promise<AnalyticsResult> {
  const settings = config();
  if (!settings) return { status: "not-configured" };

  const now = new Date();
  const start = new Date(now);
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  const range = { since: start.toISOString(), until: now.toISOString() };

  try {
    const [totals, dailyRows, ...topRows] = await Promise.all([
      query<Totals>("count", range, settings),
      query<(Totals & { timestamp: string })[]>("aggregate", { ...range, by: "day" }, settings),
      ...DIMENSIONS.map((dimension) =>
        query<(Totals & Record<string, unknown>)[]>(
          "aggregate",
          { ...range, by: dimension, limit: "8" },
          settings,
        ),
      ),
    ]);

    // The API leaves out days without visits; show them as zero.
    const byDay = new Map(dailyRows.map((row) => [toDayKey(new Date(row.timestamp)), row]));
    const daily: DailyRow[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(start);
      date.setUTCDate(start.getUTCDate() + i);
      const key = toDayKey(date);
      const row = byDay.get(key);
      daily.push({ day: key, pageviews: row?.pageviews ?? 0, visitors: row?.visitors ?? 0 });
    }

    const top = Object.fromEntries(
      DIMENSIONS.map((dimension, index) => [
        dimension,
        topRows[index].map((row) => ({
          key: String(row[dimension] ?? ""),
          pageviews: row.pageviews,
          visitors: row.visitors,
        })),
      ]),
    ) as Record<AnalyticsDimension, RankedRow[]>;

    return {
      status: "ok",
      summary: { ...range, totals: { pageviews: totals.pageviews, visitors: totals.visitors }, daily, top },
    };
  } catch (error) {
    const httpStatus = error instanceof AnalyticsApiError ? error.httpStatus : null;
    const message = error instanceof Error ? error.message : String(error);
    console.error("Vercel Web Analytics API failed:", httpStatus, message);
    return { status: "error", httpStatus, message };
  }
}
