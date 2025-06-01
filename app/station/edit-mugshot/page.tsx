"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Upload, Camera, Loader2, AlertCircle, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { uploadImage } from "@/lib/storage-service"
import type { Mugshot } from "@/lib/types"
import ImageCropper from "@/components/image-cropper"
import { createClient } from "@/utils/supabase/client"

export default function EditMugshotPage() {
  const router = useRouter()
  const supabase = createClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showCropper, setShowCropper] = useState(false)
  const [loadingMugshot, setLoadingMugshot] = useState(true)
  const [mugshotId, setMugshotId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    crime: "",
    note: "",
    productUrl: "",
    twitterHandle: "",
    imageFile: null as File | null,
    imagePreview: "",
    imageUrl: "",
  })

  // Get the current user ID and fetch their mugshot
  useEffect(() => {
    async function getUserAndMugshot() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/login")
          return
        }

        setUserId(user.id)

        // Fetch the user's mugshot
        const response = await fetch("/api/mugshots/me")

        if (!response.ok) {
          // User doesn't have a mugshot, redirect to creation page
          router.push("/station/get-arrested")
          return
        }

        const mugshot = await response.json()
        setMugshotId(mugshot.id)

        // Populate form with mugshot data
        setFormData({
          name: mugshot.name || "",
          crime: mugshot.crime || "",
          note: mugshot.note || "",
          productUrl: mugshot.productUrl || "",
          twitterHandle: mugshot.twitterHandle || "",
          imageFile: null,
          imagePreview: "",
          imageUrl: mugshot.imageUrl || "",
        })

        setLoadingMugshot(false)
      } catch (error) {
        console.error("Error fetching mugshot:", error)
        setError("Failed to load your mugshot. Please try again.")
        setLoadingMugshot(false)
      }
    }

    getUserAndMugshot()
  }, [supabase, router])

  // Reference to file input
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB")
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({
          ...formData,
          imageFile: file,
          imagePreview: reader.result as string,
        })
        setError(null)
        // Show the cropper when an image is selected
        setShowCropper(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCropComplete = (croppedBlob: Blob) => {
    // Create a new File object from the cropped Blob
    const croppedFile = new File([croppedBlob], "cropped-mugshot.jpg", {
      type: "image/jpeg",
      lastModified: Date.now(),
    })

    // Create a URL for the preview
    const previewUrl = URL.createObjectURL(croppedBlob)

    // Update form data with the cropped image
    setFormData({
      ...formData,
      imageFile: croppedFile,
      imagePreview: previewUrl,
    })

    // Hide the cropper
    setShowCropper(false)
  }

  const handleCropCancel = () => {
    // If the user cancels cropping, clear the image
    setFormData({
      ...formData,
      imageFile: null,
      imagePreview: "",
    })
    setShowCropper(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      let imageUrl = formData.imageUrl

      // If a new image was uploaded, process it
      if (formData.imageFile) {
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval)
              return 90
            }
            return prev + 10
          })
        }, 300)

        const { url, error: uploadError } = await uploadImage(formData.imageFile)

        clearInterval(progressInterval)
        setUploadProgress(100)

        if (uploadError || !url) {
          setError(uploadError || "Failed to upload image")
          setLoading(false)
          return
        }

        imageUrl = url
      }

      // Update the mugshot record in the database
      const mugshotData: Partial<Omit<Mugshot, "id" | "createdAt">> = {
        name: formData.name,
        crime: formData.crime,
        note: formData.note,
        imageUrl: imageUrl,
        mugshotUrl: imageUrl, // For now, we're using the same image for both
        productUrl: formData.productUrl,
        twitterHandle: formData.twitterHandle,
      }

      const response = await fetch(`/api/mugshots/${mugshotId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mugshotData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update mugshot")
      }

      // Show success message
      setSuccess("Your mugshot has been updated successfully!")

      // Reset form state
      setUploadProgress(0)
      setLoading(false)

      // If a new image was uploaded, update the preview
      if (formData.imageFile) {
        setFormData({
          ...formData,
          imageUrl: imageUrl,
          imageFile: null,
          imagePreview: "",
        })
      }
    } catch (err) {
      console.error("Error in handleSubmit:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.")
      setLoading(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (formData.imagePreview && formData.imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(formData.imagePreview)
      }
    }
  }, [formData.imagePreview])

  // Show loading state while fetching the mugshot
  if (loadingMugshot) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading your criminal record...</p>
        </div>
      </div>
    )
  }

  // If the cropper is showing, render it instead of the normal form
  if (showCropper && formData.imagePreview) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="pt-6 px-6 flex items-center">
          <button onClick={handleCropCancel} className="text-white mr-4">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold">Position Your Mugshot</h1>
        </div>
        <div className="h-6 w-full bg-yellow-400 mt-4 relative overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "repeating-linear-gradient(45deg, #000 0, #000 10px, #f6e05e 10px, #f6e05e 20px)",
              backgroundSize: "28px 28px",
            }}
          ></div>
        </div>
        <div className="p-6">
          <ImageCropper
            imageUrl={formData.imagePreview}
            onCropComplete={handleCropComplete}
            onCancel={handleCropCancel}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen max-w-4xl mx-auto bg-gray-900 rounded-xl border border-gray-800 shadow-lg">
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center">
            <button onClick={() => router.push("/station")} className="text-white mr-4">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold text-white">Edit Your Mugshot</h1>
          </div>
        </div>
        {/* Error message */}
        {error && (
          <div className="bg-red-900/70 text-white p-3 rounded-md mb-4 flex items-start border border-red-700">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5 text-red-400" />
            <p className="text-sm">{error}</p>
          </div>
        )}
        {/* Success message */}
        {success && (
          <div className="bg-green-900/70 text-white p-3 rounded-md mb-4 flex items-start border border-green-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5 text-green-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm">{success}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center bg-gray-800">
              {formData.imagePreview ? (
                <div className="relative w-full h-64 mx-auto">
                  <Image
                    src={formData.imagePreview || "/placeholder.svg"}
                    alt="Preview"
                    fill
                    className="object-contain rounded-lg border border-gray-700 bg-gray-900"
                  />
                  <div className="absolute bottom-2 right-2 flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowCropper(true)}
                      className="bg-gray-900 text-white rounded-full p-2 border border-gray-700"
                      title="Edit crop"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M6 2v4h12V2"></path>
                        <path d="M18 18h4v-4"></path>
                        <path d="M22 22H2V2"></path>
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, imageFile: null, imagePreview: "" })}
                      className="bg-red-500 text-white rounded-full p-2 border border-red-700"
                      title="Remove image"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              ) : formData.imageUrl ? (
                <div className="relative w-full h-64 mx-auto">
                  <Image
                    src={formData.imageUrl || "/placeholder.svg"}
                    alt="Current Mugshot"
                    fill
                    className="object-contain rounded-lg border border-gray-700 bg-gray-900"
                  />
                </div>
              ) : (
                <div className="py-12">
                  <div className="flex justify-center mb-4">
                    <Upload className="h-12 w-12 text-yellow-400" />
                  </div>
                  <p className="text-gray-300 mb-2">No mugshot image found</p>
                </div>
              )}
              <input
                type="file"
                id="imageFile"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="mt-4 flex justify-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="border-gray-700 text-white"
                  onClick={triggerFileInput}
                >
                  <Upload className="mr-2 h-4 w-4 text-yellow-400" /> {formData.imageUrl ? "Change Photo" : "Upload Photo"}
                </Button>
                <Button type="button" variant="outline" className="border-gray-700 text-white">
                  <Camera className="mr-2 h-4 w-4 text-yellow-400" /> Take Photo
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">
                  Your Name (Cannot be changed)
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  required
                  disabled
                  className="bg-gray-900 border-gray-700 text-white opacity-75 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400">
                  Your name cannot be changed as it's used in your maker profile URL (founderswall.com/maker/your-name)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="crime" className="text-white">
                  Your Crime
                </Label>
                <Input
                  id="crime"
                  name="crime"
                  value={formData.crime}
                  onChange={handleInputChange}
                  placeholder="e.g., SHIPPED WITHOUT TESTING"
                  required
                  className="bg-gray-900 border-gray-700 text-white"
                />
                <p className="text-xs text-gray-400">This will appear on your mugshot sign</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="note" className="text-white">
                  Handwritten Note
                </Label>
                <Input
                  id="note"
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  placeholder="e.g., No remorse shipping fast"
                  className="bg-gray-900 border-gray-700 text-white"
                  required
                />
                <p className="text-xs text-gray-400">This will appear as a handwritten note below your mugshot</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="productUrl" className="text-white">
                  Product URL
                </Label>
                <Input
                  id="productUrl"
                  name="productUrl"
                  value={formData.productUrl}
                  onChange={handleInputChange}
                  placeholder="https://yourproduct.com"
                  className="bg-gray-900 border-gray-700 text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitterHandle" className="text-white">
                  X/Twitter Handle
                </Label>
                <Input
                  id="twitterHandle"
                  name="twitterHandle"
                  value={formData.twitterHandle}
                  onChange={handleInputChange}
                  placeholder="@yourusername"
                  className="bg-gray-900 border-gray-700 text-white"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {uploadProgress > 0 ? `Uploading ${uploadProgress}%` : "Saving..."}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
