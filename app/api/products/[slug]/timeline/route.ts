import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export const dynamic = "force-dynamic"

// Cache for GET timeline entries
interface CachedTimeline {
  timestamp: number;
  data: any[]; // Replace with specific TimelineEntry type if available
}
const timelineCache = new Map<string, CachedTimeline>();
const TIMELINE_CACHE_DURATION = 30000; // 30 seconds

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  const supabase = await createClient()
  const { slug } = await context.params

  try {
    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the product to check ownership
    const { data: product, error: fetchError } = await supabase.from("products").select("*").eq("slug", slug).single()

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Get the user's mugshot to check if they're the founder
    const { data: mugshot, error: mugshotError } = await supabase
      .from("mugshots")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (mugshotError && mugshotError.code !== "PGRST116") {
      return NextResponse.json({ error: mugshotError.message }, { status: 500 })
    }

    // Check if the user is the founder of the product
    if (mugshot?.id !== product.founder_id) {
      return NextResponse.json(
        { error: "You don't have permission to add timeline entries to this product" },
        { status: 403 },
      )
    }

    // Check if the user has already added an entry today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data: existingEntries, error: entriesError } = await supabase
      .from("timeline_entries")
      .select("created_at")
      .eq("product_id", product.id)
      .gte("created_at", today.toISOString())
      .order("created_at", { ascending: false })

    if (entriesError) {
      return NextResponse.json({ error: entriesError.message }, { status: 500 })
    }

    if (existingEntries && existingEntries.length > 0) {
      return NextResponse.json({ error: "You can only add one timeline entry per day" }, { status: 429 })
    }

    const entryData = await request.json()

    // Validate required fields
    if (!entryData.headline) {
      return NextResponse.json({ error: "Headline is required" }, { status: 400 })
    }

    // Insert the timeline entry
    const { data: entry, error: insertError } = await supabase
      .from("timeline_entries")
      .insert({
        product_id: product.id,
        headline: entryData.headline,
        description: entryData.description || null,
        date: entryData.date || new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Invalidate timeline cache for this slug
    const cacheKey = `timeline-${slug}`;
    timelineCache.delete(cacheKey);

    return NextResponse.json(entry)
  } catch (error) {
    return NextResponse.json({ error: "An unexpected error occurred. Please try again." }, { status: 500 })
  }
}

// Add a GET endpoint to fetch timeline entries
export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  const supabase = await createClient()
  const { slug } = await context.params

  const cacheKey = `timeline-${slug}`;
  const cachedEntry = timelineCache.get(cacheKey);
  if (cachedEntry && Date.now() - cachedEntry.timestamp < TIMELINE_CACHE_DURATION) {
    return NextResponse.json(cachedEntry.data);
  }

  try {
    // Get the product
    const { data: product, error: fetchError } = await supabase.from("products").select("id").eq("slug", slug).single()

    if (fetchError) {
      // Optionally cache error for a short period if desired, or just return
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!product) {
      timelineCache.set(cacheKey, { timestamp: Date.now(), data: [] }); // Cache empty result for not found product
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Get timeline entries
    const { data: entries, error: entriesError } = await supabase
      .from("timeline_entries")
      .select("*")
      .eq("product_id", product.id)
      .order("date", { ascending: false })

    if (entriesError) {
      // Optionally cache error for a short period
      return NextResponse.json({ error: entriesError.message }, { status: 500 })
    }

    const dataToCache = entries || [];
    timelineCache.set(cacheKey, { timestamp: Date.now(), data: dataToCache });
    return NextResponse.json(dataToCache)
  } catch (error) {
    // Avoid caching general errors
    return NextResponse.json({ error: "An unexpected error occurred. Please try again." }, { status: 500 })
  }
}
