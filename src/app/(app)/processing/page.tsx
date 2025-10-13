'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useAuth } from "@/lib/hooks/useAuth"
import { useRecordings } from "@/lib/hooks/useRecordings"
import { usePosts } from "@/lib/hooks/usePosts"
import { formatDate } from "@/lib/utils"
import { Mic, FileText, CheckCircle, Loader2, ArrowRight, Sparkles, Zap } from "lucide-react"
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { TranscriptionService } from '@/lib/services/transcription'
import { ContentGenerationService } from '@/lib/services/contentGeneration'
import { DashboardHeader } from '@/components/dashboard-header'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'

export default function ProcessingPage() {
  const { user, loading: authLoading } = useAuth()
  const { recordings, loading: recordingsLoading, updateRecording } = useRecordings()
  const { posts, loading: postsLoading, createPost } = usePosts()
  const [processingStep, setProcessingStep] = useState(0)
  const [isProcessing, setIsProcessing] = useState(true)
  const [transcription, setTranscription] = useState('')
  const [generatedPost, setGeneratedPost] = useState('')
  const [currentRecording, setCurrentRecording] = useState<any>(null)
  const [hasProcessed, setHasProcessed] = useState(false)
  const [userContext, setUserContext] = useState<{ linkedinGoal?: string; backStory?: string } | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [continuousProgress, setContinuousProgress] = useState(0)
  const [showShimmer, setShowShimmer] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const steps = [
    { id: 0, title: 'Transcribing Audio', description: 'Converting your speech to text...' },
    { id: 1, title: 'Generating Content', description: 'Creating your post from transcription...' },
    { id: 2, title: 'Saving Post', description: 'Storing your new content...' },
    { id: 3, title: 'Complete', description: 'Your post is ready!' }
  ]

  // Fetch user context for personalization
  useEffect(() => {
    const fetchUserContext = async () => {
      if (!user) return
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('linkedin_goal, back_story')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error fetching user context:', error)
          return
        }

        // console.log('Raw user context data from database:', data)
        // console.log('linkedin_goal:', data?.linkedin_goal)
        // console.log('back_story:', data?.back_story)

        const context = {
          linkedinGoal: data?.linkedin_goal,
          backStory: data?.back_story
        }
        
        // console.log('Setting userContext to:', context)
        setUserContext(context)
      } catch (error) {
        console.error('Error:', error)
      }
    }

    fetchUserContext()
  }, [user, supabase])

  useEffect(() => {
    if (recordings.length > 0 && !hasProcessed) {
      // Get the most recent processing recording
      const latestRecording = recordings
        .filter(r => r.status === 'processing')
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
      
      if (latestRecording) {
        setCurrentRecording(latestRecording)
        setHasProcessed(true)
        startProcessing(latestRecording)
      }
    }
  }, [recordings, hasProcessed])

  const startProcessing = async (recording: any) => {
    try {
      // Start continuous progress animation
      setContinuousProgress(0)
      setShowShimmer(true)
      const progressInterval = setInterval(() => {
        setContinuousProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            return 100
          }
          return prev + 0.5 // Increase by 0.5% every 50ms for smooth animation
        })
      }, 50)

      // Step 1: Transcribing Audio
      setProcessingStep(0)
      toast.info('Starting transcription...')
      
      const transcriptionService = new TranscriptionService()
      const transcriptionResult = await transcriptionService.transcribeAudio(recording.audio_url)
      setTranscription(transcriptionResult)
      
      // Update the recording with the transcript
      try {
        await updateRecording(recording.id, {
          transcript: transcriptionResult,
          status: 'completed'
        })
        // console.log('Recording updated with transcript successfully')
      } catch (updateError) {
        console.error('Failed to update recording with transcript:', updateError)
        // Continue processing even if transcript update fails
      }
      
      // Step 2: Generating Content
      setProcessingStep(1)
      toast.info('Generating content...')
      
      const contentService = new ContentGenerationService()
      
      // Only pass userContext if it has actual values
      const validUserContext = userContext && (userContext.linkedinGoal || userContext.backStory) 
        ? userContext 
        : undefined
      
      // console.log('userContext state:', userContext)
      // console.log('Valid userContext check:', userContext && (userContext.linkedinGoal || userContext.backStory))
      // console.log('Passing userContext to content generation:', validUserContext)
      
      const { title, hook, body, call_to_action } = await contentService.generatePostFromTranscription(
        transcriptionResult, 
        validUserContext
      )
      setGeneratedPost(`${hook}\n\n${body}\n\n${call_to_action}`)
      
      // Step 3: Saving Post
      setProcessingStep(2)
      toast.info('Saving post...')
      
      // Create the actual post
      await createPost({
        title: title,
        hook: hook,
        body: body,
        call_to_action: call_to_action,
        platform: 'linkedin',
        status: 'draft',
        user_id: user?.id || '',
        recording_id: recording.id,
      })
      
      // Step 4: Complete
      setProcessingStep(3)
      setIsProcessing(false)
      setContinuousProgress(100) // Ensure it reaches 100%
      setShowConfetti(true)
      
      // Hide shimmer and show content after a brief delay
      setTimeout(() => {
        setShowShimmer(false)
      }, 500)
      
      toast.success('Post created successfully!')
      
      // Hide confetti after 2 seconds
      setTimeout(() => {
        setShowConfetti(false)
      }, 2000)
      
      // Auto-redirect to posts after 3 seconds
      setTimeout(() => {
        router.push('/posts')
      }, 3000)
      
    } catch (error) {
      console.error('Processing error:', error)
      toast.error(`Failed to process recording: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setIsProcessing(false)
      setContinuousProgress(0) // Reset progress on error
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You need to be signed in to access this page.</p>
          <Link href="/signin">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Show loading while recordings are being fetched
  if (recordingsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading recording...</p>
        </div>
      </div>
    )
  }

  if (!currentRecording) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">No Recording Found</h1>
          <p className="text-muted-foreground mb-6">Please record something first.</p>
          <Link href="/recording">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Back to Recording
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleViewPosts = () => {
    router.push('/posts')
  }

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <DashboardHeader />

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-6 py-8 md:px-8 lg:px-12">
        {/* Minimal Processing Status */}
        <div className="max-w-lg mx-auto mb-8">
          <div className="bg-card rounded-2xl border border-border/50 p-6 text-center transition-all hover:border-border hover:shadow-lg animate-scale-in">
            {/* Simple Progress Indicator */}
            <div className="flex justify-center mb-4">
              {processingStep >= steps.length - 1 ? (
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              ) : (
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                </div>
              )}
            </div>
            
            {/* Minimal Step Info */}
            <div className="mb-4">
              <h3 className={`text-lg font-semibold mb-1 ${
                processingStep >= steps.length - 1 ? 'text-green-600' : 'text-foreground'
              }`}>
                {processingStep >= steps.length - 1 ? 'Complete' : steps[processingStep]?.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {processingStep >= steps.length - 1 ? 'Your post is ready!' : steps[processingStep]?.description}
              </p>
              {processingStep === 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  This usually takes 10-15 seconds
                </p>
              )}
            </div>
            
            {/* Progress Bar with Continuous Percentage */}
            <div className="space-y-2">
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-100 ease-out"
                  style={{ width: `${continuousProgress}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Step {processingStep + 1} of {steps.length}</span>
                <span>{Math.round(continuousProgress)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Shimmer Effect - Shows during processing */}
        {showShimmer && (
          <div className="bg-card rounded-2xl border border-border/50 p-6 animate-scale-in">
            <div className="space-y-4">
              {/* Shimmer Header */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-muted rounded-lg shimmer"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-32 shimmer"></div>
                  <div className="h-3 bg-muted rounded w-24 shimmer"></div>
                </div>
              </div>
              
              {/* Shimmer Content Lines */}
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-full shimmer"></div>
                <div className="h-4 bg-muted rounded w-4/5 shimmer"></div>
                <div className="h-4 bg-muted rounded w-3/4 shimmer"></div>
                <div className="h-4 bg-muted rounded w-5/6 shimmer"></div>
                <div className="h-4 bg-muted rounded w-2/3 shimmer"></div>
                <div className="h-4 bg-muted rounded w-4/5 shimmer"></div>
              </div>
            </div>
          </div>
        )}

        {/* Minimal Results */}
        {transcription && !showShimmer && (
          <div className="space-y-6 animate-fade-in">
            {/* Generated Post - Main Focus */}
            {generatedPost && (
              <div className="bg-card rounded-2xl border border-border/50 p-6 transition-all hover:border-border hover:shadow-lg animate-scale-in">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-accent/50 rounded-lg flex items-center justify-center mr-3">
                      <FileText className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Generated Post</h3>
                      <p className="text-sm text-muted-foreground">Ready for publishing</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedPost)
                      toast.success('Post copied to clipboard!')
                    }}
                    variant="outline"
                    size="sm"
                    className="flex items-center border-border hover:bg-muted"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">{generatedPost}</p>
                </div>
              </div>
            )}

            {/* Action Button */}
            {!isProcessing && (
              <div className="text-center">
                <Button
                  onClick={handleViewPosts}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg"
                  size="lg"
                >
                  <ArrowRight className="h-5 w-5 mr-2" />
                  View Your Posts
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Confetti Animation */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
            <div className="absolute top-1/3 left-1/3 w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
            <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '0.6s'}}></div>
            <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.8s'}}></div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  )
}