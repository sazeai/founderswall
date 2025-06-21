import { createClient } from "@/utils/supabase/server"
import { BuildStoryService } from "@/lib/build-story-service"
import BuildStoryCard from "@/components/build-story-card"
import { Button } from "@/components/ui/button"
import { Plus, Trophy, X, Lightbulb } from "lucide-react"
import Link from "next/link"
import { PublicHeader } from "@/components/public-header"
import PublicFooter from "@/components/public-footer"

export default async function StoriesPage() {
  let stories = []
  let error = null

  try {
    const supabase = await createClient()
    const buildStoryService = new BuildStoryService(supabase)
    stories = await buildStoryService.getAllBuildStories()
  } catch (err) {
    console.error("Error loading build stories:", err)
    error = err instanceof Error ? err.message : "Failed to load stories"
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <PublicHeader />

      {/* JSON-LD Schema for Stories Collection Page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "@id": "https://founderswall.com/stories#webpage",
            url: "https://founderswall.com/stories",
            name: "Build Stories - Real Stories from Indie Maker Trenches",
            description:
              "Real stories from the indie maker trenches. Discover wins, fails, and hacks from legendary builders in the startup community.",
            isPartOf: {
              "@type": "WebSite",
              "@id": "https://founderswall.com/#website",
              name: "FoundersWall",
              url: "https://founderswall.com",
            },
            mainEntity: {
              "@type": "ItemList",
              name: "Build Stories",
              description: "Collection of real build stories from indie makers",
              numberOfItems: stories.length,
              itemListElement: stories.slice(0, 20).map((story, index) => ({
                "@type": "ListItem",
                position: index + 1,
                item: {
                  "@type": "Article",
                  "@id": `https://founderswall.com/stories/${story.slug}`,
                  headline: story.title,
                  description: story.content.substring(0, 160) + (story.content.length > 160 ? "..." : ""),
                  datePublished: story.created_at,
                  author: {
                    "@type": "Person",
                    name: story.author?.name || "Anonymous",
                    image: story.author?.image_url,
                  },
                  articleSection: story.category,
                  url: `https://founderswall.com/stories/${story.slug}`,
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
                  name: "Build Stories",
                  item: "https://founderswall.com/stories",
                },
              ],
            },
            inLanguage: "en-US",
            keywords: [
              "build stories",
              "indie maker stories",
              "startup stories",
              "founder stories",
              "wins",
              "fails",
              "hacks",
            ],
            about: {
              "@type": "Thing",
              name: "Indie Maker Stories",
              description: "Real experiences and stories from indie makers and startup founders",
            },
          }),
        }}
      />

      <main className="container mx-auto px-4 pb-12 pt-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-4xl font-bold mb-2">Build Stories</h1>
            <p className="text-gray-400">Real stories from the indie maker trenches</p>
          </div>
          <Link href="/station/submit-story">
            <Button className="bg-red-500 hover:bg-red-600 font-bold">
              <Plus className="w-4 h-4 mr-2" />
              Share Your Story
            </Button>
          </Link>
        </div>

        {/* Yellow Caution Stripe */}
        <div className="h-6 w-full bg-yellow-400 mb-8 relative overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "repeating-linear-gradient(45deg, #000 0, #000 10px, #f6e05e 10px, #f6e05e 20px)",
              backgroundSize: "28px 28px",
            }}
          ></div>
        </div>

        {/* Category Filters */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-mono text-gray-400 font-bold">FILTER BY CATEGORY:</span>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="font-mono border-gray-600 text-white hover:bg-gray-800">
                ALL STORIES
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="font-mono border-green-600 text-green-400 hover:bg-green-900"
              >
                <Trophy className="w-3 h-3 mr-1" />
                WINS
              </Button>
              <Button variant="outline" size="sm" className="font-mono border-red-600 text-red-400 hover:bg-red-900">
                <X className="w-3 h-3 mr-1" />
                FAILS
              </Button>
              <Button variant="outline" size="sm" className="font-mono border-blue-600 text-blue-400 hover:bg-blue-900">
                <Lightbulb className="w-3 h-3 mr-1" />
                HACKS
              </Button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-6 mb-8">
            <div className="text-center">
              <h3 className="text-lg font-bold text-red-400 font-mono mb-2">ERROR LOADING STORIES</h3>
              <p className="text-red-300 font-mono">{error}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!error && stories.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 max-w-md mx-auto">
              <h3 className="text-xl font-bold text-white font-mono mb-4">NO STORIES YET</h3>
              <p className="text-gray-400 font-mono mb-6">Be the first to share your build story!</p>
              <Link href="/station/submit-story">
                <Button className="bg-red-500 hover:bg-red-600 text-white font-mono">
                  <Plus className="w-4 h-4 mr-2" />
                  SHARE FIRST STORY
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Stories Grid */}
        {!error && stories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {stories.map((story) => (
              <BuildStoryCard key={story.id} story={story} />
            ))}
          </div>
        )}

        {/* Stats */}
        {!error && stories.length > 0 && (
          <div className="text-center">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 inline-block">
              <span className="font-mono text-gray-400">TOTAL STORIES: {stories.length}</span>
            </div>
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  )
}
