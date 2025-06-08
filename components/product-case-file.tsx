"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { formatDate, normalizeUsername } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Eye, Triangle, Loader2 } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import type { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

interface ProductCaseFileProps {
  product: {
    id: string
    slug: string
    caseId: string
    title: string
    founderName?: string
    logoUrl?: string | null
    category?: string
    status?: string
    summary: string[]
    launchDate: string
    productUrl?: string
    upvotes?: number
  }
  isMostWanted?: boolean
}

export function ProductCaseFile({ product, isMostWanted = false }: ProductCaseFileProps) {
  const [rotation, setRotation] = useState(0)
  const [pinPosition, setPinPosition] = useState({ x: 50, y: 15 })
  const [stainPosition, setStainPosition] = useState({ x: 70, y: 60, opacity: 0.1, scale: 0.5, rotation: 0 })
  const [upvotes, setUpvotes] = useState(product.upvotes || 0)
  const [isUpvoting, setIsUpvoting] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setIsLoading(false)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Generate random styling on mount
  useEffect(() => {
    // Random rotation between -1 and 1 degrees (reduced for better fit)
    const randomRotation = Math.random() * 2 - 1
    setRotation(randomRotation)

    // Random pin position
    const randomPinX = 40 + Math.random() * 20 // Between 40-60%
    const randomPinY = 10 + Math.random() * 10 // Between 10-20%
    setPinPosition({ x: randomPinX, y: randomPinY })

    // Random coffee stain
    const randomStainX = 50 + Math.random() * 40 // Between 50-90%
    const randomStainY = 40 + Math.random() * 40 // Between 40-80%
    const randomOpacity = 0.05 + Math.random() * 0.15 // Between 0.05-0.2
    const randomScale = 0.3 + Math.random() * 0.4 // Between 0.3-0.7
    const randomStainRotation = Math.random() * 360 // Full rotation
    setStainPosition({
      x: randomStainX,
      y: randomStainY,
      opacity: randomOpacity,
      scale: randomScale,
      rotation: randomStainRotation,
    })
  }, [])

  // Get only the first word of the founder name
  const founderFirstName = product.founderName ? product.founderName.split(" ")[0] : "Unknown"

  const handleUpvote = async () => {
    if (!user) {
      router.push(`/login?redirectedFrom=/launch`)
      return
    }

    setIsUpvoting(true)

    try {
      const response = await fetch(`/api/products/${product.slug}/upvote`, {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        setUpvotes(data.upvotes || 0)
      }
    } catch (error) {
    } finally {
      setIsUpvoting(false)
    }
  }

  // Create a normalized username for the URL
  const makerProfileUrl = product.founderName ? `/maker/${normalizeUsername(product.founderName)}` : "#"

  return (
    <div className="relative w-full flex justify-center">
      <div className="w-full max-w-[300px]">
        {/* Red Pin */}
        <div
          className="absolute z-20 w-5 h-5 bg-red-500 rounded-full shadow-lg"
          style={{
            top: "-6px",
            left: `${pinPosition.x}%`,
            transform: "translateX(-50%)",
          }}
        />

        {/* Main card */}
        <div
          className="relative z-10 w-full shadow-xl"
          style={{
            transform: `rotate(${rotation}deg)`,
            transformOrigin: `${pinPosition.x}% ${pinPosition.y}%`,
          }}
        >
          {/* Paper background with texture */}
          <div className="relative bg-[#FFF1C5] border-2 border-gray-800 rounded-sm overflow-hidden p-3">
            {/* Old paper texture overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: "url('https://w7.pngwing.com/pngs/930/611/png-transparent-retro-wall-texture-retro-texture-crack-thumbnail.png')",
                backgroundSize: "cover",
                opacity: 0.2,
                mixBlendMode: "luminosity",
              }}
            />

           

            {/* CONFIDENTIAL stamp for Most Wanted */}
            {isMostWanted && (
              <div className="absolute top-2 right-2 rotate-12 z-10">
                <div className="border-2 border-red-600 p-1">
                  <div className="text-red-600 font-bold text-xs leading-tight text-center font-mono">MOST WANTED</div>
                </div>
              </div>
            )}

            {/* Content with improved typography */}
            <div className="relative z-10">
              {/* Header with Case ID and Title */}
              <div className="mb-2">
                <div className="flex justify-between items-center mb-1">
                  <div className="bg-red-600 text-white px-1 py-0.5 text-xs font-bold inline-block">
                    CASE #{product.caseId}
                  </div>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <h2 className="text-base font-black uppercase tracking-tight text-black leading-tight font-mono">
                    {product.title}
                  </h2>
                  <div className="text-xs font-bold text-gray-700 font-mono">{formatDate(product.launchDate)}</div>
                </div>

                <div className="h-0.5 bg-gray-800 my-1"></div>
              </div>

              {/* Logo and Details */}
              <div className="flex gap-2 mb-2">
                {/* Logo with polaroid-like frame */}
                <div className="w-14 h-14 bg-white flex-shrink-0 p-0.5 shadow-md rotate-1 border border-gray-800">
                  {product.logoUrl ? (
                    <Image
                      src={product.logoUrl || "/placeholder.svg"}
                      alt={`${product.title} logo`}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                        <line x1="7" y1="7" x2="7.01" y2="7" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Details with improved typography */}
                <div className="flex-grow">
                  <div className="grid grid-cols-1 gap-y-0.5">
                    <div className="flex justify-between">
                      <span className="text-xs font-bold text-gray-800">Suspect:</span>
                      {product.founderName ? (
                        <Link
                          href={makerProfileUrl}
                          className="text-xs text-blue-800 font-semibold hover:underline truncate max-w-[120px]"
                        >
                          {founderFirstName}
                        </Link>
                      ) : (
                        <span className="text-xs text-gray-800 font-semibold">Unknown</span>
                      )}
                    </div>

                    <div className="flex justify-between">
                      <span className="text-xs font-bold text-gray-800">Category:</span>
                      <span className="text-xs text-gray-800 font-semibold uppercase truncate max-w-[120px]">
                        {product.category || "UNCAT"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-xs font-bold text-gray-800">Status:</span>
                      <span className="text-xs text-red-700 font-semibold truncate max-w-[120px]">
                        {product.status || "On the Run"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Evidence Summary with handwritten-like style */}
              <div className="mb-2">
                <div className="flex items-center mb-1">
                  <div className="w-2 h-2 bg-red-600 mr-1"></div>
                  <h3 className="text-xs font-black uppercase text-black font-mono">EVIDENCE SUMMARY</h3>
                </div>
                <ul className="space-y-1 pl-1">
                  {product.summary.slice(0, 3).map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-600 font-bold mr-1 flex-shrink-0">•</span>
                      <span className="text-xs text-black font-serif italic">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons styled like rubber stamps */}
              <div>
                <div className="h-0.5 bg-gray-800 mb-2"></div>
                <div className="flex gap-2">
                  <Button
                    asChild
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white border-none rounded-none text-xs font-bold py-1 h-auto px-2 font-mono shadow-md"
                  >
                    <Link href={`/launch/${product.slug}`} className="flex items-center justify-center">
                      <Eye className="mr-1 h-3 w-3" /> INVESTIGATE
                    </Link>
                  </Button>

                  <Button
                    onClick={handleUpvote}
                    disabled={isUpvoting || isLoading}
                    className={`flex-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded-none text-xs font-bold py-1 h-auto font-mono shadow-md flex items-center justify-center`}
                  >
                    {isUpvoting ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : (
                      <Triangle className="mr-1 h-3 w-3" />
                    )}
                    UPVOTE ({upvotes})
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
