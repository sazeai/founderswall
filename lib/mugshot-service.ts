import { createClient } from "@/utils/supabase/server"
import type { Mugshot, Connection } from "./types"

// Add a simple cache at the top of the file
let mugshotsCache: { data: Mugshot[]; timestamp: number } | null = null
const CACHE_DURATION = 30000 // 30 seconds

// Helper function to get badge type for a user
async function getBadgeTypeForUser(userId: string | null): Promise<string> {
  if (!userId) return "wanted"

  const supabase = await createClient()
  const { data, error } = await supabase.from("user_profiles").select("badge_type").eq("user_id", userId).single()

  if (error || !data) {
    return "wanted"
  }

  return data.badge_type || "wanted"
}

// Helper function to get badge types for multiple users
async function getBadgeTypesForUsers(userIds: (string | null)[]): Promise<Record<string, string>> {
  const validUserIds = userIds.filter((id): id is string => id !== null)
  if (validUserIds.length === 0) return {}

  const supabase = await createClient()
  const { data, error } = await supabase.from("user_profiles").select("user_id, badge_type").in("user_id", validUserIds)

  if (error || !data) {
    return {}
  }

  const badgeMap: Record<string, string> = {}
  data.forEach((profile) => {
    badgeMap[profile.user_id] = profile.badge_type || "wanted"
  })

  // Fill in missing users with default badge
  validUserIds.forEach((userId) => {
    if (!badgeMap[userId]) {
      badgeMap[userId] = "wanted"
    }
  })

  return badgeMap
}

export async function getMugshots(): Promise<Mugshot[]> {
  // Check cache first
  if (mugshotsCache && Date.now() - mugshotsCache.timestamp < CACHE_DURATION) {
    return mugshotsCache.data
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("mugshots")
    .select("*")
    .eq("payment_status", "completed")
    .order("created_at", { ascending: false })

  if (error) {
    return []
  }

  // Get badge types for all users in one batch
  const userIds = data.map((mugshot) => mugshot.user_id)
  const badgeMap = await getBadgeTypesForUsers(userIds)

  const result = data.map((mugshot) => ({
    id: mugshot.id,
    name: mugshot.name,
    crime: mugshot.crime,
    note: mugshot.note,
    imageUrl: mugshot.image_url,
    mugshotUrl: mugshot.mugshot_url,
    productUrl: mugshot.product_url,
    twitterHandle: mugshot.twitter_handle,
    userId: mugshot.user_id,
    createdAt: mugshot.created_at,
    likes: mugshot.likes || 0,
    badgeType: badgeMap[mugshot.user_id || ""] || "wanted",
    featured: mugshot.featured || false,
    accessType: mugshot.access_type,
    paymentStatus: mugshot.payment_status,
    connections: mugshot.connections || [],
  }))

  // Update cache
  mugshotsCache = { data: result, timestamp: Date.now() }

  return result
}

export async function getConnections() {
  const supabase = await createClient()

  const { data, error } = await supabase.from("connections").select("*").order("created_at", { ascending: false })

  if (error) {
    return []
  }

  return data as Connection[]
}

export async function getMugshotById(id: string): Promise<Mugshot | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("mugshots").select("*").eq("id", id).single()

  if (error) {
    return null
  }

  const badgeType = await getBadgeTypeForUser(data.user_id)

  return {
    id: data.id,
    name: data.name,
    crime: data.crime,
    note: data.note,
    imageUrl: data.image_url,
    mugshotUrl: data.mugshot_url,
    productUrl: data.product_url,
    twitterHandle: data.twitter_handle,
    userId: data.user_id,
    createdAt: data.created_at,
    likes: data.likes || 0,
    badgeType: badgeType,
    featured: data.featured || false,
    accessType: data.access_type,
    paymentStatus: data.payment_status,
    connections: data.connections || [],
  }
}

export async function createMugshot(mugshotData: Omit<Mugshot, "id" | "createdAt" | "likes">) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("mugshots")
    .insert([
      {
        name: mugshotData.name,
        crime: mugshotData.crime,
        note: mugshotData.note,
        image_url: mugshotData.imageUrl,
        mugshot_url: mugshotData.mugshotUrl,
        product_url: mugshotData.productUrl,
        twitter_handle: mugshotData.twitterHandle,
        user_id: mugshotData.userId,
      },
    ])
    .select()
    .single()

  if (error) {
    return { mugshot: null, error: error.message }
  }

  return {
    mugshot: data as Mugshot,
    error: null,
  }
}

export async function createConnection(connection: Omit<Connection, "id" | "createdAt">) {
  const supabase = await createClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      connection: null,
      error: "Authentication required to create connections.",
    }
  }

  // Ensure we're not creating a connection from a criminal to themselves
  if (connection.fromCriminalId === connection.toCriminalId) {
    return {
      connection: null,
      error: "Cannot create a connection from a criminal to themselves.",
    }
  }

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
      return {
        connection: null,
        error: "This connection already exists. Try a different connection type or criminals.",
      }
    }

    return {
      connection: null,
      error: "Failed to create connection. Please try again.",
    }
  }

  // Add an upvote record for the creator
  await supabase.from("upvotes").insert({
    connection_id: data.id,
    user_id: user.id,
  })

  return {
    connection: data as Connection,
    error: null,
  }
}

export async function updateMugshot(id: string, mugshotData: Partial<Omit<Mugshot, "id" | "createdAt">>) {
  const supabase = await createClient()

  // Get the current user to ensure we're updating the right mugshot
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { mugshot: null, error: "Authentication required" }
  }

  // First, let's check if the mugshot exists and belongs to the user
  const { data: existingMugshot, error: checkError } = await supabase
    .from("mugshots")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id) // Ensure it belongs to the current user
    .single()

  if (checkError) {
    // If not found by ID + user_id, try to find by user_id only (in case ID is wrong)
    const { data: userMugshot, error: userCheckError } = await supabase
      .from("mugshots")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (userCheckError) {
      return { mugshot: null, error: "Mugshot not found or you don't have permission to update it" }
    }

    // Use the correct ID for the update
    id = userMugshot.id
  }

  // Now update the mugshot using the correct ID
  const { data, error } = await supabase
    .from("mugshots")
    .update({
      name: mugshotData.name,
      crime: mugshotData.crime,
      note: mugshotData.note,
      image_url: mugshotData.imageUrl,
      mugshot_url: mugshotData.mugshotUrl,
      product_url: mugshotData.productUrl,
      twitter_handle: mugshotData.twitterHandle,
      likes: mugshotData.likes,
    })
    .eq("id", id)
    .eq("user_id", user.id) // Double-check ownership
    .select()

  if (error) {
    return { mugshot: null, error: error.message }
  }

  if (!data || data.length === 0) {
    return { mugshot: null, error: "No mugshot was updated - record may not exist or you may not have permission" }
  }

  // Get the updated mugshot with badge type
  const updatedMugshot = data[0]
  const badgeType = await getBadgeTypeForUser(updatedMugshot.user_id)

  const result = {
    id: updatedMugshot.id,
    name: updatedMugshot.name,
    crime: updatedMugshot.crime,
    note: updatedMugshot.note,
    imageUrl: updatedMugshot.image_url,
    mugshotUrl: updatedMugshot.mugshot_url,
    productUrl: updatedMugshot.product_url,
    twitterHandle: updatedMugshot.twitter_handle,
    userId: updatedMugshot.user_id,
    createdAt: updatedMugshot.created_at,
    likes: updatedMugshot.likes || 0,
    badgeType: badgeType,
    featured: updatedMugshot.featured || false,
    accessType: updatedMugshot.access_type,
    paymentStatus: updatedMugshot.payment_status,
    connections: updatedMugshot.connections || [],
  }

  return {
    mugshot: result as Mugshot,
    error: null,
  }
}

export async function deleteMugshot(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("mugshots").delete().eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  return {
    success: true,
    error: null,
  }
}

export async function getMugshotsByUserId(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("mugshots")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    return []
  }

  const badgeType = await getBadgeTypeForUser(userId)

  return data.map((mugshot) => ({
    id: mugshot.id,
    name: mugshot.name,
    crime: mugshot.crime,
    note: mugshot.note,
    imageUrl: mugshot.image_url,
    mugshotUrl: mugshot.mugshot_url,
    productUrl: mugshot.product_url,
    twitterHandle: mugshot.twitter_handle,
    userId: mugshot.user_id,
    createdAt: mugshot.created_at,
    likes: mugshot.likes || 0,
    badgeType: badgeType,
    featured: mugshot.featured || false,
    accessType: mugshot.access_type,
    paymentStatus: mugshot.payment_status,
    connections: mugshot.connections || [],
  }))
}

export async function checkConnectionExists(
  fromCriminalId: string,
  toCriminalId: string,
  connectionType: string,
): Promise<boolean> {
  const supabase = await createClient()

  // Check in both directions since connections are bidirectional
  const { data, error } = await supabase
    .from("connections")
    .select("id")
    .or(
      `and(from_criminal_id.eq.${fromCriminalId},to_criminal_id.eq.${toCriminalId}),and(from_criminal_id.eq.${toCriminalId},to_criminal_id.eq.${fromCriminalId})`,
    )
    .eq("connection_type", connectionType)

  if (error) {
    return false
  }

  return data.length > 0
}

export async function updateConnection(
  connectionId: string,
  updates: Partial<Omit<Connection, "id" | "createdAt">>,
): Promise<{
  connection: Connection | null
  error: string | null
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("connections")
    .update({
      evidence: updates.evidence,
      connection_type: updates.connectionType,
    })
    .eq("id", connectionId)
    .select()
    .single()

  if (error) {
    return {
      connection: null,
      error: "Failed to update connection. Please try again.",
    }
  }

  return {
    connection: data as Connection,
    error: null,
  }
}

export async function upvoteConnection(
  connectionId: string,
  userId: string,
): Promise<{
  success: boolean
  error: string | null
  newUpvoteCount?: number
}> {
  const supabase = await createClient()

  // Check if the user has already upvoted this connection
  const { data: existingUpvote, error: checkError } = await supabase
    .from("upvotes")
    .select("id")
    .eq("connection_id", connectionId)
    .eq("user_id", userId)
    .single()

  if (checkError && checkError.code !== "PGRST116") {
    // PGRST116 is "not found" which is expected if no upvote exists
    return {
      success: false,
      error: "Failed to check existing upvote. Please try again.",
    }
  }

  // If the user has already upvoted, return an error
  if (existingUpvote) {
    return {
      success: false,
      error: "You have already upvoted this connection.",
    }
  }

  // Add the upvote record
  const { error: insertError } = await supabase.from("upvotes").insert({
    connection_id: connectionId,
    user_id: userId,
  })

  if (insertError) {
    return {
      success: false,
      error: "Failed to upvote connection. Please try again.",
    }
  }

  // Increment the upvote count in the connections table
  const { data: updatedConnection, error: updateError } = await supabase.rpc("increment_connection_upvotes", {
    connection_id: connectionId,
  })

  if (updateError) {
    return {
      success: false,
      error: "Failed to update upvote count. Please try again.",
    }
  }

  // Get the new upvote count
  const { data: connection, error: getError } = await supabase
    .from("connections")
    .select("upvotes")
    .eq("id", connectionId)
    .single()

  if (getError) {
    return {
      success: true, // Still return success since the upvote was added
      error: null,
      newUpvoteCount: 0, // Default value
    }
  }

  return {
    success: true,
    error: null,
    newUpvoteCount: connection.upvotes,
  }
}

export async function deleteConnection(connectionId: string): Promise<{
  success: boolean
  error: string | null
}> {
  const supabase = await createClient()

  // First delete any upvotes for this connection
  const { error: upvotesError } = await supabase.from("upvotes").delete().eq("connection_id", connectionId)

  if (upvotesError) {
    return {
      success: false,
      error: "Failed to delete connection upvotes.",
    }
  }

  // Then delete the connection
  const { error } = await supabase.from("connections").delete().eq("id", connectionId)

  if (error) {
    return {
      success: false,
      error: "Failed to delete connection.",
    }
  }

  return {
    success: true,
    error: null,
  }
}

export async function getMugshotsByIds(ids: string[]): Promise<Mugshot[]> {
  if (!ids.length) return []

  const supabase = await createClient()

  const { data, error } = await supabase.from("mugshots").select("*").in("id", ids)

  if (error) {
    return []
  }

  // Get badge types for all users
  const userIds = data.map((mugshot) => mugshot.user_id)
  const badgeMap = await getBadgeTypesForUsers(userIds)

  return data.map((mugshot) => ({
    id: mugshot.id,
    name: mugshot.name,
    crime: mugshot.crime,
    note: mugshot.note,
    imageUrl: mugshot.image_url,
    mugshotUrl: mugshot.mugshot_url,
    productUrl: mugshot.product_url,
    twitterHandle: mugshot.twitter_handle,
    userId: mugshot.user_id,
    createdAt: mugshot.created_at,
    likes: mugshot.likes || 0,
    badgeType: badgeMap[mugshot.user_id || ""] || "wanted",
    featured: mugshot.featured || false,
    accessType: mugshot.access_type,
    paymentStatus: mugshot.payment_status,
    connections: mugshot.connections || [],
  }))
}

export async function getMugshotByUsername(username: string): Promise<Mugshot | null> {
  const supabase = await createClient()

  try {
    // Get all mugshots first
    const { data, error } = await supabase.from("mugshots").select("*")

    if (error) {
      return null
    }

    // Normalize the URL username (lowercase, replace hyphens with spaces for comparison)
    const normalizedUrlUsername = username.toLowerCase().replace(/-/g, " ")

    // Find the mugshot with a matching normalized name
    const matchingMugshot = data.find((mugshot) => {
      // Normalize the database name (lowercase)
      const normalizedDbName = mugshot.name.toLowerCase()

      // Compare the normalized names
      return normalizedDbName === normalizedUrlUsername
    })

    if (!matchingMugshot) {
      return null
    }

    // Get badge type for this user
    const badgeType = await getBadgeTypeForUser(matchingMugshot.user_id)

    return {
      id: matchingMugshot.id,
      name: matchingMugshot.name,
      crime: matchingMugshot.crime,
      note: matchingMugshot.note,
      imageUrl: matchingMugshot.image_url,
      mugshotUrl: matchingMugshot.mugshot_url,
      productUrl: matchingMugshot.product_url,
      twitterHandle: matchingMugshot.twitter_handle,
      userId: matchingMugshot.user_id,
      createdAt: matchingMugshot.created_at,
      likes: matchingMugshot.likes || 0,
      badgeType: badgeType,
      featured: matchingMugshot.featured || false,
      accessType: matchingMugshot.access_type,
      paymentStatus: matchingMugshot.payment_status,
      connections: matchingMugshot.connections || [],
    }
  } catch (error) {
    return null
  }
}
