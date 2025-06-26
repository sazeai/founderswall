import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import type { Mugshot } from "@/lib/types"
import { normalizeUsername } from "@/lib/utils"

export async function GET() {
  const supabase = await createClient()

  try {
    // First get all mugshots
    const { data: mugshotsData, error: mugshotsError } = await supabase
      .from("mugshots")
      .select("*")
      .order("created_at", { ascending: false })

    if (mugshotsError) {
      return NextResponse.json({ error: mugshotsError.message }, { status: 500 })
    }

    // Then get all user profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from("user_profiles")
      .select("user_id, badge_type")

    // Create a map of user_id to badge_type for quick lookup
    const profilesMap = new Map()
    if (profilesData) {
      profilesData.forEach((profile) => {
        profilesMap.set(profile.user_id, profile.badge_type)
      })
    }

    // Transform the data to match the expected format
    const mugshots = mugshotsData.map((item) => ({
      id: item.id,
      name: item.name,
      crime: item.crime,
      note: item.note,
      imageUrl: item.image_url,
      mugshotUrl: item.mugshot_url,
      productUrl: item.product_url,
      twitterHandle: item.twitter_handle,
      likes: item.likes || 0,
      createdAt: item.created_at,
      userId: item.user_id,
      badgeType: profilesMap.get(item.user_id) || "wanted", // Get badge from profiles map
      featured: item.featured || false,
      accessType: item.access_type,
      paymentStatus: item.payment_status,
      connections: item.connections || [],
      slug: item.slug,
    })) as Mugshot[]

    return NextResponse.json(mugshots)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch mugshots" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()

  try {
    const mugshotData = await request.json()

    // Generate a unique slug: normalized name + short random string
    const normalizedName = normalizeUsername(mugshotData.name)
    const randomString = Math.random().toString(36).substring(2, 10)
    const slug = `${normalizedName}-${randomString}`

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
          slug: slug,
        },
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform the data to match the expected format
    const mugshot = {
      id: data.id,
      name: data.name,
      crime: data.crime,
      note: data.note,
      imageUrl: data.image_url,
      mugshotUrl: data.mugshot_url,
      productUrl: data.product_url,
      twitterHandle: data.twitter_handle,
      likes: data.likes || 0,
      createdAt: data.created_at,
      userId: data.user_id,
      badgeType: "wanted", // New mugshots start as wanted
      featured: false,
      accessType: data.access_type,
      paymentStatus: data.payment_status,
      connections: [],
      slug: data.slug,
    } as Mugshot

    return NextResponse.json(mugshot)
  } catch (error) {
    return NextResponse.json({ error: "An unexpected error occurred. Please try again." }, { status: 500 })
  }
}
