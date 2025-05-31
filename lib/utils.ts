import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase() // Ensure lowercase
    .trim() // Remove leading/trailing spaces
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with a single hyphen
    .replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
}

// Update the normalizeUsername function to only use the first two words
export function normalizeUsername(username: string): string {
  if (!username) return ""

  // First clean the username by removing special characters and normalizing spaces
  const cleanedUsername = username
    .toLowerCase()
    .trim()
    .replace(/[^a-zA-Z\s]/g, "") // Remove ALL special characters, keep only letters and spaces
    .replace(/\s+/g, " ") // Normalize multiple spaces to single spaces

  // Take only the first two words
  const words = cleanedUsername.split(" ")
  const firstTwoWords = words.slice(0, 2).join(" ")

  // Convert to URL-friendly format
  return firstTwoWords
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with a single hyphen
    .replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
}

// Client-safe version that doesn't directly use server components
export async function generateCaseId(): Promise<string> {
  try {
    // Make a fetch request to an API endpoint that will generate the case ID
    const response = await fetch("/api/case-id", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to generate case ID")
    }

    const data = await response.json()
    return data.caseId
  } catch (error) {
    console.error("Error generating case ID:", error)
    // Fallback to a random number if there's an error
    return `L${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`
  }
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) {
    return "Unknown date"
  }

  try {
    const date = new Date(dateString)

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Invalid date"
    }

    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  } catch (error) {
    console.error("Error formatting date:", error, "Date string:", dateString)
    return "Invalid date"
  }
}
