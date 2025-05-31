import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

// Add dynamic config to this API route
export const dynamic = "force-dynamic"

export async function GET() {
  const supabase = await createClient()

  try {
    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the user's mugshot - simple query first
    const { data: mugshot, error: mugshotError } = await supabase
      .from("mugshots")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (mugshotError) {
      if (mugshotError.code === "PGRST116") {
        return NextResponse.json({ error: "You don't have a mugshot yet. Please create one first." }, { status: 404 })
      }
      return NextResponse.json({ error: mugshotError.message }, { status: 500 })
    }

    // Get badge type separately to avoid join issues
    let badgeType = "wanted" // default
    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("badge_type")
      .eq("user_id", user.id)
      .single()

    if (!profileError && userProfile) {
      badgeType = userProfile.badge_type || "wanted"
    }

    // Transform the data to match the expected format
    const transformedMugshot = {
      id: mugshot.id,
      name: mugshot.name,
      crime: mugshot.crime,
      note: mugshot.note,
      imageUrl: mugshot.image_url,
      mugshotUrl: mugshot.mugshot_url,
      productUrl: mugshot.product_url,
      twitterHandle: mugshot.twitter_handle,
      likes: mugshot.likes || 0,
      createdAt: mugshot.created_at,
      userId: mugshot.user_id,
      isApproved: mugshot.is_approved,
      isVisible: mugshot.is_visible,
      paymentStatus: mugshot.payment_status,
      badgeType: badgeType,
      featured: mugshot.featured || false,
      accessType: mugshot.access_type,
    }

    return NextResponse.json(transformedMugshot)
  } catch (error) {
    return NextResponse.json({ error: "An unexpected error occurred. Please try again." }, { status: 500 })
  }
}
