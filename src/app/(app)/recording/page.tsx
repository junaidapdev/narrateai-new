'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useAuth } from "@/lib/hooks/useAuth"
import { useRecordings } from "@/lib/hooks/useRecordings"
import { useSubscription } from "@/lib/hooks/useSubscription"
import { formatDate, formatDuration } from "@/lib/utils"
import { Mic, MicOff, Play, Pause, Square, Trash2, Save, Download } from "lucide-react"
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { TrialUsageIndicator } from '@/components/subscription/TrialUsageIndicator'
import { PaywallModal } from '@/components/subscription/PaywallModal'

export default function RecordingPage() {
  const { user, loading: authLoading } = useAuth()
  const { recordings, loading: recordingsLoading, createRecording, deleteRecording } = useRecordings()
  const { subscription, trialUsage, updateTrialUsage } = useSubscription()
  
  // Recording states
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  
  // Form states
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  
  // Subscription states
  const [showPaywall, setShowPaywall] = useState(false)
  
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const animationRef = useRef<number | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  // Cleanup effects
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => setIsPlaying(false)
    }
  }, [audioUrl])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Signed out successfully!')
      router.push('/')
    } catch (error) {
      toast.error('Failed to sign out')
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

  // Audio recording functions
  const startRecording = async () => {
    // Check trial limits
    if (trialUsage && trialUsage.is_trial && !trialUsage.can_record) {
      setShowPaywall(true)
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      })
      
      streamRef.current = stream
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        if (!title) {
          setTitle(`Recording ${new Date().toLocaleString()}`)
        }
      }
      
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      // Start timer with trial limit checking
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1
          
          // Check trial limits during recording
          if (trialUsage && trialUsage.is_trial) {
            const currentMinutesUsed = newTime / 60 // Convert seconds to minutes with decimal precision
            const totalMinutesUsed = (trialUsage.minutes_used || 0) + currentMinutesUsed
            
            // If we've reached or exceeded the trial limit, stop recording
            if (totalMinutesUsed >= trialUsage.minutes_limit) {
              stopRecording()
              setShowPaywall(true)
              toast.error('Trial limit reached! Please upgrade to continue recording.')
              return newTime
            }
          }
          
          return newTime
        })
      }, 1000)
      
      // Start audio level monitoring
      startAudioLevelMonitoring(stream)
      
    } catch (error) {
      console.error('Error accessing microphone:', error)
      toast.error('Unable to access microphone. Please check permissions.')
    }
  }
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
    }
  }
  
  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        setIsPaused(false)
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1)
        }, 1000)
      } else {
        mediaRecorderRef.current.pause()
        setIsPaused(true)
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
      }
    }
  }
  
  const startAudioLevelMonitoring = (stream: MediaStream) => {
    const audioContext = new AudioContext()
    const analyser = audioContext.createAnalyser()
    const microphone = audioContext.createMediaStreamSource(stream)
    const dataArray = new Uint8Array(analyser.frequencyBinCount)
    
    microphone.connect(analyser)
    analyser.fftSize = 256
    
    const updateLevel = () => {
      if (isRecording && !isPaused) {
        analyser.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length
        setAudioLevel(average / 255)
        animationRef.current = requestAnimationFrame(updateLevel)
      }
    }
    updateLevel()
  }
  
  const playRecording = () => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }
  
  const pausePlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }
  
  const saveRecording = async () => {
    if (!audioBlob) {
      toast.error('Please record audio first')
      return
    }

    try {
      // Upload audio file to Supabase Storage
      const fileName = `recording-${Date.now()}.webm`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('recordings')
        .upload(fileName, audioBlob, {
          contentType: 'audio/webm',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        toast.error('Failed to upload audio file')
        return
      }

      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('recordings')
        .getPublicUrl(fileName)

      // Create recording with default title
      const defaultTitle = `Recording ${new Date().toLocaleString()}`
      
      console.log('Creating recording with data:', {
        title: defaultTitle,
        description: null,
        audio_url: urlData.publicUrl,
        status: 'processing',
        user_id: user.id,
      })
      
      const result = await createRecording({
        title: defaultTitle,
        audio_url: urlData.publicUrl,
        status: 'processing',
        user_id: user.id,
      })

      console.log('Recording created successfully:', result)
      
      // Update trial usage if user is on trial
      if (trialUsage && trialUsage.is_trial) {
        const minutesUsed = recordingTime / 60 // Convert seconds to minutes with decimal precision
        const newTotalMinutes = (trialUsage.minutes_used || 0) + minutesUsed
        await updateTrialUsage(newTotalMinutes)
      }
      
      toast.success('Recording saved successfully!')
      // Redirect to review page
      router.push('/recording/review')
    } catch (error) {
      console.error('Failed to save recording - Full error:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      })
      toast.error('Failed to save recording')
    }
  }
  
  const downloadRecording = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title || 'recording'}.webm`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }
  
  const resetRecording = () => {
    setAudioBlob(null)
    setAudioUrl(null)
    setRecordingTime(0)
    setTitle('')
    setDescription('')
    setIsPlaying(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleDeleteRecording = async (id: string) => {
    if (confirm('Are you sure you want to delete this recording?')) {
      try {
        await deleteRecording(id)
        toast.success('Recording deleted successfully!')
      } catch (error) {
        toast.error('Failed to delete recording')
      }
    }
  }

  const getStatusIcon = (status: string) => {
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
                <Link href="/recording" className="text-[#0A66C2] font-medium">
                  Recordings
                </Link>
                <Link href="/posts" className="text-gray-600 hover:text-gray-900">
                  Posts
                </Link>
                <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
                  Pricing
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Voice Recorder
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Record your voice and create content automatically.
          </p>
        </div>

        {/* Trial Usage Indicator */}
        {trialUsage && trialUsage.is_trial && (
          <TrialUsageIndicator
            minutesUsed={trialUsage.minutes_used}
            minutesLimit={trialUsage.minutes_limit}
            isTrial={trialUsage.is_trial}
            canRecord={trialUsage.can_record}
          />
        )}

        <div className="grid lg:grid-cols-3 gap-4 lg:gap-8">
          {/* Recording Interface */}
          <div className="lg:col-span-1 order-1 lg:order-1">
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
              <CardHeader>
                <CardTitle className="flex items-center text-indigo-700">
                  <Mic className="h-5 w-5 mr-2" />
                  Live Recording
                </CardTitle>
                <CardDescription>
                  Record your voice with real-time audio visualization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Recording Timer */}
                <div className="text-center">
                  <div className="text-xl md:text-2xl lg:text-3xl font-mono font-bold text-[#0A66C2] mb-2">
                    {formatTime(recordingTime)}
                  </div>
                  {isRecording && (
                    <div className="text-sm text-indigo-500">
                      {isPaused ? 'Paused' : 'Recording...'}
                    </div>
                  )}
                  
                  {/* Trial Limit Warning */}
                  {isRecording && trialUsage && trialUsage.is_trial && (
                    (() => {
                      const currentMinutesUsed = recordingTime / 60 // Convert seconds to minutes with decimal precision
                      const totalMinutesUsed = (trialUsage.minutes_used || 0) + currentMinutesUsed
                      const remainingMinutes = trialUsage.minutes_limit - totalMinutesUsed
                      
                      if (remainingMinutes <= 1 && remainingMinutes > 0) {
                        return (
                          <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded-lg">
                            <div className="flex items-center justify-center space-x-1 text-yellow-800">
                              <span className="text-sm font-medium">⚠️ Less than 1 minute remaining in trial</span>
                            </div>
                          </div>
                        )
                      } else if (remainingMinutes <= 0) {
                        return (
                          <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded-lg">
                            <div className="flex items-center justify-center space-x-1 text-red-800">
                              <span className="text-sm font-medium">🚫 Trial limit reached!</span>
                            </div>
                          </div>
                        )
                      }
                      return null
                    })()
                  )}
                </div>

                {/* Audio Level Visualization */}
                {isRecording && (
                  <div className="flex justify-center items-end space-x-1 h-16">
                    {Array.from({ length: 20 }, (_, i) => (
                      <div
                        key={i}
                        className="w-2 bg-indigo-300 rounded-full transition-all duration-100"
                        style={{
                          height: `${Math.max(4, (audioLevel * 100) + Math.random() * 20)}%`,
                          backgroundColor: audioLevel > 0.3 ? '#ef4444' : audioLevel > 0.1 ? '#f59e0b' : '#6366f1'
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Recording Controls */}
                <div className="flex justify-center space-x-2 md:space-x-4">
                  {!isRecording ? (
                    <Button
                      onClick={startRecording}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-full text-sm md:text-base"
                      size="lg"
                    >
                      <Mic className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2" />
                      <span className="hidden sm:inline">Start Recording</span>
                      <span className="sm:hidden">Start</span>
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button
                        onClick={pauseRecording}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 md:px-4 py-2"
                      >
                        {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                      </Button>
                      <Button
                        onClick={stopRecording}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-3 md:px-4 py-2"
                      >
                        <Square className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Recording Actions */}
                {audioBlob && (
                  <div className="space-y-4 pt-4 border-t border-indigo-200">
                    {/* Playback Controls */}
                    <div className="flex justify-center items-center space-x-2 md:space-x-4">
                      <Button
                        onClick={isPlaying ? pausePlayback : playRecording}
                        className="bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white px-3 md:px-4"
                        size="sm"
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button
                        onClick={downloadRecording}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-3 md:px-4"
                        size="sm"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={resetRecording}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 md:px-4"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Done Button */}
                    <Button 
                      onClick={saveRecording}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 md:py-3 text-sm md:text-base"
                    >
                      <Save className="h-4 w-4 mr-1 md:mr-2" />
                      <span className="hidden sm:inline">Done - Review Recording</span>
                      <span className="sm:hidden">Done</span>
                    </Button>
                  </div>
                )}

                {/* Hidden Audio Element */}
                {audioUrl && (
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    onEnded={() => setIsPlaying(false)}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    className="hidden"
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recordings List */}
          <div className="lg:col-span-2 order-2 lg:order-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mic className="h-5 w-5 mr-2 text-[#0A66C2]" />
                  Your Recordings
                </CardTitle>
                <CardDescription>
                  {recordings.length} total recordings • Click to play
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recordingsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A66C2] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading recordings...</p>
                  </div>
                ) : recordings.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mic className="h-10 w-10 text-[#0A66C2]" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No recordings yet</h3>
                    <p className="text-gray-500 mb-6">
                      Start recording your voice to create your first audio content
                    </p>
                    <div className="text-sm text-[#0A66C2] bg-indigo-50 px-4 py-2 rounded-lg inline-block">
                      💡 Tip: Click "Start Recording" to begin
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recordings.map((recording) => (
                      <div key={recording.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all duration-200">
                        <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                              <Mic className="h-5 w-5 sm:h-6 sm:w-6 text-[#0A66C2]" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate group-hover:text-indigo-700 text-sm sm:text-base">
                              {recording.title}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {formatDate(recording.created_at)}
                              {recording.duration && (
                                <span className="ml-2 text-[#0A66C2]">
                                  • {formatDuration(recording.duration)}
                                </span>
                              )}
                            </p>
                            {recording.description && (
                              <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">
                                {recording.description}
                              </p>
                            )}
                            {recording.transcript && (
                              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs sm:text-sm">
                                <p className="text-green-800 font-medium mb-1">📝 Transcript:</p>
                                <p className="text-green-700 line-clamp-2">
                                  {recording.transcript}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end space-x-2 mt-2 sm:mt-0">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(recording.status)}
                          </div>
                          <Button
                            className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteRecording(recording.id)}
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onUpgrade={(plan) => {
          console.log('Upgrading to:', plan)
          setShowPaywall(false)
        }}
      />
    </div>
  )
}

