"use client"

import type React from "react"

import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { X, ZoomIn, ZoomOut, RefreshCw, Maximize, Minimize, Star, Crown, Quote } from "lucide-react"
import { getMugshots } from "@/lib/mugshot-service-client"
import CriminalModal from "@/components/criminal-modal"
import type { Mugshot } from "@/lib/types"
import { PublicHeader } from "@/components/public-header"
import PublicFooter from "@/components/public-footer"
import LoadingMugshotWall from "@/components/loading-mugshot-wall"
import { getRandomRotation, getPinPosition } from "@/utils/crimeBoardEffects"

// Motivational quotes for indie makers
const motivationalQuotes = [
  "Ship early, ship often. Perfection is the enemy of progress.",
  "Build in public. Learn in public. Fail in public. Succeed in public.",
  "The best time to launch was yesterday. The second best time is today.",
  "Your first version should embarrass you, or you waited too long to ship.",
  "Focus on solving real problems for real people.",
  "Consistency beats intensity. Show up every day.",
  "Don't wait for permission. Just start building.",
  "Revenue is the ultimate validation.",
  "Build something people want, not something you think they need.",
  "The best marketing is a great product.",
  "Iterate based on feedback, not assumptions.",
  "Small bets, quick wins, compound over time.",
  "Your unfair advantage is being you. Lean into it.",
  "Solve your own problems first. You'll be more passionate about it.",
  "Done is better than perfect.",
]

// Add these helper functions after the motivationalQuotes array and before the Home component:

// Points calculation based on product count
const calculatePoints = (productCount: number): number => {
  if (productCount === 1) return 10
  if (productCount === 2) return 25
  if (productCount === 3) return 45
  if (productCount === 4) return 70
  if (productCount >= 5) return 100 + (productCount - 5) * 20 // 100+ for 5+, +20 for each additional
  return 0
}

// Convert points to star display
const getStarDisplay = (points: number) => {
  const fullStars = Math.min(Math.floor(points / 20), 5) // Max 5 stars
  const hasHalfStar = points % 20 >= 10
  const remainingPoints = points % 20

  return {
    fullStars,
    hasHalfStar,
    displayPoints: points,
  }
}

// Get winning titles based on position and product count
const getWinningTitle = (position: number, productCount: number): string => {
  if (position === 0) {
    // First place
    if (productCount >= 5) return "🚀 SERIAL LAUNCHER"
    if (productCount >= 4) return "⚡ PRODUCT MACHINE"
    if (productCount >= 3) return "🔥 LAUNCH LEGEND"
    if (productCount >= 2) return "💎 BUILD MASTER"
    return "👑 TOP BUILDER"
  } else if (position === 1) {
    // Second place
    if (productCount >= 4) return "🌟 LAUNCH EXPERT"
    if (productCount >= 3) return "⭐ SHIP CHAMPION"
    if (productCount >= 2) return "🎯 BUILD HERO"
    return "🥈 ELITE MAKER"
  } else {
    // Third place
    if (productCount >= 3) return "🔧 CRAFT MASTER"
    if (productCount >= 2) return "🛠️ BUILD WIZARD"
    return "🥉 RISING STAR"
  }
}

// Render star component
const StarRating = ({ points }: { points: number }) => {
  const { fullStars, hasHalfStar } = getStarDisplay(points)

  return (
    <div className="flex items-center">
      {/* Render full stars */}
      {Array.from({ length: fullStars }).map((_, i) => (
        <span key={i} className="text-yellow-400 text-sm">
          ★
        </span>
      ))}
      {/* Render half star if needed */}
      {hasHalfStar && <span className="text-yellow-400 text-sm">☆</span>}
      {/* Fill remaining slots with empty stars up to 5 */}
      {Array.from({ length: Math.max(0, 5 - fullStars - (hasHalfStar ? 1 : 0)) }).map((_, i) => (
        <span key={`empty-${i}`} className="text-gray-600 text-sm">
          ☆
        </span>
      ))}
    </div>
  )
}

export default function HomeClient() {
  const [selectedCriminal, setSelectedCriminal] = useState<Mugshot | null>(null)
  const [mugshots, setMugshots] = useState<Mugshot[]>([])
  const [zoomLevel, setZoomLevel] = useState(1)
  const [hoveredCriminal, setHoveredCriminal] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [productCounts, setProductCounts] = useState<Record<string, number>>({})
  const [currentQuote, setCurrentQuote] = useState<string>(motivationalQuotes[0])

  // New state for panning
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [startPanPosition, setStartPanPosition] = useState({ x: 0, y: 0 })

  // For torn paper effect
  const [topTornEdge, setTopTornEdge] = useState("")
  const [bottomTornEdge, setBottomTornEdge] = useState("")

  const boardRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const dragOccurredRef = useRef(false) // Added for robust drag detection

  // Separate featured and regular mugshots
  const featuredMugshots = useMemo(() => mugshots.filter((mugshot) => mugshot.featured), [mugshots])

  // Sort mugshots for leaderboard based on actual products from database
  const leaderboardMugshots = useMemo(() => {
    // Create a copy of mugshots and add product counts
    const mugshotsWithProducts = mugshots.map((mugshot) => ({
      ...mugshot,
      productCount: productCounts[mugshot.id] || 0,
    }))

    // Filter out mugshots with 0 products and sort by product count (descending), take top 3
    return mugshotsWithProducts
      .filter((mugshot) => mugshot.productCount > 0) // Only show mugshots with products
      .sort((a, b) => b.productCount - a.productCount)
      .slice(0, 3)
  }, [mugshots, productCounts])



  // Generate torn paper effect
  useEffect(() => {
    const generateTornEdge = () => {
      const edges = []
      const segments = 30

      for (let i = 0; i < segments; i++) {
        const depth = Math.random() * 5 + 2
        edges.push(`${(i / segments) * 100}% ${depth}px`)
      }

      return edges.join(",")
    }

    setTopTornEdge(generateTornEdge())
    setBottomTornEdge(generateTornEdge())
  }, [])

  // Rotate quotes every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * motivationalQuotes.length)
      setCurrentQuote(motivationalQuotes[randomIndex])
    }, 8000)

    return () => clearInterval(interval)
  }, [])

  // Add coffee stains effect
  useEffect(() => {
    if (!boardRef.current || isLoading) return

    const addCoffeeStain = () => {
      const coffeeStain = document.createElement("div")
      coffeeStain.className = "absolute opacity-20 pointer-events-none z-5" // Lower z-index
      coffeeStain.style.left = `${Math.random() * 80 + 10}%`
      coffeeStain.style.top = `${Math.random() * 80 + 10}%`
      coffeeStain.style.transform = `rotate(${Math.random() * 360}deg)`

      // Create SVG for coffee stain instead of image
      const svgNS = "http://www.w3.org/2000/svg"
      const svg = document.createElementNS(svgNS, "svg")
      svg.setAttribute("width", "100")
      svg.setAttribute("height", "100")
      svg.setAttribute("viewBox", "0 0 100 100")

      const path = document.createElementNS(svgNS, "path")
      path.setAttribute("fill", "#8B4513")
      path.setAttribute("opacity", "0.3")

      svg.appendChild(path)
      coffeeStain.appendChild(svg)
      boardRef.current?.appendChild(coffeeStain)
    }

    // Add a few coffee stains
    for (let i = 0; i < 3; i++) {
      setTimeout(addCoffeeStain, i * 100)
    }

    // Cleanup function to remove stains when component unmounts
    return () => {
      const stains = boardRef.current?.querySelectorAll(".coffee-stain")
      stains?.forEach((stain) => stain.remove())
    }
  }, [isLoading])

  // Load mugshots, and product counts from database
  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const mugshotsData = await getMugshots()

      // Fetch products directly from API
      const productsResponse = await fetch("/api/products?limit=1000")
      const productsData = await productsResponse.json()

      setMugshots(mugshotsData)

      // Calculate product counts per founder (mugshot.id)
      const counts: Record<string, number> = {}

      if (Array.isArray(productsData)) {
        productsData.forEach((product) => {
          // product.founderId should be the mugshots.id
          if (product.founderId) {
            counts[product.founderId] = (counts[product.founderId] || 0) + 1
          }
        })
      }

      setProductCounts(counts)
    } catch (err) {
      setError("Failed to load data. Please try refreshing the page.")
      console.error("Error loading data:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Update the useEffect to use the memoized function
  useEffect(() => {
    loadData()
  }, [loadData])

  const openCriminalModal = (criminal: Mugshot) => {
    setSelectedCriminal(criminal)
    document.body.style.overflow = "hidden"
  }

  const closeCriminalModal = () => {
    setSelectedCriminal(null)
    document.body.style.overflow = "auto"
  }

  const handleCriminalClick = (criminal: Mugshot) => {
    if (isPanning) return // Keep this as a quick check
    if (dragOccurredRef.current) {
      // If a drag/pan just happened, don't treat as click
      dragOccurredRef.current = false // Reset for next interaction
      return
    }
    openCriminalModal(criminal)
  }

  // Get grid positions for the polaroids
  const getGridPosition = (index: number) => {
    // Check if we're on mobile
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768

    // For mobile: 4 items per row, smaller cards
    const itemsPerRow = isMobile ? 4 : 6

    // For spiral layout
    // Start from the center and spiral outward
    // This creates a rectangular spiral pattern

    // Define the center of the board - moved higher up
    const centerX = 50
    const centerY = 35 // Back to original position

    // Calculate the spiral position
    // We'll use a rectangular spiral algorithm
    let x = 0,
      y = 0
    let direction = 0 // 0: right, 1: down, 2: left, 3: up
    let steps = 1
    let stepCount = 0
    let turnCount = 0

    for (let i = 0; i < index; i++) {
      // Move in the current direction
      switch (direction) {
        case 0:
          x++
          break // Move right
        case 1:
          y++
          break // Move down
        case 2:
          x--
          break // Move left
        case 3:
          y--
          break // Move up
      }

      // Count steps taken in this direction
      stepCount++

      // If we've taken enough steps, change direction
      if (stepCount === steps) {
        direction = (direction + 1) % 4
        stepCount = 0
        turnCount++

        // After completing two turns (one horizontal, one vertical),
        // increase the number of steps for the next two turns
        if (turnCount === 2) {
          steps++
          turnCount = 0
        }
      }
    }

    // Scale the spiral to fit the board
    // Adjust these values to control the spacing between cards
    // Increased horizontal spacing for desktop to 15 (was 12)
    // Increased vertical spacing for desktop by applying a multiplier
    const horizontalScale = isMobile ? 18 : 15
    const verticalScale = isMobile ? 18 : 22 // Increased vertical spacing on desktop

    // Calculate final position
    // Apply different scaling for x and y to create more vertical space between cards on desktop
    const left = centerX + x * horizontalScale
    const top = centerY + y * verticalScale

    return {
      top: `${top}%`,
      left: `${left}%`,
    }
  }

  // Calculate board height based on number of mugshots
  const calculateBoardHeight = () => {
    const itemsPerRow = 6 // Updated to 6 items per row
    const rows = Math.ceil(mugshots.length / itemsPerRow)
    // Each row is approximately 22% of height, plus some padding
    return Math.max(100, rows * 22 + 20) // Minimum 100% height
  }

  // Handle zoom controls
  const handleZoom = (direction: "in" | "out") => {
    if (direction === "in") {
      setZoomLevel(Math.min(2, zoomLevel + 0.1)) // Smaller increments for smoother zoom
    } else {
      setZoomLevel(Math.max(0.5, zoomLevel - 0.1)) // Smaller increments for smoother zoom
    }
  }

  // Reset pan and zoom to default
  const resetView = () => {
    setPanPosition({ x: 0, y: 0 })
    setZoomLevel(1)
  }

  // Pan/slide handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start panning with left mouse button
    if (e.button !== 0) return
    dragOccurredRef.current = false // Reset for mouse too

    // Set panning flag
    setIsPanning(true)

    // Store the starting position
    setStartPanPosition({
      x: e.clientX - panPosition.x,
      y: e.clientY - panPosition.y,
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return

    dragOccurredRef.current = true // If mouse moves while button is down, it's a drag

    // Calculate new pan position
    const newPanX = e.clientX - startPanPosition.x
    const newPanY = e.clientY - startPanPosition.y

    // Update pan position
    setPanPosition({ x: newPanX, y: newPanY })

    // Prevent default to avoid text selection during panning
    e.preventDefault()
  }

  const handleMouseUp = () => {
    // End panning
    setIsPanning(false)
  }

  // Touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return
    dragOccurredRef.current = false // Reset on new touch start

    // Set panning flag
    setIsPanning(true)

    // Store the starting position
    setStartPanPosition({
      x: e.touches[0].clientX - panPosition.x,
      y: e.touches[0].clientY - panPosition.y,
    })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPanning || e.touches.length !== 1) return

    dragOccurredRef.current = true // If move occurs, it's a drag

    // Calculate new pan position
    const newPanX = e.touches[0].clientX - startPanPosition.x
    const newPanY = e.touches[0].clientY - startPanPosition.y

    // Update pan position
    setPanPosition({ x: newPanX, y: newPanY })

    // Prevent default to avoid page scrolling during panning
    e.preventDefault()
  }

  const handleTouchEnd = () => {
    // End panning
    setIsPanning(false)
  }

  // Set cursor style based on panning state
  const getCursorStyle = () => {
    return isPanning ? "grabbing" : "grab"
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      // Enter fullscreen
      const corkboardSection = document.getElementById("corkboard-section")
      if (corkboardSection?.requestFullscreen) {
        corkboardSection
          .requestFullscreen()
          .then(() => {
            setIsFullscreen(true)
            // Reset view when entering fullscreen
            resetView()
          })
          .catch((err) => {})
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document
          .exitFullscreen()
          .then(() => {
            setIsFullscreen(false)
          })
          .catch((err) => {
            console.error(`Error attempting to exit fullscreen: ${err.message}`)
          })
      }
    }
  }

  // Add a useEffect to handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  // Get badge info for polaroid display
  const getBadgeInfo = (badgeType: string) => {
    switch (badgeType) {
      case "community_pick":
        return {
          text: "★",
          color: "text-blue-600",
          bgColor: "bg-blue-100",
          borderColor: "border-blue-500",
        }
      case "startup_saviour":
        return {
          text: "♛",
          color: "text-purple-600",
          bgColor: "bg-purple-100",
          borderColor: "border-purple-500",
        }
      default:
        return null // No badge for regular "wanted" users
    }
  }

  // Get badge info for featured display
  const getFeaturedBadgeInfo = (badgeType: string) => {
    switch (badgeType) {
      case "community_pick":
        return {
          text: "COMMUNITY PICK",
          color: "text-blue-100",
          bgColor: "bg-blue-600",
        }
      case "startup_saviour":
        return {
          text: "STARTUP SAVIOUR",
          color: "text-purple-100",
          bgColor: "bg-purple-600",
        }
      default:
        return {
          text: "ELITE FOUNDER",
          color: "text-yellow-100",
          bgColor: "bg-yellow-600",
        }
    }
  }

  // Get medal for leaderboard position
  const getLeaderboardMedal = (position: number) => {
    switch (position) {
      case 0:
        return {
          icon: "🥇",
          color: "bg-yellow-500",
          shadow: "shadow-yellow-500/50",
        }
      case 1:
        return {
          icon: "🥈",
          color: "bg-gray-400",
          shadow: "shadow-gray-400/50",
        }
      case 2:
        return {
          icon: "🥉",
          color: "bg-amber-700",
          shadow: "shadow-amber-700/50",
        }
      default:
        return {
          icon: "",
          color: "bg-gray-700",
          shadow: "shadow-gray-700/50",
        }
    }
  }

  const [isAddLogModalOpen, setIsAddLogModalOpen] = useState(false)

  // Show loading state
  if (isLoading) {
    return <LoadingMugshotWall />
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <div className="bg-red-900/50 p-6 rounded-lg max-w-md text-center">
          <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading Data</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Update the LeaderboardComponent to use the new points system:
  // Replace the existing LeaderboardComponent with this updated version:
  const LeaderboardComponent = ({ className = "" }: { className?: string }) => (
    <div className={`bg-black/70 backdrop-blur-md rounded-lg border border-yellow-500 p-3 shadow-xl ${className}`}>
      <div className="flex items-center justify-center text-yellow-400 text-sm font-bold mb-4">
        <Crown className="h-4 w-4 mr-2" fill="currentColor" />
        TOP FOUNDERS
      </div>

      {leaderboardMugshots.map((mugshot, index) => {
        const points = calculatePoints(mugshot.productCount)
        const title = getWinningTitle(index, mugshot.productCount)

        return (
          <div key={mugshot.id} className="flex items-center justify-between text-white text-sm mb-3">
            <div className="flex items-center flex-1 min-w-0">
              {/* Profile photo with medal overlay */}
              <div className="relative mr-3 flex-shrink-0">
                <div
                  className={`w-8 h-8 rounded-full overflow-hidden border-2 ${
                    index === 0
                      ? "border-yellow-500 shadow-yellow-500/50"
                      : index === 1
                        ? "border-gray-400 shadow-gray-400/50"
                        : "border-amber-700 shadow-amber-700/50"
                  }`}
                >
                  <Image
                    src={mugshot.imageUrl || "/placeholder.svg?height=32&width=32&query=person"}
                    alt={mugshot.name}
                    width={32}
                    height={32}
                    className="object-cover w-full h-full"
                  />
                </div>
                {/* Medal badge for top 3 */}
                <div className="absolute -bottom-1 -right-1 text-xs">
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                </div>
              </div>

              <div className="flex flex-col min-w-0 flex-1">
                {/* Name - ensure it doesn't wrap */}
                <span className="text-white font-medium text-xs whitespace-nowrap overflow-hidden text-ellipsis">
                  {mugshot.name}
                </span>
                {/* Title */}
                <span className="text-yellow-400 text-[10px] font-bold whitespace-nowrap overflow-hidden text-ellipsis">
                  {title}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end flex-shrink-0 ml-2">
              {/* Stars */}
              <StarRating points={points} />
              {/* Points */}
              <span className="text-xs text-gray-400 mt-1">{points} pts</span>
            </div>
          </div>
        )
      })}
    </div>
  )

  // Add this above the return statement in your Home component:
  const wallCards = [
    {
      title: "🔧 Build Logs",
      color: "text-red-600",
      desc: "Raw updates. No filters. Like digital graffiti. Just ship and log it.",
      stamp: "EVIDENCE",
      stain: true,
    },
    {
      title: "📢 Uplifts",
      color: "text-yellow-600",
      desc: "Boost the builders who show up. No likes. Just recognition from the real ones.",
      stamp: "",
      stain: false,
    },
    {
      title: "🧠 Mental Logs",
      color: "text-blue-600",
      desc: "Rants, wins, burnout. Track the chaos behind the code.",
      stamp: "CONFIDENTIAL",
      stain: true,
    },
    {
      title: "📸 Product Drops",
      color: "text-pink-600",
      desc: "What you've launched. No leaderboard. Just receipts.",
      stamp: "",
      stain: false,
    },
    {
      title: "🧷 Pins & Threads",
      color: "text-green-600",
      desc: "Connect your chaos. Thread your logs into a timeline.",
      stamp: "",
      stain: true,
    },
  ]

  return (
    <main className="min-h-screen flex flex-col bg-black overflow-x-hidden">
     

      <PublicHeader />

      {/* New Hero Section */}
      <section className="relative top-16-custom overflow-hidden min-h-screen lg:min-h-screen">
        {/* Playful Background Doodles and Text */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Background Pattern */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `
          radial-gradient(circle at 25% 25%,rgb(219, 191, 122) 2px, transparent 2px),
          radial-gradient(circle at 75% 75%, #fbbf24 1px, transparent 1px)
        `,
              backgroundSize: "50px 50px",
            }}
          />

          {/* Playful Doodles and Text Overlays */}
          <div className="absolute top-10 left-10 text-yellow-300 opacity-20 transform -rotate-12">
            <div className="text-6xl">💻</div>
          </div>
          <div className="absolute top-20 right-20 text-white opacity-15 transform rotate-12 font-mono text-sm">
            SHIP IT!
          </div>
          <div className="absolute top-32 left-1/4 text-yellow-400 opacity-25 transform rotate-6">
            <div className="text-4xl">🚀</div>
          </div>
          <div className="absolute top-40 right-1/3 text-white opacity-10 transform -rotate-6 font-mono text-xs">
            ZERO FUNDING
          </div>
          <div className="absolute bottom-32 left-16 text-yellow-300 opacity-20 transform rotate-45">
            <div className="text-5xl">⚡</div>
          </div>
          <div className="absolute bottom-20 right-16 text-white opacity-50 transform -rotate-12 font-mono text-sm">
            BUILT IN PUBLIC
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-4 items-center w-full">
            {/* Left Side - Typography */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <div className="mb-6 lg:mb-8 relative">
                <div className="absolute -bottom-4 left-0 lg:relative lg:bottom-auto lg:left-auto lg:inline-block lg:ml-4 lg:mt-2">
                  <div className="bg-yellow-400 text-black px-3 py-1 text-xs lg:text-sm font-bold transform rotate-[-12deg] shadow-lg border-2 border-black">
                    WANTED
                  </div>
                </div>
                <h1
                  className="text-6xl sm:text-6xl md:text-6xl lg:text-7xl xl:text-[7rem] font-black text-yellow-400 leading-none"
                  style={{
                    textShadow: "3px 3px 0px #bb1919, -2px -2px 0px #bb1919, 2px -2px 0px #bb1919, -2px 2px 0px #000",
                    fontFamily: "'Arial Black', sans-serif",
                  }}
                >
                  <span className="block">FOUNDERS</span>
                  <span className="block -mt-2 lg:-mt-4">WALL</span>
                </h1>
              </div>

              <div className="mb-6 lg:mb-8">
                <h2 className="text-white text-xl sm:text-2xl lg:text-3xl font-bold mb-2 lg:mb-3">
                  Where the shipping never stops, and the dopamine never hits.
                </h2>
                <p className="text-yellow-200 text-base font-handwriting sm:text-lg lg:text-xl">
                  Built for the ones who ship quietly, fail publicly, and don't stop.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6">
                <Link
                  href="/station"
                  className="group bg-yellow-400 hover:bg-yellow-500 text-black px-6 lg:px-8 py-3 lg:py-4 rounded-lg font-bold text-base lg:text-lg transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center justify-center"
                >
                  <span className="mr-2">👮‍♂️</span>
                  Get on the Board
                  <div className="ml-2 group-hover:translate-x-1 transition-transform">→</div>
                </Link>
                <button
                  onClick={() => {
                    const corkboardSection = document.getElementById("corkboard-section")
                    corkboardSection?.scrollIntoView({ behavior: "smooth" })
                  }}
                  className="group bg-transparent border-2 border-white hover:bg-white hover:text-red-600 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-lg font-bold text-base lg:text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                >
                  <span className="mr-2">🔍</span>
                  Meet Suspects
                  <div className="ml-2 group-hover:translate-x-1 transition-transform">→</div>
                </button>
              </div>

              {/* Graffiti/Sticker Context Block */}
              <div className="flex items-center mb-8 w-full min-h-[140px]">
                <div
                  className="relative bg-yellow-200 border-2 border-black rounded-lg shadow-2xl px-6 py-5 max-w-md w-full text-center"
                  style={{
                    fontFamily: "'Permanent Marker', Marker Felt, Arial, sans-serif",
                    transform: "rotate(-4deg)",
                    transformOrigin: "50% 0%",
                    boxShadow: "8px 8px 0px #222, 0 2px 16px rgba(0,0,0,0.18)",
                    position: "relative",
                    zIndex: 10,
                    animation: "popIn 0.7s cubic-bezier(.68,-0.55,.27,1.55)",
                  }}
                >
                  {/* Hanging Pin */}
                  <div
                    className="absolute left-1/2 -top-4 z-30"
                    style={{
                      transform: "translateX(-50%)",
                    }}
                  >
                    <div className="w-5 h-5 bg-red-500 rounded-full shadow-lg border-2 border-red-700" />
                    {/* Pin shadow for realism */}
                    <div className="w-2 h-2 bg-black opacity-30 rounded-full absolute left-1/2 top-5 -translate-x-1/2 blur-sm" />
                  </div>
                  {/* Dirty paper texture overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none rounded-lg"
                    style={{
                      backgroundImage:
                        "url('https://w7.pngwing.com/pngs/930/611/png-transparent-retro-wall-texture-retro-texture-crack-thumbnail.png')",
                      backgroundSize: "cover",
                      opacity: 0.18,
                      mixBlendMode: "luminosity",
                      zIndex: 20,
                    }}
                  />
                  {/* Hand-drawn border (SVG) */}
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none z-30"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    <rect
                      x="2"
                      y="2"
                      width="96"
                      height="96"
                      fill="none"
                      stroke="black"
                      strokeDasharray="6,4"
                      strokeWidth="2"
                    />
                  </svg>
                  {/* Body */}
                  <div className="relative z-40 text-black font-handwriting font-medium  whitespace-pre-line leading-snug">
                    FoundersWall is where indie hackers log their <span className="text-red-600 font-bold">chaos</span>.
                    <br />
                    Not polished posts. Not follower farming.
                    <br />
                    Just proof that you're <span className="text-green-700 font-bold">alive</span> and building.
                    <br />
                    <br />
                    <span className="text-yellow-700 font-bold">It's gritty. It's public. It's real.</span>
                  </div>
                </div>
              </div>

              {/* THIS WEEK'S LEADERBOARD - Show on mobile with proper spacing */}
              <div className="lg:hidden mb-8">
                <LeaderboardComponent />
              </div>
            </div>

            {/* Right Side - Hero Visual */}
            <div className="flex flex-col justify-center order-1 lg:order-2">
              <div className="relative flex flex-col justify-center items-center">
                <div className="absolute inset-0 bg-yellow-400 rounded-full blur-3xl opacity-20 scale-110"></div>
                <div className="absolute inset-0 bg-red-400 rounded-full blur-2xl opacity-10 scale-125"></div>
                <div className="relative flex justify-center items-center">
                  <Image
                    src="/wallimg.png"
                    alt="Founders shipping like hell"
                    width={350}
                    height={350}
                    className="w-48 h-48 sm:w-60 sm:h-60 lg:w-[300px] lg:h-[300px] xl:w-[350px] xl:h-[350px] object-contain drop-shadow-2xl max-w-xs sm:max-w-sm lg:max-w-md"
                    priority
                  />
                  {/* Floating Achievement Badges */}
                  <div className="absolute -top-4 -left-4 bg-green-500 text-white px-2 py-1 text-xs font-bold transform -rotate-12 shadow-lg">
                    $10K MRR
                  </div>
                  <div className="absolute top-8 -right-8 bg-blue-500 text-white px-2 py-1 text-xs font-bold transform rotate-12 shadow-lg">
                    SHIPPED
                  </div>
                  <div className="absolute -bottom-4 -right-4 bg-purple-500 text-white px-2 py-1 text-xs font-bold transform rotate-6 shadow-lg">
                    INDIE
                  </div>
                  <div className="absolute bottom-8 -left-8 bg-orange-500 text-white px-2 py-1 text-xs font-bold transform -rotate-6 shadow-lg">
                    LEGEND
                  </div>
                </div>
                {/* THIS WEEK'S LEADERBOARD - Show below the image on desktop */}
                <div className="hidden lg:block w-full max-w-md mt-6">
                  <LeaderboardComponent />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section - Always visible above the caution strip */}
      <div className="bg-black/80 text-white backdrop-blur-sm py-3 overflow-hidden z-20 relative border-t border-gray-800">
        <div className="flex items-center justify-center text-center px-4">
          <Quote className="h-5 w-5 text-yellow-400 mr-3 flex-shrink-0" />
          <p className="text-white text-sm md:text-base font-medium transition-opacity duration-500">{currentQuote}</p>
          <Quote className="h-5 w-5 text-yellow-400 ml-3 flex-shrink-0 transform rotate-180" />
        </div>
      </div>

      {/* Caution Stripe Separator - Clear separation between sections */}
      <div className="h-8 w-full bg-yellow-400 relative overflow-hidden z-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg, #000 0, #000 10px, #f6e05e 10px, #f6e05e 20px)",
            backgroundSize: "28px 28px",
          }}
        ></div>
      </div>

      <section
        id="corkboard-section"
        className={`flex-1 overflow-x-hidden ${isFullscreen ? "fixed inset-0 z-50 bg-black" : ""}`}
      >
        {/* Board - Now with cork board background and torn paper effect */}
        <div
          ref={boardRef}
          className={`relative w-full mb-8 overflow-hidden cork-board ${isFullscreen ? "rounded-none" : ""}`}
          style={{
            height: "80vh",
            minHeight: "700px",
            cursor: getCursorStyle(),
            backgroundColor: "#1f2937",
            backgroundImage: `
              linear-gradient(to right, #374151 1px, transparent 1px),
              linear-gradient(to bottom, #374151 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
            border: "2px solid #374151",
            touchAction: "none", // Prevent default browser touch actions
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Paper overlay with slight texture for torn effect */}
          <div className="absolute inset-0 bg-[#ddd] z-0 opacity-5 pointer-events-none"></div>

          {/* Zoom Controls - Top Left */}
          <div className="absolute top-4 left-4 z-40 flex flex-col space-y-2">
            <button
              onClick={() => handleZoom("in")}
              className="w-10 h-10 bg-gray-800/90 hover:bg-gray-700 text-white rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm"
              title="Zoom In"
            >
              <ZoomIn size={20} />
            </button>
            <button
              onClick={() => handleZoom("out")}
              className="w-10 h-10 bg-gray-800/90 hover:bg-gray-700 text-white rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm"
              title="Zoom Out"
            >
              <ZoomOut size={20} />
            </button>
          </div>

          {/* Reset and Fullscreen Controls - Top Right */}
          <div className="absolute top-4 right-4 z-40 flex flex-col space-y-2">
            <button
              onClick={resetView}
              className="w-10 h-10 bg-gray-800/90 hover:bg-gray-700 text-white rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm"
              title="Reset View"
            >
              <RefreshCw size={20} />
            </button>
            <button
              onClick={toggleFullscreen}
              className="w-10 h-10 bg-gray-800/90 hover:bg-gray-700 text-white rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          </div>

          {/* Content container with panning and zooming */}
          <div
            ref={contentRef}
            className="absolute inset-0 transition-transform"
            style={{
              transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
              transformOrigin: "center",
              height: `${calculateBoardHeight()}%`,
              width: "100%",
            }}
          >
            {/* All Mugshots - Using spiral layout (including featured ones) */}
            {mugshots.map((mugshot, index) => {
              const position = getGridPosition(index)
              const rotation = getRandomRotation() // Random rotation between -7 and 7 degrees
              const isHovered = hoveredCriminal === mugshot.id

              // Get random pin position
              const pinPosition = getPinPosition("top-left")

              // Get badge info for special users
              const badgeInfo = getBadgeInfo(mugshot.badgeType || "wanted")

              return (
                <div
                  key={mugshot.id}
                  className={`absolute cursor-pointer transition-all duration-300`}
                  style={{
                    top: position.top,
                    left: position.left,
                    transform: `rotate(${rotation}deg)`,
                    zIndex: 10,
                    width: typeof window !== "undefined" && window.innerWidth < 768 ? "70px" : "90px", // Smaller on mobile
                    // Add margin to create more space between cards
                    margin: "10px",
                  }}
                  onClick={() => handleCriminalClick(mugshot)}
                  onMouseEnter={() => setHoveredCriminal(mugshot.id)}
                  onMouseLeave={() => setHoveredCriminal(null)}
                  data-mugshot-id={mugshot.id}
                >
                  {/* Featured Crown Icon - only show if featured */}
                  {mugshot.featured && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-50">
                      <Crown className="h-6 w-6 text-yellow-500 drop-shadow-lg" fill="currentColor" />
                    </div>
                  )}

                  {/* Red Pin - positioned absolutely */}
                  <div
                    className="absolute w-4 h-4 rounded-full bg-red-500 shadow-md z-20"
                    style={{
                      top: pinPosition.top,
                      left: pinPosition.left,
                    }}
                  ></div>

                  {/* Special Badge for Community Picks and Startup Saviours */}
                  {badgeInfo && (
                    <div
                      className={`absolute -top-1 -right-1 w-6 h-6 rounded-full ${badgeInfo.bgColor} ${badgeInfo.borderColor} border-2 flex items-center justify-center z-30 shadow-md`}
                    >
                      <span className={`text-sm font-bold ${badgeInfo.color}`}>{badgeInfo.text}</span>
                    </div>
                  )}

                  {/* Tape strips - for visual effect */}
                  <div className="absolute -top-2 -left-2 w-10 h-3 bg-gray-200/70 rotate-45 z-10"></div>
                  <div className="absolute -top-2 -right-2 w-10 h-3 bg-gray-200/70 -rotate-45 z-10"></div>

                  {/* Polaroid */}
                  <div className="bg-white p-2 shadow-lg relative">
                    {/* Polaroid effect with shadow */}
                    <div
                      className="absolute inset-0 bg-black/10 z-0"
                      style={{
                        filter: "blur(8px)",
                        transform: "translateY(4px)",
                      }}
                    ></div>

                    <div className="relative z-10">
                      {/* Mugshot Image */}
                      <div className="relative mb-2 border-b-2 border-amber-200">
                        <Image
                          src={mugshot.imageUrl || "/placeholder.svg"}
                          alt={`Mugshot of ${mugshot.name}`}
                          width={150}
                          height={150}
                          className="w-full object-cover"
                          priority
                        />
                        {/* Crime text overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-80 py-0.5 px-1">
                          <p className="text-white text-[8px] font-mono text-center font-bold truncate">
                            {mugshot.crime}
                          </p>
                        </div>
                      </div>

                      {/* Name */}
                      <div className="text-center font-bold text-xs truncate text-black">
                        {mugshot.name}
                        {mugshot.featured && (
                          <Star className="inline h-3 w-3 ml-1 text-yellow-500" fill="currentColor" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Modals - Rendered inside the corkboard section for fullscreen compatibility */}
        {selectedCriminal && <CriminalModal criminal={selectedCriminal} onClose={closeCriminalModal} />}

        {/* Stats - Added mx-4 to maintain some spacing */}
        <div className="flex justify-center w-full text-lg mb-8 mx-4">
          <div className="flex items-center flex-wrap justify-center gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
              <span className="text-white">{mugshots.length} Founders</span>
            </div>

            {featuredMugshots.length > 0 && (
              <>
                <span className="text-gray-500">|</span>
                <div className="flex items-center">
                  <Crown className="h-4 w-4 text-yellow-500 mr-2" fill="currentColor" />
                  <span className="text-white">{featuredMugshots.length} Featured</span>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
      <section className="relative py-16 px-4 sm:px-8 lg:px-16 bg-[#18181b] text-white overflow-hidden">
        {/* Dirty texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage:
              "url('https://w7.pngwing.com/pngs/930/611/png-transparent-retro-wall-texture-retro-texture-crack-thumbnail.png')",
            backgroundSize: "cover",
            opacity: 0.18,
            mixBlendMode: "luminosity",
          }}
        />
        <div className="max-w-5xl mx-auto relative z-10">
          {/* Torn Sticky Note Heading */}
          <div className="flex items-center justify-center mb-12 relative">
            <div
              className="font-handwriting text-2xl sm:text-3xl font-bold uppercase"
              style={{ transform: "rotate(-3deg)", letterSpacing: "2px", textShadow: "1px 1px 0 #fff", border: "none" }}
            >
              ✦ WHAT HAPPENS ON THE WALL ✦
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {wallCards.map((card, i) => (
              <div
                key={card.title}
                className="relative bg-yellow-200 px-4 pt-4 pb-6 font-handwriting text-black"
                style={{
                  transform: `rotate(${(i % 2 === 0 ? -1 : 1) * (3 + Math.random() * 3)}deg) translateY(${Math.random() * 8 - 4}px)`,
                  minHeight: "90px",
                  boxShadow: "2px 2px 0 #000",
                  border: "none",
                  marginTop: i % 2 === 0 ? "0px" : "16px",
                  marginBottom: i % 2 === 1 ? "0px" : "8px",
                }}
              >
                {/* Pin */}
                <div className="absolute left-1/2 -top-4 z-20" style={{ transform: "translateX(-50%)" }}>
                  <div className="w-4 h-4 bg-red-500 rounded-full shadow border-2 border-red-700" />
                </div>
                {/* Dirty paper texture overlay */}
                <div
                  className="absolute inset-0 pointer-events-none rounded-lg"
                  style={{
                    backgroundImage:
                      "url('https://w7.pngwing.com/pngs/930/611/png-transparent-retro-wall-texture-retro-texture-crack-thumbnail.png')",
                    backgroundSize: "cover",
                    opacity: 0.18,
                    mixBlendMode: "luminosity",
                    zIndex: 10,
                  }}
                />
                {/* Stamp */}
                {card.stamp && (
                  <div
                    className="absolute top-3 right-3 bg-red-700 text-white text-xs font-bold px-2 py-1 rounded rotate-[-8deg] shadow z-30 tracking-widest opacity-80"
                    style={{ letterSpacing: "2px" }}
                  >
                    {card.stamp}
                  </div>
                )}
                {/* Coffee stain */}
                {card.stain && (
                  <svg className="absolute left-6 bottom-3 z-30 opacity-30" width="48" height="48" viewBox="0 0 48 48">
                    <ellipse
                      cx="24"
                      cy="24"
                      rx="20"
                      ry="8"
                      fill="none"
                      stroke="#222"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                  </svg>
                )}
                <h3
                  className={`${card.color} text-lg font-handwriting font-bold z-20 relative`}
                  style={{ letterSpacing: "1px", textShadow: "1px 1px 0 #fff", marginBottom: "0" }}
                >
                  {card.title}
                </h3>
                <p
                  className="text-black text-sm font-medium z-20 relative font-mono leading-snug"
                  style={{ marginTop: "0", marginBottom: "0" }}
                >
                  {card.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-yellow-300 mb-4 font-mono text-sm">
              Got a startup? A mess?
              <br />
              Cool. That's all you need to show up here.
            </p>
            <Link href="/login" passHref legacyBehavior>
              <a
                className="bg-red-700 hover:bg-red-800 text-yellow-100 py-3 px-8 rounded-full font-extrabold text-lg shadow-lg border-2 border-yellow-400 tracking-wider font-handwriting inline-block"
                style={{ letterSpacing: "2px", boxShadow: "4px 4px 0 #000", textShadow: "1px 1px 0 #000" }}
              >
                Get on the Wall
              </a>
            </Link>
          </div>
        </div>
      </section>
      <PublicFooter />

      {/* PinWall component, floating button, and AddLogModal have been moved to app/logs/page.tsx */}
    </main>
  )
}