"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ThumbsUp, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import type { User } from "@supabase/supabase-js"

interface UpvoteButtonProps {
  productSlug: string
  initialUpvotes: number
  className?: string
  size?: "sm" | "md" | "lg"
}

export default function UpvoteButton({ productSlug, initialUpvotes }: UpvoteButtonProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes)
  const [isUpvoting, setIsUpvoting] = useState(false)
  const [hasUpvoted, setHasUpvoted] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setIsLoading(false)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleUpvote = async () => {
    if (!user) {
      router.push(`/login?redirectedFrom=/launch/${productSlug}`)
      return
    }

    setIsUpvoting(true)

    try {
      const response = await fetch(`/api/products/${productSlug}/upvote`, {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        setUpvotes(data.upvotes)
        setHasUpvoted(!hasUpvoted)
      }
    } catch (error) {
      console.error("Error upvoting product:", error)
    } finally {
      setIsUpvoting(false)
    }
  }

  return (
    <Button
      onClick={handleUpvote}
      disabled={isUpvoting || isLoading}
      className={`${hasUpvoted ? "bg-red-600 hover:bg-red-700" : "bg-zinc-700 hover:bg-zinc-600"} text-white`}
      size="sm"
    >
      {isUpvoting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <ThumbsUp className="h-4 w-4 mr-1" />}
      {upvotes}
    </Button>
  )
}
