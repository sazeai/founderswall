"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Check, Loader2, X, Users, Send, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const [showNomination, setShowNomination] = useState(false)
  const [nominationData, setNominationData] = useState({
    twitterHandle: "",
    additionalMessage: "",
  })
  const [isSubmittingNomination, setIsSubmittingNomination] = useState(false)
  const [nominationSubmitted, setNominationSubmitted] = useState(false)

  useEffect(() => {
    async function verifyPayment() {
      try {
        // Check payment status
        const response = await fetch("/api/payments/status")
        const data = await response.json()

        if (data.has_lifetime_access) {
          setStatus("success")
          setMessage("Payment successful! You can now submit unlimited product launches.")
        } else {
          setStatus("error")
          setMessage("Payment verification failed. Please contact support if you believe this is an error.")
        }
      } catch (error) {
        setStatus("error")
        setMessage("Unable to verify payment status. Please try again later.")
      }
    }

    // Add a small delay to ensure webhook has been processed
    const timer = setTimeout(verifyPayment, 2000)
    return () => clearTimeout(timer)
  }, [])

  const handleNominationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingNomination(true)

    try {
      const response = await fetch("/api/nominations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nominee_twitter_handle: nominationData.twitterHandle,
          additional_message: nominationData.additionalMessage,
        }),
      })

      if (response.ok) {
        setNominationSubmitted(true)
        setShowNomination(false)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit nomination")
      }
    } catch (error) {
      alert(`Failed to submit nomination: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsSubmittingNomination(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNominationData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      {/* Coffee stains background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-amber-900 opacity-10 blur-xl"></div>
        <div className="absolute bottom-32 right-16 w-24 h-24 rounded-full bg-amber-800 opacity-15 blur-lg"></div>
      </div>

      <div className="max-w-lg w-full relative">
        {/* Evidence bag styling */}
        <div className="bg-gray-800 border-2 border-gray-600 shadow-2xl relative">
          {/* Police tape header */}
          <div className="h-8 w-full bg-yellow-400 relative overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: "repeating-linear-gradient(45deg, #000 0, #000 10px, #f6e05e 10px, #f6e05e 20px)",
                backgroundSize: "28px 28px",
              }}
            ></div>
          </div>

          {/* Evidence tag */}
          <div className="absolute -top-2 -right-2 bg-red-600 text-white px-3 py-1 text-xs font-bold transform rotate-12 z-10">
            EVIDENCE #001
          </div>

          <div className="p-8">
            {status === "loading" && (
              <>
                <div className="text-center mb-6">
                  {/* Simplified loader icon */}
                  <Loader2 className="w-16 h-16 text-yellow-400 animate-spin mx-auto mb-4" />
                  <h1 className="text-2xl font-bold text-white mb-2">PROCESSING PAYMENT</h1>
                  <p className="text-gray-300">Verifying your Founder Keycard...</p>
                </div>
              </>
            )}

            {status === "success" && !showNomination && !nominationSubmitted && (
              <>
                <div className="text-center mb-6">
                  <div className="h-16 w-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                    <Check className="h-8 w-8 text-white" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-black text-xs font-bold">✓</span>
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-2">FOUNDER KEYCARD ACQUIRED!</h1>
                  <p className="text-gray-300 mb-6">{message}</p>
                </div>

                {/* Nomination prompt */}
                <div className="bg-gray-900 border border-yellow-400 p-6 mb-6 relative">
                  <div className="absolute -top-2 -left-2 bg-yellow-400 text-black px-2 py-1 text-xs font-bold transform -rotate-6">
                    TIP SUBMISSION
                  </div>
                  <div className="flex items-start">
                    <Users className="h-6 w-6 text-yellow-400 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">Know a founder who deserves recognition?</h3>
                      <p className="text-gray-300 text-sm mb-4">
                        Nominate them for our weekly community pick. If selected, they'll get full access and be
                        featured on the Wall!
                      </p>
                      <Button
                        onClick={() => setShowNomination(true)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold"
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Submit Tip
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => router.push("/station/submit-launch")}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3"
                  >
                    Enter Detective Station
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/")}
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    View Founder Wall
                  </Button>
                </div>
              </>
            )}

            {showNomination && (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-white mb-2">SUBMIT CONFIDENTIAL TIP</h2>
                  <p className="text-gray-400 text-sm">Help us find outstanding founders in the community</p>
                </div>

                <form onSubmit={handleNominationSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="twitterHandle" className="text-white font-bold">
                      Suspect's X (Twitter) Profile *
                    </Label>
                    <Input
                      id="twitterHandle"
                      name="twitterHandle"
                      type="text"
                      placeholder="https://x.com/username or @username"
                      value={nominationData.twitterHandle}
                      onChange={handleInputChange}
                      required
                      className="bg-gray-900 border-gray-600 text-white mt-1 placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <Label htmlFor="additionalMessage" className="text-white font-bold">
                      Additional Intel (Optional)
                    </Label>
                    <Textarea
                      id="additionalMessage"
                      name="additionalMessage"
                      placeholder="Why do they deserve recognition? What makes them special?"
                      value={nominationData.additionalMessage}
                      onChange={handleInputChange}
                      rows={3}
                      className="bg-gray-900 border-gray-600 text-white mt-1 placeholder-gray-400"
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmittingNomination}
                      className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-bold"
                    >
                      {isSubmittingNomination ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Submit Tip
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowNomination(false)}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </>
            )}

            {nominationSubmitted && (
              <>
                <div className="text-center mb-6">
                  <div className="h-16 w-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="h-8 w-8 text-black" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">TIP SUBMITTED SUCCESSFULLY!</h2>
                  <p className="text-gray-300 text-sm mb-6">
                    Your nomination has been filed. We'll review it and may feature them on the wall. Thanks for helping
                    us discover amazing founders!
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => router.push("/station/submit-launch")}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3"
                  >
                    Enter Builder Playground
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/")}
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    View Founder Wall
                  </Button>
                </div>
              </>
            )}

            {status === "error" && (
              <>
                <div className="text-center mb-6">
                  <div className="h-16 w-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="h-8 w-8 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-2">INVESTIGATION FAILED</h1>
                  <p className="text-gray-300 mb-6">{message}</p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => router.push("/station/submit-launch")}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                  >
                    Submit Launch
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/")}
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Back to Home
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Police tape footer */}
          <div className="h-8 w-full bg-yellow-400 relative overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: "repeating-linear-gradient(45deg, #000 0, #000 10px, #f6e05e 10px, #f6e05e 20px)",
                backgroundSize: "28px 28px",
              }}
            ></div>
          </div>
        </div>

        {/* Fingerprint decoration */}
        <div className="absolute -bottom-8 -right-8 opacity-10">
          <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
            <path
              d="M50,2 C74,2 94,22 94,46 C94,60 86,72 74,80 M50,2 C26,2 6,22 6,46 C6,60 14,72 26,80 M74,80 C66,86 58,90 50,90 C42,90 34,86 26,80"
              stroke="white"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}
