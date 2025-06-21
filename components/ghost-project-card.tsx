"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { Eye, Lock, Code, Globe, Palette, FileText, Database, Smartphone } from "lucide-react"

interface GhostProjectCardProps {
  project: any
}

export function GhostProjectCard({ project }: GhostProjectCardProps) {
  const [rotation, setRotation] = useState(0)
  const [pinPosition, setPinPosition] = useState({ x: 50, y: 15 })
  const [stainPosition, setStainPosition] = useState({ x: 70, y: 60, opacity: 0.1, scale: 0.5, rotation: 0 })

  // Generate random styling on mount
  useEffect(() => {
    const randomRotation = Math.random() * 3 - 1.5 // Slightly more rotation for ghost effect
    setRotation(randomRotation)

    const randomPinX = 40 + Math.random() * 20
    const randomPinY = 10 + Math.random() * 10
    setPinPosition({ x: randomPinX, y: randomPinY })

    const randomStainX = 50 + Math.random() * 40
    const randomStainY = 40 + Math.random() * 40
    const randomOpacity = 0.08 + Math.random() * 0.2 // Slightly more visible stains
    const randomScale = 0.4 + Math.random() * 0.6
    const randomStainRotation = Math.random() * 360
    setStainPosition({
      x: randomStainX,
      y: randomStainY,
      opacity: randomOpacity,
      scale: randomScale,
      rotation: randomStainRotation,
    })
  }, [])

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "abandoned_after_mvp":
        return { icon: "🚫", text: "ABANDONED AFTER MVP", color: "bg-red-600" }
      case "never_launched":
        return { icon: "👻", text: "NEVER LAUNCHED", color: "bg-purple-600" }
      case "got_users":
        return { icon: "⚡", text: "HAD USERS", color: "bg-yellow-600" }
      default:
        return { icon: "💀", text: "UNKNOWN STATUS", color: "bg-gray-600" }
    }
  }

  const getAssetIcon = (asset: string) => {
    switch (asset.toLowerCase()) {
      case "codebase":
        return { icon: <Code className="h-4 w-4" />, label: "CODE" }
      case "domain":
        return { icon: <Globe className="h-4 w-4" />, label: "DOMAIN" }
      case "ui_design":
        return { icon: <Palette className="h-4 w-4" />, label: "UI" }
      case "documentation":
        return { icon: <FileText className="h-4 w-4" />, label: "DOCS" }
      case "database":
        return { icon: <Database className="h-4 w-4" />, label: "DB" }
      case "mobile_app":
        return { icon: <Smartphone className="h-4 w-4" />, label: "APP" }
      default:
        return { icon: <FileText className="h-4 w-4" />, label: asset.toUpperCase().slice(0, 4) }
    }
  }

  const statusInfo = getStatusInfo(project.status)

  return (
    <div className="relative w-full flex justify-center">
      <div className="w-full max-w-[320px]">
        {/* Red Pin */}
        <div
          className="absolute z-20 w-6 h-6 bg-red-500 rounded-full shadow-lg border-2 border-red-700"
          style={{
            top: "-8px",
            left: `${pinPosition.x}%`,
            transform: "translateX(-50%)",
          }}
        />

        {/* Main card */}
        <div
          className="relative z-10 w-full shadow-2xl"
          style={{
            transform: `rotate(${rotation}deg)`,
            transformOrigin: `${pinPosition.x}% ${pinPosition.y}%`,
          }}
        >
          {/* Paper background with darker ghost texture */}
          <div className="relative bg-[#F5F1E8] border-2 border-gray-900 rounded-sm overflow-hidden p-4">
            {/* Old paper texture overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: "url('/paper-texture.png')",
                backgroundSize: "cover",
                opacity: 0.3,
                mixBlendMode: "multiply",
              }}
            />

            {/* Ghost stain (darker than normal) */}
            <div
              className="absolute pointer-events-none"
              style={{
                top: `${stainPosition.y}%`,
                left: `${stainPosition.x}%`,
                transform: `translate(-50%, -50%) rotate(${stainPosition.rotation}deg) scale(${stainPosition.scale})`,
                opacity: stainPosition.opacity,
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "radial-gradient(circle, #4A4A4A 0%, #6B6B6B 30%, transparent 70%)",
              }}
            />

            {/* GHOST FILE stamp */}
            <div className="absolute top-3 right-3 rotate-12 z-10">
              <div className="border-2 border-purple-700 p-1 bg-purple-100">
                <div className="text-purple-700 font-bold text-xs leading-tight text-center font-mono">
                  👻 GHOST
                  <br />
                  FILE
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="relative z-10">
              {/* Header with Case ID */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-2">
                  <div className="bg-purple-700 text-white px-2 py-1 text-xs font-bold inline-block font-mono">
                    GHOST #{project.id.slice(-6).toUpperCase()}
                  </div>
                 
                </div>

                <h2 className="text-lg font-black uppercase tracking-tight text-black leading-tight font-mono mb-1">
                  {project.codename}
                </h2>

                <div className="h-0.5 bg-gray-900 my-2"></div>
              </div>

              {/* Status Tag - Professional placement */}
              <div className="mb-3">
                <div className={`${statusInfo.color} text-white px-2 py-1 text-xs font-bold inline-block font-mono`}>
                  {statusInfo.icon} {statusInfo.text}
                </div>
              </div>

              {/* One-liner */}
              <div className="mb-3">
                <div className="flex items-center mb-1">
                  <div className="w-2 h-2 bg-purple-700 mr-2"></div>
                  <h3 className="text-xs font-black uppercase text-black font-mono">CASE SUMMARY</h3>
                </div>
                <p className="text-sm text-black font-serif italic leading-tight">"{project.one_liner}"</p>
              </div>

              {/* Suspect Info */}
              <div className="mb-3">
                <div className="flex justify-between">
                  <span className="text-xs font-bold text-gray-800 font-mono">SUSPECT:</span>
                  <span className="text-xs text-gray-800 font-semibold truncate max-w-[150px]">
                    {project.founder?.name || "UNKNOWN"}
                  </span>
                </div>
              </div>

              {/* Intent/Price - Professional placement */}
              <div className="mb-3">
                <div className="flex justify-between">
                  <span className="text-xs font-bold text-gray-800 font-mono">STATUS:</span>
                  <span className="text-xs text-gray-800 font-semibold">
                    {project.intent === "learning_only"
                      ? "📚 FOR LEARNING"
                      : `💰 ${project.asking_price || "OPEN TO OFFERS"}`}
                  </span>
                </div>
              </div>

              {/* Tech Stack */}
              {project.tech_stack && project.tech_stack.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center mb-1">
                    <div className="w-2 h-2 bg-purple-700 mr-2"></div>
                    <h3 className="text-xs font-black uppercase text-black font-mono">TECH EVIDENCE</h3>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {project.tech_stack.map((tech: string, index: number) => (
                      <span key={index} className="bg-gray-300 text-gray-800 text-xs px-1 py-0.5 rounded-sm font-mono">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Assets - Show ALL with different icons */}
              {project.assets_available && project.assets_available.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center mb-1">
                    <div className="w-2 h-2 bg-purple-700 mr-2"></div>
                    <h3 className="text-xs font-black uppercase text-black font-mono">AVAILABLE ASSETS</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {project.assets_available.map((asset: string, index: number) => {
                      const assetInfo = getAssetIcon(asset)
                      return (
                        <div key={index} className="flex items-center space-x-1 bg-gray-200 p-1 rounded-sm">
                          <div className="text-gray-700">{assetInfo.icon}</div>
                          <span className="text-xs font-mono text-gray-800">{assetInfo.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Access Status */}
              <div className="mb-3">
                <div className="bg-gray-900 text-white p-2 text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <Lock className="h-3 w-3" />
                    <span className="text-xs font-bold font-mono">CLASSIFIED - REQUEST ACCESS</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div>
                <div className="h-0.5 bg-gray-900 mb-2"></div>
                <Link
                  href={`/ghost/${project.slug}`}
                  className="w-full bg-purple-800 hover:bg-purple-700 text-white border-none rounded-none text-xs font-bold py-2 px-2 font-mono shadow-md flex items-center justify-center transition-colors"
                >
                  <Eye className="mr-1 h-3 w-3" /> 👻 INVESTIGATE GHOST
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
