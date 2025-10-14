'use client'

export default function ScheduleDemo() {
  return (
    <div className="w-full h-full bg-background relative overflow-hidden">
      <video
        src="/3.mp4"
        className="w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      />
    </div>
  )
}
