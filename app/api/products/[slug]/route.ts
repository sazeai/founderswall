import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getProductBySlug } from "@/lib/product-service"

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params

  const { product, error } = await getProductBySlug(slug)

  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }

  return NextResponse.json(product)
}

export async function PATCH(request: Request, context: { params: Promise<{ slug: string }> }) {
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
      return NextResponse.json({ error: "You don't have permission to update this product" }, { status: 403 })
    }

    const updates = await request.json()

    // Don't allow updating certain fields
    delete updates.id
    delete updates.slug
    delete updates.case_id
    delete updates.founder_id
    delete updates.created_at

    // Convert camelCase to snake_case for database
    const dbUpdates: Record<string, any> = {}
    for (const [key, value] of Object.entries(updates)) {
      const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase()
      dbUpdates[snakeKey] = value
    }

    // Update the product
    const { data: updatedProduct, error: updateError } = await supabase
      .from("products")
      .update(dbUpdates)
      .eq("id", product.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json(updatedProduct)
  } catch (error) {
    
    return NextResponse.json({ error: "An unexpected error occurred. Please try again." }, { status: 500 })
  }
}
