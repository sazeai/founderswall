import { NextResponse } from "next/server"

export async function POST(request: Request) {
  console.log("🚀 BUILD STORY POST - Route handler started")

  try {
    console.log("📝 BUILD STORY POST - Importing dependencies")
    const { createClient } = await import("@/utils/supabase/server")

    console.log("✅ BUILD STORY POST - Dependencies imported successfully")

    console.log("📝 BUILD STORY POST - Creating Supabase client")
    const supabase = await createClient()
    console.log("✅ BUILD STORY POST - Supabase client created")

    console.log("👤 BUILD STORY POST - Getting authenticated user")
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    console.log("👤 BUILD STORY POST - Auth result:", user ? `User ID: ${user.id}` : "No user found", authError)

    if (authError || !user) {
      console.log("❌ BUILD STORY POST - No user authenticated")
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    console.log("📄 BUILD STORY POST - Parsing request body")
    const body = await request.json()
    console.log("📄 BUILD STORY POST - Request body:", body)

    const { title, category, content } = body

    // Validate required fields
    if (!title || !category || !content) {
      console.log("❌ BUILD STORY POST - Missing required fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate category
    if (!["win", "fail", "hack"].includes(category)) {
      console.log("❌ BUILD STORY POST - Invalid category:", category)
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }

    console.log("🔧 BUILD STORY POST - Generating slug")
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .substring(0, 50)
    console.log("🔧 BUILD STORY POST - Generated slug:", slug)

    console.log("💾 BUILD STORY POST - Preparing insert data")
    const insertData = {
      user_id: user.id, // Use user_id, not author_id
      title: title,
      slug: slug, // Add this line
      category: category,
      content: content,
      upvotes: 0,
      emoji_reactions: {}, // Use emoji_reactions, not reactions
    }
    console.log("💾 BUILD STORY POST - Insert data:", insertData)

    console.log("💾 BUILD STORY POST - Inserting into build_stories table")
    const { data: story, error: insertError } = await supabase
      .from("build_stories")
      .insert(insertData)
      .select()
      .single()

    console.log("💾 BUILD STORY POST - Insert result:", { story, insertError })

    if (insertError) {
      console.log("❌ BUILD STORY POST - Database insert error:", insertError)
      return NextResponse.json(
        {
          error: "Database error",
          details: insertError.message,
          code: insertError.code,
        },
        { status: 500 },
      )
    }

    console.log("✅ BUILD STORY POST - Story created successfully:", story?.id)
    return NextResponse.json(story, { status: 201 })
  } catch (error) {
    console.error("💥 BUILD STORY POST - Unhandled error:", error)
    console.error("💥 BUILD STORY POST - Error name:", error?.constructor?.name)
    console.error("💥 BUILD STORY POST - Error message:", error instanceof Error ? error.message : String(error))

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error),
        type: error?.constructor?.name || "Unknown",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  console.log("🚀 BUILD STORY GET - Route handler started")

  try {
    const { createClient } = await import("@/utils/supabase/server")
    const supabase = await createClient()

    const { data: stories, error } = await supabase
      .from("build_stories")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.log("❌ BUILD STORY GET - Database error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("✅ BUILD STORY GET - Stories fetched:", stories?.length || 0)
    return NextResponse.json(stories || [])
  } catch (error) {
    console.error("💥 BUILD STORY GET - Error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
