"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Eye,
  Link2,
  Search,
  X,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Filter,
  Info,
  Maximize,
  Minimize,
  AlertCircle,
  ChevronDown,
  Star,
  Crown,
  ExternalLink,
  Twitter,
  AlertTriangle,
} from "lucide-react"
import { getMugshots, getConnections, createConnection as createDbConnection } from "@/lib/mugshot-service-client"
import CriminalModal from "@/components/criminal-modal"
import ConnectionModal from "@/components/connection-modal"
import ConnectionBadge from "@/components/connection-badge"
import type { Mugshot } from "@/lib/types"
import type { Connection } from "@/lib/types"
import { PublicHeader } from "@/components/public-header"
import PublicFooter from "@/components/public-footer"

import LoadingMugshotWall from "@/components/loading-mugshot-wall"
import { getRandomRotation, getPinPosition } from "@/utils/crimeBoardEffects"

// Define connection types for filter
const connectionTypes = ["all", "collaborator", "competitor", "same-tech", "mentor", "inspired-by"]

export default function Home() {
  const [selectedCriminal, setSelectedCriminal] = useState<Mugshot | null>(null)
  const [mode, setMode] = useState<"view" | "connect" | "investigate">("view")
  const [selectedCriminals, setSelectedCriminals] = useState<string[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [mugshots, setMugshots] = useState<Mugshot[]>([])
  const [showConnectionModal, setShowConnectionModal] = useState(false)
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null)
  const [highlightedCriminals, setHighlightedCriminals] = useState<string[]>([])
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isFiltered, setIsFiltered] = useState(false)
  const [hoveredCriminal, setHoveredCriminal] = useState<string | null>(null)
  const [investigatingCriminal, setInvestigatingCriminal] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [isUpvoting, setIsUpvoting] = useState(false)
  // New state for connection type filter
  const [connectionTypeFilter, setConnectionTypeFilter] = useState<string>("all")
  // State for filter dropdown
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false)
  // New state to track pulsing connections
  const [pulsingConnections, setPulsingConnections] = useState<string[]>([])

  // New state for panning
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [startPanPosition, setStartPanPosition] = useState({ x: 0, y: 0 })

  // For torn paper effect
  const [topTornEdge, setTopTornEdge] = useState("")
  const [bottomTornEdge, setBottomTornEdge] = useState("")

  const boardRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const filterDropdownRef = useRef<HTMLDivElement>(null)

  // Separate featured and regular mugshots
  const featuredMugshots = mugshots.filter((mugshot) => mugshot.featured)

  // Generate JSON-LD Schema for homepage
  const generateHomePageSchema = () => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": "https://founderswall.com/#webpage",
      url: "https://founderswall.com",
      name: "FoundersWall – A Public Log of Legendary Builders",
      isPartOf: {
        "@id": "https://founderswall.com/#website",
      },
      about: {
        "@id": "https://founderswall.com/#organization",
      },
      description:
        "Discover and explore top indie makers. FoundersWall is where the most consistent, creative, and relentless builders get tracked, logged, and celebrated.",
      breadcrumb: {
        "@id": "https://founderswall.com/#breadcrumb",
      },
      inLanguage: "en-US",
      potentialAction: [
        {
          "@type": "ReadAction",
          target: ["https://founderswall.com"],
        },
      ],
    }

    // Add featured founders as ItemList if available
    if (featuredMugshots.length > 0) {
      const featuredSchema = {
        "@type": "ItemList",
        name: "Featured Legendary Builders",
        description: "Elite founders who made their mark in the indie hacker world",
        numberOfItems: featuredMugshots.length,
        itemListElement: featuredMugshots.map((mugshot, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Person",
            "@id": `https://founderswall.com/maker/${mugshot.name.toLowerCase().replace(/\s+/g, "-")}`,
            name: mugshot.name,
            description: mugshot.crime,
            image: mugshot.imageUrl,
            url: `https://founderswall.com/maker/${mugshot.name.toLowerCase().replace(/\s+/g, "-")}`,
            jobTitle: "Indie Maker",
            worksFor: {
              "@type": "Organization",
              name: "Independent",
            },
          },
        })),
      }

      return {
        "@context": "https://schema.org",
        "@graph": [schema, featuredSchema],
      }
    }

    return schema
  }

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

  // Load mugshots and connections from Supabase on mount
  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      setError(null)

      try {
        // Fetch mugshots and connections in parallel
        const [mugshotsData, connectionsData] = await Promise.all([getMugshots(), getConnections()])

        setMugshots(mugshotsData)
        setConnections(connectionsData)
      } catch (err) {
        setError("Failed to load data. Please try refreshing the page.")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setIsFilterDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Effect to handle pulsing animation
  useEffect(() => {
    // If in investigate mode and there's an investigating criminal, pulse the connections
    if (mode === "investigate" && investigatingCriminal) {
      // Get all connections for the investigating criminal
      const criminalConnections = connections
        .filter((conn) => {
          // Only include connections that match the current filter
          if (connectionTypeFilter !== "all" && conn.connectionType !== connectionTypeFilter) {
            return false
          }
          return conn.fromCriminalId === investigatingCriminal || conn.toCriminalId === investigatingCriminal
        })
        .map((conn) => conn.id)

      // Set pulsing connections
      setPulsingConnections(criminalConnections)
    } else {
      // Clear pulsing connections
      setPulsingConnections([])
    }
  }, [mode, investigatingCriminal, connections, connectionTypeFilter])

  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      // Force re-render when window size changes to update the layout
      setMugshots([...mugshots])
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [mugshots])

  const openCriminalModal = (criminal: Mugshot) => {
    if (mode === "view") {
      setSelectedCriminal(criminal)
      document.body.style.overflow = "hidden"
    }
  }

  const closeCriminalModal = () => {
    setSelectedCriminal(null)
    document.body.style.overflow = "auto"
  }

  const handleCriminalClick = (criminal: Mugshot) => {
    // Don't trigger clicks if we're panning
    if (isPanning) return

    if (mode === "connect") {
      handleConnectMode(criminal)
    } else if (mode === "investigate") {
      handleInvestigateMode(criminal)
    } else {
      openCriminalModal(criminal)
    }
  }

  const handleConnectMode = (criminal: Mugshot) => {
    if (selectedCriminals.includes(criminal.id)) {
      // Deselect if already selected
      setSelectedCriminals(selectedCriminals.filter((id) => id !== criminal.id))
    } else if (selectedCriminals.length < 2) {
      // Add to selection if less than 2 selected
      const newSelected = [...selectedCriminals, criminal.id]
      setSelectedCriminals(newSelected)

      // If we now have 2 selected, open the connection modal
      if (newSelected.length === 2) {
        setShowConnectionModal(true)
      }
    }
  }

  const handleInvestigateMode = (criminal: Mugshot) => {
    // If we're already investigating this criminal, clear the investigation
    if (investigatingCriminal === criminal.id) {
      setInvestigatingCriminal(null)
      setHighlightedCriminals([])
      setIsFiltered(false)
      return
    }

    // Find all connections involving this criminal
    const relatedConnections = connections.filter(
      (conn) => conn.fromCriminalId === criminal.id || conn.toCriminalId === criminal.id,
    )

    // Get all criminals connected to this one
    const connectedCriminals = relatedConnections
      .flatMap((conn) => [conn.fromCriminalId, conn.toCriminalId])
      .filter((id) => id !== criminal.id)

    // Highlight the selected criminal and all connected criminals
    setHighlightedCriminals([criminal.id, ...connectedCriminals])
    setInvestigatingCriminal(criminal.id)
  }

  const createConnection = async (
    connectionType: string,
    evidence: string,
  ): Promise<{ success: boolean; error: string | null }> => {
    if (selectedCriminals.length !== 2) {
      return { success: false, error: "Please select two criminals to connect." }
    }

    try {
      const newConnectionData = {
        fromCriminalId: selectedCriminals[0],
        toCriminalId: selectedCriminals[1],
        connectionType,
        evidence,
        createdBy: "user",
      }

      const { connection, error } = await createDbConnection(newConnectionData)

      if (error) {
        return { success: false, error }
      }

      if (connection) {
        setConnections([...connections, connection])
        setSelectedCriminals([])
        setShowConnectionModal(false)
        return { success: true, error: null }
      } else {
        return { success: false, error: "Failed to create connection. Please try again." }
      }
    } catch (err) {
      return { success: false, error: "An unexpected error occurred. Please try again." }
    }
  }

  const cancelConnection = () => {
    setSelectedCriminals([])
    setShowConnectionModal(false)
  }

  const resetMode = () => {
    setMode("view")
    setSelectedCriminals([])
    setHighlightedCriminals([])
    setIsFiltered(false)
    setInvestigatingCriminal(null)
    setConnectionTypeFilter("all")
    setPulsingConnections([])
  }

  const handleConnectionClick = (connection: Connection) => {
    // Don't trigger clicks if we're panning
    if (isPanning) return

    setSelectedConnection(connection)
  }

  const closeConnectionDetail = () => {
    setSelectedConnection(null)
  }

  const handleUpvoteConnection = async (connectionId: string) => {
    // Upvoting is disabled for now
    closeConnectionDetail()
  }

  // Get color for connection type
  const getConnectionColor = (type: string) => {
    switch (type) {
      case "collaborator":
        return "#ef4444" // red-500
      case "competitor":
        return "#3b82f6" // blue-500
      case "same-tech":
        return "#22c55e" // green-500
      case "mentor":
        return "#a855f7" // purple-500
      case "inspired-by":
        return "#f97316" // orange-500
      default:
        return "#ef4444" // red-500
    }
  }

  // Get connections for a criminal
  const getCriminalConnections = (criminalId: string) => {
    return connections.filter((conn) => {
      // Check connection type filter
      if (connectionTypeFilter !== "all" && conn.connectionType !== connectionTypeFilter) {
        return false
      }
      return conn.fromCriminalId === criminalId || conn.toCriminalId === criminalId
    })
  }

  // Get connected criminals for a criminal
  const getConnectedCriminals = (criminalId: string) => {
    const criminalConnections = getCriminalConnections(criminalId)
    return criminalConnections
      .map((conn) => {
        const connectedId = conn.fromCriminalId === criminalId ? conn.toCriminalId : conn.fromCriminalId
        const connectedCriminal = mugshots.find((m) => m.id === connectedId)
        return {
          criminal: connectedCriminal,
          connection: conn,
        }
      })
      .filter((item) => item.criminal) // Filter out any undefined criminals
  }

  // Generate grid positions for the polaroids
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
          .catch((err) => {
         
          })
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

  // Handle connection type filter change
  const handleConnectionTypeFilter = (type: string) => {
    setConnectionTypeFilter(type)
    setIsFilterDropdownOpen(false)
  }

  // Get connection type display name
  const getConnectionTypeDisplayName = (type: string) => {
    switch (type) {
      case "all":
        return "All Connections"
      case "collaborator":
        return "Collaborators"
      case "competitor":
        return "Competitors"
      case "same-tech":
        return "Same Tech"
      case "mentor":
        return "Mentor/Mentee"
      case "inspired-by":
        return "Inspired By"
      default:
        return type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, " ")
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
      {/* JSON-LD Schema for Homepage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateHomePageSchema()),
        }}
      />

      <PublicHeader />
      {/* Hero Section */}
      <section className="pt-24 px-6 text-center">
        <div className="relative inline-block">
          <h1
            className="text-white text-3xl sm:text-5xl font-bold tracking-wider mb-4 glitch-text"
            data-text="FoundersWall"
          >
            FOUNDERS WALL
          </h1>

          <div className="absolute -top-2 -right-6 bg-yellow-400 text-black text-xs px-2 py-1 rotate-12 font-bold">
            v1.0.0
          </div>
        </div>
      </section>

      {/* Yellow Caution Stripe */}
      <div className="h-8 w-full bg-yellow-400 relative overflow-hidden my-4">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg, #000 0, #000 10px, #f6e05e 10px, #f6e05e 20px)",
            backgroundSize: "28px 28px",
          }}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-black font-black text-sm tracking-wider">⚠️ INDIE MAKERS ZONE ⚠️</span>
        </div>
      </div>

      <section className="pt-6 px-6 pb-4 text-center">
        <div className="bg-gray-800 border-4 border-red-500 p-6 rounded-md mb-6 transform -rotate-1 max-w-2xl mx-auto relative">
          {/* Indie maker stickers */}
          <div className="absolute -top-4 -right-4 bg-blue-500 text-white text-xs px-3 py-2 rotate-12 font-black rounded-lg shadow-lg border-2 border-white">
            <span className="block">SHIPPED</span>
            <span className="block text-yellow-300">IN 1 DAY</span>
          </div>
          <div className="absolute -bottom-4 -left-4 bg-orange-500 text-white text-xs px-3 py-2 -rotate-6 font-black rounded-lg shadow-lg border-2 border-white">
            <span className="block">ZERO</span>
            <span className="block text-yellow-300">FUNDING</span>
          </div>

          <div className="flex items-center justify-center">
            <h2
              className="text-red-500 text-xl sm:text-2xl font-black tracking-wider"
              style={{
                fontFamily: "'Arial Black', 'Helvetica', sans-serif",
                textShadow: "2px 2px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000",
              }}
            >
              LEGENDS IN THE MAKING
            </h2>
          </div>

          <div className="mt-4">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-1">THE INDIE HACKER</h3>

            <div
              className="text-3xl md:text-4xl font-black text-yellow-400"
              style={{
                fontFamily: "'Fredoka One', cursive",
                textShadow: "2px 2px 0px #000",
              }}
            >
              WALL OF FAME
            </div>
            <div className="mt-2 text-yellow-300 text-sm font-mono">
              <span className="inline-block mx-1">💻</span>
              <span className="inline-block mx-1">MAKERS</span>
              <span className="inline-block mx-1">•</span>
              <span className="inline-block mx-1">BUILDERS</span>
              <span className="inline-block mx-1">•</span>
              <span className="inline-block mx-1">CREATORS</span>
              <span className="inline-block mx-1">💻</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/station"
              className="py-3 px-6 bg-red-500 hover:bg-red-600 rounded-md text-white text-lg font-bold text-center inline-flex items-center justify-center transition-transform transform hover:scale-105 relative overflow-hidden"
            >
              <span className="mr-2">👮‍♂️</span> Get on the Board
              <span className="absolute -bottom-1 -right-1 text-xs bg-yellow-400 text-black px-1 rotate-12">HOT!</span>
            </Link>
            <button
              onClick={() => {
                const corkboardSection = document.getElementById("corkboard-section")
                corkboardSection?.scrollIntoView({ behavior: "smooth" })
              }}
              className="py-3 px-6 bg-gray-700 hover:bg-gray-600 rounded-md text-white text-lg font-bold text-center inline-flex items-center justify-center transition-transform transform hover:scale-105 border-2 border-dashed border-gray-500"
            >
              <span className="mr-2">🔍</span> Meet Suspects
            </button>
          </div>

          {/* Indie maker stats */}
          <div className="mt-4 flex justify-center gap-3 flex-wrap">
            <div className="bg-gray-700 px-3 py-1 rounded-full text-xs text-white flex items-center">
              <span className="text-green-400 mr-1">▲</span> 24% MRR
            </div>
            <div className="bg-gray-700 px-3 py-1 rounded-full text-xs text-white flex items-center">
              <span className="text-yellow-400 mr-1">★</span> {mugshots.length}+ Makers
            </div>
            <div className="bg-gray-700 px-3 py-1 rounded-full text-xs text-white flex items-center">
              <span className="text-blue-400 mr-1">⚡</span> Built in Public
            </div>
          </div>
        </div>
      </section>

      {/* Yellow Caution Stripe */}
      <div className="h-8 w-full bg-yellow-400 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg, #000 0, #000 10px, #f6e05e 10px, #f6e05e 20px)",
            backgroundSize: "28px 28px",
          }}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-black font-black text-xs tracking-wider">
            APPROACH WITH CAUTION - HIGHLY PRODUCTIVE
          </span>
        </div>
      </div>

      {/* Compact Featured Section */}
      {featuredMugshots.length > 0 && (
        <div className="mx-4 mt-6 container mx-auto mb-4">
          {/* Compact Crime Scene Banner */}
          <div className="relative">
            <div className="bg-red-600 text-white p-2 transform -rotate-1 shadow-lg border-2 border-red-700">
              <div className="flex items-center justify-center space-x-2">
                <AlertTriangle className="h-4 w-4" />
                <h3 className="text-sm font-bold font-mono tracking-wider">⚠ MOST WANTED THIS WEEK ⚠</h3>
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Compact Featured Card - Horizontal Layout */}
          <div className="mt-2">
            {featuredMugshots.slice(0, 1).map((featuredMugshot) => {
              const badgeInfo = getFeaturedBadgeInfo(featuredMugshot.badgeType || "wanted")

              return (
                <div
                  key={`featured-${featuredMugshot.id}`}
                  className="cursor-pointer"
                  onClick={() => openCriminalModal(featuredMugshot)}
                >
                  <div className="bg-gray-900 border-2 border-yellow-500 shadow-xl relative overflow-hidden">
                    <div className="flex items-center p-4 space-x-4">
                      {/* Mugshot - Smaller */}
                      <div className="relative flex-shrink-0">
                        <div className="border-2 border-gray-300 bg-white p-1 shadow-lg transform -rotate-2">
                          <Image
                            src={featuredMugshot.imageUrl || "/placeholder.svg"}
                            alt={`Most Wanted: ${featuredMugshot.name}`}
                            width={80}
                            height={80}
                            className="w-20 h-20 object-cover grayscale"
                          />
                          <div className="bg-black text-white text-center py-0.5 mt-1">
                            <div className="text-xs font-mono font-bold">SUSPECT</div>
                          </div>
                        </div>

                        {/* Crown badge */}
                        <div className="absolute -top-1 -left-1">
                          <Crown className="h-5 w-5 text-yellow-400" fill="currentColor" />
                        </div>
                      </div>

                      {/* Details - Compact */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-lg text-white font-mono truncate">
                            {featuredMugshot.name.toUpperCase()}
                          </h4>
                          <div
                            className={`${badgeInfo.bgColor} ${badgeInfo.color} px-2 py-1 text-xs font-bold rounded transform rotate-3`}
                          >
                            {badgeInfo.text}
                          </div>
                        </div>

                        <div className="bg-yellow-500 text-black p-2 mb-2 border-l-4 border-red-500">
                          <div className="text-xs font-bold mb-1">ALLEGED CRIME:</div>
                          <div className="text-sm font-mono italic line-clamp-2">"{featuredMugshot.crime}"</div>
                        </div>

                        {/* Evidence Links - Inline */}
                        {(featuredMugshot.productUrl || featuredMugshot.twitterHandle) && (
                          <div className="flex space-x-2">
                            {featuredMugshot.productUrl && (
                              <a
                                href={featuredMugshot.productUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-xs bg-red-600 text-white px-2 py-1 font-mono font-bold hover:bg-red-700 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                EVIDENCE
                              </a>
                            )}
                            {featuredMugshot.twitterHandle && (
                              <a
                                href={`https://x.com/${featuredMugshot.twitterHandle?.replace("@", "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-xs bg-red-600 text-white px-2 py-1 font-mono font-bold hover:bg-red-700 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Twitter className="h-3 w-3 mr-1" />
                                SOCIAL
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Danger Level - Vertical */}
                      <div className="flex-shrink-0 text-center hidden md:block">
                        <div className="text-xs font-mono font-bold text-red-500 mb-1">DANGER</div>
                        <div className="flex flex-col space-y-1">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-2 h-2 bg-red-500 rounded-full"></div>
                          ))}
                        </div>
                        <div className="text-xs font-mono text-red-500 mt-1 transform rotate-90 origin-center">MAX</div>
                      </div>
                    </div>

                    {/* Bottom warning strip */}
                    <div className="bg-yellow-500 text-black text-center py-1">
                      <div className="text-xs font-bold font-mono">
                        🚨 IF SEEN, REPORT TO FOUNDERSWALL IMMEDIATELY 🚨
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Investigation Board Section - Removed px-6 padding to make it full-width */}
      <section
        id="corkboard-section"
        className={`flex-1 py-8 overflow-x-hidden ${isFullscreen ? "fixed inset-0 z-50 bg-black" : ""}`}
      >
        {/* Investigation Toolbar - Always visible in fullscreen */}
        <div
          className={`bg-gray-800 p-3 rounded-md mb-4 mx-4 flex flex-wrap gap-2 items-center justify-center md:justify-between ${
            isFullscreen ? "sticky top-2 z-[100]" : ""
          }`}
        >
          <div className="flex space-x-2">
            <button
              className={`p-2 rounded flex items-center ${mode === "view" ? "bg-red-500" : "bg-gray-700 hover:bg-gray-600"}`}
              onClick={() => resetMode()}
              title="View Mode"
            >
              <Eye size={16} className="mr-1" />
              <span className="text-xs text-white">View</span>
            </button>
            <button
              className={`p-2 rounded flex items-center ${mode === "connect" ? "bg-red-500" : "bg-gray-700 hover:bg-gray-600"}`}
              onClick={() => {
                setMode("connect")
                setHighlightedCriminals([])
                setInvestigatingCriminal(null)
              }}
              title="Connect Mode"
            >
              <Link2 size={16} className="mr-1" />
              <span className="text-xs text-white">Connect</span>
            </button>
            <button
              className={`p-2 rounded flex items-center ${mode === "investigate" ? "bg-red-500" : "bg-gray-700 hover:bg-gray-600"}`}
              onClick={() => {
                setMode("investigate")
                setSelectedCriminals([])
              }}
              title="Investigate Mode"
            >
              <Search size={16} className="mr-1" />
              <span className="text-xs text-white">Investigate</span>
            </button>
          </div>

          {/* Connection Type Filter - only visible in investigate mode */}
          {mode === "investigate" && (
            <div className="relative" ref={filterDropdownRef}>
              <button
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-md flex items-center text-sm"
              >
                <Filter className="mr-2 h-4 w-4" />
                <span>{getConnectionTypeDisplayName(connectionTypeFilter)}</span>
                <ChevronDown className="ml-2 h-4 w-4" />
              </button>

              {isFilterDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-gray-800 rounded-md shadow-lg z-[110]">
                  {connectionTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => handleConnectionTypeFilter(type)}
                      className={`w-full text-left px-4 py-2 text-sm ${
                        connectionTypeFilter === type ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      {type === "all" && "All Connections"}
                      {type !== "all" && (
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: getConnectionColor(type) }}
                          ></div>
                          {getConnectionTypeDisplayName(type)}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Zoom controls - visible on both desktop and mobile in fullscreen */}
          <div className={`${isFullscreen ? "flex" : "hidden md:flex"} space-x-2 ml-4`}>
            <button
              onClick={() => handleZoom("in")}
              className="p-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded flex items-center"
              title="Zoom In"
            >
              <ZoomIn size={16} />
            </button>
            <button
              onClick={() => handleZoom("out")}
              className="p-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded flex items-center"
              title="Zoom Out"
            >
              <ZoomOut size={16} />
            </button>
            <button
              onClick={resetView}
              className="p-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded flex items-center"
              title="Reset View"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded flex items-center"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            </button>
          </div>
        </div>

        {/* Connection error notification */}
        {connectionError && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-900/90 text-white px-4 py-2 rounded-md z-50 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span className="text-sm">{connectionError}</span>
          </div>
        )}

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

          {/* Filter Toggle Button - Fixed position, outside of the content container */}
          {mode === "investigate" && investigatingCriminal && (
            <div className={`absolute ${isFullscreen ? "top-16" : "top-4"} right-4 z-40 pointer-events-auto`}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsFiltered(!isFiltered)
                }}
                className="bg-gray-800/90 hover:bg-gray-700 text-white px-3 py-2 rounded-md flex items-center text-sm shadow-lg"
              >
                {isFiltered ? (
                  <>
                    <Eye className="mr-2 h-4 w-4" /> Show All
                  </>
                ) : (
                  <>
                    <Filter className="mr-2 h-4 w-4" /> Show Connected Only
                  </>
                )}
              </button>
            </div>
          )}

          {/* Sticky notes - decorative elements */}
          <div
            className="absolute left-4 top-4 z-5 w-48 bg-yellow-200 p-4 shadow-md transform rotate-[-5deg]"
            style={{ maxWidth: "200px" }}
          >
            <div className="text-black font-handwriting text-sm">
              <p className="font-bold mb-2">INVESTIGATION NOTES:</p>
              <p>They're all using different stacks, but something links them</p>
            </div>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6">
              <div className="w-4 h-4 rounded-full bg-red-500 shadow-md mx-auto"></div>
            </div>
          </div>

          <div
            className="absolute right-8 top-16 z-5 w-48 bg-blue-100 p-4 shadow-md transform rotate-[4deg]"
            style={{ maxWidth: "200px" }}
          >
            <div className="text-black font-handwriting text-sm">
              <p className="font-bold mb-2">FOLLOW UP:</p>
              <p>Pins don’t lie. Someone’s rising too fast</p>
            </div>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6">
              <div className="w-4 h-4 rounded-full bg-blue-500 shadow-md mx-auto"></div>
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
              const isSelected = selectedCriminals.includes(mugshot.id)
              const isHighlighted = highlightedCriminals.includes(mugshot.id)
              const isHovered = hoveredCriminal === mugshot.id
              const isInvestigating = investigatingCriminal === mugshot.id

              // Add this new line to determine if this card should pulse
              const shouldPulse =
                mode === "investigate" && isHighlighted && !isInvestigating && investigatingCriminal !== null

              // Get connections for this criminal
              const criminalConnections = getCriminalConnections(mugshot.id)
              const hasConnections = criminalConnections.length > 0

              // Determine if this card should be visible in filtered mode
              const isVisible = !isFiltered || isHighlighted || isInvestigating

              // Determine if this card should be dimmed in investigation mode
              const shouldBeDimmed =
                mode === "investigate" && investigatingCriminal && !isHighlighted && !isInvestigating

              // Get random pin position
              const pinPosition = getPinPosition("top-left")

              // Get badge info for special users
              const badgeInfo = getBadgeInfo(mugshot.badgeType || "wanted")

              return (
                <div
                  key={mugshot.id}
                  className={`absolute cursor-pointer transition-all duration-300
                    ${isSelected ? "ring-4 ring-red-500" : ""}
                    ${isHighlighted && !isSelected ? "ring-2 ring-yellow-400" : ""}
                    ${!isVisible ? "hidden" : ""}`}
                  style={{
                    top: position.top,
                    left: position.left,
                    transform: `rotate(${rotation}deg)`,
                    zIndex: isInvestigating ? 35 : isHighlighted ? 25 : 10,
                    // Apply dimming directly to non-highlighted mugshots
                    opacity: shouldBeDimmed ? 0.5 : 1,
                    // Add a highlight glow effect to highlighted mugshots but only if not pulsing
                    boxShadow: isHighlighted && !shouldPulse ? "0 0 15px 5px rgba(255, 255, 0, 0.3)" : "",
                    width: typeof window !== "undefined" && window.innerWidth < 768 ? "90px" : "120px", // Smaller on mobile
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

                      {/* Connection Badges */}
                      {(mode === "investigate" || hasConnections) &&
                        criminalConnections.map((connection, i) => {
                          // Determine if this connection should be highlighted
                          const connectedId =
                            connection.fromCriminalId === mugshot.id
                              ? connection.toCriminalId
                              : connection.fromCriminalId
                          const isConnectionHighlighted = highlightedCriminals.includes(connectedId)

                          // Check if this connection should be pulsing
                          const isPulsing = pulsingConnections.includes(connection.id)

                          // Only show badge if in investigate mode or if this is a highlighted connection
                          if (mode !== "investigate" && !isConnectionHighlighted) return null

                          // Position badges in different corners based on index
                          const positions = [
                            "bottom-0 right-0", // bottom right
                            "bottom-0 left-0", // bottom left
                            "top-0 right-0", // top right
                            "top-0 left-0", // top left
                          ]
                          const position = positions[i % positions.length]

                          return (
                            <ConnectionBadge
                              key={connection.id}
                              connection={connection}
                              position={position}
                              color={getConnectionColor(connection.connectionType)}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleConnectionClick(connection)
                              }}
                              isHighlighted={isConnectionHighlighted || isInvestigating}
                              isPulsing={isPulsing}
                            />
                          )
                        })}

                      {/* Action Buttons - Only show when hovered or selected */}
                      {(isHovered || isSelected || isInvestigating) && (
                        <div className="absolute bottom-0 left-0 right-0 flex justify-between bg-black/80 text-white text-[8px] font-mono">
                          <button
                            className="flex-1 py-1 flex items-center justify-center hover:bg-gray-700"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (mode === "view") {
                                setMode("investigate")
                                handleInvestigateMode(mugshot)
                              } else {
                                handleCriminalClick(mugshot)
                              }
                            }}
                          >
                            <Eye className="h-2 w-2 mr-1" /> INVESTIGATE
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Connection Info Labels - Only show when investigating this criminal */}
                  {isInvestigating &&
                    getConnectedCriminals(mugshot.id).map(({ criminal, connection }) => {
                      // Check if this connection should be pulsing
                      const isPulsing = pulsingConnections.includes(connection.id)

                      return (
                        <div
                          key={connection.id}
                          className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-30 pointer-events-auto"
                        >
                          <div
                            className={`bg-gray-900/90 text-white text-xs px-2 py-1 rounded shadow-lg flex items-center ${
                              isPulsing ? "animate-connection-pulse" : ""
                            }`}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleConnectionClick(connection)
                            }}
                          >
                            <div
                              className="w-2 h-2 rounded-full mr-1"
                              style={{ backgroundColor: getConnectionColor(connection.connectionType) }}
                            ></div>
                            <span className="capitalize mr-1">{connection.connectionType}</span>

                            <Info className="ml-1 h-3 w-3 opacity-70" />
                          </div>
                        </div>
                      )
                    })}
                </div>
              )
            })}
          </div>
        </div>

        {/* Mobile Controls - Floating at the bottom (hidden in fullscreen) */}
        {!isFullscreen && (
          <div className="md:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 flex space-x-3 bg-gray-800/90 rounded-full px-4 py-2 shadow-lg">
            <button
              onClick={() => handleZoom("in")}
              className="w-10 h-10 bg-gray-700 hover:bg-gray-600 text-white rounded-full flex items-center justify-center"
              title="Zoom In"
            >
              <ZoomIn size={20} />
            </button>
            <button
              onClick={() => handleZoom("out")}
              className="w-10 h-10 bg-gray-700 hover:bg-gray-600 text-white rounded-full flex items-center justify-center"
              title="Zoom Out"
            >
              <ZoomOut size={20} />
            </button>
            <button
              onClick={resetView}
              className="w-10 h-10 bg-gray-700 hover:bg-gray-600 text-white rounded-full flex items-center justify-center"
              title="Reset View"
            >
              <RefreshCw size={20} />
            </button>
            <button
              onClick={toggleFullscreen}
              className="w-10 h-10 bg-gray-700 hover:bg-gray-600 text-white rounded-full flex items-center justify-center"
              title="Fullscreen"
            >
              <Maximize size={20} />
            </button>
          </div>
        )}

        {/* Modals - Rendered inside the corkboard section for fullscreen compatibility */}
        {/* Criminal Modal */}
        {selectedCriminal && <CriminalModal criminal={selectedCriminal} onClose={closeCriminalModal} />}

        {/* Connection Modal */}
        {showConnectionModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
            <ConnectionModal
              criminals={mugshots.filter((m) => selectedCriminals.includes(m.id))}
              onSave={createConnection}
              onCancel={cancelConnection}
            />
          </div>
        )}

        {/* Connection Detail Modal */}
        {selectedConnection && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4"
            onClick={closeConnectionDetail}
          >
            <div className="bg-gray-800 rounded-lg p-4 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-bold text-lg">Connection Details</h3>
                <button onClick={closeConnectionDetail} className="text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: getConnectionColor(selectedConnection.connectionType) }}
                  ></div>
                  <span className="text-white capitalize">{selectedConnection.connectionType}</span>
                </div>

                <div className="bg-gray-700 p-3 rounded text-white text-sm mb-4">{selectedConnection.evidence}</div>

                <div className="flex justify-between text-sm text-gray-400">
                  <span>Created: {new Date(selectedConnection.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
                  onClick={closeConnectionDetail}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats - Added mx-4 to maintain some spacing */}
        <div className="flex justify-center w-full text-lg mb-8 mx-4">
          <div className="flex items-center flex-wrap justify-center gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
              <span className="text-white">{mugshots.length} criminals</span>
            </div>
            <span className="text-gray-500">|</span>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
              <span className="text-white">{connections.length} connections</span>
            </div>
            {featuredMugshots.length > 0 && (
              <>
                <span className="text-gray-500">|</span>
                <div className="flex items-center">
                  <Crown className="h-4 w-4 text-yellow-500 mr-2" fill="currentColor" />
                  <span className="text-white">{featuredMugshots.length} featured</span>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Bottom Caution Stripe */}
      <div className="h-8 w-full bg-yellow-400 relative overflow-hidden mt-auto">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg, #000 0, #000 10px, #f6e05e 10px, #f6e05e 20px)",
            backgroundSize: "28px 28px",
          }}
        ></div>
      </div>
      <PublicFooter />
    </main>
  )
}
