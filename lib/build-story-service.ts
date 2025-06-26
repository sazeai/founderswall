import { BuildStory } from "@/lib/types"

export class BuildStoryService {
  constructor(private supabase: any) {}

  async getAllBuildStories() {
    try {
      // First, get all stories
      const { data: stories, error: storiesError } = await this.supabase
        .from("build_stories")
        .select(`
          id,
          slug,
          title,
          content,
          created_at,
          updated_at,
          category,
          user_id,
          emoji_reactions
        `)
        .order("created_at", { ascending: false })

      if (storiesError) {
        return []
      }

      if (!stories || stories.length === 0) {
        return []
      }

      // Get unique user IDs
      const userIds = [
        ...new Set(stories.map((story: { user_id: string }) => story.user_id)),
      ]

      // Fetch author info separately
      const { data: authors, error: authorsError } = await this.supabase
        .from("mugshots")
        .select("user_id, name, image_url, slug")
        .in("user_id", userIds)

      if (authorsError) {
        // Continue without authors rather than failing completely
      }

      // Create a map of user_id to author info
      const authorMap = new Map()
      if (authors) {
        authors.forEach(
          (author: { user_id: string; name: string; image_url: string; slug: string }) => {
            authorMap.set(author.user_id, {
              name: author.name,
              image_url: author.image_url,
              slug: author.slug,
            })
          }
        )
      }

      // Transform the data to match the expected structure
      const transformedStories = stories.map((story: any) => {
        const author = authorMap.get(story.user_id)
        return {
          id: story.id,
          slug: story.slug,
          title: story.title,
          content: story.content,
          created_at: story.created_at,
          updated_at: story.updated_at,
          category: story.category,
          emoji_reactions: story.emoji_reactions || {},
          author: {
            name: author?.name || "Anonymous",
            image_url: author?.image_url || null,
            slug: author?.slug || undefined,
          },
        }
      })

      return transformedStories
    } catch (error) {
      return []
    }
  }

  async getBuildStoryBySlug(slug: string) {
    try {
      // Get the story
      const { data: story, error: storyError } = await this.supabase
        .from("build_stories")
        .select(`
          id,
          slug,
          title,
          content,
          created_at,
          updated_at,
          category,
          user_id,
          emoji_reactions
        `)
        .eq("slug", slug)
        .single()

      if (storyError) {
        throw new Error(`Story not found: ${storyError.message}`)
      }

      if (!story) {
        throw new Error("Story not found")
      }

      // Get author info separately
      const { data: author, error: authorError } = await this.supabase
        .from("mugshots")
        .select("name, image_url, slug")
        .eq("user_id", story.user_id)
        .single()

      if (authorError) {
        // Continue without author info rather than failing
      }

      // Transform the data
      const transformedStory = {
        id: story.id,
        slug: story.slug,
        title: story.title,
        content: story.content,
        created_at: story.created_at,
        updated_at: story.updated_at,
        category: story.category,
        emoji_reactions: story.emoji_reactions || {},
        author: {
          name: author?.name || "Anonymous",
          image_url: author?.image_url || null,
          slug: author?.slug || undefined,
        },
      }

      return transformedStory
    } catch (error) {
      throw error
    }
  }

  async getTopStoryAuthors() {
    try {
      // Get story counts by user
      const { data: storyCounts, error: countsError } = await this.supabase
        .from("build_stories")
        .select("user_id")
        .not("user_id", "is", null)

      if (countsError) {
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
        .select("user_id, name, image_url, slug")
        .in("user_id", topUserIds)

      if (authorsError) {
        return []
      }

      // Combine with counts
      const topAuthors =
        authors
          ?.map((author: any) => ({
            user_id: author.user_id,
            name: author.name,
            image_url: author.image_url,
            slug: author.slug,
            story_count: userCounts[author.user_id] || 0,
          }))
          .sort((a: any, b: any) => b.story_count - a.story_count) || []

      return topAuthors
    } catch (error) {
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
