"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { normalizeUsername } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Eye, Trophy, X, Lightbulb } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { BuildStory } from "@/lib/types"

interface BuildStoryCardProps {
  story: BuildStory
}

const categoryConfig = {
  win: {
    icon: Trophy,
    color: "text-green-600",
    bgColor: "bg-green-600",
    label: "WIN",
  },
  fail: {
    icon: X,
    color: "text-red-600",
    bgColor: "bg-red-600",
    label: "FAIL",
  },
  hack: {
    icon: Lightbulb,
    color: "text-blue-600",
    bgColor: "bg-blue-600",
    label: "HACK",
  },
}

export default function BuildStoryCard({ story }: BuildStoryCardProps) {
  const [rotation, setRotation] = useState(0)
  const [pinPosition, setPinPosition] = useState({ x: 50, y: 15 })
  const [stainPosition, setStainPosition] = useState({ x: 70, y: 60, opacity: 0.1, scale: 0.5, rotation: 0 })

  const config = categoryConfig[story.category as keyof typeof categoryConfig]
  const Icon = config.icon

  // Generate random styling on mount
  useEffect(() => {
    // Random rotation between -1 and 1 degrees
    const randomRotation = Math.random() * 2 - 1
    setRotation(randomRotation)

    // Random pin position
    const randomPinX = 40 + Math.random() * 20 // Between 40-60%
    const randomPinY = 10 + Math.random() * 10 // Between 10-20%
    setPinPosition({ x: randomPinX, y: randomPinY })

    // Random coffee stain
    const randomStainX = 50 + Math.random() * 40 // Between 50-90%
    const randomStainY = 40 + Math.random() * 40 // Between 40-80%
    const randomOpacity = 0.05 + Math.random() * 0.15 // Between 0.05-0.2
    const randomScale = 0.3 + Math.random() * 0.4 // Between 0.3-0.7
    const randomStainRotation = Math.random() * 360 // Full rotation
    setStainPosition({
      x: randomStainX,
      y: randomStainY,
      opacity: randomOpacity,
      scale: randomScale,
      rotation: randomStainRotation,
    })
  }, [])

  // Get only the first word of the author name
  const authorFirstName = story.author?.name ? story.author.name.split(" ")[0] : "Unknown"

  // Create a normalized username for the URL
  const makerProfileUrl = story.author?.name ? `/maker/${normalizeUsername(story.author.name)}` : "#"

  // Truncate content for preview
  const truncatedContent = story.content.length > 150 ? story.content.substring(0, 150) + "..." : story.content

  return (
    <div className="relative w-full flex justify-center">
      <div className="w-full max-w-[380px]">
        {/* Red Pin */}
        <div
          className="absolute z-20 w-6 h-6 bg-red-500 rounded-full shadow-lg border-2 border-red-600"
          style={{
            top: "-8px",
            left: `${pinPosition.x}%`,
            transform: "translateX(-50%)",
          }}
        />

        {/* Main card */}
        <div
          className="relative z-10 w-full shadow-xl"
          style={{
            transform: `rotate(${rotation}deg)`,
            transformOrigin: `${pinPosition.x}% ${pinPosition.y}%`,
          }}
        >
          {/* Paper background with texture */}
          <div className="relative bg-[#FFF1C5] border-2 border-gray-800 rounded-sm overflow-hidden p-5">
            {/* Old paper texture overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  "url('https://w7.pngwing.com/pngs/930/611/png-transparent-retro-wall-texture-retro-texture-crack-thumbnail.png')",
                backgroundSize: "cover",
                opacity: 0.2,
                mixBlendMode: "luminosity",
              }}
            />

            {/* Coffee stain */}
            <div
              className="absolute pointer-events-none"
              style={{
                top: `${stainPosition.y}%`,
                left: `${stainPosition.x}%`,
                transform: `translate(-50%, -50%) rotate(${stainPosition.rotation}deg) scale(${stainPosition.scale})`,
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: `radial-gradient(circle, rgba(139, 69, 19, ${stainPosition.opacity}) 0%, rgba(139, 69, 19, ${stainPosition.opacity * 0.5}) 70%, transparent 100%)`,
              }}
            />

            {/* Content with improved typography */}
            <div className="relative z-10">
              {/* Header with better layout */}
              <div className="mb-4">
                {/* Category badge and date - better positioned */}
                <div className="flex justify-between items-start mb-3">
                  <div
                    className={`${config.bgColor} text-white px-2 py-1 text-sm font-bold inline-flex items-center shadow-md`}
                  >
                    <Icon className="w-4 h-4 mr-1" />
                    {config.label}
                  </div>
                  <div className="text-xs font-bold text-gray-600 font-mono bg-white px-2 py-1 border border-gray-400 shadow-sm">
                    {formatDistanceToNow(new Date(story.created_at), { addSuffix: true })}
                  </div>
                </div>

                {/* Title with better spacing */}
                <h2 className="text-lg font-black uppercase tracking-tight text-black leading-tight font-mono mb-3 break-words">
                  {story.title}
                </h2>

                <div className="h-1 bg-gray-800 mb-3"></div>
              </div>

              {/* Author section with better layout */}
              <div className="flex gap-4 mb-4">
                {/* Author photo with polaroid-like frame */}
                <div className="w-16 h-16 bg-white flex-shrink-0 p-1 shadow-md rotate-1 border-2 border-gray-800">
                  {story.author?.image_url ? (
                    <Image
                      src={story.author.image_url || "/placeholder.svg"}
                      alt={`${story.author.name} photo`}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Details with better spacing */}
                <div className="flex-grow">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-800">Author:</span>
                      {story.author?.name ? (
                        <Link
                          href={makerProfileUrl}
                          className="text-sm text-blue-800 font-semibold hover:underline truncate max-w-[140px]"
                        >
                          {authorFirstName}
                        </Link>
                      ) : (
                        <span className="text-sm text-gray-800 font-semibold">Unknown</span>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-800">Category:</span>
                      <span className={`text-sm font-semibold uppercase ${config.color}`}>{config.label}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-800">Status:</span>
                      <span className="text-sm text-green-700 font-semibold">Published</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Story Preview with better styling */}
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <div className={`w-3 h-3 ${config.bgColor} mr-2`}></div>
                  <h3 className="text-sm font-black uppercase text-black font-mono">STORY PREVIEW</h3>
                </div>
                <div className="pl-2 border-l-2 border-gray-400">
                  <div className="text-sm text-black font-serif italic leading-relaxed">{truncatedContent}</div>
                </div>
              </div>

              {/* Action Button with proper styling like product case files */}
              <div>
                <div className="h-1 bg-gray-800 mb-3"></div>
                <div className="flex justify-center">
                  <Button
                    asChild
                    className="bg-red-600 hover:bg-red-700 text-white border-2 border-red-800 rounded-none text-sm font-bold py-2 px-6 font-mono shadow-lg transform hover:scale-105 transition-transform uppercase tracking-wide"
                  >
                    <Link href={`/stories/${story.slug || story.id}`} className="flex items-center justify-center">
                      <Eye className="mr-2 h-4 w-4" />
                      READ STORY
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
