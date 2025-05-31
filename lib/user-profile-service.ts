import { createClient } from "@/utils/supabase/server"

export class UserProfileService {
  static async ensureUserProfile(userId: string): Promise<boolean> {
    const supabase = await createClient()

    try {
      // Check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("user_id", userId)
        .single()

      if (checkError && checkError.code === "PGRST116") {
        // Profile doesn't exist, create it
        const { error: createError } = await supabase.from("user_profiles").insert({
          user_id: userId,
          badge_type: "wanted",
        })

        if (createError) {
          return false
        }

        return true
      } else if (checkError) {
        return false
      }

      // Profile already exists
      return true
    } catch (error) {
      return false
    }
  }

  static async updateBadgeType(userId: string, badgeType: string): Promise<boolean> {
    const supabase = await createClient()

    try {
      // Ensure profile exists first
      await this.ensureUserProfile(userId)

      // Update badge type
      const { error } = await supabase
        .from("user_profiles")
        .update({
          badge_type: badgeType,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)

      if (error) {
        return false
      }

      return true
    } catch (error) {
      return false
    }
  }

  static async getBadgeType(userId: string): Promise<string> {
    const supabase = await createClient()

    try {
      const { data, error } = await supabase.from("user_profiles").select("badge_type").eq("user_id", userId).single()

      if (error) {
        return "wanted" // Default fallback
      }

      return data.badge_type || "wanted"
    } catch (error) {
      return "wanted" // Default fallback
    }
  }
}
