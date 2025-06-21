"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { User } from "@supabase/supabase-js"
import { LogOut, ChevronDown, UserIcon, FileText, Camera, Home, Loader2, Ghost } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

interface StationHeaderProps {
  user: User
}

export default function StationHeader({ user }: StationHeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [logoutError, setLogoutError] = useState<string | null>(null)
  const router = useRouter()

  const toggleProfileMenu = () => {
    setIsProfileOpen(!isProfileOpen)
  }

  const handleLogout = async () => {
    setLogoutError(null)
    setIsSigningOut(true)

    try {
      // Use the client-side Supabase client for sign-out
      const supabase = createClient()

      // Sign out the user
      const { error } = await supabase.auth.signOut()

      if (error) {
        setLogoutError(error.message)
        setIsSigningOut(false)
        return
      }

      // Redirect to home page after successful sign-out
      router.push("/")
    } catch (err) {
      console.error("Error during logout:", err)
      setLogoutError("Failed to sign out. Please try again.")
      setIsSigningOut(false)
    }
  }

  return (
    <header className="bg-black border-b border-gray-800">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center">
              <img src="/founderwall-logo.png" alt="FoundersWall" className="h-8 md:h-10" />
            </Link>

            <nav className="hidden md:flex items-center space-x-4">
              <Link href="/station" className="px-3 py-2 text-gray-300 hover:text-white transition-colors">
                <span className="flex items-center">
                  <Home className="w-4 h-4 mr-2" />
                  Station
                </span>
              </Link>
              <Link href="/station/get-arrested" className="px-3 py-2 text-gray-300 hover:text-white transition-colors">
                <span className="flex items-center">
                  <Camera className="w-4 h-4 mr-2" />
                  Create Mugshot
                </span>
              </Link>
              <Link href="/launch" className="px-3 py-2 text-gray-300 hover:text-white transition-colors">
                <span className="flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  All Launches
                </span>
              </Link>
              <Link href="/uplift" className="px-3 py-2 text-gray-300 hover:text-white transition-colors">
                <span className="flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Uplift
                </span>
              </Link>
              <Link href="/station/show-up" className="px-3 py-2 text-gray-300 hover:text-white transition-colors">
                <span className="flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Request Support
                </span>
              </Link>
              {/* ONLY ADDITION - story  Link */}
              <Link href="/station/submit-story" className="px-3 py-2 text-gray-300 hover:text-white transition-colors">
                <span className="flex items-center">
                  <Ghost className="w-4 h-4 mr-2" />
                  Submit Story
                </span>
              </Link>
            </nav>
          </div>

          <div className="relative">
            <button
              onClick={toggleProfileMenu}
              className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-md transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-gray-300" />
              </div>
              <span className="hidden sm:inline text-sm">{user.email?.split("@")[0]}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-700">
                <div className="px-4 py-2 border-b border-gray-700">
                  <p className="text-xs font-medium">{user.email}</p>
                  <p className="text-xs text-gray-400">Suspect</p>
                </div>
                <Link
                  href="/station/edit-mugshot"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left"
                  onClick={() => setIsProfileOpen(false)}
                >
                  Profile Settings
                </Link>

                {/* Display error message if logout failed */}
                {logoutError && <div className="px-4 py-2 text-xs text-red-400">{logoutError}</div>}

                {/* Updated logout button with loading state */}
                <button
                  onClick={handleLogout}
                  disabled={isSigningOut}
                  className="block px-4 py-2 text-sm text-red-400 hover:bg-gray-700 w-full text-left flex items-center"
                >
                  {isSigningOut ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Exiting The Wall...
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4 mr-2" />
                      Exit The Wall
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-800">
        <div className="flex justify-around">
          <Link href="/station" className="flex-1 text-center py-3 text-gray-400 hover:text-white transition-colors">
            <Home className="w-5 h-5 mx-auto" />
            <span className="text-xs">Station</span>
          </Link>
          <Link
            href="/station/get-arrested"
            className="flex-1 text-center py-3 text-gray-400 hover:text-white transition-colors"
          >
            <Camera className="w-5 h-5 mx-auto" />
            <span className="text-xs">Mugshot</span>
          </Link>
          <Link href="/launch" className="flex-1 text-center py-3 text-gray-400 hover:text-white transition-colors">
            <FileText className="w-5 h-5 mx-auto" />
            <span className="text-xs">All Products</span>
          </Link>
          <Link href="/uplift" className="flex-1 text-center py-3 text-gray-400 hover:text-white transition-colors">
            <FileText className="w-5 h-5 mx-auto" />
            <span className="text-xs">Uplift</span>
          </Link>
          <Link
            href="/station/show-up"
            className="flex-1 text-center py-3 text-gray-400 hover:text-white transition-colors"
          >
            <FileText className="w-5 h-5 mx-auto" />
            <span className="text-xs">Request</span>
          </Link>
          {/* ONLY ADDITION - Ghost Projects Mobile Link */}
          <Link
            href="/station/submit-ghost"
            className="flex-1 text-center py-3 text-gray-400 hover:text-white transition-colors"
          >
            <Ghost className="w-5 h-5 mx-auto" />
            <span className="text-xs">Ghost</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
