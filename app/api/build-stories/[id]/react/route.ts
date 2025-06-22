import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {

    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }


    const { emoji } = await request.json()
    const storyId = params.id

    if (!emoji) {
      return NextResponse.json({ error: "Emoji is required" }, { status: 400 })
    }


    // Check if user has ANY existing reaction for this story
    const { data: existingReaction, error: checkError } = await supabase
      .from("build_story_reactions")
      .select("id, emoji")
      .eq("story_id", storyId)
      .eq("user_id", user.id)
      .maybeSingle()

    if (checkError) {
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    let userReaction = null

    if (existingReaction) {
      if (existingReaction.emoji === emoji) {
        // User clicked the same emoji - remove reaction
        const { error: deleteError } = await supabase
          .from("build_story_reactions")
          .delete()
          .eq("story_id", storyId)
          .eq("user_id", user.id)

        if (deleteError) {
          return NextResponse.json({ error: "Failed to remove reaction" }, { status: 500 })
        }
        userReaction = null
      } else {
        // User clicked different emoji - update existing reaction
        const { error: updateError } = await supabase
          .from("build_story_reactions")
          .update({ emoji: emoji })
          .eq("story_id", storyId)
          .eq("user_id", user.id)

        if (updateError) {
          return NextResponse.json({ error: "Failed to update reaction" }, { status: 500 })
        }
        userReaction = emoji
      }
    } else {
      // No existing reaction - create new one
      const { error: insertError } = await supabase.from("build_story_reactions").insert({
        story_id: storyId,
        user_id: user.id,
        emoji: emoji,
      })

      if (insertError) {
        return NextResponse.json({ error: "Failed to add reaction" }, { status: 500 })
      }
      userReaction = emoji
    }

    // Get updated reaction counts for this story
    const { data: allReactions, error: reactionsError } = await supabase
      .from("build_story_reactions")
      .select("emoji")
      .eq("story_id", storyId)

    if (reactionsError) {
      return NextResponse.json({ error: "Failed to get reaction counts" }, { status: 500 })
    }

    // Count reactions by emoji
    const reactionCounts = (allReactions || []).reduce((acc: Record<string, number>, reaction) => {
      acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1
      return acc
    }, {})


    // Update the story's emoji_reactions JSONB column
    const { error: updateError } = await supabase
      .from("build_stories")
      .update({ emoji_reactions: reactionCounts })
      .eq("id", storyId)

    if (updateError) {
      return NextResponse.json({ error: "Failed to update story" }, { status: 500 })
    }


    return NextResponse.json({
      userReaction, // null if removed, emoji string if added/updated
      reactions: reactionCounts,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
