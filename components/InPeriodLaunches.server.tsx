import Link from "next/link"
import { getCurrentLaunchPeriod } from "@/lib/launch-period"
import UpvoteButton from "@/components/upvote-button"
import { Calendar, User, TrendingUp, Flame, Star, Zap } from "lucide-react"

interface Product {
  id: string
  slug: string
  title: string
  logoUrl?: string
  upvotes?: number
  launchDate: string
  founderName?: string
}

interface InPeriodLaunchesProps {
  products: Product[]
  error?: string | null
}

export default function InPeriodLaunches({ products, error }: InPeriodLaunchesProps) {
  if (error) {
    return (
      <section className="bg-gradient-to-br from-orange-50 via-white to-amber-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 text-destructive">
              <Zap className="w-5 h-5 mr-2" />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!products || products.length === 0) {
    return (
      <section className="bg-gradient-to-br from-orange-50 via-white to-amber-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
              <TrendingUp className="w-10 h-10 text-primary" />
            </div>
            <p className="text-lg text-muted-foreground">No launches in this period yet. Check back soon!</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-gradient-to-br from-yellow-900/60 via-black/80 to-yellow-900/60 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-sm font-bold mb-6 shadow-lg">
            <Flame className="w-5 h-5 mr-2 animate-pulse" />HOT LAUNCHES
          </div>
          <h2 className="text-3xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-orange-400 mb-6">
            Live Product Launches
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-tight">
            Discover groundbreaking products launching this week and be part of the innovation revolution
          </p>

          <div className="flex justify-center gap-8 mt-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{products.length}</div>
              <div className="text-sm text-muted-foreground">Live Launches</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">
                {products.reduce((sum, p) => sum + (p.upvotes || 0), 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Votes</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="group relative bg-gradient-to-br from-black-900/60 via-black/80 to-gray-900/60 border-2 border-orange-100 rounded-2xl p-6 hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 overflow-hidden"
            >
              <div className="absolute top-4 left-4 w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-sm z-10">
                {index + 1}
              </div>

              {/* Featured launch badge for top 3 */}
              {index < 1 && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-secondary to-primary text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
                  <Star className="w-3 h-3 inline mr-1" />
                  FEATURED
                </div>
              )}

              <div className="flex items-start justify-between mb-6 pt-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-orange-200">
                  {product.logoUrl ? (
                    <img
                      src={product.logoUrl || "/placeholder.svg"}
                      alt={product.title}
                      className="w-12 h-12 object-contain"
                    />
                  ) : (
                    <TrendingUp className="w-8 h-8 text-primary" />
                  )}
                </div>

                <UpvoteButton
                  productSlug={product.slug}
                  initialUpvotes={product.upvotes ?? 0}
                  className="bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary text-white border-0 rounded-xl px-4 py-2 font-bold shadow-lg hover:shadow-xl transition-all duration-200"
                  size="md"
                />
              </div>

              <div className="space-y-4 mb-8">
                <h3 className="font-bold text-card-foreground text-xl leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                  {product.title}
                </h3>

                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  {product.launchDate && (
                    <div className="flex items-center gap-2 bg-orange-50 px-3 py-1 rounded-full">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="font-medium text-primary">
                        {new Date(product.launchDate).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  )}

                  {product.founderName && (
                    <div className="flex items-center gap-2 bg-amber-50 px-3 py-1 rounded-full">
                      <User className="w-4 h-4 text-primary" />
                      <span className="font-medium truncate text-primary">{product.founderName}</span>
                    </div>
                  )}
                </div>
              </div>

              <Link
                href={`/launch/${product.slug}`}
                className="inline-flex items-center justify-center w-full bg-gradient-to-r from-secondary to-primary hover:from-primary hover:to-secondary text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 group-hover:shadow-lg transform hover:scale-105"
              >
                <Zap className="w-5 h-5 mr-2" />
                Explore Launch
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
