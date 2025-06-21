"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Check, ChevronDown, MessageCircle, Send, Share2, Users, Flame, Loader2, Paperclip } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import type { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import type { Mugshot } from "@/lib/types"

// We need to define the launch and launch support types based on the db schema
type SupportType = "FEEDBACK" | "SOCIAL_SUPPORT" | "FIRST_TESTERS"

interface Launch {
  id: string
  user_id: string
  product_name: string
  description?: string
  launch_date: string
  launch_links?: any // JSONB
  support_types?: SupportType[]
  image_url?: string
  status?: "LAUNCHING" | "LAUNCHED"
  created_at: string
  // Joined data
  mugshot?: Mugshot
  supporters: { supporter_id: string; support_type: SupportType; mugshot?: Mugshot }[]
  showReturnSignal?: boolean
}

interface LaunchCardProps {
  launch: Launch
  currentUser: User | null
}

export function LaunchCard({ launch, currentUser }: LaunchCardProps) {
  const router = useRouter()
  const [isPledging, setIsPledging] = useState(false)
  const [userHasPledged, setUserHasPledged] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [pinPosition, setPinPosition] = useState({ x: 50, y: 15 })

  useEffect(() => {
    if (currentUser) {
      const pledged = launch.supporters.some((s) => s.supporter_id === currentUser.id)
      setUserHasPledged(pledged)
    }
  }, [currentUser, launch.supporters])

  useEffect(() => {
    // Random rotation between -1 and 1 degrees
    const randomRotation = Math.random() * 2 - 1
    setRotation(randomRotation)
    // Random pin position
    const randomPinX = 40 + Math.random() * 20 // 40-60%
    const randomPinY = 10 + Math.random() * 10 // 10-20%
    setPinPosition({ x: randomPinX, y: randomPinY })
  }, [])

  const handleTogglePledge = async () => {
    if (!currentUser) {
      router.push("/login?redirectedFrom=/uplift")
      return
    }

    setIsPledging(true)
    const originalPledgeStatus = userHasPledged

    // Optimistic Update
    setUserHasPledged(!originalPledgeStatus)

    try {
      const response = await fetch(`/api/launches/${launch.id}/pledge`, {
        method: originalPledgeStatus ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: originalPledgeStatus ? undefined : JSON.stringify({ support_types: launch.support_types || [] }),
      })

      if (response.ok) {
        router.refresh() // Refresh to get the latest supporters list
      } else {
        setUserHasPledged(originalPledgeStatus) // Revert on failure
        console.error("Failed to update pledge")
      }
    } catch (error) {
      setUserHasPledged(originalPledgeStatus) // Revert on error
      console.error("Error updating pledge:", error)
    } finally {
      setIsPledging(false)
    }
  }

  const supportTypeIcons: Record<SupportType, React.ReactNode> = {
    FEEDBACK: <MessageCircle className="w-4 h-4" />,
    SOCIAL_SUPPORT: <Share2 className="w-4 h-4" />,
    FIRST_TESTERS: <Users className="w-4 h-4" />,
  }

  const supportTypeLabels: Record<SupportType, string> = {
    FEEDBACK: "Feedback",
    SOCIAL_SUPPORT: "Share",
    FIRST_TESTERS: "Test",
  }

  // De-duplicate supporters to handle multiple pledge types per person
  const uniqueSupporters = Array.from(new Map(launch.supporters.map((item) => [item.supporter_id, item])).values())
  
  const launchDate = new Date(launch.launch_date);
  const month = launchDate.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const day = launchDate.getDate();

  return (
    <div className="relative w-full flex justify-center">
      <div className="w-full max-w-sm">
        {/* Red Pin */}
        <div
          className="absolute z-20 w-5 h-5 bg-red-500 rounded-full shadow-lg"
          style={{
            top: "-10px",
            left: `${pinPosition.x}%`,
            transform: "translateX(-50%)",
          }}
        />
        {/* Main card with tilt */}
        <div
          className="bg-[#FFF1C5] z-10 relative border-2 border-zinc-800 rounded-lg overflow-hidden font-mono shadow-lg w-full transform hover:-translate-y-1 transition-transform duration-300"
          style={{
            transform: `rotate(${rotation}deg)` ,
            transformOrigin: `${pinPosition.x}% ${pinPosition.y}%`,
          }}
        >
          <div className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "url('https://w7.pngwing.com/pngs/930/611/png-transparent-retro-wall-texture-retro-texture-crack-thumbnail.png')",
              backgroundSize: "cover",
              opacity: 0.1,
              mixBlendMode: "luminosity",
            }}
          />
          <div className="p-5">
            <div className="flex justify-between items-start">
                 <div className="flex items-center mb-3">
                    <Image
                      src={launch.image_url || "/images/mugshots/placeholder.png"}
                      alt={launch.product_name}
                      width={48}
                      height={48}
                      className="rounded-full border-2 border-zinc-700 object-cover mr-3"
                    />
                  <div>
                    <h3 className="font-bold text-lg text-zinc-800">{launch.product_name}</h3>
                    <p className="text-sm text-zinc-800">
                      by{" "}
                      <Link
                        href={`/maker/${launch.mugshot?.name ? launch.mugshot.name.replace(/\s+/g, "-").toLowerCase() : ''}`}
                        className="font-semibold text-red-500 hover:text-zinc-500 transition-colors"
                      >
                        {launch.mugshot?.name || "a founder"}
                      </Link>
                    </p>
                  </div>
                </div>
                <div className="text-center bg-zinc-800 border-2 border-zinc-700 rounded-md px-3 py-1 shadow-inner">
                    <p className="text-red-500 font-black text-2xl tracking-wider">{day}</p>
                    <p className="text-zinc-100 font-bold text-sm -mt-1">{month}</p>
                </div>
            </div>

            <p className="text-sm text-zinc-800 my-4 border-t border-b border-dashed border-zinc-700 py-3">{launch.description}</p>
            
            <div className="mb-4">
                <h4 className="text-sm font-semibold text-zinc-600 mb-2 uppercase tracking-wider">Intel Drop (Support Needed):</h4>
                <div className="flex flex-wrap gap-2">
                    {launch.support_types?.map((type) => (
                        <span key={type} className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-semibold mr-2 px-2.5 py-1 rounded-full flex items-center">
                            {supportTypeIcons[type]}
                            <span className="ml-1.5">{supportTypeLabels[type]}</span>
                        </span>
                    ))}
                    {(!launch.support_types || launch.support_types.length === 0) && (
                        <p className="text-sm text-zinc-500">No specific support requested.</p>
                    )}
                </div>
            </div>

            <Button
                onClick={handleTogglePledge}
                disabled={isPledging || launch.status === 'LAUNCHED'}
                className={`w-full flex justify-center items-center transition-all duration-300 font-bold text-base py-3 border-2 rounded-md
                  ${launch.status === 'LAUNCHED'
                    ? 'bg-gray-800 border-gray-500 text-gray-400 cursor-not-allowed opacity-60'
                    : userHasPledged
                      ? 'bg-green-600 border-green-500 text-black hover:bg-green-600/30 hover:border-green-400'
                      : 'bg-red-600 border-red-500 text-red-300 hover:bg-red-600/30 hover:border-red-400'}
                `}
              >
                {launch.status === 'LAUNCHED' ? (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    Pledging Closed
                  </>
                ) : isPledging ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : userHasPledged ? (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    Pledge Secured
                  </>
                ) : (
                  <>Pledge to Support</>
                )}
              </Button>
        </div>
      
        {uniqueSupporters.length > 0 && (
          <div className=" px-5 py-3 border-t-2 border-dashed border-zinc-800">
            <h4 className="text-sm font-semibold text-zinc-800 mb-2 flex items-center uppercase tracking-wider">
              <Flame className="w-4 h-4 mr-2 text-red-500" />
              Supporters ({uniqueSupporters.length}):
            </h4>
            <div className="flex flex-wrap gap-2 mt-2">
              {uniqueSupporters.map((supporter) => (
                <Link
                  key={supporter.supporter_id}
                  href={`/maker/${supporter.mugshot?.name ? supporter.mugshot.name.replace(/\s+/g, "-").toLowerCase() : ''}`}
                >
                  <div className="flex items-center bg-zinc-800 rounded-full p-0.5 pr-2 text-xs hover:bg-zinc-700 transition-colors cursor-pointer border border-zinc-700">
                    <Image
                        src={supporter.mugshot?.imageUrl || "/images/mugshots/placeholder.png"}
                        alt={supporter.mugshot?.name || "Supporter"}
                        width={18}
                        height={18}
                        className="rounded-full object-cover"
                    />
                    <span className="ml-1 font-semibold text-zinc-300">{supporter.mugshot?.name || "A Supporter"}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        {/* LAUNCH LINKS: Only show if launched and links exist */}
        {launch.status === 'LAUNCHED' && launch.launch_links && (
          Array.isArray(launch.launch_links) && launch.launch_links.length > 0 ? (
            <div className=" px-5 py-3 border-t-2 border-green-700 mt-2 rounded-b-lg">
              <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center uppercase tracking-wider">
                <ArrowRight className="w-4 h-4 mr-2" />
                Go Support This Launch:
              </h4>
              <div className="flex flex-wrap gap-3 mt-2">
                {launch.launch_links.map((link: { label: string; url: string }, idx: number) => (
                  link.url && link.label ? (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center bg-green-700 hover:bg-green-600 text-white font-bold px-3 py-1 rounded-full text-xs transition-colors border border-green-500 shadow"
                    >
                      <Paperclip className="w-3 h-3 mr-1" />
                      {link.label}
                    </a>
                  ) : null
                ))}
              </div>
            </div>
          ) :
          (typeof launch.launch_links === 'object' && launch.launch_links !== null && Object.keys(launch.launch_links).length > 0) ? (
            <div className="bg-green-900/40 px-5 py-3 border-t-2 border-green-700 mt-2 rounded-b-lg">
              <h4 className="text-sm font-semibold text-green-300 mb-2 flex items-center uppercase tracking-wider">
                <ArrowRight className="w-4 h-4 mr-2 text-green-400" />
                Go Support This Launch:
              </h4>
              <div className="flex flex-wrap gap-3 mt-2">
                {Object.entries(launch.launch_links).map(([platform, url]) => (
                  (typeof url === 'string' && url.trim().length > 0) ? (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center bg-green-700 hover:bg-green-600 text-white font-bold px-3 py-1 rounded-full text-xs transition-colors border border-green-500 shadow"
                    >
                      <Paperclip className="w-3 h-3 mr-1" />
                      {platform.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </a>
                  ) : null
                ))}
              </div>
            </div>
          ) : null
        )}
        {/* STATUS BADGE (top-right) */}
        <div
          className={`absolute top-2 -right-2 px-2 py-1 text-xs font-bold uppercase rotate-12 transform rounded shadow-lg z-10 ${
            launch.status === 'LAUNCHED'
              ? 'bg-green-500 text-black'
              : 'bg-yellow-400 text-black'
          }`}
          style={{fontFamily: "'Courier New', Courier, monospace"}}
        >
          {launch.status === 'LAUNCHED' ? 'LAUNCHED' : 'LAUNCHING'}
        </div>
          </div>
        </div>
      </div>
    )
}
