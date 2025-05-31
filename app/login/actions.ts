"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  // Validate input
  if (!data.email || !data.password) {
    return { error: { message: "Email and password are required" } }
  }

  try {
    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
      // Return user-friendly error messages
      if (error.message.includes("Invalid login credentials")) {
        return { error: { message: "Invalid email or password. Please check your credentials and try again." } }
      }
      if (error.message.includes("Email not confirmed")) {
        return { error: { message: "Please check your email and click the confirmation link before signing in." } }
      }
      if (error.message.includes("Too many requests")) {
        return { error: { message: "Too many login attempts. Please wait a few minutes before trying again." } }
      }
      // Generic fallback for other errors
      return { error: { message: "Login failed. Please check your credentials and try again." } }
    }
  } catch (err) {
    return { error: { message: "An unexpected error occurred. Please try again." } }
  }

  // Move redirect outside try-catch to prevent catching redirect errors
  revalidatePath("/", "layout")
  redirect("/station")
}

export async function signUp(formData: FormData) {
  const supabase = await createClient()
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  // Validate input
  if (!data.email || !data.password) {
    return { error: { message: "Email and password are required" } }
  }

  if (data.password.length < 6) {
    return { error: { message: "Password must be at least 6 characters long" } }
  }

  try {
    const { error } = await supabase.auth.signUp({
      ...data,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    })

    if (error) {
      // Return user-friendly error messages
      if (error.message.includes("User already registered")) {
        return { error: { message: "An account with this email already exists. Please sign in instead." } }
      }
      if (error.message.includes("Password should be")) {
        return { error: { message: "Password must be at least 6 characters long" } }
      }
      if (error.message.includes("Invalid email")) {
        return { error: { message: "Please enter a valid email address" } }
      }
      // Generic fallback for other errors
      return { error: { message: "Sign up failed. Please try again." } }
    }

    return { success: true }
  } catch (err) {
    return { error: { message: "An unexpected error occurred. Please try again." } }
  }
}

export async function logout() {
  const supabase = await createClient()

  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return { error: { message: "Failed to sign out. Please try again." } }
    }
  } catch (err) {
    return { error: { message: "An unexpected error occurred during sign out." } }
  }

  // Move redirect outside try-catch
  revalidatePath("/", "layout")
  redirect("/")
}

export async function loginWithGithub() {
  const supabase = await createClient()
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return { error }
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function loginWithGoogle() {
  const supabase = await createClient()
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return { error }
  }

  if (data.url) {
    redirect(data.url)
  }
}
