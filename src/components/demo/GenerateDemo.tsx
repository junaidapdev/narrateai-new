'use client'

export default function GenerateDemo() {
  return (
    <div className="w-full h-full bg-background relative overflow-hidden">
      <video
        src="/2.mp4"
        className="w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      />
    </div>
  )
}
