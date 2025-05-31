"use client"

import type React from "react"
import { useState, useEffect } from "react"

interface Mugshot {
  id: string
  name: string
  imageUrl: string
  badge?: string
}

const MugshotWall: React.FC = () => {
  const [mugshots, setMugshots] = useState<Mugshot[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMugshots = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/mugshots")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: Mugshot[] = await response.json()
      setMugshots(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMugshots()
  }, [])

  // Add refresh on window focus to pick up badge changes
  useEffect(() => {
    const handleFocus = () => {
      fetchMugshots()
    }

    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [])

  if (loading) {
    return <div>Loading mugshots...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="mugshot-wall">
      {mugshots.map((mugshot) => (
        <div key={mugshot.id} className="mugshot">
          <img src={mugshot.imageUrl || "/placeholder.svg"} alt={mugshot.name} />
          <div className="mugshot-name">{mugshot.name}</div>
          {mugshot.badge && <div className="mugshot-badge">{mugshot.badge}</div>}
        </div>
      ))}
    </div>
  )
}

export default MugshotWall
