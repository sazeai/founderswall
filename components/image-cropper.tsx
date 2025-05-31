"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Check, X, ZoomIn, ZoomOut } from "lucide-react"
import { Slider } from "@/components/ui/slider"

interface ImageCropperProps {
  imageUrl: string
  onCropComplete: (croppedImageBlob: Blob) => void
  onCancel: () => void
  aspectRatio?: number
}

export default function ImageCropper({ imageUrl, onCropComplete, onCancel }: ImageCropperProps) {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })

  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  // Fixed crop dimensions
  const CROP_SIZE = 400

  // When the image loads, get its natural dimensions
  const onImageLoad = () => {
    if (imageRef.current) {
      setImageSize({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight,
      })

      // Center the image initially
      centerImage()
    }
  }

  // Center the image in the crop area
  const centerImage = () => {
    if (containerRef.current && imageRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const containerCenter = {
        x: containerRect.width / 2,
        y: containerRect.height / 2,
      }

      const scaledImageWidth = imageRef.current.naturalWidth * scale
      const scaledImageHeight = imageRef.current.naturalHeight * scale

      setPosition({
        x: containerCenter.x - scaledImageWidth / 2,
        y: containerCenter.y - scaledImageHeight / 2,
      })
    }
  }

  // Handle mouse/touch down to start dragging
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true)

    // Get client coordinates whether it's mouse or touch
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY

    setDragStart({
      x: clientX - position.x,
      y: clientY - position.y,
    })
  }

  // Handle mouse/touch move to update position
  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return

    // Get client coordinates whether it's mouse or touch
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY

    // Calculate new position
    const newX = clientX - dragStart.x
    const newY = clientY - dragStart.y

    setPosition({ x: newX, y: newY })

    // Prevent default to avoid scrolling while dragging on mobile
    e.preventDefault()
  }

  // Handle mouse/touch up to end dragging
  const handleDragEnd = () => {
    setIsDragging(false)
  }

  // Generate the cropped image when the user clicks "Apply"
  const generateCroppedImage = () => {
    if (!containerRef.current || !imageRef.current) return

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size to our desired output size
    canvas.width = CROP_SIZE
    canvas.height = CROP_SIZE

    // Get the container dimensions and position
    const containerRect = containerRef.current.getBoundingClientRect()

    // Calculate the visible portion of the image within the crop area
    const cropAreaLeft = containerRect.width / 2 - CROP_SIZE / 2
    const cropAreaTop = containerRect.height / 2 - CROP_SIZE / 2

    // Calculate the source coordinates in the original image
    const sourceX = (cropAreaLeft - position.x) / scale
    const sourceY = (cropAreaTop - position.y) / scale
    const sourceWidth = CROP_SIZE / scale
    const sourceHeight = CROP_SIZE / scale

    // Draw the cropped portion to the canvas
    ctx.drawImage(imageRef.current, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, CROP_SIZE, CROP_SIZE)

    // Convert the canvas to a Blob
    canvas.toBlob(
      (blob) => {
        if (blob) {
          onCropComplete(blob)
        }
      },
      "image/jpeg",
      0.95,
    )
  }

  // Add event listeners for drag end outside the component
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false)
      }
    }

    window.addEventListener("mouseup", handleGlobalMouseUp)
    window.addEventListener("touchend", handleGlobalMouseUp)

    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp)
      window.removeEventListener("touchend", handleGlobalMouseUp)
    }
  }, [isDragging])

  return (
    <div className="bg-gray-900 p-6 rounded-lg max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-white mb-4">Position Your Mugshot</h2>
      <p className="text-gray-300 mb-4">Move and zoom your photo to fit within the square frame.</p>

      {/* Crop container with fixed dimensions */}
      <div className="relative mx-auto mb-6" style={{ width: "100%", maxWidth: "500px", height: "500px" }}>
        {/* Container for the draggable image - this handles all interactions */}
        <div
          ref={containerRef}
          className="absolute inset-0 overflow-hidden"
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
        >
          {/* The actual image that can be moved and scaled */}
          <img
            ref={imageRef}
            src={imageUrl || "/placeholder.svg"}
            alt="Crop preview"
            onLoad={onImageLoad}
            className="absolute select-none"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: "0 0",
              maxWidth: "none",
              touchAction: "none",
            }}
            draggable={false}
          />
        </div>

        {/* Overlay with crop area - positioned above image but with pointer-events: none */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Semi-transparent overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-50">
            {/* Transparent hole for the crop area */}
            <div
              className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
              style={{
                width: `${CROP_SIZE}px`,
                height: `${CROP_SIZE}px`,
                boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.5)`, // Creates the overlay effect
              }}
            ></div>
          </div>

          {/* Crop area border - visible but not interactive */}
          <div
            className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-white rounded-sm"
            style={{ width: `${CROP_SIZE}px`, height: `${CROP_SIZE}px` }}
          >
            {/* Corner indicators for better UX */}
            <div className="absolute -top-1 -left-1 w-4 h-4 border-l-2 border-t-2 border-white"></div>
            <div className="absolute -top-1 -right-1 w-4 h-4 border-r-2 border-t-2 border-white"></div>
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-l-2 border-b-2 border-white"></div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-r-2 border-b-2 border-white"></div>
          </div>
        </div>
      </div>

      {/* Zoom controls */}
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <ZoomOut className="h-4 w-4 text-gray-400 mr-2" />
          <Slider
            value={[scale]}
            min={0.5}
            max={3}
            step={0.01}
            onValueChange={(value) => {
              setScale(value[0])
              // Recenter when scale changes dramatically
              if (Math.abs(scale - value[0]) > 0.5) {
                centerImage()
              }
            }}
            className="flex-1"
          />
          <ZoomIn className="h-4 w-4 text-gray-400 ml-2" />
        </div>
        <p className="text-xs text-center text-gray-400">Drag the image to position • Use slider to zoom</p>
      </div>

      {/* Action buttons */}
      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onCancel} className="border-gray-700 text-white">
          <X className="mr-2 h-4 w-4" /> Cancel
        </Button>
        <Button onClick={generateCroppedImage} className="bg-red-500 hover:bg-red-600">
          <Check className="mr-2 h-4 w-4" /> Apply
        </Button>
      </div>
    </div>
  )
}
