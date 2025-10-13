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
import { Mic, MicOff, Play, Pause, Square, Trash2, Save, X, RotateCcw } from "lucide-react"
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { PaywallModal } from '@/components/subscription/PaywallModal'
import { DashboardHeader } from '@/components/dashboard-header'

export default function RecordingPage() {
  const { user, loading: authLoading } = useAuth()
  const { createRecording, recordings, loading: recordingsLoading } = useRecordings()
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
  
  // Processing states
  const [isProcessing, setIsProcessing] = useState(false)
  const [displayText, setDisplayText] = useState('')
  
  // Subscription states
  const [showPaywall, setShowPaywall] = useState(false)
  
  // Recent recordings playback states
  const [playingRecordingId, setPlayingRecordingId] = useState<string | null>(null)
  
  // UI enhancement states
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0)
  
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const animationRef = useRef<number | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  // Example prompts for rotation
  const examplePrompts = [
    "💭 Share a recent win...",
    "💡 Talk about a lesson learned...",
    "🎯 Describe your expertise...",
    "🚀 What's your biggest challenge?",
    "💼 Share a professional insight...",
    "🌟 What motivates you daily?"
  ]

  // Rotate prompts every 3 seconds
  useEffect(() => {
    if (!isRecording && !audioBlob) {
      const interval = setInterval(() => {
        setCurrentPromptIndex((prev) => (prev + 1) % examplePrompts.length)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [isRecording, audioBlob, examplePrompts.length])

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

  // Typing animation effect
  useEffect(() => {
    if (isProcessing) {
      const text = "Processing audio..."
      let index = 0
      setDisplayText('')
      
      const typeInterval = setInterval(() => {
        if (index < text.length) {
          setDisplayText(text.slice(0, index + 1))
          index++
        } else {
          clearInterval(typeInterval)
        }
      }, 100)
      
      return () => clearInterval(typeInterval)
    }
  }, [isProcessing])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Signed out successfully!')
      router.push('/')
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  // Recent recordings playback function
  const playRecentRecording = async (recording: any) => {
    try {
      // Stop any currently playing recording
      if (playingRecordingId && playingRecordingId !== recording.id) {
        const currentAudio = document.getElementById(`audio-${playingRecordingId}`) as HTMLAudioElement
        if (currentAudio) {
          currentAudio.pause()
          currentAudio.currentTime = 0
        }
      }

      // If clicking the same recording, toggle play/pause
      if (playingRecordingId === recording.id) {
        const audio = document.getElementById(`audio-${recording.id}`) as HTMLAudioElement
        if (audio) {
          if (audio.paused) {
            audio.play()
          } else {
            audio.pause()
          }
        }
        return
      }

      // Play new recording
      setPlayingRecordingId(recording.id)
      
      // Create audio element if it doesn't exist
      let audio = document.getElementById(`audio-${recording.id}`) as HTMLAudioElement
      if (!audio) {
        audio = new Audio(recording.audio_url)
        audio.id = `audio-${recording.id}`
        audio.preload = 'metadata'
        document.body.appendChild(audio)
        
        audio.addEventListener('ended', () => {
          setPlayingRecordingId(null)
        })
        
        audio.addEventListener('error', () => {
          toast.error('Failed to load audio')
          setPlayingRecordingId(null)
        })
      }
      
      audio.play()
    } catch (error) {
      console.error('Error playing recording:', error)
      toast.error('Failed to play recording')
      setPlayingRecordingId(null)
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

    setIsProcessing(true)

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
      
      
      const result = await createRecording({
        title: defaultTitle,
        audio_url: urlData.publicUrl,
        duration: recordingTime, // Save duration in seconds
        status: 'processing',
        user_id: user.id,
      })

      // console.log('Recording created successfully:', result)
      
      // Update trial usage if user is on trial
      if (trialUsage && trialUsage.is_trial) {
        const minutesUsed = recordingTime / 60 // Convert seconds to minutes with decimal precision
        const newTotalMinutes = (trialUsage.minutes_used || 0) + minutesUsed
        await updateTrialUsage(newTotalMinutes)
      }
      
      toast.success('Recording saved successfully!')
      // Redirect to processing page
      router.push('/processing')
    } catch (error) {
      console.error('Failed to save recording - Full error:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      })
      toast.error('Failed to save recording')
    } finally {
      setIsProcessing(false)
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
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 pb-24 md:px-8 lg:px-12 md:py-12 md:pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Recording Interface */}
          <div className="bg-card rounded-2xl border border-border/50 p-6 md:p-12 text-center transition-all hover:border-border hover:shadow-lg animate-scale-in">
            
            {/* Main Title */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-medium text-foreground mb-4 md:mb-6 leading-tight">
              {audioBlob ? (
                <>
                  Review<br />your recording
                </>
              ) : (
                <>
                  Speak<br />your mind
                </>
              )}
            </h1>
            
            {/* Description */}
            <p className="text-base md:text-lg text-muted-foreground mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed">
              {audioBlob ? (
                "Listen to your recording and process it into a polished LinkedIn post."
              ) : (
                "Press the button and start talking. We'll transform your thoughts into a polished LinkedIn post."
              )}
            </p>

            {/* Recording Timer */}
            <div className="text-center mb-4 md:mb-6">
              <div className="text-4xl md:text-5xl lg:text-6xl font-mono font-bold text-foreground mb-2">
                {formatTime(recordingTime)}
              </div>
              {isRecording && (
                <div className="text-sm text-muted-foreground">
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
                        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center justify-center space-x-2 text-yellow-700">
                            <span className="text-sm font-medium">⚠️ Less than 1 minute remaining in trial</span>
                          </div>
                        </div>
                      )
                    } else if (remainingMinutes <= 0) {
                      return (
                        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center justify-center space-x-2 text-red-700">
                            <span className="text-sm font-medium">🚫 Trial limit reached!</span>
                          </div>
                        </div>
                      )
                    }
                    return null
                  })()
                )}
                </div>

              {/* Rotating Example Prompts */}
              {!isRecording && !audioBlob && (
                <div className="mb-8 md:mb-12">
                  <div className="h-12 flex items-center justify-center">
                    <div className="text-lg font-medium text-muted-foreground transition-all duration-500 ease-in-out">
                      {examplePrompts[currentPromptIndex]}
                    </div>
                  </div>
                </div>
              )}

              {/* Professional Waveform During Recording */}
              {isRecording && (
                <div className="bg-card border border-border/30 rounded-2xl p-6 mb-12 shadow-sm">
                  <div className="flex justify-center items-end space-x-1 h-20">
                    {Array.from({ length: 50 }, (_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-gradient-to-t from-primary/40 via-primary/70 to-primary rounded-full transition-all duration-300 hover:scale-110"
                        style={{
                          height: `${Math.max(8, (audioLevel * 120) + Math.random() * 40 + 20)}%`,
                          animationDelay: `${i * 0.02}s`
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

            {/* Recording Controls */}
            <div className="flex justify-center mb-6 md:mb-12">
              {!isRecording && !audioBlob ? (
                <Button
                  onClick={startRecording}
                  className="w-24 h-24 md:w-32 md:h-32 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 animate-pulse-glow"
                  size="lg"
                >
                  <Mic className="h-12 w-12 md:h-16 md:w-16" />
                </Button>
              ) : isRecording ? (
                <div className="flex flex-row items-center gap-6 md:gap-8">
                  {/* Pause/Resume Button */}
                  <Button
                    onClick={pauseRecording}
                    className="w-16 h-16 md:w-20 md:h-20 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                    size="lg"
                  >
                    {isPaused ? <Play className="h-6 w-6 md:h-8 md:w-8" /> : <Pause className="h-6 w-6 md:h-8 md:w-8" />}
                  </Button>
                  
                  {/* Stop Button */}
                  <Button
                    onClick={stopRecording}
                    className="w-16 h-16 md:w-20 md:h-20 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                    size="lg"
                  >
                    <Square className="h-6 w-6 md:h-8 md:w-8" />
                  </Button>
                </div>
              ) : null}
            </div>

            {/* Call to Action */}
            {!isRecording && !audioBlob && (
              <p className="text-sm text-muted-foreground mb-6 md:mb-8">
                Click to start recording
              </p>
            )}
            
            {/* Recording Status */}
            {isRecording && (
              <div className="text-center mb-8 md:mb-12">
                <p className="text-sm text-muted-foreground mb-2">
                  {isPaused ? 'Recording paused' : 'Recording in progress...'}
                </p>
                <div className="flex justify-center space-x-2 text-xs text-muted-foreground/70">
                  <span>Tap to pause</span>
                  <span>•</span>
                  <span>Tap to stop</span>
                </div>
              </div>
            )}

            {/* Completed State - Compact Layout */}
            {audioBlob && (
              <div className="space-y-4 pt-2">

                {/* Professional Waveform Preview */}
                <div className="bg-card border border-border/30 rounded-2xl p-6 mb-6 shadow-sm">
                  <div className="flex justify-center items-end space-x-1 h-20">
                    {Array.from({ length: 50 }, (_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-gradient-to-t from-primary/40 via-primary/70 to-primary rounded-full transition-all duration-300 hover:scale-110"
                        style={{
                          height: `${Math.random() * 60 + 15}%`,
                          animationDelay: `${i * 0.02}s`
                        }}
                      />
                    ))}
                  </div>
                </div>


                {/* Action Buttons - Compact Layout */}
                <div className="space-y-3">
                  {/* Primary Action Row */}
                  <div className="flex gap-3">
                    {/* Process Audio - Primary Button */}
                    <Button 
                      onClick={saveRecording}
                      disabled={isProcessing}
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                      size="lg"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Process Audio
                        </>
                      )}
                    </Button>
                    
                    {/* Preview Recording Button */}
                    <Button
                      onClick={isPlaying ? pausePlayback : playRecording}
                      variant="outline"
                      className="px-3 md:px-4 border-border hover:bg-accent transition-all duration-200 hover:scale-[1.02]"
                      size="lg"
                    >
                      {isPlaying ? <Pause className="h-3 w-3 md:h-4 md:w-4" /> : <Play className="h-3 w-3 md:h-4 md:w-4" />}
                    </Button>
                  </div>
                  
                  {/* Secondary Actions */}
                  <div className="flex justify-between items-center">
                    <Button
                      onClick={resetRecording}
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground transition-all duration-200"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Record Again
                    </Button>
                    
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      <div className="text-sm font-medium text-foreground">
                        {formatTime(recordingTime)} recorded
                      </div>
                    </div>
                  </div>
                </div>
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
              </div>
        </div>

        {/* Recent Recordings Section */}
        <div className="mt-8 md:mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-serif font-medium text-foreground">
              Recent Recordings
            </h2>
            <Link href="/posts">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>

          {recordingsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading recordings...</p>
            </div>
          ) : recordings.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No recordings yet</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Start recording to see your content here
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recordings.slice(0, 6).map((recording) => (
                <Card key={recording.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground truncate">
                          {recording.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(recording.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge 
                        className={`${
                          recording.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : recording.status === 'processing'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {recording.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>
                          {(() => {
                            const duration = recording.duration
                            if (!duration || duration <= 0) return '0:00'
                            
                            const minutes = Math.floor(duration / 60)
                            const seconds = Math.floor(duration % 60)
                            return `${minutes}:${seconds.toString().padStart(2, '0')}`
                          })()}
                        </span>
                        <span>•</span>
                        <span>{recording.status === 'completed' ? 'Ready' : 'Processing'}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        {recording.status === 'completed' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => playRecentRecording(recording)}
                          >
                            {playingRecordingId === recording.id ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <MobileBottomNav />
      </div>

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