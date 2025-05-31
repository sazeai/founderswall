"use client"

import type React from "react"
import type { Connection } from "@/lib/types"

interface ConnectionBadgeProps {
  connection: Connection
  position: string
  color: string
  onClick: (e: React.MouseEvent) => void
  isHighlighted?: boolean
  isPulsing?: boolean
}

export default function ConnectionBadge({
  connection,
  position,
  color,
  onClick,
  isHighlighted = false,
  isPulsing = false,
}: ConnectionBadgeProps) {
  return (
    <div
      className={`absolute ${position} z-30 pointer-events-auto transition-all duration-300 ${
        isHighlighted ? "opacity-100 scale-100" : "opacity-70 scale-90 hover:opacity-100 hover:scale-100"
      }`}
      onClick={onClick}
    >
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center shadow-md cursor-pointer ${
          isPulsing ? "animate-badge-pulse" : ""
        }`}
        style={{
          backgroundColor: color,
          boxShadow: isPulsing ? `0 0 8px 2px ${color}` : undefined,
        }}
        title={`${connection.connectionType} connection`}
      >
        {/* Badge content */}
      </div>
    </div>
  )
}
