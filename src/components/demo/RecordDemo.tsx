'use client'

import { useState } from 'react'

export default function RecordDemo() {
  const [videoError, setVideoError] = useState(false)

  if (videoError) {
    return (
      <div className="w-full h-full bg-background relative overflow-hidden rounded-lg flex items-center justify-center">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground text-lg">🎤</span>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Step 1: Record</h3>
          <p className="text-sm text-muted-foreground">Just speak your thoughts</p>
          <p className="text-xs text-muted-foreground mt-2">Video loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-background relative overflow-hidden">
      <video
        src="/1.mp4"
        className="w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        onError={() => setVideoError(true)}
        onLoadStart={() => console.log('Video loading started')}
        onCanPlay={() => console.log('Video can play')}
      />
    </div>
  )
}
