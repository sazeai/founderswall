import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import StationHeader from "./station-header"

// Add this line to mark the route as dynamic
export const dynamic = "force-dynamic"

export default async function StationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const supabase = await createClient()

    // Use getUser() instead of getSession() for security
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    // If no user or error, redirect to login with station redirect
    if (!user || userError) {
      redirect("/login?redirectedFrom=/station")
    }

    return (
      <div className="min-h-screen flex flex-col bg-dark text-white">
        <StationHeader user={user} />
        <main className="flex-grow py-12 px-4">{children}</main>
      </div>
    )
  } catch (error) {
    console.error("Error in station layout:", error)
    // Fallback to a simple error page
    return (
      <div className="min-h-screen flex flex-col items-center py-12 justify-center bg-dark text-white">
        <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
        <p className="mb-4">We're having trouble loading this page.</p>
        <a href="/" className="text-red-500 hover:underline">
          Return to home page
        </a>
      </div>
    )
  }
}
