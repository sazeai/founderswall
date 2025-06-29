import Image from "next/image"

export default function BadgeSection() {
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
            mentions: [
              {
                "@type": "Organization",
                name: "Huzzler",
                url: "https://huzzler.so/products/VhGPTL2Ajs/founderswall",
              },
              {
                "@type": "Organization",
                name: "Turbo0",
                url: "https://turbo0.com/item/founderswall",
              },
              {
                "@type": "Organization",
                name: "SimilarLabs",
                url: "https://similarlabs.com",
              },
              {
                "@type": "Organization",
                name: "Dang.ai",
                url: "https://dang.ai",
              },
              {
                "@type": "Organization",
                name: "Indie.Deals",
                url: "https://indie.deals",
              },
            ],
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
            {/* Huzzler Badge */}
            <a
              href="https://huzzler.so/products/VhGPTL2Ajs/founderswall?utm_source=huzzler_product_website&utm_medium=badge&utm_campaign=badge"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block transition-transform hover:scale-105 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-black rounded"
              title="FoundersWall is featured on Huzzler"
            >
              <Image
                src="https://huzzler.so/assets/images/embeddable-badges/featured.png"
                alt="Featured on Huzzler - FoundersWall"
                width={150}
                height={54}
                className="h-12 md:h-14 w-auto"
                loading="lazy"
              />
            </a>

            {/* Turbo0 Badge - Kept simple for crawler verification */}
            <a
              href="https://turbo0.com/item/founderswall"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block transition-transform hover:scale-105"
            >
              <img
                src="https://img.turbo0.com/badge-listed-light.svg"
                alt="Listed on Turbo0"
                style={{ height: "54px", width: "auto" }}
              />
            </a>

            {/* SimilarLabs Badge */}
            <a
              href="https://similarlabs.com/?ref=embed"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block transition-transform hover:scale-105 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-black rounded"
              title="FoundersWall partners with SimilarLabs"
            >
              <Image
                src="https://similarlabs.com/similarlabs-embed-badge-dark.svg"
                alt="SimilarLabs Partner - FoundersWall"
                width={150}
                height={54}
                className="h-12 md:h-14 w-auto"
                loading="lazy"
              />
            </a>

            {/* Dang.ai Badge */}
            <a
              href="https://dang.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block transition-transform hover:scale-105 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-black rounded"
              title="FoundersWall is featured on Dang.ai"
            >
              <Image
                src="https://cdn.prod.website-files.com/63d8afd87da01fb58ea3fbcb/6487e2868c6c8f93b4828827_dang-badge.png"
                alt="Featured on Dang.ai - FoundersWall"
                width={150}
                height={54}
                className="h-12 md:h-14 w-auto"
                loading="lazy"
              />
            </a>

            {/* Indie.Deals Badge */}
            <a
              href="https://indie.deals?ref=https%3A%2F%2Ffounderswall.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none" }}
              className="inline-block transition-transform hover:scale-105"
            >
              <span style={{ fontSize: "14px", fontWeight: "500", color: "#4b5563" }}>
                Find us on{" "}
                <span style={{ fontWeight: "700", color: "#0070f3", position: "relative", display: "inline-block" }}>
                  Indie.Deals
                  <span className="indie-deals-text-badge" style={{ position: "relative" }}>
                    <span
                      style={{
                        position: "absolute",
                        bottom: "0",
                        left: "0",
                        width: "0",
                        height: "2px",
                        backgroundColor: "#0070f3",
                        transition: "width 0.3s",
                      }}
                    ></span>
                  </span>
                </span>
              </span>
            </a>
          </nav>
        </div>
      </section>
    </>
  )
}
