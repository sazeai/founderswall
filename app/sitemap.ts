import type { MetadataRoute } from "next"
import { getMugshots } from "@/lib/mugshot-service"
import { getProducts } from "@/lib/product-service"
import { getBuildStories } from "@/lib/build-story-service"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://founderswall.com"

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/launch`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/stories`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/station`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/uplift`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ]

  try {
    // Get dynamic content
    const [mugshots, products, stories] = await Promise.all([getMugshots(), getProducts(), getBuildStories()])

    // Founder/Maker pages
    const founderPages: MetadataRoute.Sitemap = mugshots.map((mugshot) => {
      // Normalize username for URL
      const username = mugshot.name
        .toLowerCase()
        .split(" ")
        .slice(0, 2) // Only first two words
        .join("-")
        .replace(/[^a-z0-9-]/g, "") // Remove special characters
        .replace(/-+/g, "-") // Replace multiple hyphens with single
        .replace(/^-|-$/g, "") // Remove leading/trailing hyphens

      return {
        url: `${baseUrl}/maker/${username}`,
        lastModified: new Date(mugshot.updatedAt || mugshot.createdAt),
        changeFrequency: "weekly" as const,
        priority: mugshot.featured ? 0.9 : 0.7,
      }
    })

    // Product launch pages
    const productPages: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${baseUrl}/launch/${product.slug}`,
      lastModified: new Date(product.updatedAt || product.launchDate),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))

    // Story pages
    const storyPages: MetadataRoute.Sitemap = stories.map((story) => ({
      url: `${baseUrl}/stories/${story.slug}`,
      lastModified: new Date(story.updatedAt || story.createdAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }))

    // Combine all pages
    return [...staticPages, ...founderPages, ...productPages, ...storyPages]
  } catch (error) {
    console.error("Error generating sitemap:", error)
    // Return static pages if dynamic content fails
    return staticPages
  }
}
