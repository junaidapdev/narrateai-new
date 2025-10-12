'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useAuth } from "@/lib/hooks/useAuth"
import { usePosts } from "@/lib/hooks/usePosts"
import { useLinkedIn } from "@/lib/hooks/useLinkedIn"
import { useLinkedInPosting } from "@/lib/hooks/useLinkedInPosting"
import { formatDate } from "@/lib/utils"
import { FileText, Edit, Trash2, Eye, Copy, Clock, Calendar, Info } from "lucide-react"
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { DashboardHeader } from '@/components/dashboard-header'

export default function PostsPage() {
  const { user, loading: authLoading } = useAuth()
  const { posts, loading: postsLoading, createPost, updatePost, deletePost, publishPost } = usePosts()
  const { connection: linkedinConnection, loading: linkedinLoading } = useLinkedIn()
  const { postToLinkedIn, canPost } = useLinkedInPosting()
  const [editingPost, setEditingPost] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editHook, setEditHook] = useState('')
  const [editBody, setEditBody] = useState('')
  const [editCallToAction, setEditCallToAction] = useState('')
  const [activeFilter, setActiveFilter] = useState('Draft')
  
  // Scheduling state
  const [schedulingPost, setSchedulingPost] = useState<string | null>(null)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [scheduleVisibility, setScheduleVisibility] = useState<'PUBLIC' | 'CONNECTIONS'>('PUBLIC')
  const [isScheduling, setIsScheduling] = useState(false)
  const [showTooltip, setShowTooltip] = useState<string | null>(null)
  const [previewPost, setPreviewPost] = useState<any>(null)
  
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Signed out successfully!')
      router.push('/')
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  const handleEditPost = (post: any) => {
    setEditingPost(post.id)
    setEditTitle(post.title || '')
    setEditHook(post.hook)
    setEditBody(post.body)
    setEditCallToAction(post.call_to_action || '')
  }

  const handleSaveEdit = async () => {
    if (!editingPost) return

    try {
      await updatePost(editingPost, {
        title: editTitle,
        hook: editHook,
        body: editBody,
        call_to_action: editCallToAction,
      })
      toast.success('Post updated successfully!')
      setEditingPost(null)
    } catch (error) {
      toast.error('Failed to update post')
    }
  }

  const handleCancelEdit = () => {
    setEditingPost(null)
    setEditTitle('')
    setEditHook('')
    setEditBody('')
    setEditCallToAction('')
  }

  const handleCopyPost = async (post: any) => {
    try {
      // Format the post content for LinkedIn
      let postContent = ''
      
      if (post.title) {
        postContent += `${post.title}\n\n`
      }
      
      postContent += `${post.hook}\n\n${post.body}`
      
      if (post.call_to_action) {
        postContent += `\n\n${post.call_to_action}`
      }
      
      await navigator.clipboard.writeText(postContent)
      toast.success('Post copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy post')
    }
  }

  const handlePreviewPost = (post: any) => {
    setPreviewPost(post)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A66C2] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to access this page.</p>
          <Link href="/signin">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }


  const handleDeletePost = async (id: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(id)
        toast.success('Post deleted successfully!')
      } catch (error) {
        toast.error('Failed to delete post')
      }
    }
  }

  const handlePublishPost = async (id: string) => {
    try {
      await publishPost(id)
      toast.success('Post published successfully!')
    } catch (error) {
      toast.error('Failed to publish post')
    }
  }

  const handleSchedulePost = (post: any) => {
    if (!canPost) {
      toast.error('LinkedIn not connected. Please connect your LinkedIn account in Settings first.')
      return
    }
    
    setSchedulingPost(post.id)
    // Set default date to tomorrow at 9 AM in local time
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(9, 0, 0, 0)
    
    // Convert to local timezone for display
    const dateStr = tomorrow.toISOString().split('T')[0]
    const timeStr = tomorrow.toTimeString().split(' ')[0].slice(0, 5)
    
    setScheduleDate(dateStr)
    setScheduleTime(timeStr)
  }

  const handleCancelSchedule = () => {
    setSchedulingPost(null)
    setScheduleDate('')
    setScheduleTime('')
    setScheduleVisibility('PUBLIC')
  }

  const handleConfirmSchedule = async () => {
    if (!schedulingPost || !scheduleDate || !scheduleTime) {
      toast.error('Please select both date and time')
      return
    }

    if (!canPost) {
      toast.error('LinkedIn not connected. Please connect your LinkedIn account first.')
      return
    }

    // Create the scheduled datetime in local timezone
    const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`)
    const now = new Date()

    if (scheduledDateTime <= now) {
      toast.error('Scheduled time must be in the future')
      return
    }

    setIsScheduling(true)

    try {
      // The scheduledDateTime is already in local timezone, but we need to ensure it's treated as local
      // Create a new date object that represents the local time correctly
      const localDate = new Date(scheduleDate)
      const [hours, minutes] = scheduleTime.split(':').map(Number)
      const localScheduledDateTime = new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate(), hours, minutes)
      
      // Convert to UTC for storage (database stores in UTC)
      const utcScheduledTime = localScheduledDateTime.toISOString()
      
      // Debug logging
      console.log('Scheduling Debug:', {
        scheduleDate,
        scheduleTime,
        localScheduledDateTime: localScheduledDateTime.toString(),
        utcScheduledTime,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      })
      
      // Update the post status to scheduled
      await updatePost(schedulingPost, {
        status: 'scheduled',
        scheduled_at: utcScheduledTime
      })

      // Create scheduled post entry
      const { error: scheduledPostError } = await supabase
        .from('scheduled_posts')
        .insert({
          post_id: schedulingPost,
          user_id: user?.id,
          scheduled_at: utcScheduledTime,
          status: 'pending'
        })

      if (scheduledPostError) {
        console.error('Error creating scheduled post:', scheduledPostError)
        toast.error('Failed to schedule post')
        return
      }

      // Show success message in local timezone
      const localTimeString = localScheduledDateTime.toLocaleString('en-US', {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      
      toast.success(`Post scheduled for ${localTimeString}`)
      handleCancelSchedule()
    } catch (error) {
      console.error('Scheduling error:', error)
      toast.error('Failed to schedule post')
    } finally {
      setIsScheduling(false)
    }
  }


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800">Published</Badge>
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  // Filter posts based on active filter
  const filteredPosts = posts.filter(post => {
    if (activeFilter === 'All') return true
    if (activeFilter === 'Published') return post.status === 'published'
    if (activeFilter === 'Draft') return post.status === 'draft'
    if (activeFilter === 'Scheduled') return post.status === 'scheduled'
    return true
  })

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <DashboardHeader />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-12 md:px-8 lg:px-12">
        <div className="mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-medium tracking-tight text-gray-900 mb-2">
              Posts
            </h1>
            <p className="text-lg text-gray-600">
              Create and manage your content.
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex space-x-6 border-b border-gray-200">
            {['Draft', 'Scheduled', 'Published', 'All'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`pb-2 text-sm font-medium transition-colors ${
                  activeFilter === filter
                    ? 'text-gray-900 border-b-2 border-gray-900' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-500">{filteredPosts.length} posts</span>
          </div>
        </div>


        {/* Posts List */}
        {postsLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading posts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              {activeFilter === 'All' ? 'No posts yet' : `No ${activeFilter.toLowerCase()} posts`}
            </p>
            <p className="text-sm text-gray-500">
              {activeFilter === 'All' ? 'Create your first post to get started' : `Try switching to a different filter`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <div key={post.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                    {editingPost === post.id ? (
                      // Edit Mode
                      <div className="p-3 md:p-4 space-y-4">
                        <div>
                          <Label htmlFor="edit-title" className="text-sm md:text-base">Title (Optional)</Label>
                          <Input
                            id="edit-title"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="Enter post title..."
                            className="mt-1 text-sm md:text-base"
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-hook" className="text-sm md:text-base">Hook *</Label>
                          <Input
                            id="edit-hook"
                            value={editHook}
                            onChange={(e) => setEditHook(e.target.value)}
                            placeholder="Enter attention-grabbing hook..."
                            className="mt-1 text-sm md:text-base"
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-body" className="text-sm md:text-base">Body *</Label>
                          <Textarea
                            id="edit-body"
                            value={editBody}
                            onChange={(e) => setEditBody(e.target.value)}
                            placeholder="Enter post body..."
                            className="mt-1 min-h-[100px] md:min-h-[120px] text-sm md:text-base"
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-cta" className="text-sm md:text-base">Call to Action (Optional)</Label>
                          <Input
                            id="edit-cta"
                            value={editCallToAction}
                            onChange={(e) => setEditCallToAction(e.target.value)}
                            placeholder="Enter call to action..."
                            className="mt-1 text-sm md:text-base"
                          />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button onClick={handleSaveEdit} className="bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white text-sm md:text-base">
                            Save Changes
                          </Button>
                          <Button onClick={handleCancelEdit} className="bg-gray-500 hover:bg-gray-600 text-white text-sm md:text-base">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                              <h3 className="text-base font-semibold text-gray-900 mb-1">
                                {post.title || 'Untitled Post'}
                              </h3>
                              <p className="text-xs text-gray-500 mb-2">
                                {formatDate(post.created_at)}
                              </p>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {post.hook}
                              </p>
                          </div>
                          <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 ml-4">
                            {/* Mobile: Stack buttons vertically, Desktop: Horizontal */}
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyPost(post)}
                                title="Copy to clipboard"
                                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-1 py-1 h-7 w-7"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePreviewPost(post)}
                                title="Preview post"
                                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-1 py-1 h-7 w-7"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditPost(post)}
                                title="Edit post"
                                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-1 py-1 h-7 w-7"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeletePost(post.id)}
                                title="Delete post"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 px-1 py-1 h-7 w-7"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            {/* Action buttons - stack vertically on mobile */}
                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                              {post.status === 'draft' && (
                                <div className="w-full sm:w-auto relative">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => canPost ? handleSchedulePost(post) : setShowTooltip(showTooltip === post.id ? null : post.id)}
                                    title={canPost ? "Schedule this post for LinkedIn" : "Connect LinkedIn in Settings to schedule posts"}
                                    className={`border border-blue-200 text-blue-700 hover:bg-blue-50 px-3 py-1 h-7 text-xs font-medium w-full sm:w-auto ${!canPost ? 'opacity-50' : ''}`}
                                  >
                                    <Clock className="h-3 w-3 mr-1" />
                                    Schedule
                                  </Button>
                                  {!canPost && showTooltip === post.id && (
                                    <div className="absolute bottom-full left-0 sm:left-1/2 sm:transform sm:-translate-x-1/2 mb-2 px-3 py-2 bg-primary text-primary-foreground text-xs rounded-lg shadow-lg z-10 animate-in fade-in-0 zoom-in-95 duration-200 whitespace-nowrap">
                                      Go to Settings <br /> to connect LinkedIn
                                      <div className="absolute top-full left-4 sm:left-1/2 sm:transform sm:-translate-x-1/2 border-4 border-transparent border-t-primary"></div>
                                    </div>
                                  )}
                                </div>
                              )}
                              {post.status === 'scheduled' && (
                                <div className="flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded w-full sm:w-auto">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  <span className="truncate">
                                    {post.scheduled_at && new Date(post.scheduled_at).toLocaleString('en-US', {
                                      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                            </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
      </main>

      {/* Scheduling Modal */}
      <Dialog open={!!schedulingPost} onOpenChange={(open) => !open && handleCancelSchedule()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Post</DialogTitle>
            <DialogDescription>
              Schedule this post to be automatically published on LinkedIn.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="schedule-date">Date</Label>
              <Input
                id="schedule-date"
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="schedule-time">Time</Label>
              <Input
                id="schedule-time"
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="schedule-visibility">Visibility</Label>
              <Select value={scheduleVisibility} onValueChange={(value: 'PUBLIC' | 'CONNECTIONS') => setScheduleVisibility(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLIC">Public</SelectItem>
                  <SelectItem value="CONNECTIONS">Connections Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {!canPost && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>LinkedIn not connected.</strong> Please connect your LinkedIn account in Settings to schedule posts.
                </p>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={handleCancelSchedule}
                disabled={isScheduling}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmSchedule}
                disabled={isScheduling || !canPost}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isScheduling ? 'Scheduling...' : 'Schedule Post'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={!!previewPost} onOpenChange={(open) => !open && setPreviewPost(null)}>
        <DialogContent className="w-[90vw] max-w-md sm:max-w-2xl max-h-[80vh] overflow-y-auto animate-in zoom-in-95 duration-300 mx-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle>Post Preview</DialogTitle>
            <DialogDescription>
              How your post will appear on LinkedIn
            </DialogDescription>
          </DialogHeader>
          {previewPost && (
            <div className="space-y-4">
              {/* LinkedIn-style preview */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="flex items-center space-x-3 p-4 border-b border-gray-100">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#0A66C2] to-[#004182] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-xs">You</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 text-sm truncate">Your Name</p>
                    <p className="text-xs text-gray-500">LinkedIn</p>
                  </div>
                </div>
                
                <div className="p-4 space-y-3">
                  {previewPost.title && (
                    <h3 className="text-base font-semibold text-gray-900 break-words leading-tight">
                      {previewPost.title}
                    </h3>
                  )}
                  
                  <div className="text-gray-900 whitespace-pre-wrap text-sm break-words leading-relaxed">
                    {previewPost.hook}
                  </div>
                  
                  <div className="text-gray-900 whitespace-pre-wrap text-sm break-words leading-relaxed">
                    {previewPost.body}
                  </div>
                  
                  {previewPost.call_to_action && (
                    <div className="text-gray-900 font-medium whitespace-pre-wrap text-sm break-words leading-relaxed">
                      {previewPost.call_to_action}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Post details */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-3 text-sm">Post Details</h4>
                <div className="space-y-3 text-xs">
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-600 font-medium">Status:</span>
                    <div className="flex-shrink-0">{getStatusBadge(previewPost.status)}</div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-600 font-medium">Created:</span>
                    <span className="text-gray-900 break-words">{formatDate(previewPost.created_at)}</span>
                  </div>
                  {previewPost.scheduled_at && (
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-600 font-medium">Scheduled for:</span>
                      <span className="text-gray-900 break-words">
                        {new Date(previewPost.scheduled_at).toLocaleString('en-US', {
                          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  )
}

