import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: mugshot, error: mugshotError } = await supabase
      .from("mugshots")
      .select("id, name, image_url, slug")
      .eq("user_id", user.id)
      .single()

    if (mugshotError || !mugshot) {
      return NextResponse.json({ upcoming: [], launched: [] })
    }

    const { data: products, error } = await supabase
      .from("products")
      .select(
        `
        id, slug, title, logo_url, screenshot_url, tier, queue_position,
        launch_date, is_visible, created_at, updated_at, status, category
        `
      )
      .eq("founder_id", mugshot.id)
      .order("launch_date", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const now = new Date()

    const upcoming = (products || []).filter((p) => {
      const ld = p.launch_date ? new Date(p.launch_date as unknown as string) : null
      return (!p.is_visible) && (!!ld && ld > now)
    })

    const launched = (products || []).filter((p) => p.is_visible)
      .sort((a, b) => (a.launch_date < b.launch_date ? 1 : -1))

    return NextResponse.json({ upcoming, launched })
  } catch (err) {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 })
  }
}
