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
  const [userReactions, setUserReactions] = useState<string[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
    }
    checkAuth()
  }, [])

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
        setReactions(data.reactions)

        if (data.reacted) {
          setUserReactions([...userReactions, emoji])
        } else {
          setUserReactions(userReactions.filter((e) => e !== emoji))
        }
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
        {availableEmojis.map((emoji) => (
          <Button
            key={emoji}
            variant="outline"
            size="sm"
            className="h-12 w-12 p-0 text-xl hover:bg-gray-700 hover:scale-110 transition-transform border-gray-600 relative"
            onClick={() => handleReaction(emoji)}
            disabled={isLoading}
          >
            {emoji}
            {reactions[emoji] && reactions[emoji] > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {reactions[emoji]}
              </span>
            )}
          </Button>
        ))}
      </div>
    </div>
  )
}
