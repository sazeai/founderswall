"use client"

import { formatDate } from "@/lib/utils"
import { ProductCaseFile } from "@/components/product-case-file"
import { ArrowLeft, ExternalLink, Calendar, Tag, Clock, Award, MapPin, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import type { Mugshot, Product, Launch } from "@/lib/types"

interface MakerProfileClientProps {
  username: string
  mugshot: Mugshot
  products: Product[]
  launches: Launch[]
}

export default function MakerProfileClient({
  username,
  mugshot,
  products,
  launches,
}: MakerProfileClientProps) {
  // Calculate some stats
  const totalUpvotes = products.reduce((sum, product) => sum + (product.upvotes || 0), 0)
  const firstLaunchDate = products.length > 0 ? new Date(products[0].launchDate) : null
  const daysSinceFirstLaunch = firstLaunchDate
    ? Math.floor((Date.now() - firstLaunchDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0

  // Generate a random "last seen" date (within the last 7 days)
  const [lastSeen, setLastSeen] = useState<string>("")
  const [streak, setStreak] = useState<number>(0)
  const [randomFunFact, setRandomFunFact] = useState<string>("")

  useEffect(() => {
    const lastSeenDays = Math.floor(Math.random() * 7)
    const newLastSeen = lastSeenDays === 0 ? "Today" : lastSeenDays === 1 ? "Yesterday" : `${lastSeenDays} days ago`
    setLastSeen(newLastSeen)

    const newStreak = Math.floor(Math.random() * 30) + 1
    setStreak(newStreak)

    const funFacts = [
      "Ships products faster than they can name them",
      "Once deployed to production at 4:59pm on a Friday",
      "Believes that 'it works on my machine' is a valid defense",
      "Has never met a bug they couldn't turn into a 'feature'",
      "Considers coffee as a primary food group",
      "Thinks 'sleep' is just a suggestion, not a requirement",
      "Has a keyboard shortcut for 'It's not a bug, it's a feature'",
      "Debugs code by talking to rubber ducks",
      "Believes version control is just saving multiple copies with different filenames",
      "Has a special relationship with Stack Overflow",
    ]
    const newRandomFunFact = funFacts[Math.floor(Math.random() * funFacts.length)]
    setRandomFunFact(newRandomFunFact)
  }, [])

  // Handle share functionality
  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/maker/${username}`

  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Back button */}
        <div className="h-12 flex items-center px-4 mb-6">
          <Link href="/launch" className="flex items-center text-white font-bold">
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span>RETURN TO HEIST BOARD</span>
          </Link>
        </div>

        {/* Crime scene tape header */}
        <div className="relative mb-8">
          <div className="h-12 bg-yellow-400 relative overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: "repeating-linear-gradient(45deg, #000 0, #000 10px, #f6e05e 10px, #f6e05e 20px)",
                backgroundSize: "28px 28px",
              }}
            ></div>
          </div>
        </div>

        {/* Suspect Profile Card */}
        <div className="bg-zinc-900 border border-zinc-800 mb-8 shadow-lg shadow-black/50">
          <div className="border-b border-zinc-800 bg-zinc-800 p-3 flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold mr-2">
                !
              </div>
              <h2 className="text-lg font-bold">SUSPECT PROFILE</h2>
            </div>
            <div className="bg-red-600/80 text-white px-2 py-0.5 text-xs uppercase font-bold">
              Case #{mugshot.id.substring(0, 6).toUpperCase()}
            </div>
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Mugshot Image */}
              <div className="md:w-1/4 flex flex-col items-center">
                <div className="relative w-48 h-64 bg-zinc-800 mb-3">
                  {mugshot.imageUrl ? (
                    <Image
                      src={mugshot.imageUrl || "/placeholder.svg"}
                      alt={mugshot.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="h-16 w-16 text-zinc-600" />
                    </div>
                  )}

                  {/* Mugshot height markers */}
                  <div className="absolute inset-y-0 left-0 w-4 bg-zinc-900 flex flex-col justify-between p-1">
                    <div className="w-full h-0.5 bg-white"></div>
                    <div className="w-full h-0.5 bg-white"></div>
                    <div className="w-full h-0.5 bg-white"></div>
                    <div className="w-full h-0.5 bg-white"></div>
                    <div className="w-full h-0.5 bg-white"></div>
                  </div>

                  {/* Mugshot ID */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 py-1 px-2 text-center">
                    <p className="text-white text-xs font-mono">
                      {formatDate(mugshot.createdAt || new Date().toISOString())}
                    </p>
                  </div>
                </div>

                {/* Name and Crime */}
                <div className="text-center mb-4">
                  <h1 className="text-2xl font-bold">{mugshot.name}</h1>
                  <p className="text-red-400 italic">"{mugshot.crime}"</p>
                </div>

                {/* External Links */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {mugshot.productUrl && (
                    <a
                      href={mugshot.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 text-sm"
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                      Website
                    </a>
                  )}
                  {mugshot.twitterHandle && (
                    <a
                      href={`https://twitter.com/${mugshot.twitterHandle.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 text-sm"
                    >
                      <span className="mr-1.5 font-bold">𝕏</span>
                      Twitter
                    </a>
                  )}
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: `${mugshot.name} | FoundersWall`,
                          text: `Check out ${mugshot.name}'s maker profile on FoundersWall!`,
                          url: shareUrl,
                        })
                      } else {
                        navigator.clipboard.writeText(shareUrl)
                        alert("Profile link copied to clipboard!")
                      }
                    }}
                    className="flex items-center bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 text-sm"
                  >
                    Share
                  </button>
                </div>
              </div>

              {/* Suspect Details */}
              <div className="md:w-3/4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Stats */}
                  <div className="space-y-4">
                    <div className="bg-zinc-800 p-4 border-l-2 border-red-500">
                      <div className="flex items-center">
                        <Award className="h-5 w-5 text-red-500 mr-3" />
                        <div>
                          <div className="text-xs text-zinc-400">TOTAL UPVOTES</div>
                          <div className="text-xl font-bold">{totalUpvotes}</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-zinc-800 p-4 border-l-2 border-blue-500">
                      <div className="flex items-center">
                        <Tag className="h-5 w-5 text-blue-500 mr-3" />
                        <div>
                          <div className="text-xs text-zinc-400">PRODUCTS LAUNCHED</div>
                          <div className="text-xl font-bold">{products.length}</div>
                        </div>
                      </div>
                    </div>

                   
                  </div>

                  {/* Additional Info */}
                  <div className="space-y-4">
                    {firstLaunchDate && (
                      <div className="bg-zinc-800 p-4 border-l-2 border-yellow-500">
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 text-yellow-500 mr-3" />
                          <div>
                            <div className="text-xs text-zinc-400">FIRST LAUNCH</div>
                            <div className="text-lg">{formatDate(firstLaunchDate.toISOString())}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-zinc-800 p-4 border-l-2 border-green-500">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-green-500 mr-3" />
                        <div>
                          <div className="text-xs text-zinc-400">LAST SEEN</div>
                          <div className="text-lg">{lastSeen}</div>
                        </div>
                      </div>
                    </div>

                   
                  </div>
                </div>

                {/* Notes */}
                {mugshot.note && (
                  <div className="mt-6 bg-zinc-800 p-4 border-l-2 border-yellow-500">
                    <div className="text-xs text-zinc-400 mb-2">CASE NOTES</div>
                    <p className="text-zinc-300">{mugshot.note}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-zinc-900 border border-zinc-800 shadow-lg shadow-black/50">
          <div className="border-b border-zinc-800 bg-zinc-800 p-3 flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold mr-2">
                2
              </div>
              <h2 className="text-lg font-bold">EVIDENCE FILES ({products.length})</h2>
            </div>
            {daysSinceFirstLaunch > 0 && (
              <div className="text-xs bg-yellow-400 text-black px-2 py-0.5 rotate-3 z-10">
                {daysSinceFirstLaunch} DAYS OF ACTIVITY
              </div>
            )}
          </div>

          <div className="p-6">
            {products.length === 0 ? (
              <div className="text-center py-12 bg-zinc-800">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-700 flex items-center justify-center">
                  <Clock className="h-8 w-8 text-zinc-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">No Evidence Found</h3>
                <p className="text-zinc-500">This suspect hasn't launched any products yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="h-[400px]">
                    <ProductCaseFile
                      product={{
                        ...product,
                        founderName: mugshot.name,
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}