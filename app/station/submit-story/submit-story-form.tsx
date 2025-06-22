"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Trophy, X, Lightbulb, Eye, Edit } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface SubmitStoryFormProps {
  user: User
}

const categories = [
  { id: "win", label: "Win", icon: Trophy, color: "bg-green-500", description: "Success stories and achievements" },
  { id: "fail", label: "Fail", icon: X, color: "bg-red-500", description: "Lessons learned from failures" },
  { id: "hack", label: "Hack", icon: Lightbulb, color: "bg-blue-500", description: "Creative solutions and tips" },
]

export default function SubmitStoryForm({ user }: SubmitStoryFormProps) {
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    console.log("🚀 FORM SUBMIT - Starting submission")

    try {
      if (!title.trim() || !category || !content.trim()) {
        throw new Error("Please fill in all fields")
      }

      console.log("📤 FORM SUBMIT - Sending request to API")
      const requestBody = {
        title: title.trim(),
        category,
        content: content.trim(),
      }
      console.log("📤 FORM SUBMIT - Request body:", requestBody)

      const response = await fetch("/api/build-stories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      console.log("📥 FORM SUBMIT - Response received:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      })

      // Check if response is ok
      if (!response.ok) {
        console.log("❌ FORM SUBMIT - Response not ok, status:", response.status)

        // Try to parse as JSON first
        let errorData
        try {
          const responseText = await response.text()
          console.log("📄 FORM SUBMIT - Raw response text:", responseText)

          // Try to parse as JSON
          try {
            errorData = JSON.parse(responseText)
            console.log("📄 FORM SUBMIT - Parsed as JSON:", errorData)
          } catch (jsonError) {
            console.log("❌ FORM SUBMIT - Not valid JSON, treating as plain text")
            errorData = { error: responseText || `HTTP ${response.status}: ${response.statusText}` }
          }
        } catch (textError) {
          console.log("❌ FORM SUBMIT - Could not read response text:", textError)
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
        }

        throw new Error(errorData.error || errorData.message || "Failed to submit story")
      }

      // Parse successful response
      let result
      try {
        const responseText = await response.text()
        console.log("📄 FORM SUBMIT - Success response text:", responseText)
        result = JSON.parse(responseText)
        console.log("✅ FORM SUBMIT - Parsed success response:", result)
      } catch (parseError) {
        console.log("❌ FORM SUBMIT - Could not parse success response:", parseError)
        throw new Error("Invalid response from server")
      }

      console.log("✅ FORM SUBMIT - Story created successfully, redirecting to /stories")
      // Redirect to stories page
      router.push("/stories")
    } catch (err) {
      console.error("💥 FORM SUBMIT - Error occurred:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Share Your Story</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
              Story Title
            </label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your story about?"
              className="bg-gray-700 border-gray-600 text-white"
              maxLength={100}
              required
            />
            <p className="text-xs text-gray-400 mt-1">{title.length}/100 characters</p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Category</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {categories.map((cat) => {
                const Icon = cat.icon
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      category === cat.id
                        ? "border-red-500 bg-red-500/10"
                        : "border-gray-600 bg-gray-700 hover:border-gray-500"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${cat.color}`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-white">{cat.label}</div>
                        <div className="text-xs text-gray-400">{cat.description}</div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content - Enhanced Markdown Editor */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">
              Your Story
            </label>

            <Tabs defaultValue="write" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-700">
                <TabsTrigger value="write" className="flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  Write
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Preview
                </TabsTrigger>
              </TabsList>

              <TabsContent value="write" className="mt-2">
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tell your story using Markdown...

**Bold text** for emphasis
*Italic text* for style
### Headings for structure
- Bullet points for lists
1. Numbered lists
> Quotes for important points
`code snippets` for technical details

Example:
### The Problem
I was struggling with **user retention** in my SaaS app...

### The Solution  
After trying multiple approaches, I discovered that *personalized onboarding* was the key..."
                  className="bg-gray-700 border-gray-600 text-white min-h-[300px] font-mono text-sm"
                  maxLength={3000}
                  required
                />
              </TabsContent>

              <TabsContent value="preview" className="mt-2">
                <div className="bg-gray-700 border border-gray-600 rounded-md p-4 min-h-[300px]">
                  {content ? (
                    <div className="text-white prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">Nothing to preview yet. Start writing in the Write tab!</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <p className="text-xs text-gray-400 mt-1">{content.length}/3000 characters</p>
            <p className="text-xs text-gray-500 mt-1">
              <strong>Markdown supported:</strong> **bold**, *italic*, ### headings, - lists, &gt; quotes, `code`
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting || !title.trim() || !category || !content.trim()}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sharing Story...
              </>
            ) : (
              "Share Story"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
