"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Upload, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { uploadImage } from "@/lib/storage-service"
import { createMugshot } from "@/lib/mugshot-service-client"
import type { Mugshot } from "@/lib/types"
import ImageCropper from "@/components/image-cropper"
import { createClient } from "@/utils/supabase/client"

export default function GetArrestedPage() {
  const router = useRouter()
  const supabase = createClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showCropper, setShowCropper] = useState(false)
  const [checkingMugshot, setCheckingMugshot] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    crime: "",
    note: "",
    productUrl: "",
    twitterHandle: "",
    imageFile: null as File | null,
    imagePreview: "",
  })

  // Get the current user ID and check if they already have a mugshot
  useEffect(() => {
    async function getUserIdAndCheckMugshot() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setCheckingMugshot(false)
          return
        }

        setUserId(user.id)

        // Check if user already has a mugshot
        const response = await fetch("/api/mugshots/me")

        if (response.ok) {
          // User already has a mugshot, redirect to edit page
          router.push("/station/edit-mugshot")
          return
        }

        // If 404, user doesn't have a mugshot yet, continue with creation
        setCheckingMugshot(false)
      } catch (error) {
        console.error("Error checking mugshot:", error)
        setCheckingMugshot(false)
      }
    }

    getUserIdAndCheckMugshot()
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
    // If the user cancels cropping on the initial upload, clear the image
    if (step === 1) {
      setFormData({
        ...formData,
        imageFile: null,
        imagePreview: "",
      })
    }
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

    try {
      // Step 1: Upload the image to Supabase Storage
      if (!formData.imageFile) {
        setError("Please upload an image")
        setLoading(false)
        return
      }

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

      const { url: imageUrl, error: uploadError } = await uploadImage(formData.imageFile)

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (uploadError || !imageUrl) {
        setError(uploadError || "Failed to upload image")
        setLoading(false)
        return
      }

      // Step 2: Create the mugshot record in the database
      const mugshotData: Omit<Mugshot, "id" | "createdAt" | "likes"> = {
        name: formData.name,
        crime: formData.crime,
        note: formData.note,
        imageUrl: imageUrl,
        mugshotUrl: imageUrl, // For now, we're using the same image for both
        productUrl: formData.productUrl,
        twitterHandle: formData.twitterHandle,
        userId: userId,
      }

      const { mugshot, error: createError } = await createMugshot(mugshotData)

      if (createError || !mugshot) {
        setError(createError || "Failed to create mugshot")
        setLoading(false)
        return
      }

      // Store the image URL and name in localStorage for the success page
      localStorage.setItem("lastUploadedImageUrl", imageUrl)
      localStorage.setItem("lastUploadedName", formData.name)

      // Step 3: Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Step 4: Redirect to success page
      router.push("/success")
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
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

  // Show loading state while checking if user has a mugshot
  if (checkingMugshot) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Checking your criminal record...</p>
        </div>
      </div>
    )
  }

  // If the cropper is showing, render it instead of the normal form
  if (showCropper && formData.imagePreview) {
    return (
      <div className="min-h-screen bg-gray-800 text-white">
        <div className="px-6 flex items-center">
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
    <div className="min-h-screen max-w-4xl mx-auto bg-gray-900 rounded-lg p-6 border border-gray-700">
      {/* Form Steps */}
      <div className="p-4">
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <div className={`w-1/3 h-1 ${step >= 1 ? "bg-red-500" : "bg-gray-700"} rounded-full`}></div>
            <div className={`w-1/3 h-1 ${step >= 2 ? "bg-red-500" : "bg-gray-700"} rounded-full`}></div>
            <div className={`w-1/3 h-1 ${step >= 3 ? "bg-red-500" : "bg-gray-700"} rounded-full`}></div>
          </div>
          <h2 className="text-xl font-bold">
            {step === 1 ? "Upload Your Selfie" : step === 2 ? "Enter Your Crime" : "Payment & Confirmation"}
          </h2>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-900/50 text-white p-3 rounded-md mb-4 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
                {formData.imagePreview ? (
                  <div className="relative w-full h-64 mx-auto">
                    <Image
                      src={formData.imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      fill
                      className="object-contain"
                    />
                    <div className="absolute bottom-2 right-2 flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowCropper(true)}
                        className="bg-gray-800 text-white rounded-full p-2"
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
                        className="bg-red-500 text-white rounded-full p-2"
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
                ) : (
                  <div className="py-12">
                    <div className="flex justify-center mb-4">
                      <Upload className="h-12 w-12 text-gray-500" />
                    </div>
                    <p className="text-gray-300 mb-2">Drag and drop your selfie here, or click to browse</p>
                    <p className="text-gray-500 text-sm">JPG, PNG or GIF (max. 5MB)</p>
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
                    <Upload className="mr-2 h-4 w-4" /> Upload Photo
                  </Button>
                </div>
              </div>

              <Button
                type="button"
                className="w-full py-6 bg-red-500 hover:bg-red-600 text-white text-xl"
                onClick={() => {
                  if (!formData.imagePreview) {
                    setError("Please upload and crop an image before continuing")
                    return
                  }
                  setError(null)
                  setStep(2)
                }}
                disabled={!formData.imagePreview}
              >
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">
                    Your Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    onInput={(e) => {
                      // Only allow letters and spaces
                      const target = e.target as HTMLInputElement
                      const filteredValue = target.value.replace(/[^a-zA-Z\s]/g, "")
                      if (target.value !== filteredValue) {
                        target.value = filteredValue
                        setFormData({
                          ...formData,
                          name: filteredValue,
                        })
                      }
                    }}
                    placeholder="John Doe"
                    required
                    className="bg-gray-900 border-gray-700 text-white"
                    maxLength={50}
                  />
                  <p className="text-xs text-gray-400">Only letters and spaces allowed (max 50 characters)</p>
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

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-gray-700 text-white"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                  onClick={() => {
                    // Check if all fields are filled
                    if (
                      !formData.name ||
                      !formData.crime ||
                      !formData.note ||
                      !formData.productUrl ||
                      !formData.twitterHandle
                    ) {
                      setError("Please fill in all fields before continuing")
                      return
                    }
                    setError(null)
                    setStep(3)
                  }}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-gray-900 p-4 rounded-lg">
                <h3 className="font-bold mb-4 text-center">Your Mugshot Preview</h3>

                <div className="relative w-full h-64 mx-auto border border-gray-700 mb-4">
                  {formData.imagePreview ? (
                    <Image
                      src={formData.imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-800">
                      <p className="text-gray-500">No image uploaded</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Name:</span>
                    <span>{formData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Crime:</span>
                    <span>{formData.crime}</span>
                  </div>
                  {formData.note && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Note:</span>
                      <span>{formData.note}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-gray-700 text-white"
                  onClick={() => setStep(2)}
                  disabled={loading}
                >
                  Back
                </Button>
                <Button type="submit" className="flex-1 bg-red-500 hover:bg-red-600 text-white" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {uploadProgress < 100 ? `Uploading ${uploadProgress}%` : "Processing"}
                    </>
                  ) : (
                    "Get on Board"
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
