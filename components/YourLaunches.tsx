"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"

function diffParts(target: Date) {
  const now = Date.now()
  const t = target.getTime()
  const delta = Math.max(0, t - now)
  const days = Math.floor(delta / (1000 * 60 * 60 * 24))
  const hours = Math.floor((delta % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((delta % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((delta % (1000 * 60)) / 1000)
  return { days, hours, minutes, seconds }
}

function Countdown({ iso }: { iso: string }) {
  const target = useMemo(() => new Date(iso), [iso])
  const [parts, setParts] = useState(() => diffParts(target))

  useEffect(() => {
    const id = setInterval(() => setParts(diffParts(target)), 1000)
    return () => clearInterval(id)
  }, [target])

  return (
    <div className="text-sm text-gray-300">
      {parts.days}d {parts.hours}h {parts.minutes}m {parts.seconds}s
    </div>
  )
}

type Product = {
  id: string
  slug: string
  title: string
  logo_url?: string
  tier?: "paid" | "free"
  queue_position?: number | null
  launch_date: string
  is_visible: boolean
  status?: string
  category?: string
}

function ScheduledBanner() {
  if (typeof window === "undefined") return null
  const params = new URLSearchParams(window.location.search)
  const scheduled = params.get("scheduled")
  const date = params.get("date")
  if (!scheduled) return null
  return (
    <div className="bg-emerald-900/40 border border-emerald-700 text-emerald-200 rounded-lg p-3">
      <div className="text-sm font-medium">Launch scheduled</div>
      <div className="text-xs">
        Your product is queued{date ? ` for ${new Date(date).toLocaleDateString()}` : ""}. It will appear automatically on launch day.
      </div>
    </div>
  )
}

export default function YourLaunches() {
  const [upcoming, setUpcoming] = useState<Product[]>([])
  const [launched, setLaunched] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/me/products", { cache: "no-store" })
        if (!res.ok) {
          const j = await res.json().catch(() => ({}))
          throw new Error(j.error || "Failed to load your launches")
        }
        const j = await res.json()
        setUpcoming(j.upcoming || [])
        setLaunched(j.launched || [])
      } catch (e: any) {
        setError(e.message || "Failed to load your launches")
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="h-5 w-40 bg-gray-800 rounded mb-4" />
        <div className="space-y-2">
          <div className="h-16 bg-gray-800 rounded" />
          <div className="h-16 bg-gray-800 rounded" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-red-300">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <ScheduledBanner />

      <section className="bg-gray-900 border border-gray-800 rounded-xl">
        <header className="px-4 py-3 border-b border-gray-800">
          <h3 className="text-white font-semibold">Upcoming Launches</h3>
          <p className="text-xs text-gray-400">These will go live automatically at 08:00 GMT on their launch day.</p>
        </header>
        <div className="p-4">
          {upcoming.length === 0 ? (
            <p className="text-gray-400 text-sm">No scheduled launches. Plan one from “Submit a Launch”.</p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcoming.map((p) => (
                <li key={p.id} className="bg-gray-800 border border-gray-700 rounded-lg p-3 flex items-start justify-between">
                  <div>
                    <div className="text-white font-medium">{p.title}</div>
                    <div className="text-xs text-gray-400">
                      Launching on {new Date(p.launch_date).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric" })} at 08:00 GMT
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Tier: {p.tier || "free"}{typeof p.queue_position === "number" ? ` • Queue #${p.queue_position}` : ""}
                    </div>
                  </div>
                  <div className="text-right">
                    <Countdown iso={p.launch_date} />
                    <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-wide">Time remaining</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="bg-gray-900 border border-gray-800 rounded-xl">
        <header className="px-4 py-3 border-b border-gray-800">
          <h3 className="text-white font-semibold">Launched</h3>
          <p className="text-xs text-gray-400">Your past and live launches.</p>
        </header>
        <div className="p-4">
          {launched.length === 0 ? (
            <p className="text-gray-400 text-sm">No launches yet.</p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {launched.map((p) => (
                <li key={p.id} className="bg-gray-800 border border-gray-700 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">{p.title}</div>
                    <div className="text-xs text-gray-400">
                      Launched on {new Date(p.launch_date).toLocaleDateString()}
                    </div>
                  </div>
                  <Link href={`/launch/${p.slug}`} className="text-xs bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1 rounded">
                    View
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}
