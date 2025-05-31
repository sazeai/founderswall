"use client"

import { useEffect, useState } from "react"
import { Eye, Database, Shield } from "lucide-react"

export default function LoadingMugshotWall({ onLoadingComplete }: { onLoadingComplete?: () => void }) {
  const [progress, setProgress] = useState(0)
  const [currentMessage, setCurrentMessage] = useState(0)
  const [scanLines, setScanLines] = useState(0)

  const messages = [
    "ACCESSING DATABASE...",
    "LOADING ARCHIVE...",
    "SCANNING RECORDS...",
    "CONNECTING TO FOUNDERSWALL...",
  ]

  useEffect(() => {
    // Fast 1-second completion
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setTimeout(() => onLoadingComplete?.(), 100)
          return 100
        }
        return prev + 10 // 10% every 100ms = 1 second total
      })
    }, 100)

    // Quick message cycling
    const messageTimer = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length)
    }, 250)

    // Scanning effect
    const scanTimer = setInterval(() => {
      setScanLines((prev) => (prev + 5) % 100)
    }, 50)

    return () => {
      clearInterval(progressTimer)
      clearInterval(messageTimer)
      clearInterval(scanTimer)
    }
  }, [onLoadingComplete])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      {/* Crime scene tape pattern background */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            #fbbf24 0px,
            #fbbf24 20px,
            #000000 20px,
            #000000 40px
          )`,
        }}
      />

      <div className="relative w-full max-w-lg mx-auto px-6">
        {/* Main terminal */}
        <div className="bg-gray-900 border-2 border-yellow-500 rounded-lg p-6 font-mono shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-yellow-500 font-bold text-lg">FOUNDERSWALL</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-400">
              <Shield className="w-3 h-3" />
            </div>
          </div>

          {/* Scanning interface */}
          <div className="mb-4">
            <div className="bg-black border border-red-500 rounded p-4 relative overflow-hidden">
              {/* Scanning grid */}
              <div className="grid grid-cols-10 gap-1 mb-3">
                {Array.from({ length: 50 }, (_, i) => (
                  <div
                    key={i}
                    className={`h-1 transition-all duration-100 ${
                      i < (progress / 100) * 50 ? (i % 2 === 0 ? "bg-yellow-500" : "bg-red-500") : "bg-gray-800"
                    }`}
                  />
                ))}
              </div>

              {/* Scanning line */}
              <div className="relative h-px bg-gray-800 overflow-hidden">
                <div
                  className="absolute top-0 h-full w-4 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"
                  style={{
                    left: `${scanLines}%`,
                    filter: "blur(0.5px)",
                  }}
                />
              </div>

              {/* Status */}
              <div className="flex justify-between items-center mt-3 text-xs">
                <div className="flex items-center space-x-1">
                  <Database className="w-3 h-3 text-yellow-500" />
                  <span className="text-yellow-500">SUSPECTS</span>
                </div>
                <span className="text-red-500 font-bold">{progress}%</span>
                <div className="flex items-center space-x-1">
                  <span className="text-red-500">WANTED</span>
                  <Eye className="w-3 h-3 text-red-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Loading message */}
          <div className="text-center mb-4">
            <p className="text-yellow-500 text-sm font-bold mb-1">{messages[currentMessage]}</p>
            <div className="flex justify-center space-x-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1 h-1 bg-red-500 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-400">
              <span>DATABASE ACCESS</span>
              <span>{progress === 100 ? "AUTHORIZED" : "AUTHENTICATING"}</span>
            </div>
            <div className="h-2 bg-gray-800 border border-gray-700 rounded overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-yellow-500 transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Bottom status */}
          <div className="mt-4 pt-2 border-t border-gray-700 flex justify-between items-center text-xs text-gray-500">
            <span>CLASSIFIED</span>
            <span>WANTED BUILDERS</span>
          </div>
        </div>

        {/* Warning tape */}
        <div className="mt-4 text-center">
          <div className="inline-block bg-yellow-500 text-black px-4 py-1 text-xs font-bold transform -rotate-1">
            ⚠ AUTHORIZED PERSONNEL ONLY ⚠
          </div>
        </div>
      </div>
    </div>
  )
}
