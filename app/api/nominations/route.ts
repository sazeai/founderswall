import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const { nominee_twitter_handle, additional_message } = body

    // Validate required fields
    if (!nominee_twitter_handle) {
      return NextResponse.json({ error: "Twitter handle is required" }, { status: 400 })
    }

    // Clean and validate Twitter handle
    let cleanHandle = nominee_twitter_handle.trim()
    if (cleanHandle.startsWith("@")) {
      cleanHandle = cleanHandle.substring(1)
    }

    if (!cleanHandle || cleanHandle.length === 0) {
      return NextResponse.json({ error: "Valid Twitter handle is required" }, { status: 400 })
    }

    // First, ensure user profile exists
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (profileCheckError && profileCheckError.code === "PGRST116") {
      // Profile doesn't exist, create it
      const { error: createProfileError } = await supabase.from("user_profiles").insert({
        user_id: user.id,
        badge_type: "wanted",
      })

      if (createProfileError) {
        return NextResponse.json({ error: "Failed to create user profile" }, { status: 500 })
      }
    } else if (profileCheckError) {
      return NextResponse.json({ error: "Failed to check user profile" }, { status: 500 })
    }

    // Insert nomination
    const { data: nomination, error: insertError } = await supabase
      .from("nominations")
      .insert({
        supporter_user_id: user.id,
        nominee_twitter_handle: cleanHandle,
        additional_message: additional_message || null,
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: "Failed to submit nomination" }, { status: 500 })
    }

    // Update the supporter's badge_type to "startup_saviour"
    const { data: updatedProfile, error: updateError } = await supabase
      .from("user_profiles")
      .update({
        badge_type: "startup_saviour",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .select()

    if (updateError) {
      return NextResponse.json({ error: "Failed to update badge type" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      nomination,
      message: "Nomination submitted successfully! Your badge has been updated.",
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: nominations, error } = await supabase
      .from("nominations")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Failed to fetch nominations" }, { status: 500 })
    }

    return NextResponse.json({ nominations })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
