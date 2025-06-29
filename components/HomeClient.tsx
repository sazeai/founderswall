"use client"

import type React from "react"
import RevampedHero from "@/components/revamped-hero"
import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import Image from "next/image"
import { X, ZoomIn, ZoomOut, RefreshCw, Maximize, Minimize, Star, Crown } from "lucide-react"
import { getMugshots } from "@/lib/mugshot-service-client"
import CriminalModal from "@/components/criminal-modal"
import type { Mugshot } from "@/lib/types"
import { PublicHeader } from "@/components/public-header"
import PublicFooter from "@/components/public-footer"
import LoadingMugshotWall from "@/components/loading-mugshot-wall"
import { getRandomRotation, getPinPosition } from "@/utils/crimeBoardEffects"

export default function HomeClient() {
  const [selectedCriminal, setSelectedCriminal] = useState<Mugshot | null>(null)
  const [mugshots, setMugshots] = useState<Mugshot[]>([])
  const [zoomLevel, setZoomLevel] = useState(1)
  const [hoveredCriminal, setHoveredCriminal] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [productCounts, setProductCounts] = useState<Record<string, number>>({})

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

      // Calculate product counts per founder (mugshots.id)
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

  return (
    <main className="min-h-screen flex flex-col bg-black overflow-x-hidden">
      <PublicHeader />

      <RevampedHero />

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
          {/* Sticky Note - Instructions */}
          <div className="hidden sm:block absolute top-4 left-16 z-40">
            <div
              className="bg-yellow-200 p-2 shadow-lg relative max-w-[120px] sm:max-w-[140px]"
              style={{
                transform: "rotate(-8deg)",
                fontFamily: "'Permanent Marker', cursive",
              }}
            >
              {/* Pin */}
              <div className="absolute left-1/2 -top-2 z-20" style={{ transform: "translateX(-50%)" }}>
                <div className="w-3 h-3 bg-red-500 rounded-full shadow border border-red-700" />
              </div>
              <p className="text-black text-[10px] sm:text-xs leading-tight">
                Each pin = a builder. Click to see what they're building, breaking, and shipping.
              </p>
            </div>
          </div>
          <div className="hidden sm:block absolute top-4 right-12 z-40">
            <div
              className="bg-yellow-200 p-2 shadow-lg relative max-w-[120px] sm:max-w-[140px]"
              style={{
                transform: "rotate(-8deg)",
                fontFamily: "'Permanent Marker', cursive",
              }}
            >
              {/* Pin */}
              <div className="absolute left-1/2 -top-2 z-20" style={{ transform: "translateX(-50%)" }}>
                <div className="w-3 h-3 bg-red-500 rounded-full shadow border border-red-700" />
              </div>
              <p className="text-black text-[10px] sm:text-xs leading-tight">
                This is not a launch list. It's a living board of what founders are really building.
              </p>
            </div>
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

      <section className="relative py-20 px-4 sm:px-8 lg:px-16 bg-gradient-to-b from-[#0a0a0a] via-[#1a1a1a] to-[#0f0f0f] text-white overflow-hidden">
        {/* Enhanced grunge texture with multiple layers */}
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

        {/* Scattered evidence markers */}
        <div className="absolute top-10 left-10 w-8 h-8 bg-red-600 rounded-full opacity-20 animate-pulse" />
        <div className="absolute top-32 right-20 w-6 h-6 bg-yellow-500 rounded-full opacity-30" />
        <div className="absolute bottom-20 left-1/4 w-4 h-4 bg-blue-500 rounded-full opacity-25" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Enhanced header with crime scene tape effect */}
          <div className="text-center mb-16 relative">
            <div className="relative z-10">
              <h2
                className="text-4xl md:text-6xl font-black text-white mb-4 relative inline-block"
                style={{
                  textShadow: "2px 2px 0px #dc2626, -1px -1px 0px #dc2626, 1px -1px 0px #dc2626, -2px 2px 0px #dc2626",
                  fontFamily: "'Arial', sans-serif",
                }}
              >
                <span className="bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 bg-clip-text text-transparent">
                  EVIDENCE BOARD
                </span>
              </h2>

              {/* Hand-drawn arrow pointing down */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                <svg width="40" height="30" viewBox="0 0 40 30" className="text-yellow-400">
                  <path
                    d="M20 5 Q15 15 20 25 Q25 15 20 5"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <path
                    d="M15 20 L20 25 L25 20"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            <p className="text-gray-300 text-lg mt-8 max-w-3xl mx-auto font-mono relative z-10">
              <span className="bg-yellow-400 text-black px-2 py-1 font-bold transform -rotate-1 inline-block mr-2">
                CLASSIFIED:
              </span>
              What really happens on FoundersWall
            </p>
          </div>

          {/* Enhanced feature cards with better visual hierarchy */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-20">
            {[
              {
                title: "📖 Build Stories",
                emoji: "📖",
                color: "text-blue-400",
                bgColor: "bg-blue-50",
                desc: "Long-form war stories from the trenches",
                details:
                  "Long-form war stories on FoundersWall are real, messy stories from builders in the trenches. The wins, the breakdowns, the near-shutdowns — all the stuff most people hide. If you've been through it, this is where you tell it.",
                stamp: "NEW INTEL",
                stain: true,
                priority: "HIGH",
              },
              {
                title: "🔧 Build Logs",
                emoji: "🔧",
                color: "text-red-400",
                bgColor: "bg-red-50",
                desc: "Raw updates. No filters. Pure evidence.",
                details:
                  "Build Logs are your day-to-day updates as a founder short, scrappy notes about what you're building, fixing, shipping, or struggling with. A place to show you're alive and shipping.",
                stamp: "LIVE FEED",
                stain: true,
                priority: "URGENT",
              },
              {
                title: "🚀 Product Launches",
                emoji: "🚀",
                color: "text-green-400",
                bgColor: "bg-green-50",
                desc: "Proof of what you've actually shipped",
                details:
                  "The Launch Board is where you share anything you're putting out into the world early builds, experiments, rough betas, quiet updates. Whether it's v0.1 or v1.9, if you shipped it, it belongs here.",
                stamp: "VERIFIED",
                stain: false,
                priority: "CRITICAL",
              },
              {
                title: "📢 Uplifts",
                emoji: "📢",
                color: "text-yellow-400",
                bgColor: "bg-yellow-50",
                desc: "Recognition from builders who get it",
                details:
                  "Uplifts are builder-to-builder launch pledges. You ask for support before launching others promise to show up. When it's their turn, you return the favor. Real backing, not fake hype.",
                stamp: "",
                stain: false,
                priority: "",
              },
              {
                title: "🤝 Connections",
                emoji: "🤝",
                color: "text-purple-400",
                bgColor: "bg-purple-50",
                desc: "Find your co-conspirators",
                details:
                  "Connect with other indie hackers. Find co-founders, get advice, or just find people who speak your language.",
                stamp: "",
                stain: true,
                priority: "",
              },
              {
                title: "👤 Maker Profile",
                emoji: "👤",
                color: "text-pink-400",
                bgColor: "bg-pink-50",
                desc: "The psychological evidence",
                details:
                  "Maker Profile is your public space on FoundersWall. It shows your face, your startup, and all your launches a simple timeline of what you've shipped. No fluff, just visible progress.",
                stamp: "CONFIDENTIAL",
                stain: true,
                priority: "SENSITIVE",
              },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className="relative group"
                style={{
                  transform: `rotate(${(i % 2 === 0 ? -1 : 1) * (2 + Math.random() * 3)}deg) translateY(${Math.random() * 12 - 6}px)`,
                  marginTop: i % 2 === 0 ? "0px" : "20px",
                  marginBottom: i % 2 === 1 ? "0px" : "12px",
                }}
              >
                {/* Enhanced sticky note with better shadows and textures */}
                <div
                  className={`${feature.bgColor} px-6 pt-6 pb-8 font-handwriting text-black relative overflow-hidden`}
                  style={{
                    minHeight: "200px",
                    boxShadow: "4px 4px 0 #000, 8px 8px 20px rgba(0,0,0,0.3)",
                    border: "2px solid #000",
                  }}
                >
                  {/* Multiple pin effects for more realistic look */}
                  <div className="absolute left-1/2 -top-4 z-30" style={{ transform: "translateX(-50%)" }}>
                    <div className="w-5 h-5 bg-red-500 rounded-full shadow-lg border-2 border-red-700" />
                  </div>
                  <div className="absolute left-1/4 -top-3 z-20" style={{ transform: "translateX(-50%)" }}>
                    <div className="w-3 h-3 bg-red-400 rounded-full shadow border border-red-600 opacity-60" />
                  </div>

                  {/* Priority label */}
                  {feature.priority && (
                    <div className="absolute top-2 left-2 bg-black text-white text-xs font-bold px-2 py-1 transform -rotate-12 z-20">
                      {feature.priority}
                    </div>
                  )}

                  {/* Enhanced stamp */}
                  {feature.stamp && (
                    <div className="absolute top-4 right-4 bg-red-700 text-white text-xs font-bold px-3 py-2 transform rotate-12 shadow-lg z-30 border-2 border-red-900">
                      {feature.stamp}
                    </div>
                  )}

                  {/* Paper texture overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage: `
                      radial-gradient(circle at 20% 20%, rgba(0,0,0,0.1) 1px, transparent 1px),
                      radial-gradient(circle at 80% 80%, rgba(0,0,0,0.05) 1px, transparent 1px)
                    `,
                      backgroundSize: "20px 20px, 30px 30px",
                      opacity: 0.3,
                      zIndex: 5,
                    }}
                  />

                  {/* Enhanced coffee stain */}
                  {feature.stain && (
                    <div className="absolute right-6 bottom-4 z-10">
                      <div
                        className="w-12 h-8 rounded-full opacity-20"
                        style={{
                          background: "radial-gradient(ellipse, #8B4513 0%, #654321 50%, transparent 70%)",
                          transform: "rotate(25deg)",
                        }}
                      />
                    </div>
                  )}

                  {/* Content with better typography */}
                  <div className="relative z-20">
                    <div className="flex items-center mb-4">
                      <span className="text-3xl mr-3">{feature.emoji}</span>
                      <h3
                        className={`${feature.color} text-xl font-bold`}
                        style={{
                          letterSpacing: "1px",
                          textShadow: "1px 1px 0 #fff",
                          fontFamily: "'Permanent Marker', cursive",
                        }}
                      >
                        {feature.title}
                      </h3>
                    </div>

                    <p className="text-gray-800 text-base font-bold mb-3 leading-tight">{feature.desc}</p>

                    <p className="text-gray-700 text-sm leading-relaxed font-mono">{feature.details}</p>
                  </div>

                  {/* Torn edge effect */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-2 bg-white opacity-50"
                    style={{
                      clipPath:
                        "polygon(0 0, 5% 100%, 10% 0, 15% 100%, 20% 0, 25% 100%, 30% 0, 35% 100%, 40% 0, 45% 100%, 50% 0, 55% 100%, 60% 0, 65% 100%, 70% 0, 75% 100%, 80% 0, 85% 100%, 90% 0, 95% 100%, 100% 0, 100% 100%, 0 100%)",
                    }}
                  />
                </div>

                {/* Hover effect shadow */}
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300 transform translate-x-2 translate-y-2 -z-10" />
              </div>
            ))}
          </div>

          {/* Enhanced call to action with evidence bag style */}
          <div className="text-center relative">
            <div className="inline-block relative mb-8">
              {/* Evidence bag background */}
              <div className="bg-gray-200 p-8 transform rotate-1 shadow-2xl border-4 border-gray-400 relative">
                <div className="absolute top-2 left-2 right-2 h-1 bg-red-500" />
                <div className="absolute top-4 left-4 text-xs font-bold text-red-600 tracking-wider">EVIDENCE #001</div>

                <p className="text-black font-handwriting text-xl mb-4 mt-4">
                  "Stop lurking in the shadows.
                  <br />
                  Start building in the light."
                </p>
                <p className="text-gray-700 text-sm font-mono">- Testimony from every successful indie hacker</p>

                {/* Evidence bag seal */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black px-4 py-1 text-xs font-bold border-2 border-black">
                  SEALED
                </div>
              </div>

              {/* Evidence bag pin */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-red-500 rounded-full shadow-lg border-2 border-red-700 z-10" />
            </div>

            <div className="space-y-6">
              <p className="text-gray-400 text-sm font-mono max-w-md mx-auto leading-relaxed">
                No followers to farm. No algorithm to game.
                <br />
                Just real builders documenting real work.
                <br />
                <span className="text-yellow-400 font-bold">Welcome to the evidence room.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  )
}
