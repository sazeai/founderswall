import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

// Add this line to mark the route as dynamic
export const dynamic = "force-dynamic"

export async function GET() {
  const supabase = await createClient()

  // Get the count of existing products
  const { count, error } = await supabase.from("products").select("*", { count: "exact", head: true })

  if (error) {
    return NextResponse.json({ error: "Failed to generate case ID" }, { status: 500 })
  }

  // Generate a case ID with the format L001, L002, etc.
  const nextNumber = (count || 0) + 1
  const caseId = `L${nextNumber.toString().padStart(3, "0")}`

  return NextResponse.json({ caseId })
}
