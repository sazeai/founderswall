import type { Mugshot, Connection } from "./types"

// Client-side functions for fetching data
export async function getMugshots() {
  try {
    const response = await fetch("/api/mugshots")
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

export async function getConnections() {
  try {
    const response = await fetch("/api/connections")
    if (!response.ok) {
      throw new Error("Failed to fetch connections")
    }
    const data = await response.json()
    return data as Connection[]
  } catch (error) {
    console.error("Error fetching connections:", error)
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

export async function createConnection(connection: Omit<Connection, "id" | "createdAt">) {
  try {
    const response = await fetch("/api/connections", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(connection),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        connection: null,
        error: data.error || "Failed to create connection",
      }
    }

    return {
      connection: data,
      error: null,
    }
  } catch (error) {
    return {
      connection: null,
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
