"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { UserIcon, LogIn, LogOut, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"
import type { User } from "@supabase/supabase-js"

export function PublicHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [logoutError, setLogoutError] = useState<string | null>(null)
  const router = useRouter()

  // Add useCallback to prevent unnecessary re-renders
  const handleLogout = useCallback(async () => {
    setLogoutError(null)
    setIsSigningOut(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()

      if (error) {
        setLogoutError(error.message)
        setIsSigningOut(false)
        return
      }

      router.push("/")
    } catch (err) {
      setLogoutError("Failed to sign out. Please try again.")
      setIsSigningOut(false)
    }
  }, [router])

  // Optimize the auth effect to prevent redundant calls
  useEffect(() => {
    const supabase = createClient()
    let mounted = true

    // Get initial user
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (mounted) {
          setUser(user)
          setIsLoading(false)
        }
      } catch (error) {
        if (mounted) {
          setUser(null)
          setIsLoading(false)
        }
      }
    }

    getUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        setUser(session?.user || null)
        setIsLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu when path changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-black/90 backdrop-blur-sm shadow-md" : "bg-black/70"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img src="/founderwall-logo.png" alt="FoundersWall" className="h-12" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <NavLink href="/" label="Home" active={pathname === "/"} />
            <NavLink
              href="/launch"
              label="The Launch Board"
              active={pathname === "/launch" || pathname.startsWith("/launch/")}
            />
            <NavLink href="/logs" label="Build Logs" active={pathname === "/logs"} />
            <NavLink href="/uplift" label="Uplift" active={pathname === "/uplift"} />
            <NavLink
              href="/stories"
              label="Build Stories"
              active={pathname === "/stories" || pathname.startsWith("/stories/")}
            />

            {/* Show loading state while checking auth */}
            {isLoading ? (
              <div className="w-24 h-8 bg-gray-700 animate-pulse rounded"></div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black hover:border-yellow-400"
                >
                  <Link href="/station">
                    <UserIcon className="h-4 w-4 mr-2" />
                    Station
                  </Link>
                </Button>
                <button
                  onClick={handleLogout}
                  disabled={isSigningOut}
                  className="flex items-center text-gray-400 hover:text-white text-sm font-medium transition-colors"
                >
                  {isSigningOut ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Exiting...
                    </>
                  ) : (
                    <>
                      <LogOut className="h-4 w-4 mr-2" />
                      Exit the Wall
                    </>
                  )}
                </button>
              </div>
            ) : (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-yellow-400 text-yellow-400 hover:text-white hover:bg-yellow-400/10"
              >
                <Link href="/login">
                  <LogIn className="h-4 w-4 mr-2" />
                  Join The Wall
                </Link>
              </Button>
            )}
          </nav>

          {/* Themed Mobile Menu Button */}
          <button
            className="md:hidden relative"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            <div className={`police-light ${isMenuOpen ? "active" : ""}`}>
              <div className="light-base">
                <div className="light-top"></div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Themed Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden relative">
          <div className="absolute top-0 left-0 right-0 bg-black border-t border-yellow-400 border-b-2 shadow-lg">
            <div className="relative">
              {/* Police Tape Top */}
              <div className="h-6 w-full overflow-hidden">
                <div className="police-tape-top"></div>
              </div>

              <div className="container mx-auto px-4 py-4 bg-gray-900/95">
                <nav className="flex flex-col space-y-2 mt-4">
                  <MobileNavLink href="/" label="Home" active={pathname === "/"} />
                  <MobileNavLink
                    href="/launch"
                    label="The Launch Board"
                    active={pathname === "/launch" || pathname.startsWith("/launch/")}
                  />
                  <MobileNavLink href="/logs" label="Build Logs" active={pathname === "/logs"} />
                  <MobileNavLink href="/uplift" label="Uplift" active={pathname === "/uplift"} />
                  <MobileNavLink
                    href="/stories"
                    label="Build Stories"
                    active={pathname === "/stories" || pathname.startsWith("/stories/")}
                  />

                  {isLoading ? (
                    <div className="w-full h-10 bg-gray-700 animate-pulse rounded"></div>
                  ) : user ? (
                    <>
                      <MobileNavLink href="/station" label="Dashboard" active={pathname.startsWith("/station")} />
                      <button
                        onClick={handleLogout}
                        disabled={isSigningOut}
                        className="block w-full text-left py-2 px-4 text-base font-medium border border-gray-800 transition-colors text-gray-400 hover:bg-gray-800 hover:text-white hover:border-l-4 hover:border-l-yellow-400 flex items-center"
                      >
                        {isSigningOut ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Exiting...
                          </>
                        ) : (
                          <>
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <MobileNavLink href="/login" label="Enter the Wall" active={pathname === "/login"} />
                  )}
                </nav>

                {/* Fingerprint decoration */}
                <div className="fingerprint-decoration"></div>
              </div>

              {/* Police Tape Bottom */}
              <div className="h-6 w-full overflow-hidden">
                <div className="police-tape-bottom"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Yellow Caution Stripe */}
      <div className="h-1 w-full bg-yellow-400 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg, #000 0, #000 10px, #f6e05e 10px, #f6e05e 20px)",
            backgroundSize: "28px 28px",
          }}
        ></div>
      </div>
    </header>
  )
}

// Desktop Nav Link
function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors hover:text-white ${active ? "text-white" : "text-gray-400"}`}
    >
      {label}
    </Link>
  )
}

// Mobile Nav Link
function MobileNavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`block py-2 px-4 text-base font-medium border border-gray-800 transition-colors ${
        active
          ? "bg-gray-800 text-white border-l-4 border-l-red-500"
          : "text-gray-400 hover:bg-gray-800 hover:text-white hover:border-l-4 hover:border-l-yellow-400"
      }`}
    >
      {label}
    </Link>
  )
}
