import { createClient } from "@/utils/supabase/server"

// Server-side implementation of generateCaseId
export async function generateCaseIdServer(): Promise<string> {
  const supabase = await createClient()

  // Get the count of existing products
  const { count, error } = await supabase.from("products").select("*", { count: "exact", head: true })

  if (error) {
    console.error("Error getting product count:", error)
    // Fallback to a random number if there's an error
    return `L${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`
  }

  // Generate a case ID with the format L001, L002, etc.
  const nextNumber = (count || 0) + 1
  return `L${nextNumber.toString().padStart(3, "0")}`
}
