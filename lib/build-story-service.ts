import { supabase } from '@/lib/supabase';

export class BuildStoryService {
  constructor(private supabase: any) {}

  async getAllBuildStories() {
    try {
      const { data: stories, error } = await this.supabase
        .from('build_stories')
        .select(`
          id,
          slug,
          title,
          content,
          created_at,
          updated_at,
          category,
          user_id,
          mugshots!build_stories_user_id_fkey (name, image_url)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching build stories:', error);
        return [];
      }

      // Transform the data to match the expected structure
      const transformedStories = stories.map((story: any) => ({
        id: story.id,
        slug: story.slug,
        title: story.title,
        content: story.content,
        created_at: story.created_at,
        updated_at: story.updated_at,
        category: story.category,
        author: {
          name: story.mugshots?.name || 'Anonymous',
          image_url: story.mugshots?.image_url || null,
        },
      }));

      return transformedStories || [];
    } catch (error) {
      console.error('Error in getAllBuildStories:', error);
      return [];
    }
  }
}
