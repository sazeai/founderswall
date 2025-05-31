"use client"

import type React from "react"
import { FileText, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Mugshot } from "@/lib/types"
import { useRef } from "react"
import { normalizeUsername } from "@/lib/utils"

interface CriminalModalProps {
  criminal: Mugshot
  onClose: () => void
  modalType?: "police-file" | "mugshot"
}

export default function CriminalModal({ criminal, onClose }: CriminalModalProps) {
  const modalContentRef = useRef<HTMLDivElement>(null)

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Create a normalized username for the URL
  const makerProfileUrl = `/maker/${normalizeUsername(criminal.name)}`

  // Get badge info based on badge_type from user_profiles (now properly fetched)
  const getBadgeInfo = (badgeType: string) => {
    switch (badgeType) {
      case "community_pick":
        return {
          text: "COMMUNITY PICK",
          color: "text-blue-700",
          borderColor: "border-blue-700",
          bgColor: "bg-blue-100",
        }
      case "startup_saviour":
        return {
          text: "STARTUP SAVIOUR",
          color: "text-purple-700",
          borderColor: "border-purple-700",
          bgColor: "bg-purple-100",
        }
      default:
        return {
          text: "WANTED",
          color: "text-red-700",
          borderColor: "border-red-700",
          bgColor: "bg-red-100",
        }
    }
  }

  // Use the badgeType from the criminal object (now fetched from user_profiles)
  const badgeInfo = getBadgeInfo(criminal.badgeType || "wanted")

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={handleBackdropClick}>
      <div className="relative bg-[#f5f2e9] rounded-none overflow-hidden border-0 max-w-md mx-auto">
        {/* Coffee stain decoration */}
        <div className="absolute top-10 right-5 w-20 h-20 rounded-full bg-amber-800 opacity-10 blur-md"></div>

        <div ref={modalContentRef} className="relative pb-2 bg-[#f5f2e9]" style={{ transform: "translateZ(0)" }}>
          {/* Header with CONFIDENTIAL badge and case file text */}
          <div className="flex justify-between items-center px-4 pb-2 border-b border-amber-800/30">
            <div className="bg-amber-200 px-4 py-1 text-sm font-bold border-b border-x border-amber-700 rounded-b-md text-amber-900">
              <span className="block leading-tight">CONFIDENTIAL</span>
            </div>
            <div className="flex items-center">
              <FileText className="mr-2 text-blue-900" size={16} />
              <span className="text-xs font-mono uppercase text-gray-800 leading-tight">
                CASE FILE #{criminal.id.substring(0, 8).toUpperCase()}
              </span>
            </div>
          </div>

          <div className="px-4">
            {/* Mugshot with realistic styling */}
            <div className="relative border-8 border-gray-100 mb-2 shadow-md">
              <div className="absolute top-0 left-0 w-full p-1 bg-black bg-opacity-75 text-white flex justify-between items-center z-10">
                <div className="font-mono text-xs leading-tight">SUSPECTED INDIE HACKER</div>
                <div className="font-mono text-xs leading-tight">{new Date().toLocaleDateString()}</div>
              </div>
              <img
                src={criminal.imageUrl || "/placeholder.svg"}
                alt={`Mugshot of ${criminal.name}`}
                className="w-full h-auto"
                crossOrigin="anonymous"
              />
              <div className="absolute bottom-0 left-0 w-full h-8 bg-yellow-400 flex items-center justify-center">
                <div className="text-black font-bold text-xs tracking-wider leading-tight">DO NOT APPROACH</div>
              </div>
              {/* Dynamic badge stamp in bottom-right corner of image - NOW USES FETCHED BADGE TYPE */}
              <div
                className={`absolute bottom-8 right-2 transform rotate-[-20deg] border-4 ${badgeInfo.borderColor} rounded px-4 py-2 ${badgeInfo.color} font-bold text-xl opacity-80 z-20 ${badgeInfo.bgColor}`}
              >
                <span className="block leading-tight">{badgeInfo.text}</span>
              </div>
            </div>

            {/* Subject info */}
            <div className="border-l-4 border-blue-900 pl-3 mb-2">
              <h3 className="font-bold text-xl mb-1 text-gray-800 leading-tight">{criminal.name}</h3>
              <p className="text-sm font-mono mb-2 italic text-gray-800 leading-tight">"{criminal.crime}"</p>
            </div>

            {/* Additional details styled as police notes */}
            <div className="bg-white p-2 border border-gray-300 shadow-sm mb-2 transform rotate-[0.5deg]">
              <div className="space-y-1 font-mono text-sm">
                <p className="text-gray-800 leading-tight">
                  <span className="font-bold">Associated Product:</span>{" "}
                  <a
                    href={criminal.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-words"
                  >
                    {criminal.productUrl?.replace(/(^\w+:|^)\/\//, "") || "N/A"}
                  </a>
                </p>
                <p className="text-gray-800 leading-tight">
                  <span className="font-bold">Known Alias:</span>{" "}
                  <a
                    href={`https://twitter.com/${criminal.twitterHandle?.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {criminal.twitterHandle || "N/A"}
                  </a>
                </p>
                <p className="text-gray-800 leading-tight">
                  <span className="font-bold">Status:</span>{" "}
                  <span className="bg-yellow-100 px-1 inline-block transform -rotate-1 text-gray-800">
                    {criminal.badgeType === "community_pick"
                      ? "Community Favorite"
                      : criminal.badgeType === "startup_saviour"
                        ? "Startup Saviour"
                        : "At large"}
                  </span>
                </p>
              </div>
            </div>

            {/* Handwritten post-it note */}
            <div className="bg-yellow-100 p-2 mb-2 transform -rotate-1 shadow-md">
              <p className="font-handwriting text-sm text-gray-800 leading-tight">
                Detective's notes: {criminal.note || "Last seen building features at midnight."}
              </p>
            </div>

            {/* Fingerprint decoration */}
            <div className="absolute bottom-24 left-8 opacity-10">
              <svg width="60" height="60" viewBox="0 0 100 100" fill="none">
                <path
                  d="M50,2 C74,2 94,22 94,46 C94,60 86,72 74,80 M50,2 C26,2 6,22 6,46 C6,60 14,72 26,80 M74,80 C66,86 58,90 50,90 C42,90 34,86 26,80 M50,10 C70,10 86,26 86,46 C86,58 80,68 70,74 M50,10 C30,10 14,26 14,46 C14,58 20,68 30,74 M70,74 C64,78 58,82 50,82 C42,82 36,78 30,74 M50,18 C66,18 78,30 78,46 C78,54 74,62 68,68 M50,18 C34,18 22,30 22,46 C22,54 26,62 32,68 M68,68 C62,72 56,74 50,74 C44,74 38,72 32,68 M50,26 C60,26 68,36 68,46 C68,52 66,56 62,60 M50,26 C40,26 32,36 32,46 C32,52 34,56 38,60 M62,60 C58,64 54,66 50,66 C46,66 42,64 38,60 M50,34 C56,34 60,40 60,46 C60,50 58,52 54,54 M50,34 C44,34 40,40 40,46 C40,50 42,52 46,54 M54,54 C52,56 50,58 50,58 C50,58 48,56 46,54 M50,42 C52,42 54,44 54,46 C54,48 52,50 50,50 C48,50 46,48 46,46 C46,44 48,42 50,42 Z"
                  stroke="black"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex justify-center p-2">
          <Button
            asChild
            className="w-full rounded-none bg-gray-700 hover:bg-gray-600 flex items-center justify-center gap-2 text-white"
            onClick={() => {
              // Reset body overflow before navigation
              document.body.style.overflow = "auto"
            }}
          >
            <Link href={makerProfileUrl}>
              <User className="w-4 h-4" />
              View Profile
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
