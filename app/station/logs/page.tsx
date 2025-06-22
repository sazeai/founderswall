import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { YourLogsWall } from "@/components/YourLogsWall"
import AddLogModalButton from "@/components/AddLogModalButton"

export default async function LogsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  // Check if user has a mugshot/profile
  const { data: mugshot, error } = await supabase.from("mugshots").select("id").eq("user_id", user.id).single()

  if (error || !mugshot) {
    // If no mugshot, redirect to the page to create one
    return redirect("/station/get-arrested")
  }

  return (
    <div className="text-white min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">Your Logs</h1>
        <p className="text-gray-400 mb-8">This is your personal wall of logs, tracking your journey.</p>
        <AddLogModalButton />
        <YourLogsWall />
      </div>
    </div>
  )
}
