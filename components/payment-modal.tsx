"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, CreditCard, Check, X } from "lucide-react"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function PaymentModal({ isOpen, onClose, onSuccess }: PaymentModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePayment = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create payment")
      }

      // Redirect to Dodo payment page
      if (data.payment_link) {
        window.location.href = data.payment_link
      } else {
        throw new Error("No payment link received")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed")
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gray-800 border-2 border-red-500">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <CreditCard className="h-5 w-5 text-red-500" />
            Get Your Founder Keycard
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
         

          <div className="my-4 px-2 text-center">
            <h3 className="text-lg font-bold text-yellow-400 mb-2">JOIN THE INNER CIRCLE. BUILD YOUR LEGACY.
            </h3>
            <p className="text-gray-300 text-sm mb-1">Join the circle of makers who don't just talk they ship.</p>
            <p className="text-gray-300 text-sm mb-1">Show your face, launch your tools, build your tribe.</p>
            <p className="text-gray-300 text-sm mb-3">This isn't just a platform it's your legacy in the making.</p>
            <p className="text-red-400 font-semibold text-sm mb-1">Miss this, and you'll be watching from the sidelines.</p>
            <p className="text-green-400 font-semibold text-sm">Get in. Get seen. Get real.</p>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500 rounded-md p-3 flex items-start gap-2">
              <X className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-300">Payment Error</p>
                <p className="text-sm text-red-400">{error}</p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={loading}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "🚨 Pay 5 Now 🚨"
              )}
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Secure payment powered by Dodopayments. Your payment information is encrypted and secure.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
