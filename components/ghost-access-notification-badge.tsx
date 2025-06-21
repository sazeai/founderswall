"use client"

import { useState, useEffect, useCallback } from "react"
import { Badge } from "@/components/ui/badge"

export function GhostAccessNotificationBadge() {
  const [pendingCount, setPendingCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const fetchPendingCount = useCallback(async () => {
    if (isLoading) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/ghost-projects/access-requests")
      if (response.ok) {
        const requests = await response.json()
        const pending = requests.filter((req: any) => req.status === "pending")
        setPendingCount(pending.length)
      }
    } catch (error) {
      console.error("Error fetching pending requests:", error)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading])

  useEffect(() => {
    fetchPendingCount()

    // Poll every 60 seconds for new requests (reduced frequency)
    const interval = setInterval(fetchPendingCount, 60000)
    return () => clearInterval(interval)
  }, [fetchPendingCount])

  if (pendingCount === 0) return null

  return (
    <Badge variant="destructive" className="ml-2 animate-pulse">
      {pendingCount}
    </Badge>
  )
}
