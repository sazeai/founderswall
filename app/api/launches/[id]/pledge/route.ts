import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id: launch_id } = await context.params
  const { support_types } = await request.json()

  if (!support_types || !Array.isArray(support_types)) {
    return NextResponse.json({ error: "Invalid support types" }, { status: 400 })
  }

  // First, remove any existing pledges from the user for this launch
  const { error: deleteError } = await supabase
    .from("launch_supports")
    .delete()
    .eq("launch_id", launch_id)
    .eq("supporter_id", user.id)

  if (deleteError) {
    return NextResponse.json({ error: "Failed to update pledges" }, { status: 500 })
  }

  // If the user submitted an empty array, it means they are removing all their pledges.
  if (support_types.length === 0) {
    return NextResponse.json({ message: "Pledges removed" })
  }

  // Then, insert the new pledges, one for each support type
  const newPledges = support_types.map((type) => ({
    launch_id,
    supporter_id: user.id,
    support_type: type,
  }))

  const { data, error } = await supabase.from("launch_supports").insert(newPledges).select()

  if (error) {
    return NextResponse.json({ error: "Failed to create pledges" }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id: launch_id } = await context.params

  const { error } = await supabase
    .from("launch_supports")
    .delete()
    .eq("launch_id", launch_id)
    .eq("supporter_id", user.id)

  if (error) {
    return NextResponse.json({ error: "Failed to delete pledges" }, { status: 500 })
  }

  return NextResponse.json({ message: "Pledges removed" })
}
