import { createClient } from "@/utils/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ hasMugshot: false, reason: "unauthenticated" }, { status: 401 })
  }

  const { data: mugshot, error } = await supabase.from("mugshots").select("id").eq("user_id", user.id).single()

  if (error || !mugshot) {
    return NextResponse.json({ hasMugshot: false, reason: "no_mugshot" })
  }

  return NextResponse.json({ hasMugshot: true })
}
