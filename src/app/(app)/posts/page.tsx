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
import { FileText, Plus, Edit, Trash2, Eye, Archive, Copy } from "lucide-react"
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'

export default function PostsPage() {
  const { user, loading: authLoading } = useAuth()
  const { posts, loading: postsLoading, createPost, updatePost, deletePost, publishPost, archivePost } = usePosts()
  const [isCreating, setIsCreating] = useState(false)
  const [editingPost, setEditingPost] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editHook, setEditHook] = useState('')
  const [editBody, setEditBody] = useState('')
  const [editCallToAction, setEditCallToAction] = useState('')
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

  const handleCreatePost = async () => {
    if (!title || !content) {
      toast.error('Please enter both title and content')
      return
    }

    try {
      await createPost({
        title,
        content,
        status: 'draft',
        user_id: user.id,
        recording_id: '',
      })

      toast.success('Post created successfully!')
      setTitle('')
      setContent('')
      setIsCreating(false)
    } catch (error) {
      toast.error('Failed to create post')
    }
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

  const handleArchivePost = async (id: string) => {
    try {
      await archivePost(id)
      toast.success('Post archived successfully!')
    } catch (error) {
      toast.error('Failed to archive post')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800">Published</Badge>
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>
      case 'archived':
        return <Badge className="bg-gray-100 text-gray-800">Archived</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold text-[#0A66C2]">
                Narrate AI
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
                <Link href="/recording" className="text-gray-600 hover:text-gray-900">
                  Recordings
                </Link>
                <Link href="/posts" className="text-[#0A66C2] font-medium">
                  Posts
                </Link>
                <Link href="/settings" className="text-gray-600 hover:text-gray-900">
                  Settings
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 hidden md:block">
                {user.user_metadata?.full_name || user.email}
              </span>
              <Button className="bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white text-sm px-3 py-1.5" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 md:py-8">
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Posts
              </h1>
              <p className="text-gray-600 text-sm md:text-base">
                Create and manage your content.
              </p>
            </div>
            <Button onClick={() => setIsCreating(!isCreating)} className="bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white text-sm md:text-base px-4 py-2">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">New Post</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        </div>

        {/* Create Post Form */}
        {isCreating && (
          <Card className="mb-6 md:mb-8">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Create New Post</CardTitle>
              <CardDescription className="text-sm md:text-base">
                Write your content and publish it to the world
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="post-title" className="text-sm md:text-base">Title</Label>
                <Input
                  id="post-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter post title"
                  className="mt-1 text-sm md:text-base"
                />
              </div>
              <div>
                <Label htmlFor="post-content" className="text-sm md:text-base">Content</Label>
                <Textarea
                  id="post-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your post content here..."
                  className="mt-1 min-h-[150px] md:min-h-[200px] text-sm md:text-base"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleCreatePost} className="bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white text-sm md:text-base">
                  Create Post
                </Button>
                <Button className="bg-gray-500 hover:bg-gray-600 text-white text-sm md:text-base" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Posts List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Your Posts</CardTitle>
            <CardDescription className="text-sm md:text-base">
              {posts.length} total posts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {postsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A66C2] mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading posts...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No posts yet</p>
                <p className="text-sm text-gray-500">
                  Create your first post to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="bg-white border border-gray-200 rounded-lg shadow-sm">
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
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 gap-3">
                        <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-[#0A66C2]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate text-sm sm:text-base">
                              {post.title || 'Untitled Post'}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {formatDate(post.created_at)}
                              {post.published_at && (
                                <span className="ml-2">
                                  • Published {formatDate(post.published_at)}
                                </span>
                              )}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">
                              {post.hook.substring(0, 100)}...
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end space-x-2">
                          <div className="flex items-center">
                            {getStatusBadge(post.status)}
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              className="bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5"
                              onClick={() => handleCopyPost(post)}
                              title="Copy to clipboard"
                            >
                              <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5"
                              onClick={() => handleEditPost(post)}
                              title="Edit post"
                            >
                              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            {post.status === 'draft' && (
                              <Button
                                className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5"
                                onClick={() => handlePublishPost(post.id)}
                                title="Publish post"
                              >
                                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            )}
                            {post.status === 'published' && (
                              <Button
                                className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5"
                                onClick={() => handleArchivePost(post.id)}
                                title="Archive post"
                              >
                                <Archive className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            )}
                            <Button
                              className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5"
                              onClick={() => handleDeletePost(post.id)}
                              title="Delete post"
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  )
}

