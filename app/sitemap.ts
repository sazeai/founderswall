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
    // Get dynamic content with better error handling
    const [mugshotsResult, productsResult, storiesResult] = await Promise.allSettled([
      getMugshots(),
      getProducts(),
      getBuildStories(),
    ])

    // Extract successful results
    const mugshots = mugshotsResult.status === "fulfilled" ? mugshotsResult.value : []
    const products = productsResult.status === "fulfilled" ? productsResult.value : []
    const stories = storiesResult.status === "fulfilled" ? storiesResult.value : []

    console.log(
      `Sitemap generation: ${mugshots.length} mugshots, ${products.length} products, ${stories.length} stories`,
    )

    // Founder/Maker pages
    const founderPages: MetadataRoute.Sitemap = mugshots.map((mugshot) => {
      // Create username slug from name
      const username = mugshot.name
        .toLowerCase()
        .trim()
        .split(" ")
        .slice(0, 2) // Only first two words
        .join("-")
        .replace(/[^a-z0-9-]/g, "") // Remove special characters
        .replace(/-+/g, "-") // Replace multiple hyphens with single
        .replace(/^-|-$/g, "") // Remove leading/trailing hyphens

      return {
        url: `${baseUrl}/maker/${username}`,
        lastModified: new Date(mugshot.updated_at || mugshot.created_at || new Date()),
        changeFrequency: "weekly" as const,
        priority: mugshot.featured ? 0.9 : 0.7,
      }
    })

    // Product launch pages
    const productPages: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${baseUrl}/launch/${product.slug}`,
      lastModified: new Date(product.updated_at || product.launch_date || product.created_at || new Date()),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))

    // Story pages
    const storyPages: MetadataRoute.Sitemap = stories.map((story) => ({
      url: `${baseUrl}/stories/${story.slug}`,
      lastModified: new Date(story.updated_at || story.created_at || new Date()),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }))

    // Log the counts for debugging
    console.log(`Sitemap URLs generated:`)
    console.log(`- Static pages: ${staticPages.length}`)
    console.log(`- Founder pages: ${founderPages.length}`)
    console.log(`- Product pages: ${productPages.length}`)
    console.log(`- Story pages: ${storyPages.length}`)
    console.log(`- Total: ${staticPages.length + founderPages.length + productPages.length + storyPages.length}`)

    // Combine all pages
    return [...staticPages, ...founderPages, ...productPages, ...storyPages]
  } catch (error) {
    console.error("Error generating sitemap:", error)
    // Return static pages if dynamic content fails
    return staticPages
  }
}
