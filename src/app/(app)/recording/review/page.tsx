'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useAuth } from "@/lib/hooks/useAuth"
import { useRecordings } from "@/lib/hooks/useRecordings"
import { formatDate, formatDuration } from "@/lib/utils"
import { Mic, Play, Pause, ArrowLeft, ArrowRight } from "lucide-react"
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ReviewPage() {
  const { user, loading: authLoading } = useAuth()
  const { recordings, loading: recordingsLoading } = useRecordings()
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentRecording, setCurrentRecording] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (recordings.length > 0) {
      // Get the most recent recording (processing status)
      const latestRecording = recordings
        .filter(r => r.status === 'processing')
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
      
      if (latestRecording) {
        setCurrentRecording(latestRecording)
      }
    }
  }, [recordings])

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
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Recording
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const handlePlayPause = () => {
    const audio = document.getElementById('review-audio') as HTMLAudioElement
    if (audio) {
      if (isPlaying) {
        audio.pause()
        setIsPlaying(false)
      } else {
        audio.play()
        setIsPlaying(true)
      }
    }
  }

  const handleProcess = () => {
    // Redirect to processing page
    router.push('/processing')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold text-indigo-600">
                Narrate
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
                <Link href="/recording" className="text-indigo-600 font-medium">
                  Recordings
                </Link>
                <Link href="/posts" className="text-gray-600 hover:text-gray-900">
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
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/recording">
              <Button variant="outline" className="border-gray-300">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Review Recording
              </h1>
              <p className="text-gray-600">
                Listen to your recording and process it to create content.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
            <CardHeader>
              <CardTitle className="flex items-center text-indigo-700">
                <Mic className="h-5 w-5 mr-2" />
                Your Recording
              </CardTitle>
              <CardDescription>
                {currentRecording.title} • {formatDate(currentRecording.created_at)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Audio Player */}
              <div className="text-center">
                <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mic className="h-16 w-16 text-indigo-600" />
                </div>
                
                <Button
                  onClick={handlePlayPause}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full"
                  size="lg"
                >
                  {isPlaying ? <Pause className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2" />}
                  {isPlaying ? 'Pause' : 'Play'} Recording
                </Button>
              </div>

              {/* Hidden Audio Element */}
              <audio
                id="review-audio"
                src={currentRecording.audio_url}
                onEnded={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="hidden"
              />

              {/* Process Button */}
              <div className="pt-6 border-t border-indigo-200">
                <Button
                  onClick={handleProcess}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                  size="lg"
                >
                  <ArrowRight className="h-5 w-5 mr-2" />
                  Process Recording
                </Button>
                <p className="text-sm text-gray-500 text-center mt-2">
                  This will transcribe your audio and generate a post
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
