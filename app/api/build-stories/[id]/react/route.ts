import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("🚀 REACTION API - Starting reaction toggle")

    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("❌ REACTION API - Authentication failed:", authError)
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    console.log("✅ REACTION API - User authenticated:", user.id)

    const { emoji } = await request.json()
    const storyId = params.id

    if (!emoji) {
      return NextResponse.json({ error: "Emoji is required" }, { status: 400 })
    }

    console.log(`🎭 REACTION API - Processing ${emoji} for story ${storyId} by user ${user.id}`)

    // Check if user has ANY existing reaction for this story
    const { data: existingReaction, error: checkError } = await supabase
      .from("build_story_reactions")
      .select("id, emoji")
      .eq("story_id", storyId)
      .eq("user_id", user.id)
      .maybeSingle()

    if (checkError) {
      console.error("❌ REACTION API - Error checking existing reaction:", checkError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    let userReaction = null

    if (existingReaction) {
      if (existingReaction.emoji === emoji) {
        // User clicked the same emoji - remove reaction
        console.log("🗑️ REACTION API - Removing existing reaction")
        const { error: deleteError } = await supabase
          .from("build_story_reactions")
          .delete()
          .eq("story_id", storyId)
          .eq("user_id", user.id)

        if (deleteError) {
          console.error("❌ REACTION API - Error deleting reaction:", deleteError)
          return NextResponse.json({ error: "Failed to remove reaction" }, { status: 500 })
        }
        userReaction = null
      } else {
        // User clicked different emoji - update existing reaction
        console.log(`🔄 REACTION API - Updating reaction from ${existingReaction.emoji} to ${emoji}`)
        const { error: updateError } = await supabase
          .from("build_story_reactions")
          .update({ emoji: emoji })
          .eq("story_id", storyId)
          .eq("user_id", user.id)

        if (updateError) {
          console.error("❌ REACTION API - Error updating reaction:", updateError)
          return NextResponse.json({ error: "Failed to update reaction" }, { status: 500 })
        }
        userReaction = emoji
      }
    } else {
      // No existing reaction - create new one
      console.log("➕ REACTION API - Adding new reaction")
      const { error: insertError } = await supabase.from("build_story_reactions").insert({
        story_id: storyId,
        user_id: user.id,
        emoji: emoji,
      })

      if (insertError) {
        console.error("❌ REACTION API - Error inserting reaction:", insertError)
        return NextResponse.json({ error: "Failed to add reaction" }, { status: 500 })
      }
      userReaction = emoji
    }

    // Get updated reaction counts for this story
    console.log("📊 REACTION API - Calculating updated reaction counts")
    const { data: allReactions, error: reactionsError } = await supabase
      .from("build_story_reactions")
      .select("emoji")
      .eq("story_id", storyId)

    if (reactionsError) {
      console.error("❌ REACTION API - Error fetching reactions:", reactionsError)
      return NextResponse.json({ error: "Failed to get reaction counts" }, { status: 500 })
    }

    // Count reactions by emoji
    const reactionCounts = (allReactions || []).reduce((acc: Record<string, number>, reaction) => {
      acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1
      return acc
    }, {})

    console.log("📊 REACTION API - New reaction counts:", reactionCounts)

    // Update the story's emoji_reactions JSONB column
    const { error: updateError } = await supabase
      .from("build_stories")
      .update({ emoji_reactions: reactionCounts })
      .eq("id", storyId)

    if (updateError) {
      console.error("❌ REACTION API - Error updating story reactions:", updateError)
      return NextResponse.json({ error: "Failed to update story" }, { status: 500 })
    }

    console.log("✅ REACTION API - Reaction toggle completed successfully")

    return NextResponse.json({
      userReaction, // null if removed, emoji string if added/updated
      reactions: reactionCounts,
    })
  } catch (error) {
    console.error("💥 REACTION API - Unhandled error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
