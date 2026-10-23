"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

// Admin and login pages aren't counted, so only real visitors show up.
const IGNORED_PATHS = ["/manage", "/login"];

function ignoreAdminPages(event: BeforeSendEvent) {
  const { pathname } = new URL(event.url);
  const ignored = IGNORED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
  return ignored ? null : event;
}

/**
 * Vercel Web Analytics: cookie-free page view counts (free on Hobby, 50k
 * events/month). Only sends data on Vercel deployments; in local dev it just
 * logs to the console.
 */
export function SiteAnalytics() {
  return <Analytics beforeSend={ignoreAdminPages} />;
}
