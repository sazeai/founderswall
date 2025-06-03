import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export const dynamic = "force-dynamic"

interface CachedOwnership {
  timestamp: number;
  data: { isOwner: boolean };
}

const ownershipCache = new Map<string, CachedOwnership>();
const OWNERSHIP_CACHE_DURATION = 30000; // 30 seconds

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const supabase = await createClient()
  const slug = params.slug

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      // For non-logged-in users, ownership is always false and doesn't need user-specific caching key part.
      // However, to keep cache structure simple, we can return directly or use a generic key if we were to cache this.
      return NextResponse.json({ isOwner: false })
    }

    const cacheKey = `ownership-${user.id}-${slug}`;
    const cachedEntry = ownershipCache.get(cacheKey);
    if (cachedEntry && Date.now() - cachedEntry.timestamp < OWNERSHIP_CACHE_DURATION) {
      console.log(`Cache HIT for ownership: user ${user.id}, slug ${slug}`);
      return NextResponse.json(cachedEntry.data);
    }
    console.log(`Cache MISS for ownership: user ${user.id}, slug ${slug}`);

    const { data: product, error: fetchError } = await supabase.from("products").select("founder_id").eq("slug", slug).single()

    if (fetchError || !product) {
      ownershipCache.set(cacheKey, { timestamp: Date.now(), data: { isOwner: false } });
      return NextResponse.json({ isOwner: false })
    }

    const { data: mugshot, error: mugshotError } = await supabase
      .from("mugshots")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (mugshotError || !mugshot) {
      ownershipCache.set(cacheKey, { timestamp: Date.now(), data: { isOwner: false } });
      return NextResponse.json({ isOwner: false })
    }

    const isOwner = mugshot.id === product.founder_id
    ownershipCache.set(cacheKey, { timestamp: Date.now(), data: { isOwner } });
    return NextResponse.json({ isOwner })

  } catch (error) {
    // Avoid caching general errors unless specific strategy is in place
    return NextResponse.json({ isOwner: false })
  }
}
