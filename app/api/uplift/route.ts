import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()

    const { product_name, description, launch_date, launch_links, support_types, image_url, status } = body

    if (!product_name || !launch_date) {
      return NextResponse.json({ error: "Product name and launch date are required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("launches")
      .insert([
        {
          user_id: user.id,
          product_name,
          description,
          launch_date,
          launch_links,
          support_types,
          image_url,
          status,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating uplift submission:", error)
      return NextResponse.json({ error: "Failed to create uplift submission" }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
