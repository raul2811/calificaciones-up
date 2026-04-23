import type { MetadataRoute } from "next";

import { getCanonicalUrl } from "@/lib/site";

const routes = ["/", "/login", "/dashboard", "/plan", "/analytics", "/pendientes", "/profesores", "/morosidad"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return routes.map((route) => ({
    url: getCanonicalUrl(route),
    lastModified: now,
    changeFrequency: route === "/" ? "weekly" : "daily",
    priority: route === "/" ? 1 : 0.7,
  }));
}
