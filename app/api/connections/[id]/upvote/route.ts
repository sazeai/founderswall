import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export const dynamic = "force-dynamic"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const connectionId = params.id

  if (!connectionId) {
    return NextResponse.json({ success: false, error: "Connection ID is required" }, { status: 400 })
  }

  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ success: false, error: "Authentication required to upvote connections." }, { status: 401 })
  }

  // Check if the user has already upvoted this connection
  const { data: existingUpvote, error: checkError } = await supabase
    .from("upvotes")
    .select("id")
    .eq("connection_id", connectionId)
    .eq("user_id", user.id)
    .single()

  if (checkError && checkError.code !== "PGRST116") {
    // PGRST116 is "not found" which is expected if no upvote exists
    return NextResponse.json({ success: false, error: "Failed to check existing upvote. Please try again." }, { status: 500 })
  }

  // If the user has already upvoted, return an error
  if (existingUpvote) {
    return NextResponse.json({ success: false, error: "You have already upvoted this connection." }, { status: 400 })
  }

  // Add the upvote record
  const { error: insertError } = await supabase.from("upvotes").insert({
    connection_id: connectionId,
    user_id: user.id,
  })

  if (insertError) {
    return NextResponse.json({ success: false, error: "Failed to upvote connection. Please try again." }, { status: 500 })
  }

  // Increment the upvote count in the connections table
  const { data: updatedConnection, error: updateError } = await supabase.rpc("increment_connection_upvotes", {
    connection_id: connectionId,
  })

  if (updateError) {
    return NextResponse.json({ success: false, error: "Failed to update upvote count. Please try again." }, { status: 500 })
  }

  // Get the new upvote count
  const { data: connection, error: getError } = await supabase
    .from("connections")
    .select("upvotes")
    .eq("id", connectionId)
    .single()

  if (getError) {
    return NextResponse.json({ success: false, error: "Failed to retrieve updated upvote count" }, { status: 500 })
  }

  return NextResponse.json({ success: true, newUpvoteCount: connection.upvotes })
}
