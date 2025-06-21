import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: NextRequest) {
  console.log("🚀 BUILD STORIES API - POST request received")

  try {
    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    console.log("👤 BUILD STORIES API - User check:", user ? `User ID: ${user.id}` : "No user found")

    if (userError || !user) {
      console.error("❌ BUILD STORIES API - Authentication error:", userError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse the request body
    const body = await request.json()
    console.log("📝 BUILD STORIES API - Request body:", {
      title: body.title,
      category: body.category,
      contentLength: body.content?.length || 0,
    })

    const { title, category, content } = body

    // Validate required fields
    if (!title || !category || !content) {
      console.error("❌ BUILD STORIES API - Missing required fields")
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

    console.log("🔗 BUILD STORIES API - Generated slug:", slug)

    // Check if slug already exists
    const { data: existingStory, error: slugCheckError } = await supabase
      .from("build_stories")
      .select("id")
      .eq("slug", slug)
      .single()

    if (slugCheckError && slugCheckError.code !== "PGRST116") {
      console.error("❌ BUILD STORIES API - Error checking slug:", slugCheckError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    // If slug exists, append timestamp
    const finalSlug = existingStory ? `${slug}-${Date.now()}` : slug
    console.log("🔗 BUILD STORIES API - Final slug:", finalSlug)

    // Insert the story
    const { data: newStory, error: insertError } = await supabase
      .from("build_stories")
      .insert({
        user_id: user.id,
        title: title.trim(),
        category: category.toLowerCase(),
        content: content.trim(),
        slug: finalSlug,
        upvotes: 0,
        emoji_reactions: {},
      })
      .select()
      .single()

    if (insertError) {
      console.error("❌ BUILD STORIES API - Insert error:", insertError)
      return NextResponse.json({ error: `Failed to create story: ${insertError.message}` }, { status: 500 })
    }

    console.log("✅ BUILD STORIES API - Story created successfully:", newStory.id)

    // Verify the story was created by fetching it back
    const { data: verifyStory, error: verifyError } = await supabase
      .from("build_stories")
      .select("*")
      .eq("id", newStory.id)
      .single()

    if (verifyError) {
      console.error("❌ BUILD STORIES API - Verification error:", verifyError)
    } else {
      console.log("✅ BUILD STORIES API - Story verified:", {
        id: verifyStory.id,
        slug: verifyStory.slug,
        title: verifyStory.title,
      })
    }

    return NextResponse.json({
      success: true,
      story: newStory,
      message: "Story created successfully",
    })
  } catch (error) {
    console.error("💥 BUILD STORIES API - Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  console.log("🔍 BUILD STORIES API - GET request received")

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
        upvotes,
        emoji_reactions,
        user_id
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("❌ BUILD STORIES API - GET error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("✅ BUILD STORIES API - Stories fetched:", stories?.length || 0)

    return NextResponse.json({
      success: true,
      stories: stories || [],
      count: stories?.length || 0,
    })
  } catch (error) {
    console.error("💥 BUILD STORIES API - GET unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
