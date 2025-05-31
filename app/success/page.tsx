"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { CheckCircle, ArrowLeft, Users, Trophy, Zap, ExternalLink, Crown, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getMugshots } from "@/lib/mugshot-service-client"
import type { Mugshot } from "@/lib/types"

export default function SuccessPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [name, setName] = useState<string>("")
  const [recentArrests, setRecentArrests] = useState<Mugshot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userMugshot, setUserMugshot] = useState<Mugshot | null>(null)

  // Retrieve the uploaded image URL from localStorage
  useEffect(() => {
    const storedImageUrl = localStorage.getItem("lastUploadedImageUrl")
    const storedName = localStorage.getItem("lastUploadedName")

    if (storedImageUrl) {
      setImageUrl(storedImageUrl)
      localStorage.removeItem("lastUploadedImageUrl")
    }

    if (storedName) {
      setName(storedName)
      localStorage.removeItem("lastUploadedName")
    }

    // Load recent arrests
    loadRecentArrests()
  }, [])

  const loadRecentArrests = async () => {
    try {
      const mugshots = await getMugshots()
      // Get the 8 most recent arrests
      const recent = mugshots
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 8)

      setRecentArrests(recent)

      // Try to find the user's mugshot (most recent one with matching name)
      if (name) {
        // First try exact match
        let userMug = recent.find((m) => m.name.toLowerCase().trim() === name.toLowerCase().trim())

        // If not found, try partial match
        if (!userMug) {
          userMug = recent.find(
            (m) =>
              m.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(m.name.toLowerCase()),
          )
        }

        // If still not found, get the most recent one (likely theirs)
        if (!userMug && recent.length > 0) {
          userMug = recent[0]
        }

        setUserMugshot(userMug || null)
      }
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }

  const getBadgeInfo = (badgeType: string) => {
    switch (badgeType) {
      case "community_pick":
        return {
          icon: <Star className="h-4 w-4" fill="currentColor" />,
          text: "COMMUNITY PICK",
          color: "text-blue-400",
        }
      case "startup_saviour":
        return {
          icon: <Crown className="h-4 w-4" fill="currentColor" />,
          text: "STARTUP SAVIOUR",
          color: "text-purple-400",
        }
      default:
        return { icon: <Zap className="h-4 w-4" />, text: "WANTED", color: "text-red-400" }
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="pt-6 px-6 flex items-center">
        <Link href="/" className="text-white mr-4 hover:text-red-400 transition-colors">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-2xl font-bold">ARREST CONFIRMED</h1>
      </header>

      {/* Yellow Caution Stripe */}
      <div className="h-6 w-full bg-yellow-400 mt-4 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg, #000 0, #000 10px, #f6e05e 10px, #f6e05e 20px)",
            backgroundSize: "28px 28px",
          }}
        ></div>
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        {/* Success Animation */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <CheckCircle className="h-20 w-20 text-green-500 animate-bounce" />
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
              GUILTY!
            </div>
          </div>
        </div>

        {/* Main Success Message */}
        <div className="text-center mb-8">
          <h2 className="sm:text-3xl text-2xl font-bold mb-4">
            🚨 ARREST SUCCESSFUL! 🚨
          </h2>
          <p className="text-xl mb-2 text-gray-300">
            <span className="text-red-400 font-bold">You're Now Officially On The Wall!</span>
          </p>
          <p className="text-gray-400">
            You're now part of the elite FoundersWall - loud, proud, and building in public.
          </p>
        </div>

        {/* Mugshot Display */}
        <div className="mb-8 max-w-sm mx-auto">
          <div className="bg-gray-900 p-6 rounded-lg border-2 border-red-500 relative overflow-hidden">
            {/* Police tape effect */}
            <div className="absolute top-0 left-0 right-0 bg-yellow-400 text-black text-center py-1 text-xs font-bold transform -rotate-1">
              ⚠️ EVIDENCE - DO NOT TAMPER ⚠️
            </div>

            <div className="relative w-full h-64 mx-auto mb-4 mt-6">
              {imageUrl ? (
                <Image
                  src={imageUrl || "/placeholder.svg"}
                  alt="Your processed mugshot"
                  fill
                  className="object-contain rounded border-2 border-gray-600"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800 rounded border-2 border-gray-600">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-2"></div>
                    <p className="text-gray-500 text-sm">Processing your mugshot...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Case Number */}
            <div className="text-center text-xs font-mono text-gray-400 mb-4">
              CASE #: {userMugshot?.id?.substring(0, 8).toUpperCase() || "PROCESSING"}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8 max-w-md mx-auto">
          <div className="bg-gray-900 border border-red-500 rounded-lg p-4 text-center">
            <Users className="h-6 w-6 text-red-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{recentArrests.length}</div>
            <div className="text-xs text-gray-400">Total Arrests</div>
          </div>
          <div className="bg-gray-900 border border-yellow-500 rounded-lg p-4 text-center">
            <Trophy className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">#{recentArrests.length}</div>
            <div className="text-xs text-gray-400">Your Position</div>
          </div>
          <div className="bg-gray-900 border border-green-500 rounded-lg p-4 text-center">
            <Zap className="h-6 w-6 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">ACTIVE</div>
            <div className="text-xs text-gray-400">Status</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col max-w-sm mx-auto gap-4 mb-8">
          <Button asChild className="bg-red-500 hover:bg-red-600 py-6 text-xl relative overflow-hidden group">
            <Link href="/">
              <span className="relative z-10">🏛️ View The Wall</span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </Link>
          </Button>

          {userMugshot && (
            <Button asChild variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
              <Link href={`/maker/${userMugshot.name.toLowerCase().replace(/\s+/g, "-")}`}>
                <ExternalLink className="mr-2 h-4 w-4" />
                View Your Profile
              </Link>
            </Button>
          )}
        </div>

        {/* Recent Arrests Feed */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gray-800 border-2 border-red-500 px-6 py-3 rounded-lg">
              <h3 className="text-red-400 text-xl font-bold text-center flex items-center">🚨 RECENT ARRESTS 🚨</h3>
              <p className="text-gray-400 text-sm text-center mt-1">Just arrested for building in public</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto pb-4">
              <div className="flex space-x-4 min-w-max px-4">
                {recentArrests.map((arrest, index) => {
                  const badgeInfo = getBadgeInfo(arrest.badgeType || "wanted")
                  const isNewArrest = index < 3 // Mark first 3 as "new"

                  return (
                    <Link
                      key={arrest.id}
                      href={`/maker/${arrest.name.toLowerCase().replace(/\s+/g, "-")}`}
                      className="flex-shrink-0 group cursor-pointer"
                    >
                      <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 w-32 hover:border-red-500 transition-all duration-300 relative overflow-hidden">
                        {/* New arrest badge */}
                        {isNewArrest && (
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                            NEW
                          </div>
                        )}

                        {/* Featured badge */}
                        {arrest.featured && (
                          <div className="absolute -top-1 -left-1 z-10">
                            <Crown className="h-5 w-5 text-yellow-500" fill="currentColor" />
                          </div>
                        )}

                        <div className="relative w-20 h-20 mx-auto mb-2 rounded border border-gray-600 overflow-hidden">
                          <Image
                            src={arrest.imageUrl || "/placeholder.svg"}
                            alt={arrest.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>

                        <div className="text-center">
                          <div className="text-white text-xs font-bold truncate mb-1">{arrest.name}</div>
                          <div className="text-gray-400 text-xs truncate mb-2">{arrest.crime}</div>
                          <div className={`flex items-center justify-center text-xs ${badgeInfo.color}`}>
                            {badgeInfo.icon}
                            <span className="ml-1 truncate">{badgeInfo.text}</span>
                          </div>
                        </div>

                        {/* Hover effect */}
                        <div className="absolute inset-0 bg-red-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
