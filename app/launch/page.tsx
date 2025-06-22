import Link from "next/link"
import type { Metadata } from "next"
import { getProducts } from "@/lib/product-service"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ProductCaseFile } from "@/components/product-case-file"
import { PublicHeader } from "@/components/public-header"
import type { Product } from "@/lib/types"

export const metadata: Metadata = {
  title: "The Launch Board - Most Wanted Products by Legendary Builders",
  description:
    "Discover the latest product launches from indie makers and startup builders. Track the most wanted SaaS products, tools, and innovations from the legendary builder community.",
  keywords: [
    "product launches",
    "indie maker products",
    "startup launches",
    "saas products",
    "product hunt alternative",
    "indie hacker launches",
    "new products",
    "startup tools",
    "maker community",
    "product directory",
  ],
  openGraph: {
    title: "The Launch Board - Most Wanted Products by Legendary Builders",
    description:
      "Discover the latest product launches from indie makers and startup builders. Track the most wanted SaaS products, tools, and innovations from the legendary builder community.",
    type: "website",
    url: "https://founderswall.com/launch",
    images: [
      {
        url: "/og-heist-board.jpg",
        width: 1200,
        height: 630,
        alt: "The Heist Board - Product Launches",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Heist Board - Most Wanted Products by Legendary Builders",
    description: "Discover the latest product launches from indie makers and startup builders.",
    images: ["/og-heist-board.jpg"],
  },
  alternates: {
    canonical: "https://founderswall.com/launch",
  },
}

export default async function LaunchPage() {
  // Add error handling for the getProducts call
  let products: Product[] = []
  let error: string | null = null

  try {
    const result = await getProducts(20, 0)
    products = (result.products || []) as Product[]
    error = result.error
  } catch (e) {
    console.error("Error fetching products:", e)
    error = e instanceof Error ? e.message : "Unknown error occurred"
  }

  // Group products by launch date and find the most upvoted product for each date
  const productsByDate: Record<string, Product[]> = products.reduce<Record<string, Product[]>>((acc: Record<string, Product[]>, product: Product) => {
    const launchDate = new Date(product.launchDate).toISOString().split("T")[0]
    if (!acc[launchDate]) {
      acc[launchDate] = []
    }
    acc[launchDate].push(product)
    return acc
  }, {})

  // For each date, find the product with the most upvotes
  const mostWantedByDate: Record<string, boolean> = Object.keys(productsByDate).reduce<Record<string, boolean>>(
    (acc: Record<string, boolean>, date: string) => {
      const productsForDate: Product[] = productsByDate[date]
      const mostWanted = productsForDate.reduce(
        (prev: Product, current: Product) => ((prev.upvotes ?? 0) > (current.upvotes ?? 0) ? prev : current)
      )
      acc[mostWanted.id] = true
      return acc
    },
    {}
  )

  // Sort products for Trending (by upvotes) and Newest (by launch date)
  const newestProducts: Product[] = [...products].sort((a: Product, b: Product) => new Date(b.launchDate).getTime() - new Date(a.launchDate).getTime())

  // Sort products by launch date for display in "All" tab (newest date first)
  const sortedProducts: Product[] = [...products].sort((a: Product, b: Product) => new Date(b.launchDate).getTime() - new Date(a.launchDate).getTime())

  // Generate JSON-LD Schema for launch page
  const generateLaunchPageSchema = () => {
    const baseSchema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": "https://founderswall.com/launch#webpage",
      url: "https://founderswall.com/launch",
      name: "The Heist Board - Most Wanted Products by Legendary Builders",
      description:
        "Discover the latest product launches from indie makers and startup builders. Track the most wanted SaaS products, tools, and innovations from the legendary builder community.",
      isPartOf: {
        "@type": "WebSite",
        "@id": "https://founderswall.com/#website",
        name: "FoundersWall",
        url: "https://founderswall.com",
      },
      mainEntity: {
        "@type": "ItemList",
        name: "Product Launches",
        description: "Latest product launches from indie makers and startup builders",
        numberOfItems: products.length,
        itemListElement: products.slice(0, 20).map((product: Product, index: number) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "SoftwareApplication",
            "@id": `https://founderswall.com/launch/${product.slug}`,
            name: product.title,
            description: product.description
              ? product.description.length > 300
                ? product.description.substring(0, 297) + "..."
                : product.description
              : `${product.title} - A product by ${product.founderName}`,
            url: `https://founderswall.com/launch/${product.slug}`,
            applicationCategory: product.category || "BusinessApplication",
            operatingSystem: "Web",
            datePublished: product.launchDate,
            author: {
              "@type": "Person",
              name: product.founderName || "Unknown Founder",
            },
            aggregateRating:
              product.upvotes && product.upvotes > 0
                ? {
                    "@type": "AggregateRating",
                    ratingValue: Math.min(5, Math.max(1, product.upvotes / 10 + 3)),
                    reviewCount: product.upvotes,
                    bestRating: 5,
                    worstRating: 1,
                  }
                : undefined,
          },
        })),
      },
      breadcrumb: {
        "@type": "BreadcrumbList",
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
            name: "The Heist Board",
            item: "https://founderswall.com/launch",
          },
        ],
      },
      inLanguage: "en-US",
      keywords: [
        "product launches",
        "indie maker products",
        "startup launches",
        "saas products",
        "product hunt alternative",
      ],
    }

    return baseSchema
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* JSON-LD Schema for Launch Page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateLaunchPageSchema()),
        }}
      />

      <PublicHeader />

      {/* Header */}
      <section className="pt-24 px-6 pb-4 text-center">
        <h1
          className="text-white text-3xl sm:text-5xl font-bold tracking-wider mb-4 glitch-text"
          data-text="THE HEIST BOARD"
        >
          THE LAUNCH BOARD
        </h1>
        <h2 className="text-white text-2xl sm:text-4xl font-bold tracking-wider mb-4" data-text="Alt Text">
          MOST WANTED PRODUCTS LAUNCHED BY INDIE MAKERS
        </h2>
        <p className="text-gray-200 max-w-2xl mx-auto font-semibold">
          Caught shipping in public. Investigate their progress.
        </p>
      </section>

      {/* Yellow Caution Stripe with Crime Scene Text */}
      <div className="h-8 w-full bg-yellow-400 relative overflow-hidden my-6">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg, #000 0, #000 10px, #f6e05e 10px, #f6e05e 20px)",
            backgroundSize: "28px 28px",
          }}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-black text-xs font-bold tracking-wider uppercase">Crime Scene - Do Not Cross</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-3 mb-8 bg-zinc-900 border border-zinc-800">
            <TabsTrigger value="all" className="text-gray-200 font-semibold">
              All
            </TabsTrigger>

            <TabsTrigger value="newest" className="text-gray-200 font-semibold">
              Newest
            </TabsTrigger>
            <TabsTrigger value="most-wanted" className="text-gray-200 font-semibold">
              Most Wanted
            </TabsTrigger>
          </TabsList>

          {/* All Tab */}
          <TabsContent value="all" className="space-y-12">
            {error ? (
              <div className="text-center py-12">
                <div className="inline-block bg-yellow-300 text-black p-4 shadow-md font-[Permanent Marker] text-sm font-bold rotate-3">
                  Error: Failed to load products - {error}
                </div>
                <div className="mt-4">
                  <Button variant="outline" className="border-gray-700 text-gray-200 font-semibold">
                    Try Again
                  </Button>
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-block bg-yellow-300 text-black p-4 shadow-md font-[Permanent Marker] text-sm font-bold rotate-3">
                  No products found
                </div>
                <div className="mt-4">
                  <Button asChild className="bg-red-600 hover:bg-red-700 text-white font-semibold">
                    <Link href="/station/submit-launch">Submit Your Launch</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-12">
                {Object.keys(productsByDate)
                  .sort((a, b) => new Date(b) - new Date(a)) // Sort dates newest to oldest
                  .map((date, index) => (
                    <div key={date}>
                      {/* Add divider before each section except the first */}
                      {index > 0 && (
                        <div className="relative my-8">
                          <div
                            className="h-6 w-full bg-yellow-400"
                            style={{
                              backgroundImage:
                                "repeating-linear-gradient(45deg, #000 0, #000 10px, #f6e05e 10px, #f6e05e 20px)",
                              backgroundSize: "28px 28px",
                            }}
                          ></div>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-zinc-900 text-white text-xs font-bold uppercase px-3 py-1 border border-zinc-800">
                            CASE FILE
                          </div>
                        </div>
                      )}
                      <h2 className="inline-block bg-yellow-400 text-black font-[Permanent Marker] text-lg font-bold rotate-3 border border-black px-3 py-1 mb-6">
                        Launched on {new Date(date).toLocaleDateString()}
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {productsByDate[date]
                          .sort((a: Product, b: Product) => Number(b.upvotes ?? 0) - Number(a.upvotes ?? 0)) // Sort by upvotes within each date
                          .map((product) => (
                            <ProductCaseFile
                              key={product.id}
                              product={product}
                              isMostWanted={!!mostWantedByDate[product.id]}
                            />
                          ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </TabsContent>

          {/* Newest Tab */}
          <TabsContent value="newest" className="space-y-8">
            {newestProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-block bg-yellow-300 text-black p-4 shadow-md font-[Permanent Marker] text-sm font-bold rotate-3">
                  No new products yet
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {newestProducts.map((product) => (
                  <ProductCaseFile key={product.id} product={product} isMostWanted={!!mostWantedByDate[product.id]} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Most Wanted Tab */}
          <TabsContent value="most-wanted" className="space-y-8">
            {Object.keys(mostWantedByDate).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {sortedProducts
                  .filter((product: Product) => mostWantedByDate[product.id])
                  .map((product: Product) => (
                    <ProductCaseFile key={product.id} product={product} isMostWanted={true} />
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-block bg-yellow-300 text-black p-4 shadow-md font-[Permanent Marker] text-sm font-bold rotate-3">
                  No most wanted products yet
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
