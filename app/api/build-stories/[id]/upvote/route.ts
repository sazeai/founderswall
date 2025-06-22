import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getUserFromCookie } from "@/lib/server-utils"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const user = await getUserFromCookie()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const storyId = params.id

    // Check if user already upvoted
    const { data: existingUpvote } = await supabase
      .from("build_story_upvotes")
      .select("id")
      .eq("story_id", storyId)
      .eq("user_id", user.id)
      .single()

    if (existingUpvote) {
      // Remove upvote
      await supabase.from("build_story_upvotes").delete().eq("story_id", storyId).eq("user_id", user.id)
    } else {
      // Add upvote
      await supabase.from("build_story_upvotes").insert({
        story_id: storyId,
        user_id: user.id,
      })
    }

    // Get updated upvote count
    const { data: upvotes } = await supabase.from("build_story_upvotes").select("id").eq("story_id", storyId)

    // Update story upvote count
    await supabase
      .from("build_stories")
      .update({ upvotes: upvotes?.length || 0 })
      .eq("id", storyId)

    return NextResponse.json({
      upvoted: !existingUpvote,
      upvotes: upvotes?.length || 0,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to toggle upvote" }, { status: 500 })
  }
}
