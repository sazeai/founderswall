"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, DollarSign, BookOpen, Code, Globe, Palette, FileText, Lock, Eye } from "lucide-react"
import type { JSX } from "react"

interface GhostProjectTeaserProps {
  ghostProject: any
  canViewPrivate: boolean
  currentUserId?: string
}

export function GhostProjectTeaser({ ghostProject, canViewPrivate, currentUserId }: GhostProjectTeaserProps) {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "abandoned_after_mvp":
        return { icon: "🚫", text: "Abandoned after MVP", color: "bg-red-100 text-red-800 border-red-200" }
      case "never_launched":
        return { icon: "👻", text: "Never Launched", color: "bg-gray-100 text-gray-800 border-gray-200" }
      case "got_users":
        return { icon: "⚡", text: "Had Users", color: "bg-yellow-100 text-yellow-800 border-yellow-200" }
      default:
        return { icon: "💀", text: "Unknown", color: "bg-gray-100 text-gray-800 border-gray-200" }
    }
  }

  const getIntentInfo = () => {
    if (ghostProject.intent === "learning_only") {
      return {
        icon: <BookOpen className="h-5 w-5" />,
        text: "Shared for Learning",
        color: "bg-blue-100 text-blue-800 border-blue-200",
      }
    } else {
      return {
        icon: <DollarSign className="h-5 w-5" />,
        text: ghostProject.asking_price || "Open to Offers",
        color: "bg-green-100 text-green-800 border-green-200",
      }
    }
  }

  const getAssetIcons = () => {
    const icons: { [key: string]: { icon: JSX.Element; label: string } } = {
      code: { icon: <Code className="h-5 w-5" />, label: "Source Code" },
      domain: { icon: <Globe className="h-5 w-5" />, label: "Domain" },
      ui: { icon: <Palette className="h-5 w-5" />, label: "UI/Design" },
      docs: { icon: <FileText className="h-5 w-5" />, label: "Documentation" },
    }

    return (
      ghostProject.assets_available?.map((asset: string) => ({
        ...icons[asset.toLowerCase()],
        key: asset,
      })) || []
    )
  }

  const statusInfo = getStatusInfo(ghostProject.status)
  const intentInfo = getIntentInfo()
  const assetIcons = getAssetIcons()

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-white shadow-lg border-gray-200">
        <CardHeader className="pb-6">
          {/* Header with founder info */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={ghostProject.founder?.image_url || "/placeholder.svg"} />
                <AvatarFallback className="bg-gray-100 text-gray-600">
                  {ghostProject.founder?.name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-gray-900">{ghostProject.founder?.name}</h3>
                <p className="text-sm text-gray-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(ghostProject.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {canViewPrivate ? (
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                  <Eye className="h-4 w-4 mr-1" />
                  Access Granted
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                  <Lock className="h-4 w-4 mr-1" />
                  Private Details
                </Badge>
              )}
            </div>
          </div>

          {/* Project title and description */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{ghostProject.codename}</h1>
            <p className="text-lg text-gray-700 leading-relaxed">{ghostProject.one_liner}</p>
          </div>

          {/* Status and Intent */}
          <div className="flex flex-wrap gap-3 mb-6">
            <Badge variant="outline" className={`${statusInfo.color} text-sm`}>
              <span className="mr-2">{statusInfo.icon}</span>
              {statusInfo.text}
            </Badge>

            <Badge variant="outline" className={`${intentInfo.color} text-sm`}>
              {intentInfo.icon}
              <span className="ml-2">{intentInfo.text}</span>
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Tech Stack */}
          {ghostProject.tech_stack && ghostProject.tech_stack.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                {ghostProject.tech_stack.map((tech: string, index: number) => (
                  <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-700">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Available Assets */}
          {assetIcons.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Available Assets</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {assetIcons.map((asset, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-gray-600">{asset.icon}</div>
                    <span className="text-sm font-medium text-gray-900">{asset.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Private Content Teaser */}
          {!canViewPrivate && (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Private Details Available</h3>
              <p className="text-gray-600 mb-4">
                Request access to view detailed insights, learnings, and the full story behind this project.
              </p>
              <div className="text-sm text-gray-500">
                Includes: Full project details, abandonment reasons, key learnings, and more
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
