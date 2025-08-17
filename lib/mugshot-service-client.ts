import type { Mugshot } from "./types"

// Client-side functions for fetching data
export async function getMugshots() {
  try {
    const isServer = typeof window === "undefined"
    // Use correct baseUrl for SSR: local, Vercel, or prod
    let baseUrl = ""
    if (isServer) {
      if (process.env.NEXT_PUBLIC_SITE_URL) {
        baseUrl = process.env.NEXT_PUBLIC_SITE_URL
      } else if (process.env.VERCEL_URL) {
        baseUrl = `https://${process.env.VERCEL_URL}`
      } else {
        baseUrl = "http://localhost:3000"
      }
    }
    const response = await fetch(`${baseUrl}/api/mugshots`, { cache: "no-store" })
    if (!response.ok) {
      throw new Error("Failed to fetch mugshots")
    }
    const mugshots = await response.json()
    return mugshots as Mugshot[]
  } catch (error) {
    console.error("Error fetching mugshots:", error)
    return []
  }
}


export async function createMugshot(mugshotData: Omit<Mugshot, "id" | "createdAt" | "likes">) {
  try {
    const response = await fetch("/api/mugshots", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mugshotData),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        mugshot: null,
        error: data.error || "Failed to create mugshot",
      }
    }

    return {
      mugshot: data,
      error: null,
    }
  } catch (error) {
    console.error("Error creating mugshot:", error)
    return {
      mugshot: null,
      error: "An unexpected error occurred. Please try again.",
    }
  }
}

// Add function to get mugshot by username for client-side
export async function getMugshotByUsername(username: string) {
  try {
    const response = await fetch(`/api/mugshots/username/${encodeURIComponent(username)}`)
    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error("Failed to fetch mugshot")
    }
    const mugshot = await response.json()
    return mugshot as Mugshot
  } catch (error) {
    return null
  }
}
