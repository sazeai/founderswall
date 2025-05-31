import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { generateSlug } from "@/lib/utils"

// Add dynamic config to this API route
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = Number.parseInt(searchParams.get("limit") || "10")
  const offset = Number.parseInt(searchParams.get("offset") || "0")
  const filter = searchParams.get("filter") as "trending" | "newest" | "most-wanted" | undefined

  try {
    const supabase = await createClient()

    // Get products with founder information
    const { data: products, error } = await supabase
      .from("products")
      .select(`
        *,
        founder:founder_id (
          id,
          name,
          image_url
        )
      `)
      .order("created_at", { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get upvote counts for each product
    const upvoteCounts = new Map()

    // Count upvotes for each product individually
    for (const product of products) {
      const { count, error: countError } = await supabase
        .from("product_upvotes")
        .select("*", { count: "exact", head: true })
        .eq("product_id", product.id)

      if (!countError) {
        upvoteCounts.set(product.id, count || 0)
      }
    }

    // Format products for the frontend
    const formattedProducts = products.map((product) => {
      // Ensure launch_date is valid or use created_at as fallback
      let launchDate = product.launch_date
      if (!launchDate) {
        launchDate = product.created_at
      }

      return {
        id: product.id,
        slug: product.slug,
        caseId: product.case_id,
        title: product.title,
        founderId: product.founder_id,
        founderName: product.founder?.name || "Unknown",
        founderImage: product.founder?.image_url,
        logoUrl: product.logo_url,
        screenshotUrl: product.screenshot_url,
        category: product.category || "Other",
        status: product.status || "On the Run",
        summary: Array.isArray(product.summary) ? product.summary : [],
        tags: Array.isArray(product.tags) ? product.tags : [],
        description: product.description,
        productUrl: product.product_url,
        socialLinks: product.social_links,
        launchDate: launchDate,
        upvotes: upvoteCounts.get(product.id) || 0,
        createdAt: product.created_at,
        updatedAt: product.updated_at,
      }
    })

    return NextResponse.json(formattedProducts)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}

async function generateUniqueCaseId(supabase: any, maxRetries = 5): Promise<string> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Get the current max case_id number
      const { data: maxCaseData, error: maxError } = await supabase
        .from("products")
        .select("case_id")
        .order("case_id", { ascending: false })
        .limit(1)

      if (maxError) {
        // Fallback to random if there's an error
        return `L${Math.floor(Math.random() * 10000)
          .toString()
          .padStart(3,0)}`
      }

      let nextNumber = 1
      if (maxCaseData && maxCaseData.length > 0) {
        const lastCaseId = maxCaseData[0].case_id
        const lastNumber = Number.parseInt(lastCaseId.replace("L", ""))
        nextNumber = lastNumber + 1
      }

      const caseId = `L${nextNumber.toString().padStart(3, "0")}`

      // Check if this case_id already exists (double-check)
      const { data: existingCase, error: checkError } = await supabase
        .from("products")
        .select("id")
        .eq("case_id", caseId)
        .single()

      if (checkError && checkError.code === "PGRST116") {
        // No existing case found, this ID is available
        return caseId
      } else if (!checkError && existingCase) {
        // Case ID exists, try next number
        continue
      } else {
        // Some other error
        continue
      }
    } catch (error) {
      if (attempt === maxRetries - 1) {
        // Last attempt, use random fallback
        return `L${Math.floor(Math.random() * 10000)
          .toString()
          .padStart(3, "0")}`
      }
    }
  }

  // Fallback
  return `L${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(3, "0")}`
}

export async function POST(request: Request) {
  const supabase = await createClient()

  try {
    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const productData = await request.json()

    // Validate required fields
    const requiredFields = ["title", "category", "summary", "tags", "productUrl"]
    for (const field of requiredFields) {
      if (!productData[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Generate slug from title
    const slug = generateSlug(productData.title)

    // Check if slug already exists and make it unique
    let uniqueSlug = slug
    let slugCounter = 1
    while (true) {
      const { data: existingProduct, error: slugError } = await supabase
        .from("products")
        .select("id")
        .eq("slug", uniqueSlug)
        .single()

      if (slugError && slugError.code === "PGRST116") {
        // No existing product found, slug is available
        break
      } else if (!slugError && existingProduct) {
        // Slug exists, try with counter
        uniqueSlug = `${slug}-${slugCounter}`
        slugCounter++
      } else {
        // Some other error
        break
      }
    }

    // Generate unique case ID
    const caseId = await generateUniqueCaseId(supabase)

    // Ensure launch date is valid and has a fixed time (12:00 PM UTC)
    let launchDate = new Date()
    try {
      launchDate = new Date(productData.launchDate)
      // Set to 12:00 PM UTC
      launchDate.setUTCHours(12, 0, 0, 0)
    } catch (e) {
      // Default to today at 12:00 PM UTC
      launchDate = new Date()
      launchDate.setUTCHours(12, 0, 0, 0)
    }

    // Get the user's mugshot ID (this is what should be used as founder_id)
    const { data: mugshot, error: mugshotError } = await supabase
      .from("mugshots")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (mugshotError || !mugshot) {
      return NextResponse.json(
        {
          error: "You must have a mugshot profile to create a product. Please create your mugshot first.",
        },
        { status: 400 },
      )
    }

    // Use the user's mugshot ID as the founder_id
    const founderId = mugshot.id

    // Insert the product
    const { data: product, error } = await supabase
      .from("products")
      .insert({
        slug: uniqueSlug,
        case_id: caseId,
        title: productData.title,
        founder_id: founderId,
        logo_url: productData.logoUrl,
        screenshot_url: productData.screenshotUrl,
        category: productData.category,
        status: productData.status || "On the Run",
        summary: productData.summary,
        tags: productData.tags,
        description: productData.description,
        product_url: productData.productUrl,
        social_links: productData.socialLinks,
        launch_date: launchDate.toISOString(),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If there's an initial timeline entry, add it
    if (productData.initialTimelineEntry) {
      const { error: timelineError } = await supabase.from("timeline_entries").insert({
        product_id: product.id,
        date: new Date().toISOString(),
        headline: productData.initialTimelineEntry.headline,
        description: productData.initialTimelineEntry.description,
      })

      if (timelineError) {
        // We don't want to fail the whole request if just the timeline entry fails
      }
    }

    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 },
    )
  }
}
