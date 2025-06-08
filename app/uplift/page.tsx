import { createClient } from "@/utils/supabase/server"
import { getMugshotsByUserIds } from "@/lib/mugshot-service"
import { LaunchCard } from "@/components/launch-card"
import type { Mugshot } from "@/lib/types"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { PublicHeader } from "@/components/public-header"

type SupportType = "FEEDBACK" | "SOCIAL_SUPPORT" | "FIRST_TESTERS"

interface LaunchFromDB {
  id: string
  user_id: string
  product_name: string
  description?: string
  launch_date: string
  launch_links?: any
  support_types?: SupportType[]
  image_url?: string
  status?: "LAUNCHING" | "LAUNCHED"
  created_at: string
}

interface LaunchSupportFromDB {
  id: string
  launch_id: string
  supporter_id: string
  support_type: SupportType
}

interface Launch {
  id: string
  user_id: string
  product_name: string
  description?: string
  launch_date: string
  launch_links?: any
  support_types?: SupportType[]
  image_url?: string
  status?: "LAUNCHING" | "LAUNCHED"
  created_at: string
  mugshot?: Mugshot
  supporters: { supporter_id: string; support_type: SupportType; mugshot?: Mugshot }[]
  showReturnSignal?: boolean
}

export default async function UpliftPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let pastSupporters = new Set<string>()
  if (user) {
    const { data: myLaunches } = await supabase.from("launches").select("id").eq("user_id", user.id)
    if (myLaunches && myLaunches.length > 0) {
      const myLaunchIds = myLaunches.map((l) => l.id)
      const { data: mySupporters } = await supabase.from("launch_supports").select("supporter_id").in("launch_id", myLaunchIds)
      if (mySupporters) {
        mySupporters.forEach((s) => pastSupporters.add(s.supporter_id))
      }
    }
  }

  const { data: launchesData, error: launchesError } = await supabase.from("launches").select("*").order("launch_date", { ascending: true })
  const { data: supportsData, error: supportsError } = await supabase.from("launch_supports").select("*")

  if (launchesError || supportsError) {
    console.error(launchesError || supportsError)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500">Error Loading Launches</h1>
            <p className="text-gray-400">There was a problem fetching the launch data. Please try again later.</p>
        </div>
      </div>
    )
  }

  const userIds = new Set<string>()
  launchesData.forEach((l) => userIds.add(l.user_id))
  supportsData.forEach((s) => userIds.add(s.supporter_id))

  const mugshots = await getMugshotsByUserIds(Array.from(userIds))
  const mugshotsMap = new Map(mugshots.map((m) => [m.userId, m]))

  const launches: Launch[] = launchesData.map((launch: LaunchFromDB) => {
    const supporters =
      supportsData
        .filter((support) => support.launch_id === launch.id)
        .map((support: LaunchSupportFromDB) => ({
          ...support,
          mugshot: mugshotsMap.get(support.supporter_id),
        })) || []

    const showReturnSignal = pastSupporters.has(launch.user_id)

    return {
      ...launch,
      mugshot: mugshotsMap.get(launch.user_id),
      supporters,
      showReturnSignal,
    }
  })

  const today = new Date()
  today.setHours(0,0,0,0);

  const todaysLaunches = launches.filter((l) => {
    const launchDate = new Date(l.launch_date);
    launchDate.setHours(0,0,0,0);
    return launchDate.getTime() === today.getTime();
  });

  const upcomingLaunches = launches.filter((l) => {
      const launchDate = new Date(l.launch_date);
      launchDate.setHours(0,0,0,0);
      return launchDate.getTime() > today.getTime();
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <PublicHeader />
      {/* Header */}
      <section className="pt-24 px-6 pb-4 text-center">
        <h1
          className="text-white text-3xl sm:text-5xl font-bold tracking-wider mb-4 glitch-text"
          data-text="THE LAUNCH ALLIANCE"
        >
          THE LAUNCH ALLIANCE
        </h1>
        <h2 className="text-white text-2xl sm:text-4xl font-bold tracking-wider mb-4" data-text="FOUNDERS BACKING FOUNDERS">
          FOUNDERS BACKING FOUNDERS
        </h2>
        <p className="text-gray-200 max-w-2xl mx-auto font-semibold">
          The weekly thread for builders launching soon. Pledge your support and get backed by the alliance.
        </p>
         <Link href="/station/show-up" className="mt-6 inline-block">
            <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white font-bold text-lg shadow-lg transform hover:scale-105 transition-transform">
              + Request Support
            </Button>
          </Link>
      </section>

      {/* Yellow Caution Stripe */}
      <div className="h-8 w-full bg-yellow-400 relative overflow-hidden my-6">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg, #000 0, #000 10px, #f6e05e 10px, #f6e05e 20px)",
            backgroundSize: "28px 28px",
          }}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-black text-xs font-bold tracking-wider uppercase">ALLIANCE BRIEFING - EYES ONLY</span>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid grid-cols-2 mb-8 bg-zinc-900 border border-zinc-800">
                <TabsTrigger value="upcoming" className="text-gray-200 font-semibold">
                🗓️ Upcoming Missions
                </TabsTrigger>
                <TabsTrigger value="today" className="text-gray-200 font-semibold">
                🚀 Today's Targets
                </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
                {upcomingLaunches.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {upcomingLaunches.map((launch) => (
                            <LaunchCard key={launch.id} launch={launch} currentUser={user} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-400">
                        <p>No upcoming missions on the roster. Check back soon!</p>
                    </div>
                )}
            </TabsContent>

            <TabsContent value="today">
                {todaysLaunches.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {todaysLaunches.map((launch) => (
                            <LaunchCard key={launch.id} launch={launch} currentUser={user} />
                        ))}
                    </div>
                 ) : (
                    <div className="text-center py-12 text-gray-400">
                        <p>No launches targeted for today. All clear... for now.</p>
                    </div>
                )}
            </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 