import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import SubmitStoryForm from "./submit-story-form"

export default async function SubmitStoryPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?redirectedFrom=/station/submit-story")
  }

  // Check for mugshot profile
  const { data: mugshot } = await supabase.from("mugshots").select("id").eq("user_id", user.id).single()

  if (!mugshot) {
    redirect("/station/get-arrested?notice=profile_required_for_story")
  }

  return (
    <div className="min-h-screen py-4">
      <div className="container mx-auto px-2">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">SHARE YOUR BUILD STORY</h1>
            <p className="text-gray-400">Tell the community about your wins, fails, and hacks</p>
          </div>

          {/* Form */}
          <SubmitStoryForm user={user} />
        </div>
      </div>
    </div>
  )
}
