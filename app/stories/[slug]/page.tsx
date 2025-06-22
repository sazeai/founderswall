import { createClient } from "@/utils/supabase/server"
import { BuildStoryService } from "@/lib/build-story-service"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Trophy, X, Lightbulb, Calendar, User, Crown } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { PublicHeader } from "@/components/public-header"
import StoryReactions from "./story-reactions"

interface StoryPageProps {
  params: {
    slug: string
  }
}

// Function to strip markdown syntax for schema descriptions
function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s+/g, "") // Remove heading markers
    .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold markers
    .replace(/\*(.*?)\*/g, "$1") // Remove italic markers
    .replace(/`(.*?)`/g, "$1") // Remove code markers
    .replace(/>\s+/g, "") // Remove quote markers
    .replace(/[-*+]\s+/g, "") // Remove list markers
    .replace(/\[([^\]]+)\]$$[^)]+$$/g, "$1") // Remove link syntax, keep text
    .replace(/\n+/g, " ") // Replace newlines with spaces
    .trim()
}

// Function to render markdown to HTML
function renderMarkdown(text: string): string {
  return text
    .replace(/#{3}\s+(.*?)(?=\n|$)/g, '<h3 class="text-lg font-bold mb-2 text-white">$1</h3>')
    .replace(/#{2}\s+(.*?)(?=\n|$)/g, '<h2 class="text-xl font-bold mb-3 text-white">$1</h2>')
    .replace(/#{1}\s+(.*?)(?=\n|$)/g, '<h1 class="text-2xl font-bold mb-4 text-white">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-zinc-300">$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-zinc-700 px-1 py-0.5 rounded text-yellow-400 font-mono text-sm">$1</code>')
    .replace(
      /^>\s+(.*?)$/gm,
      '<blockquote class="border-l-4 border-yellow-500 pl-4 italic text-zinc-400 my-2">$1</blockquote>',
    )
    .replace(/^[-*+]\s+(.*?)$/gm, '<li class="ml-4 text-zinc-300">• $1</li>')
    .replace(/\n/g, "<br>")
}

export default async function StoryPage({ params }: StoryPageProps) {
  let story: any = null
  let topAuthors: any[] = []
  let error = null
  let initialReactions: Record<string, number> = {}

  try {
    const awaitedParams = await params
    const supabase = await createClient()
    const buildStoryService = new BuildStoryService(supabase)

    // Get the story
    story = await buildStoryService.getBuildStoryBySlug(awaitedParams.slug)

    if (!story) {
      notFound()
    }

    // Get reactions for the story
    const { data: reactionsData, error: reactionsError } = await supabase
      .from("build_story_reactions")
      .select("emoji")
      .eq("story_id", story.id)

    if (reactionsError) {
      console.error("Error fetching reactions:", reactionsError)
      // Continue without reactions if there's an error
    } else {
      initialReactions =
        reactionsData?.reduce((acc: Record<string, number>, { emoji }) => {
          acc[emoji] = (acc[emoji] || 0) + 1
          return acc
        }, {}) || {}
    }

    // Try to get top authors, but don't fail if it errors
    try {
      topAuthors = await buildStoryService.getTopStoryAuthors()
    } catch (authorsError) {
      console.error("Error loading top authors:", authorsError)
      // Continue without top authors
    }
  } catch (err) {
    console.error("Error loading story:", err)
    error = err instanceof Error ? err.message : "Failed to load story"
  }

  if (error || !story) {
    notFound()
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "win":
        return <Trophy className="w-4 h-4" />
      case "fail":
        return <X className="w-4 h-4" />
      case "hack":
        return <Lightbulb className="w-4 h-4" />
      default:
        return null
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "win":
        return "bg-green-900 text-green-400 border-green-600"
      case "fail":
        return "bg-red-900 text-red-400 border-red-600"
      case "hack":
        return "bg-blue-900 text-blue-400 border-blue-600"
      default:
        return "bg-gray-900 text-gray-400 border-gray-600"
    }
  }

  // Create clean description for schema (no markdown)
  const cleanDescription = stripMarkdown(story.content)
  const schemaDescription =
    cleanDescription.length > 160 ? cleanDescription.substring(0, 157) + "..." : cleanDescription

  // Render markdown for display
  const renderedContent = renderMarkdown(story.content)

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4">
        {/* Add the PublicHeader */}
        <PublicHeader />

        {/* JSON-LD Schema for Individual Story */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              "@id": `https://founderswall.com/stories/${story.slug}`,
              headline: story.title,
              description: schemaDescription,
              articleBody: stripMarkdown(story.content),
              datePublished: story.created_at,
              dateModified: story.updated_at || story.created_at,
              author: {
                "@type": "Person",
                name: story.author?.name || "Anonymous",
                image: story.author?.image_url,
                url: story.author?.name
                  ? `https://founderswall.com/maker/${story.author.name.toLowerCase().replace(/\s+/g, "-")}`
                  : undefined,
              },
              publisher: {
                "@type": "Organization",
                name: "FoundersWall",
                logo: {
                  "@type": "ImageObject",
                  url: "https://founderswall.com/founderwall-logo.png",
                },
              },
              mainEntityOfPage: {
                "@type": "WebPage",
                "@id": `https://founderswall.com/stories/${story.slug}`,
              },
              articleSection: story.category,
              keywords: [story.category, "indie maker", "build story", "startup story", "founder story"],
              inLanguage: "en-US",
              isPartOf: {
                "@type": "WebSite",
                name: "FoundersWall",
                url: "https://founderswall.com",
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
                    name: "Stories",
                    item: "https://founderswall.com/stories",
                  },
                  {
                    "@type": "ListItem",
                    position: 3,
                    name: story.title,
                    item: `https://founderswall.com/stories/${story.slug}`,
                  },
                ],
              },
            }),
          }}
        />

        {/* Main content */}
        <div className="pt-20 pb-16">
          {/* Back button */}
          <div className="h-12 flex items-center px-4">
            <Link href="/stories" className="flex items-center text-white font-bold">
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span>RETURN TO STORIES</span>
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

          {/* Grid for Main Content and Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-6">
            {/* Left column: Main Content */}
            <div className="lg:col-span-8">
              {/* Story Header Card */}
              <div className="bg-zinc-900 border-l-4 border-red-600 p-4 md:p-6 mb-8">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Story Info */}
                    <div className="flex-grow">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                        <Badge className={`${getCategoryColor(story.category)} font-mono text-xs font-bold`}>
                          {getCategoryIcon(story.category)}
                          <span className="ml-1">{story.category.toUpperCase()}</span>
                        </Badge>
                        <div className="text-zinc-400 text-sm font-mono">
                          {formatDistanceToNow(new Date(story.created_at), { addSuffix: true })}
                        </div>
                      </div>

                      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 font-mono uppercase tracking-wide">
                        {story.title}
                      </h1>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-start">
                          <User className="h-4 w-4 text-red-500 mt-1 mr-2" />
                          <div>
                            <div className="text-xs text-zinc-500 uppercase font-mono">Founder</div>
                            <Link
                              href={`/maker/${story.author?.name?.toLowerCase().replace(/\s+/g, "-") || "unknown"}`}
                              className="text-zinc-300 hover:text-white underline font-mono"
                            >
                              {story.author?.name || "Anonymous"}
                            </Link>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <Calendar className="h-4 w-4 text-red-500 mt-1 mr-2" />
                          <div>
                            <div className="text-xs text-zinc-500 uppercase font-mono">Published</div>
                            <div className="text-zinc-300 font-mono">
                              {formatDistanceToNow(new Date(story.created_at), { addSuffix: true })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Author Avatar */}
                    <div className="flex-shrink-0 w-[80px] md:w-[100px] self-start md:self-center">
                      <div className="bg-zinc-800 p-2 relative border-2 border-dashed border-white/70">
                        <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs px-2 py-0.5 rotate-3 z-10 whitespace-nowrap">
                          Builder
                        </div>

                        {story.author?.image_url ? (
                          <div className="relative w-full aspect-square">
                            <img
                              src={story.author.image_url || "/placeholder.svg"}
                              alt={story.author.name || "Author"}
                              className="w-full h-auto object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-full aspect-square bg-zinc-700 flex items-center justify-center">
                            <User className="h-8 w-8 text-zinc-500" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
               
              </div>

              {/* Story Content */}
              <div className="bg-zinc-900 border border-zinc-800 shadow-lg shadow-black/50 border-t-4 border-b-4 border-t-zinc-700 border-b-zinc-700 mb-6">
                <div className="border-b border-zinc-800 bg-zinc-800 p-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold mr-2">
                      1
                    </div>
                    <h2 className="text-lg font-bold font-mono">BUILD STORY</h2>
                  </div>
                  <div className="text-xs bg-yellow-400 text-black px-2 py-0.5 rotate-3 z-10 whitespace-nowrap">
                    EVIDENCE
                  </div>
                </div>

                <div className="p-3 sm:p-6">
                  <div className="bg-zinc-800 p-2 border-l-4 border-yellow-500">
                    <div
                      className="prose prose-zinc dark:prose-invert max-w-none text-zinc-300"
                      dangerouslySetInnerHTML={{ __html: renderedContent }}
                    />
                    <StoryReactions storyId={story.id} initialReactions={initialReactions} />
                  </div>
                </div>
              </div>
            </div>

            {/* Right column: Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              {/* Top Story Authors Leaderboard */}
              <div className="bg-zinc-900 border border-zinc-800">
                <div className="border-b border-zinc-800 bg-zinc-800 p-3 flex items-center">
                  <Crown className="h-5 w-5 text-yellow-400 mr-2" />
                  <h2 className="text-lg font-bold font-mono">TOP STORYTELLERS</h2>
                </div>
                <div className="p-4">
                  {topAuthors.length > 0 ? (
                    <div className="space-y-3">
                      {topAuthors.map((author: any, index: number) => (
                        <div key={author.user_id} className="flex items-center space-x-3">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              index === 0
                                ? "bg-yellow-500 text-black"
                                : index === 1
                                ? "bg-gray-400 text-black"
                                : index === 2
                                ? "bg-orange-600 text-white"
                                : "bg-zinc-700 text-white"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <img
                            src={author.image_url || "/placeholder.svg?height=32&width=32"}
                            alt={author.name || "Author"}
                            className="w-8 h-8 rounded-full border border-gray-600"
                          />
                          <div className="flex-1">
                            <Link
                              href={`/maker/${author.name?.toLowerCase().replace(/\s+/g, "-") || "unknown"}`}
                              className="text-zinc-300 hover:text-white font-mono text-sm"
                            >
                              {author.name || "Anonymous"}
                            </Link>
                            <div className="text-xs text-zinc-500 font-mono">
                              {author.story_count} {author.story_count === 1 ? "story" : "stories"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-zinc-500 text-sm font-mono text-center py-4">No storytellers yet</div>
                  )}
                </div>
              </div>

              {/* Share Story CTA */}
              <div className="bg-zinc-900 border border-zinc-800">
                <div className="border-b border-zinc-800 bg-zinc-800 p-3 flex items-center">
                  <h2 className="text-lg font-bold font-mono">SHARE YOUR STORY</h2>
                </div>
                <div className="p-4 text-center">
                  <p className="text-sm text-gray-400 font-mono mb-4">Got a build story to share?</p>
                  <Link href="/station/submit-story">
                    <Button className="bg-red-600 hover:bg-red-700 text-white font-mono w-full">SUBMIT STORY</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}