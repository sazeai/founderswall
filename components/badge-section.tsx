import Image from "next/image"

export default function BadgeSection() {
  const badges = [
    {
      href: "https://huzzler.so/products/VhGPTL2Ajs/founderswall?utm_source=huzzler_product_website&utm_medium=badge&utm_campaign=badge",
      src: "https://huzzler.so/assets/images/embeddable-badges/featured.png",
      alt: "Featured on Huzzler - FoundersWall",
      title: "FoundersWall is featured on Huzzler",
      width: 150,
      height: 54,
    },
    {
      href: "https://turbo0.com/item/founderswall",
      src: "https://img.turbo0.com/badge-listed-light.svg",
      alt: "Listed on Turbo0 - FoundersWall",
      title: "FoundersWall is listed on Turbo0",
      width: 150,
      height: 54,
    },
    {
      href: "https://similarlabs.com/?ref=embed",
      src: "https://similarlabs.com/similarlabs-embed-badge-dark.svg",
      alt: "SimilarLabs Partner - FoundersWall",
      title: "FoundersWall partners with SimilarLabs",
      width: 150,
      height: 54,
    },
    {
      href: "https://dang.ai/",
      src: "https://cdn.prod.website-files.com/63d8afd87da01fb58ea3fbcb/6487e2868c6c8f93b4828827_dang-badge.png",
      alt: "Featured on Dang.ai - FoundersWall",
      title: "FoundersWall is featured on Dang.ai",
      width: 150,
      height: 54,
    },
  ]

  return (
    <>
      {/* SEO-friendly structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "FoundersWall - Featured Badges",
            description: "FoundersWall is featured and recognized by leading startup platforms",
            mentions: badges.map((badge) => ({
              "@type": "Organization",
              name: badge.alt.split(" - ")[0],
              url: badge.href,
            })),
          }),
        }}
      />

      <section
        className="py-8 bg-black border-t border-gray-800"
        itemScope
        itemType="https://schema.org/WebPageElement"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-gray-300 mb-2">Recognized by Leading Platforms</h2>
            <p className="text-sm text-gray-500">FoundersWall is featured and trusted by top startup communities</p>
          </div>

          <nav
            className="flex flex-wrap items-center justify-center gap-6 md:gap-8"
            role="navigation"
            aria-label="Platform recognition badges"
          >
            {badges.map((badge, index) => (
              <a
                key={index}
                href={badge.href}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-block transition-transform hover:scale-105 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-black rounded"
                title={badge.title}
                itemProp="mentions"
                itemScope
                itemType="https://schema.org/Organization"
              >
                <Image
                  src={badge.src || "/placeholder.svg"}
                  alt={badge.alt}
                  width={badge.width}
                  height={badge.height}
                  className="h-12 md:h-14 w-auto"
                  loading="lazy"
                  itemProp="logo"
                />
                <meta itemProp="name" content={badge.alt.split(" - ")[0]} />
                <meta itemProp="url" content={badge.href} />
              </a>
            ))}
          </nav>
        </div>
      </section>
    </>
  )
}
