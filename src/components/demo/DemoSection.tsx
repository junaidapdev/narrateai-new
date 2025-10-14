'use client'

import { useState, useEffect } from 'react'
import RecordDemo from './RecordDemo'
import GenerateDemo from './GenerateDemo'
import ScheduleDemo from './ScheduleDemo'

export default function DemoSection() {
  const [currentDemo, setCurrentDemo] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const demos = [
    { component: <RecordDemo />, title: 'Step 1: Record', description: 'Just speak your thoughts' },
    { component: <GenerateDemo />, title: 'Generate', description: 'AI creates your LinkedIn post' },
    { component: <ScheduleDemo />, title: 'Schedule', description: 'Schedule directly to LinkedIn' }
  ]

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentDemo(prev => (prev + 1) % demos.length)
    }, 5000) // Change every 5 seconds

    return () => clearInterval(interval)
  }, [isAutoPlaying, demos.length])

  const handleDemoClick = (index: number) => {
    setCurrentDemo(index)
    setIsAutoPlaying(false)
  }

  const handlePlayPause = () => {
    setIsAutoPlaying(!isAutoPlaying)
  }

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-foreground mb-4">
          See Narrate in Action
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Watch how easy it is to transform your voice into viral LinkedIn content
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-center">
        {/* Demo Videos - Larger, more prominent */}
        <div className="lg:col-span-2">
          <div className="relative w-full aspect-square max-w-2xl mx-auto bg-card rounded-2xl shadow-2xl overflow-hidden">
            <div className="absolute inset-0">
              {demos[currentDemo].component}
            </div>
            
            {/* Navigation dots */}
            <div className="absolute bottom-4 right-4">
              <div className="flex items-center space-x-1 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2">
                {demos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleDemoClick(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      currentDemo === index 
                        ? 'bg-primary w-6' 
                        : 'bg-muted-foreground/40 hover:bg-muted-foreground/60'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Step Indicators - Cleaner, more focused */}
        <div className="space-y-4 flex flex-col justify-center">
          {demos.map((demo, index) => (
            <div
              key={index}
              className={`group relative p-4 rounded-xl transition-all duration-300 cursor-pointer border-2 ${
                currentDemo === index 
                  ? 'bg-primary/5 border-primary shadow-lg' 
                  : 'bg-card border-border hover:border-primary/50 hover:shadow-md'
              }`}
              onClick={() => handleDemoClick(index)}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                  currentDemo === index 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground group-hover:bg-primary/20'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold text-sm mb-1 transition-colors ${
                    currentDemo === index ? 'text-primary' : 'text-foreground'
                  }`}>
                    {demo.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {demo.description}
                  </p>
                </div>
              </div>
              
              {/* Active indicator */}
              {currentDemo === index && (
                <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
