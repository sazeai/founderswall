import HomeClient from "@/components/HomeClient"
import RevampedHero from "@/components/revamped-hero"
import InPeriodLaunches from "@/components/InPeriodLaunches.server"
import { getMugshots } from "@/lib/mugshot-service-client"
import { Suspense } from "react"
import type { Mugshot } from "@/lib/types"

// Fetch products from API route
async function getProducts() {
  const isServer = typeof window === "undefined"
  const baseUrl = isServer
    ? process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    : ""
  const res = await fetch(`${baseUrl}/api/products?limit=1000`, { cache: "no-store" })
  if (!res.ok) return []
  return res.json()
}


export default async function HomeServer() {
  // Fetch mugshots and products on the server
  const mugshots: Mugshot[] = await getMugshots()
  const products = await getProducts()

  // Calculate product counts per founder (mugshots.id)
  const productCounts: Record<string, number> = {}
  if (Array.isArray(products)) {
    products.forEach((product: any) => {
      if (product.founderId) {
        productCounts[product.founderId as string] = (productCounts[product.founderId as string] || 0) + 1
      }
    })
  }

  // Fetch in-period launches for the launches section
  // Use the same logic as the original InPeriodLaunches
  let launches: any[] = []
  let launchesError: string | null = null
  try {
    const { getCurrentLaunchPeriod } = await import("@/lib/launch-period")
    const { start, end } = getCurrentLaunchPeriod()
    const isServer = typeof window === "undefined"
    const baseUrl = isServer ? process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000" : ""
    const res = await fetch(`${baseUrl}/api/products?in_period=1&start=${start.toISOString()}&end=${end.toISOString()}`)
    if (!res.ok) throw new Error("Failed to load launches")
    launches = await res.json()
  } catch (e: any) {
    launchesError = e?.message || "Failed to load launches"
  }

  return (
    <>
      <RevampedHero />
      <InPeriodLaunches products={launches} error={launchesError} />
      <HomeClient
        mugshots={mugshots}
        productCounts={productCounts}
      />
    </>
  )
}
