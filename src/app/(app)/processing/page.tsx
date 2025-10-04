'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useAuth } from "@/lib/hooks/useAuth"
import { useRecordings } from "@/lib/hooks/useRecordings"
import { usePosts } from "@/lib/hooks/usePosts"
import { formatDate } from "@/lib/utils"
import { Mic, FileText, CheckCircle, Loader2, ArrowRight } from "lucide-react"
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
  const router = useRouter()
  const supabase = createClient()

  const steps = [
    { id: 0, title: 'Transcribing Audio', description: 'Converting your speech to text...' },
    { id: 1, title: 'Generating Content', description: 'Creating your post from transcription...' },
    { id: 2, title: 'Saving Post', description: 'Storing your new content...' },
    { id: 3, title: 'Complete', description: 'Your post is ready!' }
  ]

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
        console.log('Recording updated with transcript successfully')
      } catch (updateError) {
        console.error('Failed to update recording with transcript:', updateError)
        // Continue processing even if transcript update fails
      }
      
      // Step 2: Generating Content
      setProcessingStep(1)
      toast.info('Generating content...')
      
      const contentService = new ContentGenerationService()
      const { title, hook, body, call_to_action } = await contentService.generatePostFromTranscription(transcriptionResult)
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
        status: 'published',
        user_id: user?.id || '',
        recording_id: recording.id,
      })
      
      // Step 4: Complete
      setProcessingStep(3)
      setIsProcessing(false)
      toast.success('Post created successfully!')
      
      // Auto-redirect to posts after 2 seconds
      setTimeout(() => {
        router.push('/posts')
      }, 2000)
      
    } catch (error) {
      console.error('Processing error:', error)
      toast.error(`Failed to process recording: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setIsProcessing(false)
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
      <main className="mx-auto max-w-7xl px-6 py-12 md:px-8 lg:px-12">
        {/* Main Title and Subtitle */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground md:text-4xl mb-4">
            Processing Your Recording
          </h1>
          <p className="text-lg text-muted-foreground">
            We're transcribing your audio and generating your post content.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Processing Status - Single Card */}
          <div className="max-w-md mx-auto mb-12">
            <div className="bg-white rounded-xl border border-border shadow-sm p-8 text-center">
              {/* Progress Indicator */}
              <div className="flex justify-center mb-6">
                {processingStep >= steps.length - 1 ? (
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  </div>
                )}
              </div>
              
              {/* Current Step */}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {steps[processingStep]?.title || 'Processing Complete'}
                </h3>
                <p className="text-muted-foreground">
                  {steps[processingStep]?.description || 'Your post is ready!'}
                </p>
              </div>
              
              {/* Step Counter */}
              <div className="flex items-center justify-center space-x-2">
                <span className="text-sm text-muted-foreground">Step {processingStep + 1} of {steps.length}</span>
                <div className="flex space-x-1">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index <= processingStep ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          {transcription && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Transcription */}
              <div className="bg-white rounded-xl border border-border shadow-sm p-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center mr-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Transcription</h3>
                    <p className="text-sm text-muted-foreground">Your speech converted to text</p>
                  </div>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-foreground">{transcription}</p>
                </div>
              </div>

              {/* Generated Post */}
              {generatedPost && (
                <div className="bg-white rounded-xl border border-border shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <FileText className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">Generated Post</h3>
                        <p className="text-sm text-muted-foreground">Your content ready for publishing</p>
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
                  <div className="bg-muted/50 p-4 rounded-lg max-h-64 overflow-y-auto">
                    <p className="text-foreground whitespace-pre-wrap">{generatedPost}</p>
                  </div>
                </div>
              )}

              {/* Action Button */}
              {!isProcessing && (
                <div className="lg:col-span-2 text-center mt-8">
                  <Button
                    onClick={handleViewPosts}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg"
                    size="lg"
                  >
                    <ArrowRight className="h-5 w-5 mr-2" />
                    View Your Posts
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  )
}