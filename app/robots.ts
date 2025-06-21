import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/station/", "/api/", "/auth/", "/login", "/admin/"],
    },
    sitemap: "https://founderswall.com/sitemap.xml",
  }
}
