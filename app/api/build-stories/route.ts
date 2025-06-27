import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse the request body
    const body = await request.json()
    const { title, category, content } = body

    // Validate required fields
    if (!title || !category || !content) {
      return NextResponse.json({ error: "Missing required fields: title, category, content" }, { status: 400 })
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
      .substring(0, 50)

    // Check if slug already exists
    const { data: existingStory, error: slugCheckError } = await supabase
      .from("build_stories")
      .select("id")
      .eq("slug", slug)
      .single()

    if (slugCheckError && slugCheckError.code !== "PGRST116") {
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    // If slug exists, append timestamp
    const finalSlug = existingStory ? `${slug}-${Date.now()}` : slug

    // Insert the story
    const { data: newStory, error: insertError } = await supabase
      .from("build_stories")
      .insert({
        user_id: user.id,
        title: title.trim(),
        category: category.toLowerCase(),
        content: content.trim(),
        slug: finalSlug,
        emoji_reactions: {},
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: `Failed to create story: ${insertError.message}` }, { status: 500 })
    }

    // Verify the story was created by fetching it back
    const { data: verifyStory, error: verifyError } = await supabase
      .from("build_stories")
      .select("*")
      .eq("id", newStory.id)
      .single()

    return NextResponse.json({
      success: true,
      story: newStory,
      message: "Story created successfully",
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()

    // Get all stories with basic info
    const { data: stories, error } = await supabase
      .from("build_stories")
      .select(`
        id,
        slug,
        title,
        content,
        category,
        created_at,
        updated_at,
        emoji_reactions,
        user_id
      `)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      stories: stories || [],
      count: stories?.length || 0,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
