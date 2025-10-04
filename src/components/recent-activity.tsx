"use client"

import { Button } from "@/components/ui/button"
import { Mic, FileText, ArrowRight, CheckCircle, Clock, XCircle } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export function RecentActivity({ recordings, posts, recordingsLoading, postsLoading }: { recordings: any[], posts: any[], recordingsLoading: boolean, postsLoading: boolean }) {
  const recentRecordings = recordings.slice(0, 3)
  const recentPosts = posts.slice(0, 3)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'processing':
        return <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Recent Recordings */}
      <div className="rounded-2xl border border-border/50 bg-card p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-2xl font-medium tracking-tight">Recent Recordings</h2>
          <Link href="/recording">
            <Button variant="ghost" size="sm" className="gap-2">
              View all
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {recordingsLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading recordings...</p>
          </div>
        ) : recentRecordings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/50">
              <Mic className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 font-medium">No recordings yet</h3>
            <p className="mb-6 text-sm text-muted-foreground max-w-sm leading-relaxed">
              Start by recording your first voice note. We'll transform it into a polished LinkedIn post.
            </p>
            <Link href="/recording">
              <Button className="gap-2">
                <Mic className="h-4 w-4" />
                Create your first recording
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentRecordings.map((recording) => (
              <div key={recording.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(recording.status)}
                  <div>
                    <p className="font-medium">{recording.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(recording.created_at)}
                    </p>
                  </div>
                </div>
                {getStatusBadge(recording.status)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Posts */}
      <div className="rounded-2xl border border-border/50 bg-card p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-2xl font-medium tracking-tight">Recent Posts</h2>
          <Link href="/posts">
            <Button variant="ghost" size="sm" className="gap-2">
              View all
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {postsLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading posts...</p>
          </div>
        ) : recentPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/50">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 font-medium">No posts yet</h3>
            <p className="mb-6 text-sm text-muted-foreground max-w-sm leading-relaxed">
              Once you create a recording, we'll generate your first LinkedIn post automatically.
            </p>
            <Link href="/recording">
              <Button variant="outline" className="gap-2 bg-transparent">
                <FileText className="h-4 w-4" />
                Browse examples
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{post.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(post.created_at)}
                  </p>
                </div>
                <Badge 
                  className={
                    post.status === 'published' 
                      ? 'bg-green-100 text-green-800'
                      : post.status === 'draft'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }
                >
                  {post.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
