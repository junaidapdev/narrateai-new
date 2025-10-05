'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useAuth } from "@/lib/hooks/useAuth"
import { usePosts } from "@/lib/hooks/usePosts"
import { formatDate } from "@/lib/utils"
import { FileText, Edit, Trash2, Eye, Copy } from "lucide-react"
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { DashboardHeader } from '@/components/dashboard-header'

export default function PostsPage() {
  const { user, loading: authLoading } = useAuth()
  const { posts, loading: postsLoading, createPost, updatePost, deletePost, publishPost } = usePosts()
  const [editingPost, setEditingPost] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editHook, setEditHook] = useState('')
  const [editBody, setEditBody] = useState('')
  const [editCallToAction, setEditCallToAction] = useState('')
  const [activeFilter, setActiveFilter] = useState('Draft')
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


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800">Published</Badge>
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  // Filter posts based on active filter
  const filteredPosts = posts.filter(post => {
    if (activeFilter === 'All') return true
    if (activeFilter === 'Published') return post.status === 'published'
    if (activeFilter === 'Draft') return post.status === 'draft'
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
            {['Draft', 'Published', 'All'].map((filter) => (
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
                          <div className="flex items-center space-x-2 ml-4">
                            <Badge 
                              className={`${
                                post.status === 'published' 
                                  ? 'bg-green-100 text-green-800 border-green-200' 
                                  : post.status === 'draft'
                                  ? 'bg-orange-100 text-orange-800 border-orange-200'
                                  : 'bg-gray-100 text-gray-800 border-gray-200'
                              }`}
                            >
                              {post.status === 'published' ? 'Published' : post.status === 'draft' ? 'Draft' : post.status}
                            </Badge>
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
                                  onClick={() => handleEditPost(post)}
                                  title="Edit post"
                                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-1 py-1 h-7 w-7"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                {post.status === 'draft' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handlePublishPost(post.id)}
                                    title="Publish this draft"
                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 h-7 text-xs font-medium"
                                  >
                                    Publish
                                  </Button>
                                )}
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
                              </div>
                            </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  )
}

