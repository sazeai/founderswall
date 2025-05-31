import type React from "react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/server"
import { Camera, FileText, Users, Eye, Edit, Crown, Star } from "lucide-react"

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

  // Get user profile for badge type
  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select("badge_type")
    .eq("user_id", user.id)
    .single()

  const badgeType = userProfile?.badge_type || "wanted"

  return (
    <div className="container mx-auto p-2">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-red-500">DETECTIVE STATION</h1>
        <p className="text-gray-400">Your criminal investigation headquarters</p>
      </div>

      {/* Criminal Status Card */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2">Your Indie Crime Status</h2>
            <div className="flex items-center gap-2">
              {badgeType === "community_pick" && <Crown className="w-5 h-5 text-yellow-500" />}
              {badgeType === "startup_saviour" && <Star className="w-5 h-5 text-blue-500" />}
              <span className="text-lg font-medium">
                {badgeType === "wanted" && "WANTED"}
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
              <div>
                <p className="text-green-500 font-medium">IN CUSTODY</p>
                <p className="text-gray-400 text-sm">Mugshot on file</p>
              </div>
            ) : (
              <div>
                <p className="text-yellow-500 font-medium">AT LARGE</p>
                <p className="text-gray-400 text-sm">No mugshot yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <CriminalStatCard
          title="Your Mugshot"
          value={mugshotsCount || 0}
          icon={<Camera className="w-8 h-8 text-red-500" />}
          linkText={userMugshot ? "Edit Mugshot" : "Get Arrested"}
          linkHref={userMugshot ? "/station/edit-mugshot" : "/station/get-arrested"}
          status={userMugshot ? "active" : "missing"}
        />

        <CriminalStatCard
          title="Build Log"
          value={productsCount}
          icon={<FileText className="w-8 h-8 text-green-500" />}
          linkText="Submit Product"
          linkHref="/station/submit-launch"
          status="normal"
        />

  

        <CriminalStatCard
          title="Connections Found"
          value={connectionsCount || 0}
          icon={<Users className="w-8 h-8 text-yellow-500" />}
          linkText="Investigate"
          linkHref="/"
          status="normal"
        />
      </div>

      {/* Action Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Criminal Operations */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-red-500">CRIMINAL OPERATIONS</h2>
          <div className="space-y-4">
            {!userMugshot ? (
              <CriminalActionCard
                title="Get Arrested"
                description="Create your criminal mugshot and join the wall"
                icon={<Camera className="w-6 h-6" />}
                href="/station/get-arrested"
                priority="high"
              />
            ) : (
              <CriminalActionCard
                title="Edit Your Mugshot"
                description="Update your criminal profile and details"
                icon={<Edit className="w-6 h-6" />}
                href="/station/edit-mugshot"
                priority="normal"
              />
            )}

            <CriminalActionCard
              title="Submit Product Evidence"
              description="Add your product to the Heist Board"
              icon={<FileText className="w-6 h-6" />}
              href="/station/submit-launch"
              priority="normal"
            />

            {userMugshot && (
              <CriminalActionCard
                title="Share Your Arrest"
                description="Spread the word about your criminal activity"
                icon={<Users className="w-6 h-6" />}
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `Just got arrested on the #FoundersWall 🚨\nI'm officially guilty of building in public\n\n${process.env.NEXT_PUBLIC_APP_URL}/maker/${userMugshot.name.toLowerCase().replace(/\s+/g, "-")}`,
                )}`}
                priority="normal"
                external={true}
              />
            )}
          </div>
        </div>

        {/* Investigation Activities */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-yellow-500">INVESTIGATION ACTIVITIES</h2>
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
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold mb-4">CASE FILE ACTIVITY</h2>
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
    <div
      className={`bg-gray-800 rounded-lg p-6 border ${
        status === "active" ? "border-green-500/50" : status === "missing" ? "border-red-500/50" : "border-gray-700"
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-medium text-gray-300">{title}</h3>
        {icon}
      </div>
      <p className="text-3xl font-bold mb-4">{value}</p>
      <Link
        href={linkHref}
        className={`text-sm flex items-center ${
          status === "missing" ? "text-red-400 hover:text-red-300" : "text-gray-400 hover:text-white"
        } transition-colors`}
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
  const className = `block rounded-lg p-4 transition-colors ${
    priority === "high"
      ? "bg-red-900/30 hover:bg-red-900/50 border border-red-500/30"
      : "bg-gray-700 hover:bg-gray-600 border border-gray-600"
  }`

  const content = (
    <div className="flex items-start space-x-3">
      <div className={`rounded-full p-2 ${priority === "high" ? "bg-red-500/20" : "bg-gray-800"}`}>{icon}</div>
      <div className="flex-1">
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-gray-400">{description}</p>
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
        return "border-gray-500"
    }
  }

  return (
    <div className={`border-l-2 ${getColor()} pl-4 py-2`}>
      <h4 className="font-medium">{title}</h4>
      <p className="text-sm text-gray-400">{description}</p>
      <p className="text-xs text-gray-500 mt-1">{time}</p>
    </div>
  )
}
