import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

// GET handler to fetch a single launch
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: launch, error } = await supabase
    .from("launches")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single()

  if (error || !launch) {
    return NextResponse.json({ error: "Launch not found or you don't have permission to view it." }, { status: 404 })
  }

  return NextResponse.json(launch)
}

// PUT handler to update a launch
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { product_name, description, launch_date, launch_links, support_types, image_url, status } = body

  if (!product_name || !launch_date) {
    return NextResponse.json({ error: "Product name and launch date are required" }, { status: 400 })
  }

  // First, verify the user owns the launch they are trying to update
  const { data: existingLaunch, error: fetchError } = await supabase
    .from("launches")
    .select("id")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single()

  if (fetchError || !existingLaunch) {
    return NextResponse.json({ error: "Launch not found or you don't have permission to update it." }, { status: 404 })
  }

  // Now, update the launch
  const { data, error } = await supabase
    .from("launches")
    .update({
      product_name,
      description,
      launch_date,
      launch_links,
      support_types,
      image_url,
      status,
    })
    .eq("id", params.id)
    .select()
    .single()

  if (error) {
    console.error("Error updating launch:", error)
    return NextResponse.json({ error: "Failed to update launch" }, { status: 500 })
  }

  return NextResponse.json(data)
}
