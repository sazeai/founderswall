"use client"

import type React from "react"

import { useState } from "react"
import { X, AlertCircle, Loader2 } from "lucide-react"
import Image from "next/image"
import type { Mugshot } from "@/lib/types"

interface ConnectionModalProps {
  criminals: Mugshot[]
  onSave: (connectionType: string, evidence: string) => Promise<{ success: boolean; error: string | null }>
  onCancel: () => void
}

export default function ConnectionModal({ criminals, onSave, onCancel }: ConnectionModalProps) {
  const [connectionType, setConnectionType] = useState("collaborator")
  const [evidence, setEvidence] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (criminals.length !== 2) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await onSave(connectionType, evidence)

      if (!result.success && result.error) {
        setError(result.error)
        setIsSubmitting(false)
      }
      // If successful, the modal will be closed by the parent component
    } catch (err) {
      setError("Failed to create connection. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-bold text-lg">Connect Criminals</h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-white">
          <X size={20} />
        </button>
      </div>

      {error && (
        <div className="bg-red-900/50 text-white p-3 rounded-md mb-4 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-center mb-4 space-x-4">
        {criminals.map((criminal, index) => (
          <div key={criminal.id} className="text-center">
            <div className="w-16 h-16 mx-auto mb-2 relative overflow-hidden rounded-md">
              <Image src={criminal.imageUrl || "/placeholder.svg"} alt={criminal.name} fill className="object-cover" />
            </div>
            <p className="text-white text-sm">{criminal.name}</p>
            {index === 0 && (
              <div className="flex items-center justify-center my-2">
                <div className="w-8 h-0.5 bg-red-500"></div>
                <div className="text-red-500 mx-2">→</div>
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-white text-sm font-bold mb-2">Connection Type</label>
          <select
            value={connectionType}
            onChange={(e) => setConnectionType(e.target.value)}
            className="w-full bg-gray-700 text-white rounded p-2 border border-gray-600"
            disabled={isSubmitting}
          >
            <option value="collaborator">Collaborators</option>
            <option value="competitor">CopyCat</option>
            <option value="same-tech">Same Tech Stack</option>
            <option value="mentor">Mentor/Mentee</option>
            <option value="inspired-by">Inspired By</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-white text-sm font-bold mb-2">Evidence</label>
          <textarea
            value={evidence}
            onChange={(e) => setEvidence(e.target.value)}
            placeholder="Describe the connection between these criminals..."
            className="w-full bg-gray-700 text-white rounded p-2 border border-gray-600 h-24"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
              </>
            ) : (
              "Create Connection"
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
