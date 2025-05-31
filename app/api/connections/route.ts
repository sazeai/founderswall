import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import type { Connection } from "@/lib/types"

export const dynamic = "force-dynamic"

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase.from("connections").select("*").order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Transform the data to match the expected format
  const connections = data.map((item) => ({
    id: item.id,
    fromCriminalId: item.from_criminal_id,
    toCriminalId: item.to_criminal_id,
    connectionType: item.connection_type,
    evidence: item.evidence,
    createdBy: item.created_by,
    upvotes: item.upvotes || 0,
    createdAt: item.created_at,
  })) as Connection[]

  return NextResponse.json(connections)
}

export async function POST(request: Request) {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Authentication required to create connections." }, { status: 401 })
  }

  try {
    const connection = await request.json()

    // Ensure we're not creating a connection from a criminal to themselves
    if (connection.fromCriminalId === connection.toCriminalId) {
      return NextResponse.json({ error: "Cannot create a connection from a criminal to themselves." }, { status: 400 })
    }

    // Add the authenticated user's ID as the creator
    const { data, error } = await supabase
      .from("connections")
      .insert({
        from_criminal_id: connection.fromCriminalId,
        to_criminal_id: connection.toCriminalId,
        connection_type: connection.connectionType,
        evidence: connection.evidence,
        created_by: user.id, // Use the authenticated user's ID
        upvotes: 1, // Start with 1 upvote (from the creator)
      })
      .select()
      .single()

    if (error) {
      // Handle unique constraint violation
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "This connection already exists. Try a different connection type or criminals." },
          { status: 400 },
        )
      }

      return NextResponse.json({ error: "Failed to create connection. Please try again." }, { status: 500 })
    }

    // Add an upvote record for the creator
    await supabase.from("upvotes").insert({
      connection_id: data.id,
      user_id: user.id,
    })

    // Transform the data to match the expected format
    const newConnection = {
      id: data.id,
      fromCriminalId: data.from_criminal_id,
      toCriminalId: data.to_criminal_id,
      connectionType: data.connection_type,
      evidence: data.evidence,
      createdBy: data.created_by,
      upvotes: data.upvotes || 1,
      createdAt: data.created_at,
    } as Connection

    return NextResponse.json(newConnection)
  } catch (error) {
    return NextResponse.json({ success: false, error: "An unexpected error occurred. Please try again." }, { status: 500 })
  }
}
