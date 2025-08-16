// Script to be run at 8am UTC on Mondays and Thursdays
// Finds products whose launch period just ended and aggregates their data for AI summary

import { createClient } from "@/utils/supabase/server"

async function main() {
  const supabase = await createClient()
  const now = new Date()

  // Determine which products' launch period just ended
  // (Launched on Mon, period ends Thu 8am; launched Thu, period ends Mon 8am)
  // For now, just find products launched 3-4 days ago (approximate)
  const periodAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000)
  const { data: products, error } = await supabase
    .from("products")
    .select("id, slug, title, launch_date, founder_id, summary, upvotes")
    .lte("launch_date", periodAgo.toISOString())
    .is("ai_summary", null)
    .eq("is_visible", true)

  if (error) {
    console.error("Error fetching products:", error)
    return
  }

  if (!products || products.length === 0) {
    console.log("No products found for AI summary generation.")
    return
  }

  for (const product of products) {
    // TODO: Aggregate timeline, logs, upvotes, etc.
    // TODO: Call OpenAI or similar to generate summary
    // For now, just log the product
    console.log(`Would generate AI summary for product: ${product.slug}`)
  }
}

main().catch(console.error)
