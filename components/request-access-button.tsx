"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Lock } from "lucide-react"
import { toast } from "sonner"

interface RequestAccessButtonProps {
  ghostProjectId: string
  userId: string
}

export function RequestAccessButton({ ghostProjectId, userId }: RequestAccessButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim()) {
      toast.error("Please provide a message explaining why you want access.")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/ghost-projects/request-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ghostProjectId,
          message: message.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to request access")
      }

      toast.success("Access request sent! The project owner will be notified.")
      setIsOpen(false)
      setMessage("")
    } catch (error) {
      console.error("Error requesting access:", error)
      toast.error(error instanceof Error ? error.message : "Failed to request access")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-red-600 hover:bg-red-700 text-white border border-red-500">
          <Lock className="h-4 w-4 mr-2" />
          Request Access to Full Details
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-red-500/30">
        <DialogHeader>
          <DialogTitle className="text-red-400">Request Access to Ghost Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="message" className="text-gray-300">
              Why do you want access to this project? *
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Explain your interest in this project, what you plan to do with it, or how it might help you..."
              className="bg-gray-800 border-gray-700 text-white mt-2"
              rows={4}
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !message.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending Request...
                </>
              ) : (
                "Send Request"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
