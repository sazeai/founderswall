"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { createClient } from "@/utils/supabase/client"
import type { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  FileText,
  ImageIcon,
  Link,
  Loader2,
  Plus,
  Trash,
  Upload,
  X,
} from "lucide-react"
import { uploadImage } from "@/lib/storage-service"
import type { ProductFormData } from "@/lib/types"

const PRODUCT_CATEGORIES = [
  "AI Tools",
  "Analytics",
  "Design Tools",
  "Developer Tools",
  "E-commerce",
  "Education",
  "Finance",
  "Health & Fitness",
  "Marketing",
  "Productivity",
  "Social Media",
  "Other",
]

const PRODUCT_STATUSES = ["On the Run", "Under Investigation", "Captured"]

// Function to set a fixed time (12:00 PM) for the launch date
function setFixedLaunchTime(dateString: string): string {
  try {
    const date = new Date(dateString)
    date.setUTCHours(12, 0, 0, 0) // Set to 12:00 PM UTC
    return date.toISOString()
  } catch (error) {
    return new Date().toISOString() // Fallback to current time
  }
}

export default function SubmitLaunchForm() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const checkUserAndProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login?redirectedFrom=/station/submit-launch")
        return
      }
      setUser(user)

      // Check for mugshot profile
      const response = await fetch("/api/user/mugshot-check")
      const data = await response.json()

      if (!data.hasMugshot) {
        router.push("/station/get-arrested?notice=profile_required")
        return
      }
      setIsLoading(false)
    }

    checkUserAndProfile()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Re-check profile on auth change if user logs in on this page
      if (event === "SIGNED_IN" && session?.user) {
        checkUserAndProfile()
      } else {
        setUser(session?.user || null)
      }
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [router])
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Form data state
  const [formData, setFormData] = useState<ProductFormData>({
    title: "",
    founderId: "",
    logoFile: null,
    logoPreview: "",
    screenshotFile: null,
    screenshotPreview: "",
    category: "",
    tags: [],
    status: "On the Run",
    summary: ["", "", ""],
    description: "",
    productUrl: "",
    socialLinks: {},
    launchDate: new Date().toISOString().split("T")[0], // Always today
    initialTimelineEntry: {
      headline: "Product launched on Founders Wall",
      description: "The product was officially launched on Founders Wall's Heist Board.",
    },
  })

  // Refs for file inputs
  const logoInputRef = useRef<HTMLInputElement>(null)
  const screenshotInputRef = useRef<HTMLInputElement>(null)

  // Tag input state
  const [tagInput, setTagInput] = useState("")

  // Handle file selection for logo
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError("Logo image size must be less than 2MB")
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({
          ...formData,
          logoFile: file,
          logoPreview: reader.result as string,
        })
        setError(null)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle file selection for screenshot
  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Screenshot image size must be less than 5MB")
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({
          ...formData,
          screenshotFile: file,
          screenshotPreview: reader.result as string,
        })
        setError(null)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Handle summary bullet changes
  const handleSummaryChange = (index: number, value: string) => {
    const newSummary = [...formData.summary]
    newSummary[index] = value
    setFormData({
      ...formData,
      summary: newSummary,
    })
  }

  // Add a new summary bullet
  const addSummaryBullet = () => {
    if (formData.summary.length < 5) {
      setFormData({
        ...formData,
        summary: [...formData.summary, ""],
      })
    }
  }

  // Remove a summary bullet
  const removeSummaryBullet = (index: number) => {
    if (formData.summary.length > 1) {
      const newSummary = [...formData.summary]
      newSummary.splice(index, 1)
      setFormData({
        ...formData,
        summary: newSummary,
      })
    }
  }

  // Handle social link changes
  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData({
      ...formData,
      socialLinks: {
        ...formData.socialLinks,
        [platform]: value,
      },
    })
  }

  // Add a tag
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      if (formData.tags.length < 5) {
        setFormData({
          ...formData,
          tags: [...formData.tags, tagInput.trim()],
        })
        setTagInput("")
      } else {
        setError("You can add a maximum of 5 tags")
      }
    }
  }

  // Remove a tag
  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    })
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Validate form data
      if (!formData.title) {
        setError("Product title is required")
        setIsSubmitting(false)
        return
      }

      if (!formData.logoFile) {
        setError("Product logo is required")
        setIsSubmitting(false)
        return
      }

      if (!formData.screenshotFile) {
        setError("Product screenshot is required")
        setIsSubmitting(false)
        return
      }

      if (!formData.category) {
        setError("Product category is required")
        setIsSubmitting(false)
        return
      }

      if (formData.tags.length === 0) {
        setError("At least one tag is required")
        setIsSubmitting(false)
        return
      }

      if (!formData.summary[0]) {
        setError("At least one summary bullet is required")
        setIsSubmitting(false)
        return
      }

      if (!formData.productUrl) {
        setError("Product URL is required")
        setIsSubmitting(false)
        return
      }

      // Upload logo directly to mugshots bucket
      setUploadProgress(10)

      const { url: logoUrl, error: logoError } = await uploadImage(formData.logoFile, "mugshots")

      if (logoError || !logoUrl) {

        setError(logoError || "Failed to upload logo")
        setIsSubmitting(false)
        return
      }

      // Upload screenshot directly to mugshots bucket
      setUploadProgress(40)

      const { url: screenshotUrl, error: screenshotError } = await uploadImage(formData.screenshotFile, "mugshots")

      if (screenshotError || !screenshotUrl) {

        setError(screenshotError || "Failed to upload screenshot")
        setIsSubmitting(false)
        return
      }

      setUploadProgress(70)

      // Filter out empty summary bullets
      const filteredSummary = formData.summary.filter((item) => item.trim() !== "")

      // Set a fixed time (12:00 PM) for the launch date - always use today's date
      const today = new Date()
      const launchDateWithFixedTime = setFixedLaunchTime(today.toISOString().split("T")[0])

      // Prepare product data (remove founderId - server will determine it)
      const productData = {
        title: formData.title,
        logoUrl,
        screenshotUrl,
        category: formData.category,
        status: formData.status,
        summary: filteredSummary,
        tags: formData.tags,
        description: formData.description,
        productUrl: formData.productUrl,
        socialLinks: formData.socialLinks,
        launchDate: launchDateWithFixedTime,
        initialTimelineEntry: formData.initialTimelineEntry,
      }

   

      // Submit product data
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      })

      setUploadProgress(100)

      if (!response.ok) {
        const data = await response.json()
    
        setError(data.error || "Failed to create product")
        setIsSubmitting(false)
        return
      }

      const product = await response.json()

      // Redirect to the product page
      router.push(`/launch/${product.slug}`)
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      setIsSubmitting(false)
    }
  }

  // If user is not logged in, redirect to login page
  if (!isLoading && !user) {
    router.push("/login?redirectedFrom=/station/submit-launch")
    return null
  }

  return (
    <div className="min-h-screen max-w-4xl mx-auto bg-gray-900 rounded-xl border border-gray-800 shadow-lg">
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 text-white">Submit a Launch</h2>
          <p className="text-gray-400">Add your product to the Heist Board</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <div className={`w-1/3 h-1 ${step >= 1 ? "bg-yellow-400" : "bg-gray-700"} rounded-full`}></div>
            <div className={`w-1/3 h-1 ${step >= 2 ? "bg-yellow-400" : "bg-gray-700"} rounded-full`}></div>
            <div className={`w-1/3 h-1 ${step >= 3 ? "bg-yellow-400" : "bg-gray-700"} rounded-full`}></div>
          </div>
          <div className="flex justify-between text-sm">
            <div className={step >= 1 ? "text-white" : "text-gray-500"}>Basic Info</div>
            <div className={step >= 2 ? "text-white" : "text-gray-500"}>Case File Details</div>
            <div className={step >= 3 ? "text-white" : "text-gray-500"}>Timeline & Review</div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-900/70 text-white p-3 rounded-md mb-4 flex items-start border border-red-700">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5 text-red-400" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <Card className="bg-gray-900 border border-gray-800 shadow-md">
                <CardHeader>
                  <CardTitle className="text-white">Basic Information</CardTitle>
                  <CardDescription className="text-gray-400">Tell us about your product</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Product Name</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Awesome SaaS"
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Product Logo</Label>
                      <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center bg-gray-800">
                        {formData.logoPreview ? (
                          <div className="relative w-32 h-32 mx-auto">
                            <Image
                              src={formData.logoPreview || "/placeholder.svg"}
                              alt="Logo preview"
                              fill
                              className="object-contain"
                            />
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, logoFile: null, logoPreview: "" })}
                              className="absolute -top-2 -right-2 bg-yellow-400 text-white rounded-full p-1"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-center mb-2">
                              <ImageIcon className="h-10 w-10 text-gray-400" />
                            </div>
                            <p className="text-gray-300 text-sm mb-2">Upload your product logo</p>
                            <p className="text-gray-400 text-xs">PNG, JPG or SVG (max. 2MB)</p>
                            <input
                              type="file"
                              id="logoFile"
                              ref={logoInputRef}
                              accept="image/*"
                              className="hidden"
                              onChange={handleLogoChange}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              className="mt-2 border-gray-700 bg-gray-800 hover:bg-gray-700"
                              onClick={() => logoInputRef.current?.click()}
                            >
                              <Upload className="mr-2 h-4 w-4" /> Upload Logo
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Product Screenshot</Label>
                      <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center bg-gray-800">
                        {formData.screenshotPreview ? (
                          <div className="relative w-full h-32 mx-auto">
                            <Image
                              src={formData.screenshotPreview || "/placeholder.svg"}
                              alt="Screenshot preview"
                              fill
                              className="object-contain"
                            />
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, screenshotFile: null, screenshotPreview: "" })}
                              className="absolute -top-2 -right-2 bg-yellow-400 text-white rounded-full p-1"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-center mb-2">
                              <FileText className="h-10 w-10 text-gray-400" />
                            </div>
                            <p className="text-gray-300 text-sm mb-2">Upload a screenshot</p>
                            <p className="text-gray-400 text-xs">PNG or JPG (max. 5MB)</p>
                            <input
                              type="file"
                              id="screenshotFile"
                              ref={screenshotInputRef}
                              accept="image/*"
                              className="hidden"
                              onChange={handleScreenshotChange}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              className="mt-2 border-gray-700 bg-gray-800 hover:bg-gray-700"
                              onClick={() => screenshotInputRef.current?.click()}
                            >
                              <Upload className="mr-2 h-4 w-4" /> Upload Screenshot
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                        <SelectTrigger className="bg-gray-800 border-gray-700">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {PRODUCT_CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                        <SelectTrigger className="bg-gray-800 border-gray-700">
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                        <SelectContent>
                          {PRODUCT_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (up to 5)</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.tags.map((tag) => (
                        <div
                          key={tag}
                          className="bg-gray-800 text-white px-2 py-1 rounded-full text-sm flex items-center"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 text-gray-400 hover:text-white"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Add a tag"
                        className="bg-gray-800 border-gray-700 rounded-r-none"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addTag()
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={addTag}
                        className="rounded-l-none bg-yellow-400 hover:bg-yellow-500"
                        disabled={!tagInput.trim() || formData.tags.length >= 5}
                      >
                        Add
                      </Button>
                    </div>
                    <p className="text-xs text-gray-400">Press Enter to add a tag</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="launchDate">Launch Date</Label>
                    <div className="relative">
                      <Input
                        id="launchDate"
                        name="launchDate"
                        type="date"
                        value={new Date().toISOString().split("T")[0]}
                        disabled
                        className="bg-gray-800 border-gray-700 pl-10 opacity-70"
                      />
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-400">Products are automatically launched today at 12:00 PM UTC.</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    className="bg-yellow-400 hover:bg-yellow-500"
                    disabled={
                      !formData.title ||
                      !formData.logoFile ||
                      !formData.screenshotFile ||
                      !formData.category ||
                      formData.tags.length === 0
                    }
                  >
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="space-y-6">
              <Card className="bg-gray-900 border border-gray-800 shadow-md">
                <CardHeader>
                  <CardTitle className="text-white">Case File Details</CardTitle>
                  <CardDescription className="text-gray-400">Provide more information about your product</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="summary">Evidence Summary (Bullets)</Label>
                    {formData.summary.map((bullet, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={bullet}
                          onChange={(e) => handleSummaryChange(index, e.target.value)}
                          placeholder={`e.g., ${index === 0 ? "What's the product" : index === 1 ? "Who's it for" : "Key feature"}`}
                          className="bg-gray-800 border-gray-700"
                        />
                        <button
                          type="button"
                          onClick={() => removeSummaryBullet(index)}
                          className="text-gray-400 hover:text-white"
                          disabled={formData.summary.length <= 1}
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {formData.summary.length < 5 && (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full border-dashed border-gray-700 bg-gray-800 hover:bg-gray-700"
                        onClick={addSummaryBullet}
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add Bullet Point
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Full Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe your product in detail..."
                      className="bg-gray-800 border-gray-700 min-h-32"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="productUrl">Product URL</Label>
                    <div className="relative">
                      <Input
                        id="productUrl"
                        name="productUrl"
                        value={formData.productUrl}
                        onChange={handleInputChange}
                        placeholder="https://example.com"
                        className="bg-gray-800 border-gray-700 pl-10"
                      />
                      <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Social Links (Optional)</Label>
                    <div className="space-y-2">
                      <div className="relative">
                        <Input
                          value={formData.socialLinks.twitter || ""}
                          onChange={(e) => handleSocialLinkChange("twitter", e.target.value)}
                          placeholder="Twitter/X URL"
                          className="bg-gray-800 border-gray-700 pl-10"
                        />
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">𝕏</span>
                      </div>

                      <div className="relative">
                        <Input
                          value={formData.socialLinks.github || ""}
                          onChange={(e) => handleSocialLinkChange("github", e.target.value)}
                          placeholder="GitHub URL"
                          className="bg-gray-800 border-gray-700 pl-10"
                        />
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">GH</span>
                      </div>

                      <div className="relative">
                        <Input
                          value={formData.socialLinks.other || ""}
                          onChange={(e) => handleSocialLinkChange("other", e.target.value)}
                          placeholder="Other URL (Discord, Product Hunt, etc.)"
                          className="bg-gray-800 border-gray-700 pl-10"
                        />
                        <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-gray-700 bg-gray-800 hover:bg-gray-700"
                    onClick={() => setStep(1)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setStep(3)}
                    className="bg-yellow-400 hover:bg-yellow-500"
                    disabled={!formData.summary[0] || !formData.productUrl}
                  >
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* Step 3: Timeline & Review */}
          {step === 3 && (
            <div className="space-y-6">
              <Card className="bg-gray-900 border border-gray-800 shadow-md">
                <CardHeader>
                  <CardTitle className="text-white">Timeline & Review</CardTitle>
                  <CardDescription className="text-gray-400">Review your submission</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Initial Timeline Entry</Label>
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <p className="text-sm font-medium">{new Date().toLocaleDateString()}</p>
                      </div>
                      <Input
                        value={formData.initialTimelineEntry?.headline || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            initialTimelineEntry: {
                              ...formData.initialTimelineEntry!,
                              headline: e.target.value,
                            },
                          })
                        }
                        placeholder="Headline"
                        className="bg-gray-700 border-gray-600 mb-2"
                      />
                      <Textarea
                        value={formData.initialTimelineEntry?.description || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            initialTimelineEntry: {
                              ...formData.initialTimelineEntry!,
                              description: e.target.value,
                            },
                          })
                        }
                        placeholder="Description"
                        className="bg-gray-700 border-gray-600"
                      />
                    </div>
                    <p className="text-xs text-gray-400">
                      You can add more timeline entries after your product is published.
                    </p>
                  </div>

                  <div className="border-t border-gray-700 pt-4">
                    <h3 className="font-medium mb-4">Review Your Submission</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Basic Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Product Name:</span>
                            <span>{formData.title}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Category:</span>
                            <span>{formData.category}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Status:</span>
                            <span>{formData.status}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Launch Date:</span>
                            <span>{new Date(formData.launchDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {formData.tags.map((tag) => (
                              <span key={tag} className="bg-gray-700 text-xs px-2 py-0.5 rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-800 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Case File Details</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-400">Summary:</span>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                              {formData.summary
                                .filter((s) => s.trim())
                                .map((bullet, index) => (
                                  <li key={index}>{bullet}</li>
                                ))}
                            </ul>
                          </div>
                          <div>
                            <span className="text-gray-400">Product URL:</span>
                            <div className="truncate">{formData.productUrl}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-gray-700 bg-gray-800 hover:bg-gray-700"
                    onClick={() => setStep(2)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="bg-yellow-400 hover:bg-yellow-500">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {uploadProgress < 100 ? `Uploading ${uploadProgress}%` : "Processing"}
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" /> Submit Launch
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
