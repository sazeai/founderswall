"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

export default function NotFound() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [glitchText, setGlitchText] = useState("THIS ONE NEVER SHIPPED")
  const [showSecret, setShowSecret] = useState(false)
  const [secretsFound, setSecretsFound] = useState(0)
  const [showClaps, setShowClaps] = useState(false)

  const glitchTexts = [
    "THIS ONE NEVER SHIPPED",
    "F0UND3R N0T F0UND",
    "FOUNDER ESCAPED",
    "WHO ARE YOU?",
    "STOP LOOKING",
    "THEY'RE WATCHING",
    "BUILDING IN PUBLIC",
    "SHIP OR DIE",
    "404: FOUNDER.EXE CRASHED",
    "CAFFEINE LEVELS: CRITICAL",
    "LAST COMMIT: 3:47 AM",
  ]

  const indieFloatingElements = ["💰", "🚀", "☕", "💻"]

  useEffect(() => {
    // Show claps on page load
    setShowClaps(true)
    setTimeout(() => setShowClaps(false), 3000)

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })

      // Check if in dark mode corner (bottom right, moved upward)
      const isInDarkCorner = e.clientX > window.innerWidth * 0.85 && e.clientY > window.innerHeight * 0.65
      setIsDarkMode(isInDarkCorner)
    }

    // Working glitch text animation
    const glitchInterval = setInterval(
      () => {
        if (Math.random() > 0.7) {
          const randomGlitch = glitchTexts[Math.floor(Math.random() * glitchTexts.length)]
          setGlitchText(randomGlitch)

          setTimeout(
            () => {
              setGlitchText("FOUNDER NOT FOUND")
            },
            1500 + Math.random() * 1000,
          )
        }
      },
      2500 + Math.random() * 2000,
    )

    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      clearInterval(glitchInterval)
    }
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden bg-black cursor-crosshair select-none">
      {/* Background Image with Dark Mode Effect */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{
          backgroundImage: "url('/404-not-found.png')",
          filter: isDarkMode ? "brightness(0.2) contrast(2) saturate(0.5)" : "brightness(0.7) contrast(1.2)",
        }}
      />

      {/* Single Red String with Low Opacity */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
        <line
          x1="70%"
          y1="40%"
          x2={mousePos.x}
          y2={mousePos.y}
          stroke="#ff2c2c"
          strokeWidth="1"
          strokeDasharray="10,5"
          opacity="0.3"
          style={{ filter: "drop-shadow(0 0 3px #ff2c2c)" }}
        />
      </svg>

      {/* Main 404 Message - Centered and Responsive */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center px-4">
          <div
            className="text-3xl md:text-6xl font-mono font-bold text-red-500 transition-all duration-100"
            style={{
              textShadow: isDarkMode
                ? "0 0 20px #ff2c2c, 0 0 40px #ff2c2c, 0 0 60px #ff2c2c"
                : "0 0 10px #ff2c2c, 0 0 20px #ff2c2c, 0 0 30px #ff2c2c",
              filter: Math.random() > 0.95 ? "blur(2px)" : "none",
              transform: isDarkMode ? "scale(1.1)" : "scale(1)",
            }}
          >
            {glitchText}
          </div>
          <div className="text-base md:text-lg text-yellow-400 mt-4 font-sans">
            Looks like the URL you followed doesn’t exist, or someone deleted it to hide the evidence.
          </div>
        </div>
      </div>

      {/* Navigation Back Home */}
      <div className="absolute top-8 left-8 z-20">
        <Link href="/" className="group">
          <div className="bg-red-600 text-white px-6 py-3 font-mono font-bold border-2 border-red-400 hover:bg-red-700 hover:border-red-300 transition-all duration-300 transform hover:scale-105">
            ← BACK TO THE WALL
          </div>
        </Link>
      </div>

      {/* Interactive Sticky Note */}
      <div
        className="absolute top-[20%] md:top-[60%] right-[20%] w-28 h-28 bg-yellow-300 text-black p-2 font-bold text-xs transform transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl"
        style={{
          transform: `rotate(${15 + Math.sin(Date.now() / 2000) * 5}deg) scale(${isDarkMode ? 1.1 : 1})`,
          filter: isDarkMode ? "brightness(1.2) drop-shadow(0 0 8px #ffff00)" : "none",
        }}
        onClick={() => {
          setSecretsFound((prev) => prev + 1)
          setShowSecret(true)
          setTimeout(() => setShowSecret(false), 3000)
        }}
      >
        <div className="text-red-600 text-center">SHIP</div>
        <div className="text-red-600 text-center">FAST</div>
        <div className="text-[8px] mt-1 text-center">OR DIE</div>
        <div className="absolute -top-1 left-1/2 w-3 h-3 bg-red-500 rounded-full transform -translate-x-1/2"></div>
      </div>

      {/* Dark Mode Indie Elements - Instead of Eyes */}
      {isDarkMode && (
        <div className="absolute inset-0 pointer-events-none z-15">
          {/* Indie Founder Mantras - Positioned Near Edges */}
          <div className="absolute top-[20%] left-[5%] text-xl md:text-2xl font-mono text-green-400 animate-pulse">
            BUILT DIFFERENT
          </div>
          <div className="absolute top-[15%] right-[5%] text-lg md:text-xl font-mono text-yellow-400 animate-pulse">
            SHIP FAST
          </div>
          <div className="absolute bottom-[25%] left-[3%] text-base md:text-lg font-mono text-red-400 animate-pulse">
            CAFFEINE POWERED
          </div>
          <div className="absolute top-[60%] right-[3%] text-base md:text-lg font-mono text-purple-400 animate-pulse">
            IDEA GUY
          </div>
          <div className="absolute bottom-[15%] right-[8%] font-mono text-blue-300 text-xs md:text-sm animate-pulse bg-black bg-opacity-50 p-2 border border-blue-400">
            {'console.log("why is this broken?")'}
          </div>
        </div>
      )}

      {/* Secret Message Popup */}
      {showSecret && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black border-4 border-red-500 p-6 font-mono text-green-400 z-30 animate-pulse">
          <div className="text-center">
            <div className="text-red-400 mb-2">CLASSIFIED INTEL:</div>
            <div className="text-xs mb-2">Last seen: Building at 3:47 AM</div>
            <div className="text-xs mb-2">Status: Probably debugging</div>
            <div className="text-xs mb-2">Caffeine level: CRITICAL</div>
            <div className="text-xs text-yellow-400">Secrets found: {secretsFound}</div>
          </div>
        </div>
      )}

      {/* 404 Context Helper */}
      <div className="absolute bottom-8 left-8 bg-black bg-opacity-80 border border-red-500 p-4 font-mono text-green-400 text-sm z-20">
        <div className="text-red-400 font-bold mb-2">ERROR 404</div>
        <div className="text-xs">Founder not found in database</div>
        <div className="text-xs">They might be shipping something new...</div>
        <div className="text-xs text-yellow-400 mt-2">💡 Hover OVer The Candle</div>
      </div>

      {/* Hidden Dark Mode Trigger Zone */}
      <div
        className="absolute bottom-[25%] right-0 w-32 h-32 pointer-events-none z-5"
        style={{
          background: isDarkMode
            ? "radial-gradient(circle, rgba(255,0,0,0.3) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(255,255,0,0.1) 0%, transparent 70%)",
        }}
      />

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  )
}
