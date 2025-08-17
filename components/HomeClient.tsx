"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { X, ZoomIn, ZoomOut, RefreshCw, Maximize, Minimize, Star, Crown } from "lucide-react"
import CriminalModal from "@/components/criminal-modal"
import type { Mugshot } from "@/lib/types"
import { PublicHeader } from "@/components/public-header"
import PublicFooter from "@/components/public-footer"
import BadgeSection from "@/components/badge-section"

interface HomeClientProps {
  mugshots: Mugshot[]
  productCounts: Record<string, number>
}

export default function HomeClient({ mugshots }: HomeClientProps) {
  // Debug: log mugshots prop to verify data
  if (typeof window !== "undefined") {
    // Only log on client
    // eslint-disable-next-line no-console
    console.log("[HomeClient] mugshots prop:", mugshots)
  }
  const [selectedCriminal, setSelectedCriminal] = useState<Mugshot | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [hoveredCriminal, setHoveredCriminal] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  // SSR: loading and error state not needed

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

  // Deterministic torn paper effect for hydration safety
  useEffect(() => {
    const seededRandom = (seed: string) => {
      let h = 2166136261 >>> 0;
      for (let i = 0; i < seed.length; i++) {
        h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
      }
      return () => {
        h += h << 13; h ^= h >>> 7;
        h += h << 3; h ^= h >>> 17;
        h += h << 5;
        return (h >>> 0) / 4294967296;
      };
    };

    const generateTornEdge = (seed: string) => {
      const edges = [];
      const segments = 30;
      const rand = seededRandom(seed);
      for (let i = 0; i < segments; i++) {
        const depth = rand() * 5 + 2;
        edges.push(`${(i / segments) * 100}% ${depth}px`);
      }
      return edges.join(",");
    };

    setTopTornEdge(generateTornEdge("top"));
    setBottomTornEdge(generateTornEdge("bottom"));
  }, []);

  // Deterministic coffee stains effect for hydration safety
  useEffect(() => {
    if (!boardRef.current) return;

    const seededRandom = (seed: string) => {
      let h = 2166136261 >>> 0;
      for (let i = 0; i < seed.length; i++) {
        h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
      }
      return () => {
        h += h << 13; h ^= h >>> 7;
        h += h << 3; h ^= h >>> 17;
        h += h << 5;
        return (h >>> 0) / 4294967296;
      };
    };

    const stains = [];
    const rand = seededRandom("coffee-stain");
    for (let i = 0; i < 3; i++) {
      const left = rand() * 80 + 10;
      const top = rand() * 80 + 10;
      const rotate = rand() * 360;
      stains.push({ left, top, rotate });
    }

    stains.forEach(({ left, top, rotate }) => {
      const coffeeStain = document.createElement("div");
      coffeeStain.className = "absolute opacity-20 pointer-events-none z-5";
      coffeeStain.style.left = `${left}%`;
      coffeeStain.style.top = `${top}%`;
      coffeeStain.style.transform = `rotate(${rotate}deg)`;

      // Create SVG for coffee stain
      const svgNS = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("width", "100");
      svg.setAttribute("height", "100");
      svg.setAttribute("viewBox", "0 0 100 100");

      const path = document.createElementNS(svgNS, "path");
      path.setAttribute("fill", "#8B4513");
      path.setAttribute("opacity", "0.3");

      svg.appendChild(path);
      coffeeStain.appendChild(svg);
      boardRef.current?.appendChild(coffeeStain);
    });

    // Cleanup function to remove stains when component unmounts
    return () => {
      const stains = boardRef.current?.querySelectorAll(".coffee-stain");
      stains?.forEach((stain) => stain.remove());
    };
  }, []);

  // Data is now passed as props from server, no fetching here

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

  // Deterministic seeded random for hydration-safe effects
  function seededRandom(seed: string) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < seed.length; i++) {
      h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
    }
    return () => {
      h += h << 13; h ^= h >>> 7;
      h += h << 3; h ^= h >>> 17;
      h += h << 5;
      return (h >>> 0) / 4294967296;
    };
  }

  // Deterministic random rotation for each mugshot
  const getDeterministicRotation = (id: string) => {
    const rand = seededRandom(id)();
    return rand * 14 - 7; // -7 to +7 degrees
  };

  // Deterministic pin position for each mugshot
  const getDeterministicPinPosition = (id: string) => {
    const rand = seededRandom(id + "pin")();
    // Example: top-left, top-right, etc. based on random
    const positions = [
      { top: "-8px", left: "-8px" },
      { top: "-8px", left: "calc(100% - 8px)" },
      { top: "calc(100% - 8px)", left: "-8px" },
      { top: "calc(100% - 8px)", left: "calc(100% - 8px)" },
    ];
    return positions[Math.floor(rand * positions.length)];
  };

  // Deterministic spiral layout for hydration safety
  const getGridPosition = (index: number, id: string) => {
    // Check if we're on mobile
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const itemsPerRow = isMobile ? 4 : 6;
    const centerX = 50;
    const centerY = 35;
    let x = 0, y = 0;
    let direction = 0, steps = 1, stepCount = 0, turnCount = 0;
    for (let i = 0; i < index; i++) {
      switch (direction) {
        case 0: x++; break;
        case 1: y++; break;
        case 2: x--; break;
        case 3: y--; break;
      }
      stepCount++;
      if (stepCount === steps) {
        direction = (direction + 1) % 4;
        stepCount = 0;
        turnCount++;
        if (turnCount === 2) {
          steps++;
          turnCount = 0;
        }
      }
    }
    // Add a deterministic offset per mugshot for hydration safety
    const rand = seededRandom(id)(/* no arg */);
    const horizontalScale = (isMobile ? 18 : 15) + rand * 2;
    const verticalScale = (isMobile ? 18 : 22) + rand * 2;
    const left = centerX + x * horizontalScale;
    const top = centerY + y * verticalScale;
    return { top: `${top}%`, left: `${left}%` };
  };

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

  // Loading and error state handled by server, not needed here

  return (
    <main className="min-h-screen flex flex-col bg-black overflow-x-hidden">
      <PublicHeader />


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
            {Array.isArray(mugshots) && mugshots.length > 0 ? mugshots.map((mugshot, index) => {
              const position = getGridPosition(index, mugshot.id);
              const rotation = getDeterministicRotation(mugshot.id);
              const isHovered = hoveredCriminal === mugshot.id;
              const pinPosition = getDeterministicPinPosition(mugshot.id);
              const badgeInfo = getBadgeInfo(mugshot.badgeType || "wanted");
              return (
                <div
                  key={mugshot.id}
                  className={`absolute cursor-pointer transition-all duration-300`}
                  style={{
                    top: position.top,
                    left: position.left,
                    transform: `rotate(${rotation}deg)`,
                    zIndex: 10,
                    width: typeof window !== "undefined" && window.innerWidth < 768 ? "70px" : "90px",
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
                      top: "-10px",
                      left: "50%",
                      transform: "translateX(-50%)",
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
            }) : (
              <div className="text-white text-center w-full mt-12">No mugshots found.</div>
            )}
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

            
          </div>
        </div>
      </section>

      <BadgeSection />

      <PublicFooter />
    </main>
  )
}
