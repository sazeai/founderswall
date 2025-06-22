import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getProductBySlug } from "@/lib/product-service"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink, Tag, User, Calendar, Twitter, Github } from "lucide-react"
import UpvoteButton from "./upvote-button"
import { getMugshotById } from "@/lib/mugshot-service"
import { PublicHeader } from "@/components/public-header"
import PublicFooter from "@/components/public-footer"

import TimelineSection from "./timeline-section"
import type { Metadata } from "next"

// Smart description function for schema
function getSchemaDescription(product: any) {
  // 1. Use summary points if available (join first 2-3 points)
  if (product.summary && product.summary.length > 0) {
    const summaryText = product.summary.slice(0, 2).join(". ") + "."
    return summaryText.length > 160 ? summaryText.substring(0, 157) + "..." : summaryText
  }

  // 2. Truncate description to 160 chars
  if (product.description) {
    return product.description.length > 160 ? product.description.substring(0, 157) + "..." : product.description
  }

  // 3. Fallback
  return `${product.title} - A legendary build by ${product.founderName || "an indie maker"}`
}

// Add metadata generation for individual product pages
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const awaitedParams = await params
  const normalizedSlug = awaitedParams.slug.toLowerCase()
  const { product, error } = await getProductBySlug(normalizedSlug)

  if (error || !product) {
    return {
      title: "Product Not Found - FoundersWall",
      description: "The requested product could not be found on FoundersWall.",
    }
  }

  // Get founder info for richer metadata
  let founderMugshot = null
  if (product.founderId) {
    founderMugshot = await getMugshotById(product.founderId)
  }

  const title = `${product.title} by ${product.founderName || "Unknown Builder"} - FoundersWall`
  const description = product.description
    ? `${product.description.slice(0, 140)}... Built by legendary indie maker ${product.founderName || "an unknown builder"}. Discover the build story, timeline, and community feedback.`
    : `${product.title} - A legendary build by ${product.founderName || "an indie maker"}. Explore this innovative ${product.category || "product"} and the story behind its creation on FoundersWall.`

  const ogImage = product.screenshotUrl || product.logoUrl || "/og-default.png"
  const canonicalUrl = `https://founderswall.com/launch/${product.slug}`

  return {
    title,
    description,
    keywords: [
      product.title,
      product.founderName || "",
      product.category || "",
      "indie maker",
      "startup",
      "product launch",
      "build in public",
      "SaaS",
      "legendary builder",
      ...(product.tags || []),
    ]
      .filter(Boolean)
      .join(", "),
    authors: [{ name: product.founderName || "Unknown Builder" }],
    creator: product.founderName || "Unknown Builder",
    publisher: "FoundersWall",
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "FoundersWall",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${product.title} - Product screenshot`,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
      creator: founderMugshot?.twitterHandle || "@founderswall",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  }
}

export const dynamic = "force-dynamic"

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const awaitedParams = await params
  // Normalize the slug to lowercase to ensure case-insensitive matching
  const normalizedSlug = awaitedParams.slug.toLowerCase()

  const { product, error } = await getProductBySlug(normalizedSlug)

  if (error || !product) {
    console.error("Error fetching product:", error)
    notFound()
  }

  // Get the founder's mugshot if available
  let founderMugshot = null
  if (product.founderId) {
    founderMugshot = await getMugshotById(product.founderId)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Add JSON-LD Schema for Product Page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              // Main SoftwareApplication schema
              {
                "@type": "SoftwareApplication",
                "@id": `https://founderswall.com/launch/${product.slug}#software`,
                name: product.title,
                description: getSchemaDescription(product),
                url: product.productUrl,
                applicationCategory: product.category || "BusinessApplication",
                operatingSystem: "Web",
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "USD",
                  availability: "https://schema.org/InStock",
                },
                screenshot: product.screenshotUrl,
                datePublished: product.launchDate,
                creator: {
                  "@type": "Person",
                  "@id": founderMugshot
                    ? `https://founderswall.com/maker/${founderMugshot.twitterHandle?.replace("@", "") || "unknown"}#person`
                    : undefined,
                  name: product.founderName || "Unknown Builder",
                  url: founderMugshot?.productUrl,
                  sameAs: founderMugshot?.twitterHandle
                    ? [`https://x.com/${founderMugshot.twitterHandle.replace("@", "")}`]
                    : undefined,
                },
                aggregateRating:
                  (product.upvotes || 0) > 0
                    ? {
                        "@type": "AggregateRating",
                        ratingValue: Math.min(5, Math.max(1, Math.round(((product.upvotes || 0) / 10) * 4) + 1)),
                        ratingCount: product.upvotes || 0,
                        bestRating: 5,
                        worstRating: 1,
                      }
                    : undefined,
                keywords: product.tags?.join(", "),
                inLanguage: "en-US",
                isAccessibleForFree: true,
              },
              // Breadcrumb schema
              {
                "@type": "BreadcrumbList",
                "@id": `https://founderswall.com/launch/${product.slug}#breadcrumb`,
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "Home",
                    item: "https://founderswall.com",
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "Launch Board",
                    item: "https://founderswall.com/launch",
                  },
                  {
                    "@type": "ListItem",
                    position: 3,
                    name: product.title,
                    item: `https://founderswall.com/launch/${product.slug}`,
                  },
                ],
              },
              // WebPage schema
              {
                "@type": "WebPage",
                "@id": `https://founderswall.com/launch/${product.slug}#webpage`,
                url: `https://founderswall.com/launch/${product.slug}`,
                name: `${product.title} by ${product.founderName || "Unknown Builder"} - FoundersWall`,
                description: getSchemaDescription(product),
                datePublished: product.launchDate,
                dateModified: product.updatedAt || product.launchDate,
                mainEntity: {
                  "@id": `https://founderswall.com/launch/${product.slug}#software`,
                },
               
                isPartOf: {
                  "@type": "WebSite",
                  "@id": "https://founderswall.com#website",
                },
                potentialAction: {
                  "@type": "ReadAction",
                  target: `https://founderswall.com/launch/${product.slug}`,
                },
              },
              // Timeline Events as Events
              ...(product.timelineEntries?.map((entry: any, index: number) => ({
                "@type": "Event",
                name: entry.title || `${product.title} Milestone ${index + 1}`,
                description: entry.description,
                startDate: entry.date,
                eventStatus: "https://schema.org/EventScheduled",
                eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
                organizer: {
                  "@type": "Person",
                  name: product.founderName || "Unknown Builder",
                },
                about: {
                  "@id": `https://founderswall.com/launch/${product.slug}#software`,
                },
              })) || []),
              // Review schema if there are upvotes
              ...((product.upvotes || 0) > 0
                ? [
                    {
                      "@type": "Review",
                      reviewRating: {
                        "@type": "Rating",
                        ratingValue: Math.min(5, Math.max(1, Math.round(((product.upvotes || 0) / 10) * 4) + 1)),
                        bestRating: 5,
                        worstRating: 1,
                      },
                      author: {
                        "@type": "Organization",
                        name: "FoundersWall Community",
                      },
                      reviewBody: `The FoundersWall community has given ${product.title} ${product.upvotes || 0} upvotes, recognizing it as a standout build by ${product.founderName || "an indie maker"}.`,
                      itemReviewed: {
                        "@id": `https://founderswall.com/launch/${product.slug}#software`,
                      },
                    },
                  ]
                : []),
            ],
          }),
        }}
      />
      <div className="container mx-auto px-4">
        {/* Add the PublicHeader */}
        <PublicHeader />

        {/* Main content */}
        <div className="pt-20 pb-16">
          {/* Back button */}
          <div className="h-12 flex items-center px-4">
            <Link href="/launch" className="flex items-center text-white font-bold">
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span>RETURN TO LAUNCH BOARD</span>
            </Link>
          </div>

          {/* Crime scene tape header */}
          <div className="relative mb-8">
            <div className="h-12 bg-yellow-400 relative overflow-hidden">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: "repeating-linear-gradient(45deg, #000 0, #000 10px, #f6e05e 10px, #f6e05e 20px)",
                  backgroundSize: "28px 28px",
                }}
              ></div>
            </div>
          </div>

          {/* Grid for Case Header, Main Content, and Right Column */}
          <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-6">
            {/* Left column: Case Header and Main Content */}
            <div className="lg:col-span-8">
              {/* Desktop Case File Header */}
              <div className="bg-zinc-900 hidden md:block border-l-4 border-red-600 p-4 md:p-6 mb-8">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Logo and title section */}
                    <div className="md:w-1/4">
                      <div className="text-center md:text-left mb-2">
                        <div className="inline-block bg-red-600 text-white px-2 py-1 mb-1 uppercase text-xs font-bold ">
                          Case #{product.caseId}
                        </div>
                        <h1 className="text-2xl font-bold text-gray-100 mb-2">{product.title}</h1>
                      </div>
                      <div className="bg-zinc-800 relative p-3 shadow-md mb-4 max-w-[160px] mx-auto md:mx-0 border-2">
                        <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs px-2 py-0.5 rotate-3 z-10 whitespace-nowrap">
                          EXHIBIT A
                        </div>
                        {product.logoUrl ? (
                          <Image
                            src={product.logoUrl || "/placeholder.svg"}
                            alt={`${product.title} logo`}
                            width={160}
                            height={160}
                            className="w-full h-auto object-contain"
                          />
                        ) : (
                          <div className="w-full aspect-square bg-gray-100 flex items-center justify-center">
                            <p className="text-gray-400">No logo</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Product details */}
                    <div className="md:w-3/4 bg-zinc-900">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-start gap-2">
                          <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                          <div>
                            <div className="text-xs text-gray-400">FILED ON</div>
                            <div className="text-gray-200">{formatDate(product.launchDate)}</div>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <User className="h-4 w-4 text-gray-400 mt-0.5" />
                          <div>
                            <div className="text-xs text-gray-400">FOUNDER</div>
                            <div className="text-gray-200">{product.founderName || "Unknown"}</div>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Tag className="h-4 w-4 text-gray-400 mt-0.5" />
                          <div>
                            <div className="text-xs text-gray-400">CATEGORY</div>
                            <div className="text-gray-200">{product.category}</div>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <div className="h-4 w-4 text-gray-400 mt-0.5">🏆</div>
                          <div>
                            <div className="text-xs text-gray-400">STATUS</div>
                            <div className="text-red-600 font-medium">{product.status || "Active"}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap mb-4 gap-2 justify-center md:justify-start">
                        {product.tags &&
                          product.tags.slice(0, 3).map((tag: string) => (
                            <span key={tag} className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-sm">
                              #{tag}
                            </span>
                          ))}
                        {product.tags && product.tags.length > 3 && (
                          <span className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-sm">
                            +{product.tags.length - 3} more
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <UpvoteButton productSlug={product.slug} initialUpvotes={product.upvotes || 0} />

                        {product.productUrl && (
                          <a
                            href={product.productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded inline-flex items-center font-medium transition-colors"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" /> Visit Website
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Case File Header */}
              <div className="bg-zinc-900 border-l-4 block md:hidden border-red-600 p-4 md:p-6 mb-8">
                <div className="flex flex-col md:flex-row items-start gap-4">
                  <div className="flex-grow">
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <div className="bg-red-600 text-white px-3 py-1 uppercase text-xs font-bold tracking-wider shadow-md shadow-red-600/50">
                        Case #{product.caseId}
                      </div>
                      <div className="text-zinc-400 text-sm">Filed on {formatDate(product.launchDate)}</div>
                    </div>

                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">{product.title}</h1>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {product.tags &&
                        product.tags.map((tag: string) => (
                          <span key={tag} className="bg-zinc-800 text-zinc-300 px-2 py-1 text-xs">
                            {tag}
                          </span>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-start">
                        <Tag className="h-4 w-4 text-red-500 mt-1 mr-2" />
                        <div>
                          <div className="text-xs text-zinc-500 uppercase">Category</div>
                          <div className="text-zinc-300">{product.category || "Uncategorized"}</div>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <User className="h-4 w-4 text-red-500 mt-1 mr-2" />
                        <div>
                          <div className="text-xs text-zinc-500 uppercase">Founder</div>
                          <div className="text-zinc-300">{product.founderName || "Unknown"}</div>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <Calendar className="h-4 w-4 text-red-500 mt-1 mr-2" />
                        <div>
                          <div className="text-xs text-zinc-500 uppercase">Status</div>
                          <div className="text-red-400 font-medium">{product.status || "On the Run"}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Logo - Smaller and positioned on the right */}
                  <div className="flex-shrink-0 w-[80px] md:w-[100px] self-start md:self-center order-first md:order-last">
                    <div className="bg-zinc-800 p-2 relative border-2 border-dashed border-white/70">
                      {/* Evidence tag */}
                      <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs px-2 py-0.5 rotate-3 z-10 whitespace-nowrap">
                        EXHIBIT A
                      </div>

                      {product.logoUrl ? (
                        <div className="relative w-full aspect-square">
                          <Image
                            src={product.logoUrl || "/placeholder.svg"}
                            alt={`${product.title} logo`}
                            width={80}
                            height={80}
                            className="w-full h-auto object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-full aspect-square bg-zinc-700 flex items-center justify-center">
                          <span className="text-zinc-500 text-xs">No Logo</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <UpvoteButton productSlug={product.slug} initialUpvotes={product.upvotes || 0} />

                  {product.productUrl && (
                    <Button asChild className="bg-red-600 hover:bg-red-700 text-white" size="sm">
                      <a href={product.productUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" /> Explore Product
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              {/* Main content grid */}
              <div className="space-y-6">
                {/* Evidence photo */}
                <div className="bg-zinc-900 border border-zinc-800 shadow-lg shadow-black/50 border-t-4 border-b-4 border-t-zinc-700 border-b-zinc-700">
                  <div className="border-b border-zinc-800 bg-zinc-800 p-3 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold mr-2">
                        1
                      </div>
                      <h2 className="text-lg font-bold">Proof of Work	</h2>
                    </div>
                    <div className="text-xs bg-yellow-400 text-black text-xs px-2 py-0.5 rotate-3 z-10 whitespace-nowrap">
                      EXHIBIT B
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="relative aspect-video bg-black border border-zinc-700">
                      {product.screenshotUrl ? (
                        <Image
                          src={product.screenshotUrl || "/placeholder.svg"}
                          alt={product.title}
                          fill
                          className="object-contain"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-zinc-500">No preview available</p>
                        </div>
                      )}

                      {/* Evidence markers */}
                      <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold text-sm">
                        A
                      </div>
                      <div className="absolute bottom-3 right-3 w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold text-sm">
                        B
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key evidence */}
                <div className="bg-zinc-900 border border-zinc-800 relative shadow-lg shadow-black/50 border-t-4 border-b-4 border-t-zinc-700 border-b-zinc-700">
                  <div className="border-b border-zinc-800 bg-zinc-800 p-3 flex items-center">
                    <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold mr-2">
                      2
                    </div>
                    <h2 className="text-lg font-bold">Build Summary</h2>
                  </div>

                  {/* Sticky Note */}
                  <div className="absolute top-0 right-0 transform rotate-3 bg-yellow-300 text-black p-2 shadow-md  text-xs">
                    ✨ Caught Our Eye
                  </div>

                  <div className="p-4">
                    <ul className="space-y-3">
                      {product.summary &&
                        product.summary.map((bullet: string, index: number) => (
                          <li key={index} className="flex items-start bg-zinc-800 p-3 border-l-2 border-red-500">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center mr-3">
                              <span className="text-xs">{index + 1}</span>
                            </div>
                            <p className="text-zinc-300">{bullet}</p>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>

                {/* Case notes */}
                {product.description && (
                  <div className="bg-zinc-900 border border-zinc-800">
                    <div className="border-b border-zinc-800 bg-zinc-800 p-3 flex items-center">
                      <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold mr-2">
                        3
                      </div>
                      <h2 className="text-lg font-bold">Build Notes</h2>
                    </div>

                    <div className="p-4">
                      <div className="bg-zinc-800 p-4 border-l-2 border-yellow-500">
                        <p className="text-zinc-300 whitespace-pre-line text-sm leading-relaxed">
                          {product.description}
                        </p>
                      </div>

                      {/* Links section */}
                      <div className="mt-4 bg-zinc-800 p-4">
                        <h3 className="text-sm font-bold mb-3 uppercase text-zinc-400">Follow the Clues</h3>
                        <div className="space-y-2">
                          {product.productUrl && (
                            <a
                              href={product.productUrl}
                              target="_blank"
                              rel="nofollow noopener noreferrer"
                              className="flex items-center gap-2 group"
                            >
                              <div className="p-2 bg-zinc-700/50 border border-yellow-500 rounded-sm group-hover:shadow-md group-hover:shadow-red-600/50 transition-shadow">
                                <ExternalLink className="h-5 w-5 text-blue-400 group-hover:text-blue-300" />
                              </div>
                              <span className="font-[Permanent Marker] text-yellow-400 text-sm border-b border-yellow-500">
                                Visit Hideout
                              </span>
                            </a>
                          )}

                          {product.socialLinks?.twitter && (
                            <a
                              href={product.socialLinks.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 group"
                            >
                              <div className="p-2 bg-zinc-700/50 border border-yellow-500 rounded-sm group-hover:shadow-md group-hover:shadow-red-600/50 transition-shadow">
                                <Twitter className="h-5 w-5 text-blue-400 group-hover:text-blue-300" />
                              </div>
                              <span className="font-[Permanent Marker] text-yellow-400 text-sm border-b border-yellow-500">
                                Builders' Twitter
                              </span>
                            </a>
                          )}

                          {product.socialLinks?.github && (
                            <a
                              href={product.socialLinks.github}
                              target="_blank"
                              rel="nofollow noopener noreferrer"
                              className="flex items-center gap-2 group"
                            >
                              <div className="p-2 bg-zinc-700/50 border border-yellow-500 rounded-sm group-hover:shadow-md group-hover:shadow-red-600/50 transition-shadow">
                                <Github className="h-5 w-5 text-blue-400 group-hover:text-blue-300" />
                              </div>
                              <span className="font-[Permanent Marker] text-yellow-400 text-sm border-b border-yellow-500">
                                Builders' GitHub
                              </span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right column: Suspect Profile and Timeline */}
            <div className="lg:col-span-4 space-y-6">
              {/* Suspect profile */}
              {founderMugshot && (
                <div className="bg-zinc-900 border border-zinc-800">
                  <div className="border-b border-zinc-800 bg-zinc-800 p-3 flex justify-between items-center">
                    <h2 className="text-lg font-bold">Builder Profile </h2>
                    <div className="bg-red-600/80 text-white px-2 py-0.5 text-xs uppercase font-bold">Wanted</div>
                  </div>

                  <div className="p-4">
                    <div className="flex flex-col items-center mb-4">
                      <div className="w-32 h-40 bg-zinc-800 mb-3 relative">
                        {founderMugshot.imageUrl ? (
                          <Image
                            src={founderMugshot.imageUrl || "/placeholder.svg"}
                            alt={founderMugshot.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="h-12 w-12 text-zinc-600" />
                          </div>
                        )}

                        {/* Mugshot height markers */}
                        <div className="absolute inset-y-0 left-0 w-4 bg-zinc-900 flex flex-col justify-between p-1">
                          <div className="w-full h-0.5 bg-white"></div>
                          <div className="w-full h-0.5 bg-white"></div>
                          <div className="w-full h-0.5 bg-white"></div>
                          <div className="w-full h-0.5 bg-white"></div>
                          <div className="w-full h-0.5 bg-white"></div>
                        </div>
                      </div>

                      <div className="text-center">
                        <h3 className="text-xl font-bold">{founderMugshot.name}</h3>
                        <p className="text-red-400 text-sm">"{founderMugshot.crime}"</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between border-b border-zinc-800 pb-1">
                        <span className="text-zinc-400">ID:</span>
                        <span className="font-mono uppercase">{founderMugshot.id.substring(0, 8)}</span>
                      </div>

                      {founderMugshot.twitterHandle && (
                        <div className="flex justify-between border-b border-zinc-800 pb-1">
                          <span className="text-zinc-400">Social:</span>
                          <a
                            href={`https://x.com/${founderMugshot.twitterHandle.replace("@", "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300"
                          >
                            {founderMugshot.twitterHandle}
                          </a>
                        </div>
                      )}

                      {founderMugshot.productUrl && (
                        <div className="flex justify-between border-b border-zinc-800 pb-1">
                          <span className="text-zinc-400">Hideout:</span>
                          <a
                            href={founderMugshot.productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 truncate max-w-[180px]"
                          >
                            {founderMugshot.productUrl.replace(/(^\w+:|^)\/\//, "")}
                          </a>
                        </div>
                      )}
                    </div>

                    {founderMugshot.note && (
                      <div className="mt-4 bg-zinc-800 p-3 border-l-2 border-yellow-500">
                        <div className="text-xs text-zinc-400 mb-1">The Chaos So Far:</div>
                        <p className="text-zinc-300 italic text-sm">{founderMugshot.note}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timeline Section */}
              <TimelineSection
                productSlug={product.slug}
                productId={product.id}
                timelineEntries={product.timelineEntries || []}
              />
            </div>
          </div>
        </div>

        <PublicFooter />
      </div>
    </div>
  )
}