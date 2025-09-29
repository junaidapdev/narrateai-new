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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
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

  // Show loading while recordings are being fetched
  if (recordingsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading recording...</p>
        </div>
      </div>
    )
  }

  if (!currentRecording) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Recording Found</h1>
          <p className="text-gray-600 mb-6">Please record something first.</p>
          <Link href="/recording">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold text-indigo-600">
                Narrate AI
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
                <Link href="/recording" className="text-gray-600 hover:text-gray-900">
                  Recordings
                </Link>
                <Link href="/posts" className="text-indigo-600 font-medium">
                  Posts
                </Link>
                <Link href="/settings" className="text-gray-600 hover:text-gray-900">
                  Settings
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user.user_metadata?.full_name || user.email}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Processing Your Recording
          </h1>
          <p className="text-gray-600">
            We're transcribing your audio and generating your post content.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Processing Steps */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {steps.map((step, index) => (
              <Card 
                key={step.id} 
                className={`${
                  processingStep >= step.id 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200'
                }`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {processingStep > step.id ? (
                      <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                    ) : processingStep === step.id ? (
                      <Loader2 className="h-5 w-5 mr-2 text-indigo-600 animate-spin" />
                    ) : (
                      <div className="h-5 w-5 mr-2 bg-gray-300 rounded-full" />
                    )}
                    {step.title}
                  </CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Results */}
          {transcription && (
            <div className="space-y-6">
              {/* Transcription */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mic className="h-5 w-5 mr-2 text-indigo-600" />
                    Transcription
                  </CardTitle>
                  <CardDescription>
                    Your speech converted to text
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">{transcription}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Generated Post */}
              {generatedPost && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-green-600" />
                      Generated Post
                    </CardTitle>
                    <CardDescription>
                      Your content ready for publishing
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-gray-700">{generatedPost}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Button */}
              {!isProcessing && (
                <div className="text-center">
                  <Button
                    onClick={handleViewPosts}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3"
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
    </div>
  )
}
