import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export const dynamic = "force-dynamic"

interface CachedOwnership {
  timestamp: number;
  data: { isOwner: boolean };
}

const ownershipCache = new Map<string, CachedOwnership>();
const OWNERSHIP_CACHE_DURATION = 30000; // 30 seconds

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  const supabase = await createClient()
  const { slug } = await context.params

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
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
    return NextResponse.json({ isOwner: false })
  }
}
