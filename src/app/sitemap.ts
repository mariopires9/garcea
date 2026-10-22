import type { MetadataRoute } from "next";
import { executeGraphQL } from "@/lib/graphql-server";
import { EVENT_OPTIONS_QUERY } from "@/lib/queries/events";
import { SITE_URL } from "@/lib/site";

type EventsData = { events: { id: string; title: string; date: string }[] };

// /gallery is left out on purpose: it was removed from the nav and is only
// reachable by direct link.
const STATIC_PATHS = ["/", "/events", "/history", "/contacts"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { events } = await executeGraphQL<EventsData>(EVENT_OPTIONS_QUERY);

  return [
    ...STATIC_PATHS.map((path) => ({ url: `${SITE_URL}${path === "/" ? "" : path}` })),
    ...events.map((event) => ({ url: `${SITE_URL}/events/${event.id}` })),
  ];
}
