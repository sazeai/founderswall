import { createClient } from "@/utils/supabase/server"
import type { Product } from "@/lib/types"

// Cache for getProductBySlug
// Export the cache to allow invalidation from other modules
export const productBySlugCache = new Map<string, { timestamp: number; data: { product: Product | null; error: string | null } }>();
const PRODUCT_CACHE_DURATION = 30000; // 30 seconds, adjust as needed

export async function getProducts(limit = 10, offset = 0) {
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
        ),
        mugshots:founder_id (slug)
      `)
      .order("created_at", { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1)


    if (error) {
      return { products: [], error: error.message }
    }

    if (!products || products.length === 0) {
      return { products: [], error: null }
    }


    // Get upvote counts for all products in a single query
    const productIds = products.map((p) => p.id)

    const { data: upvoteData, error: upvoteError } = await supabase
      .from("product_upvotes")
      .select("product_id")
      .in("product_id", productIds)


    // Count upvotes per product
    const upvoteCounts = new Map()
    if (upvoteData) {
      upvoteData.forEach((upvote) => {
        const count = upvoteCounts.get(upvote.product_id) || 0
        upvoteCounts.set(upvote.product_id, count + 1)
      })
    }

    // Format products for the frontend
    const formattedProducts = products.map((product) => {

      // Ensure launch_date is valid or use created_at as fallback
      let launchDate = product.launch_date
      if (!launchDate) {
        launchDate = product.created_at
      }

      // Validate the date
      try {
        new Date(launchDate).toISOString()
      } catch (e) {
        launchDate = new Date().toISOString()
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
        imageUrl: product.logo_url,
        founderSlug: product.mugshots?.slug || undefined,
      }
    })


    return { products: formattedProducts, error: null }
  } catch (error) {
    return {
      products: [],
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

export async function getProductBySlug(slug: string) {
  // Check cache first
  const cachedEntry = productBySlugCache.get(slug);
  if (cachedEntry && Date.now() - cachedEntry.timestamp < PRODUCT_CACHE_DURATION) {
    return cachedEntry.data;
  }

  try {
    const supabase = await createClient()

    // Use ilike for case-insensitive matching
    const { data: product, error } = await supabase
      .from("products")
      .select(`
        *,
        founder:founder_id (
          id,
          name,
          image_url
        ),
        mugshots:founder_id (slug)
      `)
      .ilike("slug", slug)
      .single()

    if (error) {
      return { product: null, error: error.message }
    }

    if (!product) {
      return { product: null, error: "Product not found" }
    }

    // Get upvote count
    const { count: upvotes, error: upvoteError } = await supabase
      .from("product_upvotes")
      .select("*", { count: "exact", head: true })
      .eq("product_id", product.id)

    // Get timeline entries
    const { data: timelineEntries, error: timelineError } = await supabase
      .from("timeline_entries")
      .select("*")
      .eq("product_id", product.id)
      .order("date", { ascending: false })

    // Ensure launch_date is valid or use created_at as fallback
    let launchDate = product.launch_date
    if (!launchDate) {
      launchDate = product.created_at
    }

    // Validate the date
    try {
      new Date(launchDate).toISOString()
    } catch (e) {
      launchDate = new Date().toISOString()
    }

    // Format product for the frontend
    const formattedProduct = {
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
      upvotes: upvotes || 0,
      timelineEntries: timelineEntries || [],
      createdAt: product.created_at,
      updatedAt: product.updated_at,
      imageUrl: product.logo_url,
      founderSlug: product.mugshots?.slug || undefined,
    }

    // Store in cache before returning
    const result = { product: formattedProduct, error: null };
    productBySlugCache.set(slug, { timestamp: Date.now(), data: result });
    return result;
  } catch (error) {
    const errorResult = {
      product: null,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
    // Optionally, cache error responses too, or not, depending on desired behavior
    // productBySlugCache.set(slug, { timestamp: Date.now(), data: errorResult }); 
    return errorResult;
  }
}

export async function upvoteProduct(productId: string, userId: string) {
  try {
    const supabase = await createClient()

    // Check if the user has already upvoted this product
    const { data: existingUpvote, error: checkError } = await supabase
      .from("product_upvotes")
      .select("*")
      .eq("product_id", productId)
      .eq("user_id", userId)
      .maybeSingle()

    if (checkError) {
      return { success: false, error: checkError.message }
    }

    // If the user has already upvoted, remove the upvote (toggle behavior)
    if (existingUpvote) {
      const { error: deleteError } = await supabase.from("product_upvotes").delete().eq("id", existingUpvote.id)

      if (deleteError) {
        return { success: false, error: deleteError.message }
      }

      return { success: true, error: null }
    }

    // Otherwise, add a new upvote
    const { error: insertError } = await supabase.from("product_upvotes").insert({
      product_id: productId,
      user_id: userId,
    })

    if (insertError) {
      return { success: false, error: insertError.message }
    }

    return { success: true, error: null }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

export function setFixedLaunchTime(date: Date): Date {
  const fixedDate = new Date(date)
  fixedDate.setUTCHours(12, 0, 0, 0) // Set to 12:00:00.000 UTC
  return fixedDate
}

export async function addTimelineEntry({
  productId,
  headline,
  description,
  date = new Date(),
}: {
  productId: string
  headline: string
  description?: string | null
  date?: Date | string
}) {
  try {
    const supabase = await createClient()

    // Ensure date is a string
    const entryDate = typeof date === "string" ? date : date.toISOString()

    const { data, error } = await supabase
      .from("timeline_entries")
      .insert({
        product_id: productId,
        headline,
        description,
        date: entryDate,
      })
      .select()
      .single()

    if (error) {
      return { entry: null, error: error.message }
    }

    return {
      entry: {
        id: data.id,
        productId: data.product_id,
        headline: data.headline,
        description: data.description,
        date: data.date,
        createdAt: data.created_at,
      },
      error: null,
    }
  } catch (error) {
    return {
      entry: null,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

export async function isProductOwner(productId: string, userId: string) {
  try {
    const supabase = await createClient()

    // Get the user's mugshot
    const { data: mugshot, error: mugshotError } = await supabase
      .from("mugshots")
      .select("id")
      .eq("user_id", userId)
      .single()

    if (mugshotError) {
      return false
    }

    // Get the product
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("founder_id")
      .eq("id", productId)
      .single()

    if (productError) {
      return false
    }

    // Check if the user is the founder
    return mugshot.id === product.founder_id
  } catch (error) {
    return false
  }
}

export async function getProductsByFounderId(founderId: string): Promise<Product[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      timeline_entries(*),
      mugshots:founder_id (slug)
    `)
    .eq("founder_id", founderId)
    .order("created_at", { ascending: false })

  if (error) {
    return []
  }

  return data.map((product) => ({
    id: product.id,
    slug: product.slug,
    caseId: product.case_id,
    title: product.title,
    founderId: product.founder_id,
    logoUrl: product.logo_url,
    screenshotUrl: product.screenshot_url,
    category: product.category,
    status: product.status,
    summary: product.summary || [],
    tags: product.tags || [],
    description: product.description,
    productUrl: product.product_url,
    socialLinks: product.social_links,
    launchDate: product.launch_date,
    createdAt: product.created_at,
    updatedAt: product.updated_at,
    upvotes: product.upvotes || 0,
    timelineEntries: product.timeline_entries || [],
    imageUrl: product.logo_url,
    founderSlug: product.mugshots?.slug || undefined,
  }))
}
