"use client"

export default function BadgeSection() {
  return (
    <section className="py-8 bg-black border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
          {/* Huzzler Badge */}
          <a
            href="https://huzzler.so/products/VhGPTL2Ajs/founderswall?utm_source=huzzler_product_website&utm_medium=badge&utm_campaign=badge"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform hover:scale-105"
          >
            <img
              alt="Huzzler Embed Badge"
              src="https://huzzler.so/assets/images/embeddable-badges/featured.png"
              className="h-12 md:h-14 w-auto"
            />
          </a>

          {/* Turbo0 Badge */}
          <a
            href="https://turbo0.com/item/founderswall"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform hover:scale-105"
          >
            <img
              src="https://img.turbo0.com/badge-listed-light.svg"
              alt="Listed on Turbo0"
              className="h-12 md:h-14 w-auto"
            />
          </a>

          {/* SimilarLabs Badge */}
          <a
            href="https://similarlabs.com/?ref=embed"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform hover:scale-105"
          >
            <img
              src="https://similarlabs.com/similarlabs-embed-badge-dark.svg"
              alt="SimilarLabs Embed Badge"
              className="h-12 md:h-14 w-auto"
            />
          </a>

          {/* Dang.ai Badge */}
          <a
            href="https://dang.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform hover:scale-105"
          >
            <img
              src="https://cdn.prod.website-files.com/63d8afd87da01fb58ea3fbcb/6487e2868c6c8f93b4828827_dang-badge.png"
              alt="Dang.ai"
              className="h-12 md:h-14 w-auto"
              width="150"
              height="54"
            />
          </a>
        </div>
      </div>
    </section>
  )
}
