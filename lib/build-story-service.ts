export class BuildStoryService {
  constructor(private supabase: any) {}

  async getAllBuildStories() {
    try {
      console.log("🔍 BUILD STORY SERVICE - Fetching all build stories with authors")

      const { data: stories, error } = await this.supabase
        .from("build_stories")
        .select(`
        id,
        slug,
        title,
        content,
        created_at,
        updated_at,
        category,
        upvotes,
        emoji_reactions,
        mugshots!build_stories_user_id_fkey (
          name,
          image_url
        )
      `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("❌ BUILD STORY SERVICE - Error:", error)
        return []
      }

      console.log("✅ BUILD STORY SERVICE - Stories fetched:", stories?.length || 0)

      return (
        stories?.map((story: any) => ({
          id: story.id,
          slug: story.slug,
          title: story.title,
          content: story.content,
          created_at: story.created_at,
          updated_at: story.updated_at,
          category: story.category,
          upvotes: story.upvotes || 0,
          emoji_reactions: story.emoji_reactions || {},
          author: {
            name: story.mugshots?.name || "Anonymous",
            image_url: story.mugshots?.image_url || null,
          },
        })) || []
      )
    } catch (error) {
      console.error("💥 BUILD STORY SERVICE - Error:", error)
      return []
    }
  }

  async getBuildStoryBySlug(slug: string) {
    try {
      console.log("🔍 BUILD STORY SERVICE - Fetching story by slug:", slug)

      const { data: story, error } = await this.supabase
        .from("build_stories")
        .select(`
        id,
        slug,
        title,
        content,
        created_at,
        updated_at,
        category,
        upvotes,
        emoji_reactions,
        mugshots!build_stories_user_id_fkey (
          name,
          image_url
        )
      `)
        .eq("slug", slug)
        .single()

      if (error) {
        console.error("❌ BUILD STORY SERVICE - Error:", error)
        throw new Error("Story not found")
      }

      return {
        id: story.id,
        slug: story.slug,
        title: story.title,
        content: story.content,
        created_at: story.created_at,
        updated_at: story.updated_at,
        category: story.category,
        upvotes: story.upvotes || 0,
        emoji_reactions: story.emoji_reactions || {},
        author: {
          name: story.mugshots?.name || "Anonymous",
          image_url: story.mugshots?.image_url || null,
        },
      }
    } catch (error) {
      console.error("💥 BUILD STORY SERVICE - Error:", error)
      throw error
    }
  }

  async getTopStoryAuthors() {
    try {
      console.log("🏆 BUILD STORY SERVICE - Fetching top story authors")

      // Get story counts by user
      const { data: storyCounts, error: countsError } = await this.supabase
        .from("build_stories")
        .select("user_id")
        .not("user_id", "is", null)

      if (countsError) {
        console.error("❌ BUILD STORY SERVICE - Error fetching story counts:", countsError)
        return []
      }

      if (!storyCounts || storyCounts.length === 0) {
        return []
      }

      // Count stories per user
      const userCounts = storyCounts.reduce((acc: any, story: any) => {
        acc[story.user_id] = (acc[story.user_id] || 0) + 1
        return acc
      }, {})

      // Get top users (limit to top 10)
      const topUserIds = Object.entries(userCounts)
        .sort(([, a]: any, [, b]: any) => b - a)
        .slice(0, 10)
        .map(([userId]) => userId)

      if (topUserIds.length === 0) {
        return []
      }

      // Get author info for top users
      const { data: authors, error: authorsError } = await this.supabase
        .from("mugshots")
        .select("user_id, name, image_url")
        .in("user_id", topUserIds)

      if (authorsError) {
        console.error("❌ BUILD STORY SERVICE - Error fetching top authors:", authorsError)
        return []
      }

      // Combine with counts
      const topAuthors =
        authors
          ?.map((author: any) => ({
            user_id: author.user_id,
            name: author.name,
            image_url: author.image_url,
            story_count: userCounts[author.user_id] || 0,
          }))
          .sort((a: any, b: any) => b.story_count - a.story_count) || []

      console.log("🏆 BUILD STORY SERVICE - Top authors fetched:", topAuthors.length)
      return topAuthors
    } catch (error) {
      console.error("💥 BUILD STORY SERVICE - Error in getTopStoryAuthors:", error)
      return []
    }
  }

  async getBuildStories() {
    return this.getAllBuildStories()
  }
}

export const getBuildStories = async () => {
  const { createClient } = await import("@/utils/supabase/server")
  const supabase = await createClient()
  const service = new BuildStoryService(supabase)
  return service.getAllBuildStories()
}
