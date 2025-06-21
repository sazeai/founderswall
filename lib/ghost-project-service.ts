import type { SupabaseClient } from "@supabase/supabase-js"
import { generateSlug } from "@/lib/utils"
import type { GhostProject, GhostProjectFormData } from "@/lib/types"

export class GhostProjectService {
  private supabase: SupabaseClient

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient
  }

  async createGhostProject(formData: GhostProjectFormData, userId: string): Promise<GhostProject> {
    try {
      console.log("Getting user's mugshot ID for user:", userId)

      // Get the user's mugshot ID
      const { data: mugshot, error: mugshotError } = await this.supabase
        .from("mugshots")
        .select("id")
        .eq("user_id", userId)
        .single()

      if (mugshotError) {
        console.error("Mugshot query error:", mugshotError)
        throw new Error("Failed to find user profile. Please create your mugshot first.")
      }

      if (!mugshot) {
        console.log("No mugshot found for user:", userId)
        throw new Error("You must have a mugshot profile to create a ghost project. Please create your mugshot first.")
      }

      console.log("Found mugshot:", mugshot.id)

      // Generate unique slug from codename
      const baseSlug = generateSlug(formData.codename)
      let uniqueSlug = baseSlug
      let slugCounter = 1

      console.log("Generating unique slug from:", baseSlug)

      while (true) {
        const { data: existingProject, error: slugError } = await this.supabase
          .from("ghost_projects")
          .select("id")
          .eq("slug", uniqueSlug)
          .single()

        if (slugError && slugError.code === "PGRST116") {
          // No existing project found, slug is available
          console.log("Slug available:", uniqueSlug)
          break
        } else if (!slugError && existingProject) {
          // Slug exists, try with counter
          uniqueSlug = `${baseSlug}-${slugCounter}`
          slugCounter++
          console.log("Slug taken, trying:", uniqueSlug)
        } else {
          // Some other error, break and try to insert
          console.log("Slug check error:", slugError)
          break
        }
      }

      console.log("Inserting ghost project with slug:", uniqueSlug)

      // Insert the ghost project - using correct column names from our schema
      const { data: ghostProject, error } = await this.supabase
        .from("ghost_projects")
        .insert({
          slug: uniqueSlug,
          founder_id: mugshot.id,
          codename: formData.codename,
          real_name: formData.realName,
          one_liner: formData.oneLiner,
          tech_stack: formData.techStack,
          assets_available: formData.assetsAvailable,
          learnings: formData.learnings,
          abandonment_reason: formData.abandonmentReason,
          asking_price: formData.projectType === "for_learning" ? null : formData.askingPrice,
          intent: formData.projectType, // Using correct column name 'intent'
          status: formData.status,
          approved_viewers: [],
        })
        .select(`
          *,
          founder:founder_id (
            id,
            name,
            image_url
          )
        `)
        .single()

      if (error) {
        console.error("Ghost project insert error:", error)
        throw new Error(`Failed to create ghost project: ${error.message}`)
      }

      if (!ghostProject) {
        throw new Error("Ghost project was not created properly")
      }

      console.log("Ghost project created successfully")
      return ghostProject as GhostProject
    } catch (error) {
      console.error("Error in createGhostProject:", error)
      throw error // Re-throw to be handled by API route
    }
  }

  async getGhostProject(slug: string, userId?: string): Promise<GhostProject | null> {
    try {
      const { data: ghostProject, error } = await this.supabase
        .from("ghost_projects")
        .select(`
          *,
          founder:founder_id (
            id,
            name,
            image_url
          )
        `)
        .eq("slug", slug)
        .single()

      if (error || !ghostProject) {
        return null
      }

      return ghostProject as GhostProject
    } catch (error) {
      console.error("Error in getGhostProject:", error)
      return null
    }
  }

  async getAllGhostProjects(limit = 20, offset = 0): Promise<GhostProject[]> {
    try {
      const { data: ghostProjects, error } = await this.supabase
        .from("ghost_projects")
        .select(`
          *,
          founder:founder_id (
            id,
            name,
            image_url
          )
        `)
        .order("created_at", { ascending: false })
        .limit(limit)
        .range(offset, offset + limit - 1)

      if (error) {
        console.error("Error fetching ghost projects:", error)
        return []
      }

      return (ghostProjects || []) as GhostProject[]
    } catch (error) {
      console.error("Error in getAllGhostProjects:", error)
      return []
    }
  }

  async canViewPrivateDetails(ghostProjectId: string, userId: string): Promise<boolean> {
    if (!userId) return false

    try {
      // Get the user's mugshot ID
      const { data: mugshot, error: mugshotError } = await this.supabase
        .from("mugshots")
        .select("id")
        .eq("user_id", userId)
        .single()

      if (mugshotError || !mugshot) {
        return false
      }

      // Check if user is the owner or in approved viewers
      const { data: ghostProject, error } = await this.supabase
        .from("ghost_projects")
        .select("founder_id, approved_viewers")
        .eq("id", ghostProjectId)
        .single()

      if (error || !ghostProject) {
        return false
      }

      // Owner can always view
      if (ghostProject.founder_id === mugshot.id) {
        return true
      }

      // Check if user is in approved viewers
      return ghostProject.approved_viewers.includes(mugshot.id)
    } catch (error) {
      console.error("Error in canViewPrivateDetails:", error)
      return false
    }
  }

  async requestAccess(ghostProjectId: string, userId: string, message?: string): Promise<void> {
    try {
      // Get the user's mugshot ID
      const { data: mugshot, error: mugshotError } = await this.supabase
        .from("mugshots")
        .select("id")
        .eq("user_id", userId)
        .single()

      if (mugshotError || !mugshot) {
        throw new Error("You must have a mugshot profile to request access.")
      }

      // Check if request already exists
      const { data: existingRequest, error: checkError } = await this.supabase
        .from("ghost_project_access_requests")
        .select("id")
        .eq("ghost_project_id", ghostProjectId)
        .eq("requester_mugshot_id", mugshot.id)
        .single()

      if (!checkError && existingRequest) {
        throw new Error("You have already requested access to this project.")
      }

      // Create access request
      const { error } = await this.supabase.from("ghost_project_access_requests").insert({
        ghost_project_id: ghostProjectId,
        requester_user_id: userId,
        requester_mugshot_id: mugshot.id,
        message: message || null,
        status: "pending",
      })

      if (error) {
        throw new Error(`Failed to request access: ${error.message}`)
      }
    } catch (error) {
      console.error("Error in requestAccess:", error)
      throw error
    }
  }

  async approveAccessRequest(requestId: string, ownerId: string): Promise<void> {
    try {
      // Get the owner's mugshot ID
      const { data: ownerMugshot, error: ownerError } = await this.supabase
        .from("mugshots")
        .select("id")
        .eq("user_id", ownerId)
        .single()

      if (ownerError || !ownerMugshot) {
        throw new Error("Invalid owner.")
      }

      // Get the access request with ghost project info
      const { data: request, error: requestError } = await this.supabase
        .from("ghost_project_access_requests")
        .select(`
          *,
          ghost_project:ghost_project_id(
            id,
            founder_id,
            approved_viewers
          )
        `)
        .eq("id", requestId)
        .single()

      if (requestError || !request) {
        throw new Error("Access request not found.")
      }

      // Verify owner
      if (request.ghost_project.founder_id !== ownerMugshot.id) {
        throw new Error("You are not authorized to approve this request.")
      }

      // Update request status to approved
      const { error: updateError } = await this.supabase
        .from("ghost_project_access_requests")
        .update({ status: "approved" })
        .eq("id", requestId)

      if (updateError) {
        throw new Error(`Failed to approve request: ${updateError.message}`)
      }

      // Add requester to approved viewers if not already there
      const currentViewers = request.ghost_project.approved_viewers || []
      if (!currentViewers.includes(request.requester_mugshot_id)) {
        const updatedViewers = [...currentViewers, request.requester_mugshot_id]

        const { error: viewersError } = await this.supabase
          .from("ghost_projects")
          .update({ approved_viewers: updatedViewers })
          .eq("id", request.ghost_project_id)

        if (viewersError) {
          throw new Error(`Failed to update approved viewers: ${viewersError.message}`)
        }
      }
    } catch (error) {
      console.error("Error in approveAccessRequest:", error)
      throw error
    }
  }
}
