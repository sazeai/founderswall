import type React from "react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/server"
import { Camera, FileText, Users, Eye, Edit, Crown, Star, PlusCircle } from "lucide-react"
import { StationHeaderClient } from "@/components/StationHeaderClient"

export default async function StationDashboard() {
  const supabase = await createClient()

  // Get user data
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="container mx-auto px-4">
        <p>Please log in to access your station.</p>
      </div>
    )
  }

  // Get user's mugshot
  const { data: userMugshot } = await supabase.from("mugshots").select("*").eq("user_id", user.id).single()

  // Get user's mugshots count
  const { count: mugshotsCount } = await supabase
    .from("mugshots")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  // Get user's products count (if mugshot exists)
  let productsCount = 0
  if (userMugshot) {
    const { count: pCount } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("founder_id", userMugshot.id)
    productsCount = pCount || 0
  }

  // Get user's nominations count
  const { count: nominationsCount } = await supabase
    .from("nominations")
    .select("*", { count: "exact", head: true })
    .eq("supporter_user_id", user.id)

  // Get user's connections count
  const { count: connectionsCount } = await supabase
    .from("connections")
    .select("*", { count: "exact", head: true })
    .eq("created_by", user.email)

  // Get user's support requests (launches) count
  const { count: supportRequestsCount } = await supabase
    .from("launches")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  // Get user profile for badge type
  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select("badge_type")
    .eq("user_id", user.id)
    .single()

  const badgeType = userProfile?.badge_type || "wanted"

  // Get user's pins count
  const { count: pinsCount } = await supabase
    .from("pins")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Your Station</h1>
        <StationHeaderClient />
      </header>

      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-red-500 stamped-text">DETECTIVE STATION</h1>
        <p className="text-gray-400">Your criminal investigation headquarters</p>
      </div>

      {/* Criminal Status Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg p-6 mb-8 relative">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2 text-white">Your Indie Crime Status</h2>
            <div className="flex items-center gap-2">
              {badgeType === "community_pick" && <Crown className="w-5 h-5 text-yellow-400" />}
              {badgeType === "startup_saviour" && <Star className="w-5 h-5 text-blue-400" />}
              <span className="text-lg font-bold text-white uppercase tracking-wider">
                {badgeType === "wanted" && <span className="font-handwriting text-yellow-400">WANTED</span>}
                {badgeType === "community_pick" && "COMMUNITY PICK"}
                {badgeType === "startup_saviour" && "STARTUP SAVIOUR"}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-1">
              {badgeType === "wanted" && "Create a mugshot or nominate someone to upgrade your status"}
              {badgeType === "community_pick" && "You've been selected by the community!"}
              {badgeType === "startup_saviour" && "You've helped nominate underdog talented builder to the wall"}
            </p>
          </div>
          <div className="text-right">
            {userMugshot ? (
              <div className="flex flex-col items-end">
                <span className="flex items-center gap-2 text-green-400 font-bold uppercase">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-400"></span>IN CUSTODY
                </span>
                <p className="text-gray-400 text-sm">Mugshot on file</p>
              </div>
            ) : (
              <div className="flex flex-col items-end">
                <span className="flex items-center gap-2 text-red-500 font-bold uppercase">
                  <span className="inline-block w-2 h-2 rounded-full bg-red-500"></span>AT LARGE
                </span>
                <p className="text-gray-400 text-sm">No mugshot yet</p>
              </div>
            )}
          </div>
        </div>
        {/* Small tape accent */}
        <div className="absolute -top-2 left-8 w-12 h-2 bg-yellow-400/80 rounded shadow-sm z-10"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <CriminalStatCard
          title="Your Mugshot"
          value={mugshotsCount || 0}
          icon={<Camera className="w-8 h-8 text-yellow-400" />}
          linkText={userMugshot ? "Edit Mugshot" : "Get Arrested"}
          linkHref={userMugshot ? "/station/edit-mugshot" : "/station/get-arrested"}
          status={userMugshot ? "active" : "missing"}
        />

        <CriminalStatCard
          title="All Submissions"
          value={productsCount}
          icon={<FileText className="w-8 h-8 text-blue-400" />}
          linkText="Submit Product"
          linkHref="/station/submit-launch"
          status="normal"
        />

        <CriminalStatCard
          title="Request Support"
          value={supportRequestsCount || 0}
          icon={<Users className="w-8 h-8 text-red-400" />}
          linkText="Request Support"
          linkHref="/station/show-up"
          status="normal"
        />

        <div className="relative">
          <CriminalStatCard
            title="Build Logs"
            value={pinsCount || 0}
            icon={<FileText className="w-8 h-8 text-green-400" />}
            linkText="View & Edit Logs"
            linkHref="/station/logs"
            status="normal"
          />
        </div>
      </div>

      {/* Action Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Criminal Operations */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg relative">
          <h2 className="text-xl font-bold mb-4 text-white">FOUNCER ACTIVITIES</h2>
          <div className="space-y-4">
            {!userMugshot ? (
              <CriminalActionCard
                title="Get Arrested"
                description="Create your suspect mugshot and join the wall"
                icon={<Camera className="w-6 h-6" />}
                href="/station/get-arrested"
                priority="high"
              />
            ) : (
              <CriminalActionCard
                title="Edit Your Mugshot"
                description="Update your founder profile and details"
                icon={<Edit className="w-6 h-6" />}
                href="/station/edit-mugshot"
                priority="normal"
              />
            )}

            <CriminalActionCard
              title="Submit Product Evidence"
              description="Add your product to the Heist Board"
              icon={<FileText className="w-6 h-6" />}
              href="/station/show-up"
              priority="normal"
            />

            <CriminalActionCard
              title="Submit Ghost Project"
              description="List your abandoned project for others to learn or revive"
              icon={<PlusCircle className="w-6 h-6" />}
              href="/station/submit-ghost"
              priority="normal"
            />

            {userMugshot && (
              <CriminalActionCard
                title="Share Your Arrest"
                description="Spread the word about your criminal activity"
                icon={<Users className="w-6 h-6" />}
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `Just got arrested on the #FoundersWall 🚨
I'm officially guilty of building in public

${process.env.NEXT_PUBLIC_APP_URL}/maker/${userMugshot.name.toLowerCase().replace(/\s+/g, "-")}`,
                )}`}
                priority="normal"
                external={true}
              />
            )}
            {/* Small tape accent */}
            <div className="absolute -top-2 left-8 w-10 h-2 bg-yellow-400/80 rounded shadow-sm z-10"></div>
          </div>
        </div>

        {/* Investigation Activities */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg relative">
          <h2 className="text-xl font-bold mb-4 text-white">INVESTIGATION ACTIVITIES</h2>
          <div className="space-y-4">
            <CriminalActionCard
              title="View The Wall"
              description="Browse all criminals and their mugshots"
              icon={<Eye className="w-6 h-6" />}
              href="/"
              priority="normal"
            />

            <CriminalActionCard
              title="Investigate Products"
              description="Browse the Heist Board for criminal Build Log"
              icon={<FileText className="w-6 h-6" />}
              href="/launch"
              priority="normal"
            />

            <CriminalActionCard
              title="Browse Ghost Projects"
              description="Discover abandoned projects and hidden gems"
              icon={<Eye className="w-6 h-6" />}
              href="/ghost"
              priority="normal"
            />
            <div className="absolute -top-2 right-8 w-10 h-2 bg-yellow-400/80 rounded shadow-sm z-10"></div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-white">CASE FILE ACTIVITY</h2>
        <div className="space-y-4">
          <ActivityItem
            title="Detective Account Created"
            description="Your investigation credentials have been established"
            time="Account creation"
            type="system"
          />
          {userMugshot && (
            <ActivityItem
              title="Criminal Mugshot Filed"
              description={`Arrested for: ${userMugshot.crime}`}
              time={new Date(userMugshot.created_at).toLocaleDateString()}
              type="arrest"
            />
          )}
          {(nominationsCount || 0) > 0 && (
            <ActivityItem
              title={`${nominationsCount} Criminal${(nominationsCount || 0) > 1 ? "s" : ""} Nominated`}
              description="You've helped identify suspects for the wall"
              time="Recent activity"
              type="nomination"
            />
          )}
        </div>
      </div>

    
    </div>
  )
}

function CriminalStatCard({
  title,
  value,
  icon,
  linkText,
  linkHref,
  status,
}: {
  title: string
  value: number | string
  icon: React.ReactNode
  linkText: string
  linkHref: string
  status: "active" | "missing" | "normal"
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        {icon}
      </div>
      <p className="text-3xl font-bold text-white mb-4">{value}</p>
      <Link
        href={linkHref}
        className={`text-sm flex items-center font-bold underline underline-offset-2 transition-colors ${
          status === "missing"
            ? "text-red-400 hover:text-red-300"
            : status === "active"
              ? "text-green-400 hover:text-green-300"
              : "text-yellow-400 hover:text-yellow-300"
        }`}
      >
        {linkText}
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  )
}

function CriminalActionCard({
  title,
  description,
  icon,
  href,
  priority,
  external = false,
}: {
  title: string
  description: string
  icon: React.ReactNode
  href: string
  priority: "high" | "normal"
  external?: boolean
}) {
  const className = `block rounded-xl p-4 shadow-md border border-gray-800 bg-gray-900 transition-colors hover:border-yellow-400`
  const content = (
    <div className="flex items-start space-x-3">
      <div className={`rounded-full p-2 bg-gray-800 border-2 border-yellow-400 shadow-sm`}>{icon}</div>
      <div className="flex-1">
        <h3 className="font-bold text-white text-base">{title}</h3>
        <p className="text-sm text-gray-300">{description}</p>
      </div>
    </div>
  )
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    )
  }
  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  )
}

function ActivityItem({
  title,
  description,
  time,
  type,
}: {
  title: string
  description: string
  time: string
  type: "system" | "arrest" | "nomination"
}) {
  const getColor = () => {
    switch (type) {
      case "arrest":
        return "border-red-500"
      case "nomination":
        return "border-blue-500"
      default:
        return "border-yellow-400"
    }
  }
  return (
    <div className={`border-l-4 pl-4 py-2 rounded shadow-sm bg-gray-900 border-gray-800 ${getColor()}`}>
      <h4 className="font-bold text-white">{title}</h4>
      <p className="text-sm text-gray-300">{description}</p>
      <p className="text-xs text-gray-500 mt-1">{time}</p>
    </div>
  )
}
