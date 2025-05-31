import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { upvoteProduct } from "@/lib/product-service"

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  const supabase = await createClient()
  const slug = params.slug

  try {
    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the product ID from the slug
    const { data: product, error: fetchError } = await supabase.from("products").select("id").eq("slug", slug).single()

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const { success, error } = await upvoteProduct(product.id, user.id)

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    // Get the updated upvote count
    const { count } = await supabase
      .from("product_upvotes")
      .select("*", { count: "exact", head: true })
      .eq("product_id", product.id)

    return NextResponse.json({ success, upvotes: count || 0 })
  } catch (error) {
    return NextResponse.json({ error: "An unexpected error occurred. Please try again." }, { status: 500 })
  }
}
