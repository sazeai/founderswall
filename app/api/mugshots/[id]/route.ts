import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { updateMugshot } from "@/lib/mugshot-service"

export const dynamic = "force-dynamic"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient()

  try {
    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the mugshot to verify ownership
    const { data: mugshot, error: fetchError } = await supabase
      .from("mugshots")
      .select("user_id")
      .eq("id", params.id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: "Mugshot not found" }, { status: 404 })
    }

    // Verify ownership
    if (mugshot.user_id !== user.id) {
      return NextResponse.json({ error: "You do not have permission to update this mugshot" }, { status: 403 })
    }

    // Update the mugshot
    const mugshotData = await request.json()
    const { mugshot: updatedMugshot, error } = await updateMugshot(params.id, mugshotData)

    if (error || !updatedMugshot) {
      return NextResponse.json({ error: error || "Failed to update mugshot" }, { status: 500 })
    }

    return NextResponse.json(updatedMugshot)
  } catch (error) {
    return NextResponse.json({ error: "An unexpected error occurred. Please try again." }, { status: 500 })
  }
}
