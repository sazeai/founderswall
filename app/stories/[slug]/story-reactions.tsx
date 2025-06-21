"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

interface StoryReactionsProps {
  storyId: string
  initialReactions: Record<string, number>
}

const availableEmojis = ["❤️", "👍", "🔥", "💡"]

export default function StoryReactions({ storyId, initialReactions }: StoryReactionsProps) {
  const [reactions, setReactions] = useState(initialReactions || {})
  const [userReaction, setUserReaction] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Check authentication status and get user's current reaction
  useEffect(() => {
    const checkAuthAndReaction = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setIsAuthenticated(!!user)

      if (user) {
        // Get user's current reaction for this story
        const { data: userReactionData } = await supabase
          .from("build_story_reactions")
          .select("emoji")
          .eq("story_id", storyId)
          .eq("user_id", user.id)
          .maybeSingle()

        if (userReactionData) {
          setUserReaction(userReactionData.emoji)
        }
      }
    }
    checkAuthAndReaction()
  }, [storyId])

  const handleReaction = async (emoji: string) => {
    if (!isAuthenticated) {
      router.push("/login?redirectedFrom=" + encodeURIComponent(window.location.pathname))
      return
    }

    if (isLoading) return

    setIsLoading(true)
    console.log(`🎭 STORY PAGE - Reacting with ${emoji} to story ${storyId}`)

    try {
      const response = await fetch(`/api/build-stories/${storyId}/react`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emoji }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("✅ STORY PAGE - Reaction response:", data)

        // Update local state with server response
        setReactions(data.reactions)
        setUserReaction(data.userReaction) // null if removed, emoji if added/updated
      } else {
        console.error("❌ STORY PAGE - Reaction failed:", response.status)
      }
    } catch (error) {
      console.error("💥 STORY PAGE - Reaction error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mt-6 pt-4 border-t border-zinc-700">
      <h3 className="text-sm font-bold font-mono mb-3 text-zinc-400">REACT TO THIS STORY:</h3>
      <div className="flex items-center space-x-3">
        {availableEmojis.map((emoji) => {
          const isUserReaction = userReaction === emoji
          const count = reactions[emoji] || 0

          return (
            <Button
              key={emoji}
              variant={isUserReaction ? "default" : "outline"}
              size="sm"
              className={`h-12 w-12 p-0 text-xl transition-all duration-200 relative ${
                isUserReaction
                  ? "bg-blue-600 hover:bg-blue-700 border-blue-600 scale-110"
                  : "hover:bg-gray-700 hover:scale-105 border-gray-600"
              }`}
              onClick={() => handleReaction(emoji)}
              disabled={isLoading}
            >
              {emoji}
              {count > 0 && (
                <span
                  className={`absolute -top-1 -right-1 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ${
                    isUserReaction ? "bg-blue-800" : "bg-red-500"
                  }`}
                >
                  {count}
                </span>
              )}
            </Button>
          )
        })}
      </div>
      {userReaction && (
        <p className="text-xs text-zinc-500 mt-2">
          You reacted with {userReaction}. Click it again to remove, or click another to change.
        </p>
      )}
    </div>
  )
}
