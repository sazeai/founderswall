"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import type { User } from "@supabase/supabase-js"
import PaymentModal from "./payment-modal"
import { Loader2, Lock, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePaymentStatus } from "./PaymentStatusProvider"

interface AccessGuardProps {
  children: React.ReactNode
  requiresPayment?: boolean
  fallback?: React.ReactNode
}

export default function AccessGuard({ children, requiresPayment = false, fallback }: AccessGuardProps) {
  const [user, setUser] = useState<User | null>(null)
  const [userLoading, setUserLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setUserLoading(false)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      setUserLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const { paymentStatus, loading: paymentLoading, refresh } = usePaymentStatus()
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    if (!userLoading) {
      setAuthChecked(true)
    }
  }, [userLoading])

  // Show loading state while checking
  if (userLoading || !authChecked || (requiresPayment && paymentLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // If payment is not required, show children
  if (!requiresPayment) {
    return <>{children}</>
  }

  // If user has paid, show children
  if (user && paymentStatus?.has_lifetime_access) {
    return <>{children}</>
  }

  // Show the SINGLE access denied screen for all cases:
  // 1. User not logged in
  // 2. User logged in but hasn't paid
  return (
    <>
      <div className="min-h-screen text-white flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="bg-gray-800 border-4 border-red-500 p-6 rounded-md transform -rotate-1 relative">
            {/* Police badge decoration */}
            <div className="absolute -top-4 -right-4 bg-yellow-400 text-black text-xs px-3 py-2 rotate-12 font-bold rounded-md">
              RESTRICTED
            </div>

            <Lock className="h-12 w-12 mx-auto text-red-500 mb-2" />
            <h2 className="text-2xl font-bold text-red-500 mb-2" style={{ fontFamily: "Impact, sans-serif" }}>
              UNLOCK YOUR LAUNCHPAD
            </h2>
            <p className="text-gray-300 mb-4">
            Getting your first users is the hardest part of any launch. For a one-time $5 payment, you can list unlimited products and get them in front of a dedicated community of builders, and potential customers.
            </p>

            <div className="space-y-2 mb-4 text-left">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-gray-300 text-sm">Launch Unlimited Products, Forever</span>
              </div>
             
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-gray-300 text-sm">Tap into a Network of Early Adopters</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-gray-300 text-sm">Boost SEO with backlinks from ai-q.in & geekdroid.in</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-gray-300 text-sm">Cement Your Legacy on the Founder Wall</span>
              </div>
            </div>

            <div className="text-center mb-4">
              <div className="text-yellow-400 text-sm font-bold">ONE-TIME PAYMENT - $5</div>
              <div className="text-green-400 text-xs mt-1">THE ONLY LAUNCH FEE YOU'LL EVER PAY.</div>
            </div>

            {!user ? (
              <div className="space-y-3">
                <Button
                  onClick={() => {
                    window.location.href = "/login"
                  }}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 text-lg"
                >
                  🚨 Login First 🚨
                </Button>
                <p className="text-xs text-gray-500">Already have an account? Login to get your badge</p>
              </div>
            ) : (
              <div className="space-y-3">
                <Button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 text-lg"
                >
                  🚨 Get Your Founder Keycard 🚨
                </Button>
                <p className="text-xs text-gray-500">One-time payment • Launch unlimited products</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {user && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            setShowPaymentModal(false)
            // Refresh payment status in context
            refresh()
          }}
        />
      )}
    </>
  )
}
