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
        <div className="relative bg-[#FFF1C5] border-2 border-gray-300 rounded shadow-2xl px-6 py-8 max-w-md w-full mx-auto">
          {/* Subtle Red Pin */}  
          <div className="absolute left-1/2 -top-4 z-20" style={{ transform: 'translateX(-50%)' }}>
            <div className="w-4 h-4 bg-red-500 rounded-full shadow border-2 border-red-700" />
          </div>
          {/* Dirty paper texture overlay */}
          <div className="absolute inset-0 pointer-events-none rounded-xl" style={{
            backgroundImage: "url('https://w7.pngwing.com/pngs/930/611/png-transparent-retro-wall-texture-retro-texture-crack-thumbnail.png')",
            backgroundSize: 'cover',
            opacity: 0.10,
            mixBlendMode: 'luminosity',
            zIndex: 10,
          }} />
          {/* RESTRICTED badge */}
          <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs px-3 py-1 font-bold rounded shadow-sm z-30 border border-black" style={{ letterSpacing: '1px' }}>
            RESTRICTED
          </div>
          {/* $3 Note - smaller, less messy */}
          <div className="flex justify-center mb-4 mt-2">
            <div className="bg-yellow-200 border border-yellow-400 rounded px-2 py-1 text-xs text-gray-800 font-mono shadow-sm" style={{ fontFamily: 'inherit' }}>
              $3 once because showing up should cost <span className="text-red-500 font-bold">something</span>.
            </div>
          </div>
          {/* Main Card Content */}
          <div className="relative z-20">
            <h2 className="text-2xl font-bold mb-4 text-center text-red-600 tracking-wide font-mono uppercase">
              {isSignUp ? "Join the Wall" : "Enter the Wall"}
            </h2>
            {error && <div className="bg-red-900/50 text-white p-3 rounded-md mb-4">{error}</div>}
            {success && <div className="bg-green-900/50 text-white p-3 rounded-md mb-4">{success}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-mono text-gray-700">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="detective@example.com"
                  className="bg-gray-100 border-gray-300 text-black font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-mono text-gray-700">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="bg-gray-100 border-gray-300 text-black font-mono"
                />
              </div>
              <Button type="submit" className="w-full bg-red-500 hover:bg-red-600 font-bold font-mono text-lg" disabled={isLoading}>
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
              <button onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-gray-500 hover:text-red-600 font-mono">
                {isSignUp ? "Already have an account? Login" : "Need an account? Sign Up"}
              </button>
            </div>
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-yellow-100 text-gray-500 font-mono">Or continue with</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="border-gray-300 bg-white text-black font-mono flex items-center justify-center"
                  onClick={() => handleSocialLogin("google")}
                  disabled={!!socialLoading}
                >
                  {socialLoading === "google" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <svg className="mr-2 h-4 w-4 text-black" viewBox="0 0 24 24">
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
                  <span className="text-black">Continue with Google</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-gray-300 bg-white text-black font-mono flex items-center justify-center"
                  onClick={() => handleSocialLogin("github")}
                  disabled={!!socialLoading}
                >
                  {socialLoading === "github" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-black" />
                  ) : (
                    <svg className="mr-2 h-4 w-4 text-black" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.371 0 0 5.373 0 12c0 5.303 3.438 9.8 8.207 11.387.6.113.793-.258.793-.577 0-.285-.011-1.04-.017-2.04-3.338.726-4.042-1.611-4.042-1.611-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.605-2.665-.304-5.466-1.334-5.466-5.931 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.984-.399 3.003-.404 1.018.005 2.047.138 3.006.404 2.291-1.553 3.297-1.23 3.297-1.23.653 1.653.242 2.873.119 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.803 5.625-5.475 5.921.43.371.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.192.694.801.576C20.565 21.796 24 17.299 24 12c0-6.627-5.373-12-12-12z"/>
                    </svg>
                  )}
                  <span className="text-black">Continue with GitHub</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
