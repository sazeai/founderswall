"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Calendar,
  Code,
  Globe,
  Palette,
  FileText,
  DollarSign,
  BookOpen,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
} from "lucide-react"
import type { GhostProject } from "@/lib/types"

interface GhostProjectPrivateDetailsProps {
  ghostProject: GhostProject
}

export function GhostProjectPrivateDetails({ ghostProject }: GhostProjectPrivateDetailsProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "abandoned_after_mvp":
        return "🚫"
      case "never_launched":
        return "👻"
      case "got_users":
        return "⚡"
      default:
        return "💀"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "abandoned_after_mvp":
        return "Abandoned after MVP"
      case "never_launched":
        return "Never Launched"
      case "got_users":
        return "Got Users but Stopped"
      default:
        return "Unknown Status"
    }
  }

  const getAssetIcon = (asset: string) => {
    switch (asset) {
      case "codebase":
        return <Code className="h-5 w-5" />
      case "domain":
        return <Globe className="h-5 w-5" />
      case "ui_design":
        return <Palette className="h-5 w-5" />
      case "documentation":
        return <FileText className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getProjectTypeInfo = () => {
    if (ghostProject.project_type === "for_learning") {
      return {
        icon: <BookOpen className="h-5 w-5" />,
        text: "Shared for Learning",
        color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      }
    } else {
      return {
        icon: <DollarSign className="h-5 w-5" />,
        text: ghostProject.asking_price || "Open to Offers",
        color: "bg-green-500/20 text-green-400 border-green-500/30",
      }
    }
  }

  const projectTypeInfo = getProjectTypeInfo()

  return (
    <div className="space-y-8">
      {/* Header Card */}
      <Card className="bg-gray-900/80 border-green-500/30 shadow-2xl backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-16 w-16 border-2 border-green-500/50">
                <AvatarImage src={ghostProject.founder?.image_url || "/placeholder.svg"} />
                <AvatarFallback className="bg-gray-800 text-green-400">
                  {ghostProject.founder?.name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-green-400">{ghostProject.real_name || ghostProject.codename}</h1>
                <p className="text-gray-400">by {ghostProject.founder?.name}</p>
                <p className="text-gray-500 text-sm flex items-center mt-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  Created {new Date(ghostProject.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <Badge variant="outline" className={projectTypeInfo.color}>
              {projectTypeInfo.icon}
              <span className="ml-2">{projectTypeInfo.text}</span>
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Project Overview */}
      <Card className="bg-gray-900/80 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <FileText className="h-5 w-5 mr-2 text-green-400" />
            Project Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-gray-300 font-semibold mb-2">What it tried to solve:</h3>
            <p className="text-gray-400 leading-relaxed">{ghostProject.one_liner}</p>
          </div>

          <Separator className="bg-gray-700" />

          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-gray-800/50 text-yellow-400 border-yellow-500/30">
              <span className="mr-2">{getStatusIcon(ghostProject.status)}</span>
              {getStatusText(ghostProject.status)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Tech Stack */}
      {ghostProject.tech_stack && ghostProject.tech_stack.length > 0 && (
        <Card className="bg-gray-900/80 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Code className="h-5 w-5 mr-2 text-green-400" />
              Tech Stack
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {ghostProject.tech_stack.map((tech, index) => (
                <Badge key={index} variant="secondary" className="bg-gray-800 text-gray-300">
                  {tech}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Assets */}
      {ghostProject.assets_available && ghostProject.assets_available.length > 0 && (
        <Card className="bg-gray-900/80 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Palette className="h-5 w-5 mr-2 text-green-400" />
              Available Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ghostProject.assets_available.map((asset, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 bg-gray-800/50 p-4 rounded-lg border border-gray-700"
                >
                  <div className="text-green-400">{getAssetIcon(asset)}</div>
                  <div>
                    <p className="text-white font-medium capitalize">{asset.replace("_", " ")}</p>
                    <p className="text-gray-400 text-sm">Available for handover</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Why Abandoned */}
      {ghostProject.abandonment_reason && (
        <Card className="bg-gray-900/80 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-400" />
              Why It Was Abandoned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{ghostProject.abandonment_reason}</p>
          </CardContent>
        </Card>
      )}

      {/* Learnings & Insights */}
      {ghostProject.learnings && (
        <Card className="bg-gray-900/80 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Lightbulb className="h-5 w-5 mr-2 text-yellow-400" />
              Key Learnings & Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{ghostProject.learnings}</p>
          </CardContent>
        </Card>
      )}

      {/* Contact Information */}
      <Card className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <ExternalLink className="h-5 w-5 mr-2 text-green-400" />
            Interested in This Project?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-300">
              You now have access to all the details! If you're interested in taking over this project, learning from
              it, or discussing it further, you can reach out to the founder.
            </p>

            <div className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-lg">
              <Avatar className="h-12 w-12">
                <AvatarImage src={ghostProject.founder?.image_url || "/placeholder.svg"} />
                <AvatarFallback className="bg-gray-700 text-green-400">
                  {ghostProject.founder?.name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white font-semibold">{ghostProject.founder?.name}</p>
                <p className="text-gray-400 text-sm">Project Founder</p>
              </div>
            </div>

            {ghostProject.project_type !== "for_learning" && ghostProject.asking_price && (
              <div className="p-4 bg-green-900/20 rounded-lg border border-green-500/30">
                <p className="text-green-400 font-semibold">💰 {ghostProject.asking_price}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
