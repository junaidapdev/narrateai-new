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
  const [showLinkedInModal, setShowLinkedInModal] = useState(false)
  const [isConnectingLinkedIn, setIsConnectingLinkedIn] = useState(false)
  const [linkedInError, setLinkedInError] = useState<string | null>(null)
  
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

  const handleConnectLinkedIn = async () => {
    setIsConnectingLinkedIn(true)
    setLinkedInError(null)
    
    try {
      // Use the same LinkedIn connection flow as Settings (GET method)
      // Add redirect parameter to go back to posts after connection
      window.location.href = '/api/auth/linkedin/connect?redirect=/posts'
    } catch (error) {
      console.error('LinkedIn connection error:', error)
      setLinkedInError('Failed to connect to LinkedIn. Please try again.')
      setIsConnectingLinkedIn(false)
    }
  }

  const handleLinkedInModalClose = () => {
    setShowLinkedInModal(false)
    setSchedulingPost(null)
    setLinkedInError(null)
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
      // Show LinkedIn connection modal instead of schedule modal
      setShowLinkedInModal(true)
      setLinkedInError(null)
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
                                <div className="w-full sm:w-auto">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleSchedulePost(post)}
                                    title="Schedule this post for LinkedIn"
                                    className="border border-blue-200 text-blue-700 hover:bg-blue-50 px-3 py-1 h-7 text-xs font-medium w-full sm:w-auto"
                                  >
                                    <Clock className="h-3 w-3 mr-1" />
                                    Schedule
                                  </Button>
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


      {/* Preview Modal */}
      <Dialog open={!!previewPost} onOpenChange={(open) => !open && setPreviewPost(null)}>
        <DialogContent className="w-[90vw] max-w-sm sm:max-w-lg max-h-[80vh] overflow-y-auto animate-in zoom-in-95 duration-300 mx-auto rounded-3xl">
          <DialogHeader className="text-center pb-4">
            <DialogTitle className="text-lg font-serif font-medium text-gray-900">Post Preview</DialogTitle>
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
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Schedule Post Modal */}
      <Dialog open={!!schedulingPost} onOpenChange={(open) => !open && handleCancelSchedule()}>
        <DialogContent className="w-[90vw] max-w-md sm:max-w-lg max-h-[80vh] overflow-y-auto animate-in zoom-in-95 duration-300 mx-auto rounded-3xl">
          <DialogHeader className="text-center pb-6">
            <DialogTitle className="text-lg font-serif font-medium text-gray-900">Schedule Post</DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Schedule this post to be automatically published on LinkedIn
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* LinkedIn Connection Status */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-[#0A66C2] to-[#004182] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.413v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">LinkedIn Connected</p>
                  <p className="text-xs text-gray-600">Ready to schedule posts</p>
                </div>
              </div>
            </div>

            {/* Schedule Form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="schedule-date" className="text-sm font-medium text-gray-700">Schedule Date</Label>
                <Input
                  id="schedule-date"
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-1 h-11 text-sm border-gray-200 focus:border-[#0A66C2] focus:ring-[#0A66C2]"
                />
              </div>
              <div>
                <Label htmlFor="schedule-time" className="text-sm font-medium text-gray-700">Schedule Time</Label>
                <Input
                  id="schedule-time"
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="mt-1 h-11 text-sm border-gray-200 focus:border-[#0A66C2] focus:ring-[#0A66C2]"
                />
              </div>
              <div>
                <Label htmlFor="schedule-visibility" className="text-sm font-medium text-gray-700">Post Visibility</Label>
                <Select value={scheduleVisibility} onValueChange={(value: 'PUBLIC' | 'CONNECTIONS') => setScheduleVisibility(value)}>
                  <SelectTrigger className="mt-1 h-11 text-sm border-gray-200 focus:border-[#0A66C2] focus:ring-[#0A66C2]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLIC">Public</SelectItem>
                    <SelectItem value="CONNECTIONS">Connections Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-2">
              <Button
                onClick={handleConfirmSchedule}
                disabled={isScheduling}
                className="w-full h-11 bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white text-sm font-medium shadow-sm"
              >
                {isScheduling ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Scheduling...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    Schedule Post
                  </>
                )}
              </Button>
              <Button
                onClick={handleCancelSchedule}
                variant="outline"
                className="w-full h-11 text-sm font-medium border-gray-200 hover:bg-gray-50"
                disabled={isScheduling}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* LinkedIn Connection Modal */}
      <Dialog open={showLinkedInModal} onOpenChange={(open) => !open && handleLinkedInModalClose()}>
        <DialogContent className="w-[90vw] max-w-sm max-h-[80vh] overflow-y-auto animate-in zoom-in-95 duration-300 mx-auto rounded-3xl">
          <DialogHeader className="text-center pb-6">
            <DialogTitle className="text-lg font-serif font-medium text-gray-900">Connect LinkedIn</DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Link your account to schedule posts
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* LinkedIn Icon */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0A66C2] to-[#004182] rounded-full flex items-center justify-center mx-auto shadow-lg">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.413v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </div>
            </div>

            {/* Error Message */}
            {linkedInError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-sm text-red-700 text-center">{linkedInError}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleConnectLinkedIn}
                disabled={isConnectingLinkedIn}
                className="w-full h-11 bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white text-sm font-medium"
              >
                {isConnectingLinkedIn ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Connecting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.413v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    Connect LinkedIn
                  </>
                )}
              </Button>
              <Button
                onClick={handleLinkedInModalClose}
                variant="outline"
                className="w-full h-11 text-sm font-medium"
                disabled={isConnectingLinkedIn}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  )
}

