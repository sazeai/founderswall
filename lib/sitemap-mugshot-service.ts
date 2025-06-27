import { createClient } from "@/utils/supabase/server";
import type { Mugshot } from "./types";

// Fetch ALL mugshots for sitemap (no payment_status filter)
export async function getAllMugshotsForSitemap(): Promise<Mugshot[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("mugshots")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  // Map to Mugshot type (camelCase)
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
    badgeType: mugshot.badge_type || "wanted",
    featured: mugshot.featured || false,
    accessType: mugshot.access_type,
    paymentStatus: mugshot.payment_status,
  }));
}
