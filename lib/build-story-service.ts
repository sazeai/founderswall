import { supabase } from '@/lib/supabaseClient'

export async function getBuildStories() {
  try {
    const { data: stories, error } = await supabase
      .from('build_stories')
      .select('slug, createdAt, updatedAt')
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('Error fetching stories for sitemap:', error)
      return []
    }

    return stories || []
  } catch (error) {
    console.error('Error in getBuildStories:', error)
    return []
  }
}
