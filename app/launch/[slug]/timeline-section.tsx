"use client"

import { useState, useEffect, useRef } from "react"
import { Clock } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { createClient } from "@/utils/supabase/client"
import type { User } from "@supabase/supabase-js"
import AddTimelineEntry from "@/components/add-timeline-entry"

interface TimelineEntry {
  id: string
  headline: string
  description?: string
  date: string
  created_at: string
}

interface TimelineSectionProps {
  productSlug: string
  productId: string
  timelineEntries: TimelineEntry[]
}

export default function TimelineSection({ productSlug, productId, timelineEntries }: TimelineSectionProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
  const [isOwner, setIsOwner] = useState(false)
  const [entries, setEntries] = useState<TimelineEntry[]>(timelineEntries)
  const [lastEntryDate, setLastEntryDate] = useState<string | null>(null)

  // Track last ownership check per user+slug to avoid duplicate calls
  const lastCheckKeyRef = useRef<string | null>(null)

  // Check if the current user is the product owner
  useEffect(() => {
    const run = async () => {
      if (!user || isLoading) return
      const key = `${user.id}:${productSlug}`
      if (lastCheckKeyRef.current === key) return
      lastCheckKeyRef.current = key
      try {
        const response = await fetch(`/api/products/${productSlug}/ownership`)
        const data = await response.json()
        setIsOwner(Boolean(data.isOwner))
        if (data.isOwner && entries.length > 0) {
          setLastEntryDate(entries[0].date)
        }
      } catch (error) {
        console.error("Error in user verification for timeline :", error)
      }
    }
    run()
  }, [user?.id, isLoading, productSlug])

  const handleEntryAdded = async () => {
    // Refresh timeline entries
    try {
      const response = await fetch(`/api/products/${productSlug}/timeline`)
      const newEntries = await response.json()
      setEntries(newEntries)

      // Update last entry date
      if (newEntries.length > 0) {
        setLastEntryDate(newEntries[0].date)
      }
    } catch (error) {
      console.error("Error refreshing timeline entries:", error)
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800">
      <div className="border-b border-zinc-800 bg-zinc-800 p-3">
        <h2 className="text-lg font-bold">Timeline of Events </h2>
      </div>

      <div className="p-4">
        {/* Add Timeline Entry Form - Only visible to product owner */}
        {isOwner && (
          <AddTimelineEntry productSlug={productSlug} onEntryAdded={handleEntryAdded} lastEntryDate={lastEntryDate} />
        )}

        {entries.length > 0 ? (
          <div className="relative pl-6 border-l border-red-500">
            <div className="space-y-4">
              {entries.map((entry) => (
                <div key={entry.id} className="relative">
                  {/* Dot on timeline */}
                  <div className="absolute -left-[11px] top-0 w-5 h-5 bg-red-500 rounded-full"></div>

                  <div className="bg-zinc-800 p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-zinc-100">{entry.headline}</h4>
                      <div className="bg-zinc-900 px-2 py-0.5 text-xs text-zinc-400 ml-2 flex-shrink-0">
                        {formatDate(entry.date)}
                      </div>
                    </div>

                    {entry.description && <p className="text-sm text-zinc-300">{entry.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 bg-zinc-800">
            <Clock className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-zinc-500">No timeline entries yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
