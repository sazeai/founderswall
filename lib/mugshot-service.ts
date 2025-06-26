import { createClient } from "@/utils/supabase/server"
import type { Mugshot } from "./types"
import { normalizeUsername } from "./utils"

// Add a simple cache at the top of the file
let mugshotsCache: { data: Mugshot[]; timestamp: number } | null = null
const CACHE_DURATION = 30000 // 30 seconds

// Helper function to get badge type for a user
async function getBadgeTypeForUser(userId: string | null): Promise<Mugshot['badgeType']> {
  if (!userId) return "wanted"

  const supabase = await createClient()
  const { data, error } = await supabase.from("user_profiles").select("badge_type").eq("user_id", userId).single()

  if (error || !data) {
    return "wanted"
  }

  const badge = data.badge_type
  if (badge === "community_pick" || badge === "startup_saviour" || badge === "wanted") {
    return badge;
  }
  return "wanted" // Default if not a recognized type
}

// Helper function to get badge types for multiple users
async function getBadgeTypesForUsers(userIds: (string | null)[]): Promise<Record<string, Mugshot['badgeType']>> {
  const validUserIds = userIds.filter((id): id is string => id !== null)
  if (validUserIds.length === 0) return {}

  const supabase = await createClient()
  const { data, error } = await supabase.from("user_profiles").select("user_id, badge_type").in("user_id", validUserIds)

  if (error || !data) {
    return {}
  }

  const badgeMap: Record<string, Mugshot['badgeType']> = {}
  data.forEach((profile) => {
    const badge = profile.badge_type;
    if (badge === "community_pick" || badge === "startup_saviour" || badge === "wanted") {
      badgeMap[profile.user_id] = badge;
    } else {
      badgeMap[profile.user_id] = "wanted"; // Default if not a recognized type
    }
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
  }))

  // Update cache
  mugshotsCache = { data: result, timestamp: Date.now() }

  return result
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
  }))
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
  }))
}

export async function getMugshotsByUserIds(userIds: string[]): Promise<Mugshot[]> {
  if (!userIds.length) return []

  const supabase = await createClient()

  const { data, error } = await supabase.from("mugshots").select("*").in("user_id", userIds)

  if (error) {
    console.error("Error fetching mugshots by user IDs:", error)
    return []
  }

  // Get badge types for all users
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

    // Normalize the URL username using the same logic as the frontend
    const normalizedUrlUsername = normalizeUsername(username)

    // Find the mugshot with a matching normalized name
    const matchingMugshot = data.find((mugshot) => {
      // Normalize the database name using the same logic
      const normalizedDbName = normalizeUsername(mugshot.name)
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
    }
  } catch (error) {
    return null
  }
}
