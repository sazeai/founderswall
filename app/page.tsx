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
      {/* Server-rendered Hero section for SEO */}
      <section className="bg-black py-24 sm:pt-24 pb-12 relative overflow-hidden">
        <div className="relative z-10 flex flex-row items-start justify-between px-4 sm:px-8 lg:px-16 max-w-7xl mx-auto">
          {/* Mascot and PH badge */}
          <div className="flex-shrink-0 flex flex-col items-center justify-start pt-4 gap-0" style={{ minWidth: 120 }}>
            <img
              src="/caught-shipping.webp"
              alt="Caught Shipping Mascot"
              className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 drop-shadow-2xl -mb-4 z-10"
              style={{ objectFit: "contain" }}
            />
            <a
              href="https://www.producthunt.com/products/founderswall?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-founderswall"
              target="_blank"
              rel="noopener noreferrer"
              className="block relative z-0"
              style={{ marginTop: 0 }}
            >
              <img
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=983121&theme=dark&t=1750987443834"
                alt="FoundersWall - Where founders show the chaos, not just the launch | Product Hunt"
                className="w-32 h-7 md:w-48 md:h-10 lg:w-56 lg:h-12 shadow-lg border-2 border-black bg-yellow-100 rounded-md"
                width="200"
                height="43"
                style={{ marginTop: '-1.5rem' }}
              />
            </a>
          </div>
          {/* Heading and subheading */}
          <div className="flex-1 flex flex-col items-start justify-center pl-8">
            <h1
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-none tracking-tight mb-4"
              style={{
                background: "linear-gradient(135deg,#fbbf24 0%,#ef4444 50%,#10b981 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(3px 3px 0 rgba(220,38,38,0.8))",
              }}
            >
              BUILD. LAUNCH. REPEAT.
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white font-semibold max-w-2xl leading-relaxed mt-2">
              The underground hideout where real builders turn wild ideas into cold hard cash and get caught shipping every damn day.
            </p>
          </div>
        </div>
      </section>

      <Suspense fallback={<LoadingMugshotWall />}>
        <HomeClient />
      </Suspense>

      {/* Server-side rendered badges for SEO */}
      <BadgeSection />
    </>
  )
}
