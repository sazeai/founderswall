import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const supabase = await createClient()
  const slug = params.slug

  try {
    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ isOwner: false })
    }

    // Get the product
    const { data: product, error: fetchError } = await supabase.from("products").select("*").eq("slug", slug).single()

    if (fetchError || !product) {
      return NextResponse.json({ isOwner: false })
    }

    // Get the user's mugshot to check if they're the founder
    const { data: mugshot, error: mugshotError } = await supabase
      .from("mugshots")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (mugshotError || !mugshot) {
      return NextResponse.json({ isOwner: false })
    }

    // Check if the user is the founder of the product
    const isOwner = mugshot.id === product.founder_id

    return NextResponse.json({ isOwner })
  } catch (error) {
    return NextResponse.json({ isOwner: false })
  }
}
