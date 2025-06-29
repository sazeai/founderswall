import { Suspense } from "react"
import HomeClient from "@/components/HomeClient"
import BadgeSection from "@/components/badge-section"
import LoadingMugshotWall from "@/components/loading-mugshot-wall"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "FoundersWall - Where Indie Hackers Build in Public",
  description:
    "Join the community of indie hackers building in public. Share your journey, connect with fellow builders, and showcase your products on the wall.",
  keywords: "indie hackers, build in public, startup community, founders, entrepreneurs, product launches",
  openGraph: {
    title: "FoundersWall - Where Indie Hackers Build in Public",
    description:
      "Join the community of indie hackers building in public. Share your journey, connect with fellow builders, and showcase your products on the wall.",
    type: "website",
    url: "https://founderswall.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "FoundersWall - Where Indie Hackers Build in Public",
    description:
      "Join the community of indie hackers building in public. Share your journey, connect with fellow builders, and showcase your products on the wall.",
  },
}

export default function HomePage() {
  return (
    <>
      <Suspense fallback={<LoadingMugshotWall />}>
        <HomeClient />
      </Suspense>

      {/* Server-side rendered badges for SEO */}
      <BadgeSection />
    </>
  )
}
