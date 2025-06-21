"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Ghost, Clock, CheckCircle, XCircle, MessageSquare, ExternalLink, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { createClient as createClientClient } from "@/utils/supabase/client"

interface AccessRequest {
  id: string
  message: string | null
  status: "pending" | "approved" | "rejected"
  created_at: string
  ghost_project: {
    id: string
    codename: string
    slug: string
    founder_id: string
  }
  requester: {
    id: string
    name: string
    image_url: string | null
  }
}

export function AccessRequestNotifications() {
  const [requests, setRequests] = useState<AccessRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processingRequest, setProcessingRequest] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Initial fetch
    fetchAccessRequests()

    // Set up Supabase realtime subscription
    const supabase = createClientClient()

    // Get current user to filter subscriptions
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Get user's mugshot ID
      const { data: mugshot } = await supabase.from("mugshots").select("id").eq("user_id", user.id).single()

      if (!mugshot) return

      // Subscribe to changes in ghost_project_access_requests table
      // that are related to projects owned by this user
      const channel = supabase
        .channel("ghost-project-requests")
        .on(
          "postgres_changes",
          {
            event: "*", // Listen for all events (INSERT, UPDATE, DELETE)
            schema: "public",
            table: "ghost_project_access_requests",
            // We can't filter by founder_id here since it's a join,
            // so we'll fetch all and filter in the component
          },
          (payload) => {
            console.log("Realtime update received:", payload)
            // Refresh the data when any change happens
            fetchAccessRequests()
          },
        )
        .subscribe()

      // Clean up subscription when component unmounts
      return () => {
        supabase.removeChannel(channel)
      }
    }

    getCurrentUser()
  }, [])

  const fetchAccessRequests = async () => {
    try {
      setError(null)
      const response = await fetch("/api/ghost-projects/access-requests")

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `Error ${response.status}: ${response.statusText}`

        if (response.status === 401) {
          // Not logged in - this is fine, just show empty state
          console.log("User not authenticated")
          setRequests([])
        } else if (response.status === 404) {
          // No mugshot - this is fine, just show empty state
          console.log("No mugshot found")
          setRequests([])
        } else {
          console.error("Failed to fetch access requests:", errorMessage)
          setError(errorMessage)
        }
      } else {
        const data = await response.json()
        setRequests(data)
      }
    } catch (error) {
      console.error("Error fetching access requests:", error)
      setError("Failed to load access requests")
    } finally {
      setLoading(false)
    }
  }

  const handleRequestAction = async (requestId: string, action: "approve" | "reject") => {
    setProcessingRequest(requestId)
    try {
      const response = await fetch(`/api/ghost-projects/access-requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        toast.success(`Access request ${action}d successfully!`)
        // Refresh the requests
        await fetchAccessRequests()
      } else {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `Error ${response.status}: ${response.statusText}`
        toast.error(`Failed to ${action} request: ${errorMessage}`)
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error)
      toast.error(`Failed to ${action} request`)
    } finally {
      setProcessingRequest(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return null
    }
  }

  const pendingRequests = requests.filter((req) => req.status === "pending")
  const processedRequests = requests.filter((req) => req.status !== "pending")

  if (loading) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Ghost className="h-5 w-5 mr-2 text-red-400" />
            Ghost Project Access Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-400"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Ghost className="h-5 w-5 mr-2 text-red-400" />
            Ghost Project Access Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <p className="text-red-400 mb-2">Failed to load access requests</p>
            <p className="text-gray-500 text-sm mb-4">{error}</p>
            <Button
              onClick={() => {
                setError(null)
                setLoading(true)
                fetchAccessRequests()
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (requests.length === 0) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Ghost className="h-5 w-5 mr-2 text-red-400" />
            Ghost Project Access Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Ghost className="h-12 w-12 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">No access requests yet</p>
            <p className="text-gray-500 text-sm">
              When someone requests access to your ghost projects, they'll appear here
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center">
            <Ghost className="h-5 w-5 mr-2 text-red-400" />
            Ghost Project Access Requests
          </div>
          <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
            {pendingRequests.length} pending
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Clock className="h-4 w-4 mr-2 text-yellow-400" />
              Pending Approval ({pendingRequests.length})
            </h3>
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-yellow-500/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10 border-2 border-yellow-500/50">
                        <AvatarImage src={request.requester.image_url || "/placeholder.svg"} />
                        <AvatarFallback className="bg-gray-700 text-yellow-400">
                          {request.requester.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-white font-semibold">{request.requester.name}</p>
                        <p className="text-gray-400 text-sm">
                          wants access to{" "}
                          <Link
                            href={`/ghost/${request.ghost_project.slug}`}
                            className="text-red-400 hover:text-red-300 underline"
                          >
                            {request.ghost_project.codename}
                          </Link>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link href={`/ghost/${request.ghost_project.slug}`}>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                      {getStatusBadge(request.status)}
                    </div>
                  </div>

                  {request.message && (
                    <div className="mb-4 p-3 bg-gray-900/50 rounded border border-gray-600">
                      <div className="flex items-start space-x-2">
                        <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-300 text-sm">{request.message}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <p className="text-gray-500 text-xs">
                      Requested {new Date(request.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRequestAction(request.id, "reject")}
                        disabled={processingRequest === request.id}
                        className="border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleRequestAction(request.id, "approve")}
                        disabled={processingRequest === request.id}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {processingRequest === request.id ? "Processing..." : "Approve"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Processed Requests */}
        {processedRequests.length > 0 && (
          <>
            {pendingRequests.length > 0 && <Separator className="bg-gray-700" />}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {processedRequests.slice(0, 5).map((request) => (
                  <div key={request.id} className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-3 opacity-75">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={request.requester.image_url || "/placeholder.svg"} />
                          <AvatarFallback className="bg-gray-700 text-gray-400 text-xs">
                            {request.requester.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-gray-300 text-sm">
                            <span className="font-medium">{request.requester.name}</span> →{" "}
                            <span className="text-red-400">{request.ghost_project.codename}</span>
                          </p>
                          <p className="text-gray-500 text-xs">{new Date(request.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
