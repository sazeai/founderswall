"use client"

import { GhostProjectCard } from "@/components/ghost-project-card"
import { Ghost } from "lucide-react"
import Link from "next/link"

interface GhostProjectsGalleryProps {
  initialProjects: any[]
}

export default function GhostProjectsGallery({ initialProjects }: GhostProjectsGalleryProps) {
  if (!initialProjects || initialProjects.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-block bg-yellow-300 text-black p-4 shadow-md font-[Permanent Marker] text-sm font-bold rotate-3">
          👻 No ghost files found in the archives
        </div>
        <div className="mt-6">
          <Link
            href="/station/submit-ghost"
            className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold"
          >
            <Ghost className="h-5 w-5 mr-2" />
            Submit Your First Ghost File
          </Link>
        </div>
      </div>
    )
  }

  // Group projects by date like your launch page
  const projectsByDate = initialProjects.reduce((acc, project) => {
    const date = new Date(project.created_at).toISOString().split("T")[0]
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(project)
    return acc
  }, {})

  return (
    <div className="space-y-12">
      {Object.keys(projectsByDate)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
        .map((date, index) => (
          <div key={date}>
            {/* Add divider before each section except the first */}
            {index > 0 && (
              <div className="relative my-8">
                <div
                  className="h-6 w-full bg-purple-400"
                  style={{
                    backgroundImage: "repeating-linear-gradient(45deg, #000 0, #000 10px, #a855f7 10px, #a855f7 20px)",
                    backgroundSize: "28px 28px",
                  }}
                ></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-zinc-900 text-white text-xs font-bold uppercase px-3 py-1 border border-zinc-800">
                  👻 GHOST FILE DIVIDER
                </div>
              </div>
            )}

            <h2 className="inline-block bg-purple-300 text-black font-[Permanent Marker] text-lg font-bold rotate-3 border border-black px-3 py-1 mb-6">
              👻 Ghost files from {new Date(date).toLocaleDateString()}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {projectsByDate[date].map((project: any) => (
                <GhostProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        ))}
    </div>
  )
}
