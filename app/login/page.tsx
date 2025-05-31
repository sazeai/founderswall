"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login, signUp, loginWithGithub, loginWithGoogle } from "./actions"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirectedFrom") || "/"

  const [isSignUp, setIsSignUp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.append("redirectTo", redirectTo)

    try {
      if (isSignUp) {
        const result = await signUp(formData)
        if (result?.error) {
          setError(result.error.message)
        } else {
          setSuccess("Check your email for a confirmation link!")
        }
      } else {
        const result = await login(formData)
        if (result?.error) {
          setError(result.error.message)
        }
      }
    } catch (err) {
      setError("An unexpected error occurred")
      
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider: "github" | "google") => {
    setSocialLoading(provider)
    setError(null)

    try {
      if (provider === "github") {
        await loginWithGithub()
      } else if (provider === "google") {
        await loginWithGoogle()
      }
    } catch (err) {
     
      setError(`An unexpected error occurred with ${provider} login`)
      setSocialLoading(null)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="pt-6 px-6 flex items-center">
        <Link href="/" className="text-white mr-4">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-2xl font-bold">{isSignUp ? "Sign Up" : "Login"}</h1>
      </header>

      {/* Yellow Caution Stripe */}
      <div className="h-6 w-full bg-yellow-400 mt-4 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg, #000 0, #000 10px, #f6e05e 10px, #f6e05e 20px)",
            backgroundSize: "28px 28px",
          }}
        ></div>
      </div>

      <div className="p-6 max-w-md mx-auto">
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 mb-6">
          <h2 className="text-xl font-bold mb-4 text-center">{isSignUp ? "Join the Wall" : "Enter the Wall"}</h2>

          {error && <div className="bg-red-900/50 text-white p-3 rounded-md mb-4">{error}</div>}

          {success && <div className="bg-green-900/50 text-white p-3 rounded-md mb-4">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="detective@example.com"
                className="bg-gray-800 border-gray-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="bg-gray-800 border-gray-700"
              />
            </div>

            <Button type="submit" className="w-full bg-red-500 hover:bg-red-600" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSignUp ? "Signing Up..." : "Logging In..."}
                </>
              ) : isSignUp ? (
                "Sign Up"
              ) : (
                "Login"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-gray-400 hover:text-white">
              {isSignUp ? "Already have an account? Login" : "Need an account? Sign Up"}
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3">
              <Button
                type="button"
                variant="outline"
                className="border-gray-700"
                onClick={() => handleSocialLogin("google")}
                disabled={!!socialLoading}
              >
                {socialLoading === "google" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                Continue with Google
              </Button>

              <Button
                type="button"
                variant="outline"
                className="border-gray-700"
                onClick={() => handleSocialLogin("github")}
                disabled={!!socialLoading}
              >
                {socialLoading === "github" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Github className="mr-2 h-4 w-4" />
                )}
                Continue with GitHub
              </Button>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>By signing up, you agree to our Terms of Service and Privacy Policy.</p>
        </div>
      </div>
    </main>
  )
}
