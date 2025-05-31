"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Clock, Plus, Loader2 } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface AddTimelineEntryProps {
  productSlug: string
  onEntryAdded: () => void
  lastEntryDate?: string | null
}

export default function AddTimelineEntry({ productSlug, onEntryAdded, lastEntryDate }: AddTimelineEntryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [headline, setHeadline] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Check if user has already added an entry today
  const today = new Date().toISOString().split("T")[0]
  const lastEntryDay = lastEntryDate ? new Date(lastEntryDate).toISOString().split("T")[0] : null
  const hasAddedToday = lastEntryDay === today

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!headline.trim()) {
      setError("Headline is required")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/products/${productSlug}/timeline`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          headline: headline.trim(),
          description: description.trim() || null,
          date: new Date().toISOString(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to add timeline entry")
        setIsSubmitting(false)
        return
      }

      // Success
      setHeadline("")
      setDescription("")
      setIsOpen(false)
      setSuccess(true)
      onEntryAdded()

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (hasAddedToday) {
    return (
      <div className="bg-zinc-800 p-3 rounded-md mb-4 flex items-center text-sm text-zinc-400">
        <Clock className="h-4 w-4 mr-2 text-zinc-500" />
        <span>You've already added a timeline entry today. Check back tomorrow!</span>
      </div>
    )
  }

  return (
    <div className="mb-4">
      {!isOpen ? (
        <div>
          {success && (
            <div className="bg-green-900/30 text-green-400 p-3 rounded-md mb-3 flex items-center text-sm">
              <div className="h-2 w-2 rounded-full bg-green-400 mr-2"></div>
              Timeline entry added successfully!
            </div>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(true)}
            className="w-full border-dashed border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Timeline Entry
          </Button>
        </div>
      ) : (
        <div className="bg-zinc-800 p-4 rounded-md border border-zinc-700">
          <h4 className="text-sm font-medium mb-3">Add New Timeline Entry</h4>

          {error && (
            <div className="bg-red-900/30 text-red-400 p-2 rounded-md mb-3 flex items-start text-sm">
              <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-3">
              <div>
                <label htmlFor="headline" className="block text-xs text-zinc-400 mb-1">
                  Headline <span className="text-red-500">*</span>
                </label>
                <Input
                  id="headline"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g., Launched new feature"
                  className="bg-zinc-900 border-zinc-700"
                  maxLength={100}
                />
                <div className="text-right text-xs text-zinc-500 mt-1">{headline.length}/100</div>
              </div>

              <div>
                <label htmlFor="description" className="block text-xs text-zinc-400 mb-1">
                  Description (Optional)
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add more details about this milestone..."
                  className="bg-zinc-900 border-zinc-700 min-h-24"
                  maxLength={500}
                />
                <div className="text-right text-xs text-zinc-500 mt-1">{description.length}/500</div>
              </div>

              <div className="text-xs text-zinc-500 italic">
                <Clock className="h-3 w-3 inline mr-1" /> Entry will be dated {formatDate(new Date().toISOString())}
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-zinc-400"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting || !headline.trim()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Add Entry"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
