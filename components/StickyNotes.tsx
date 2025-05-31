import type React from "react"
import { cn } from "@/lib/utils"
import Thumbtack from "./Thumbtack"
import { getRandomRotation } from "../utils/crimeBoardEffects"

interface StickyNoteProps {
  content: string
  color?: string
  rotation?: number
  className?: string
  handwritten?: boolean
  children?: React.ReactNode
}

const StickyNote = ({
  content,
  color = "bg-yellow-200",
  rotation,
  className,
  handwritten = true,
  children,
}: StickyNoteProps) => {
  const noteRotation = rotation ?? getRandomRotation()

  return (
    <div
      className={cn(color, "p-3 shadow-md relative", handwritten ? 'font-["Permanent_Marker"]' : "", className)}
      style={{
        transform: `rotate(${noteRotation}deg)`,
        maxWidth: "250px",
      }}
    >
      <Thumbtack position="top-left" color="red" />
      <div className="text-black text-sm mt-2">{content}</div>
      {children}
    </div>
  )
}

export default StickyNote
