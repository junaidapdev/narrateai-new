'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Mic } from "lucide-react"

interface WelcomeModalProps {
  isOpen: boolean
  onClose: () => void
  onStartRecording: () => void
}

export function WelcomeModal({ isOpen, onClose, onStartRecording }: WelcomeModalProps) {
  const handleStartRecording = () => {
    onStartRecording()
    onClose()
  }

  const handleSkip = () => {
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto p-0 gap-0 animate-in fade-in-0 zoom-in-95 duration-300 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95">
        <DialogHeader className="px-6 pt-6 pb-4 text-center animate-in slide-in-from-top-2 duration-500 delay-100">
          <DialogTitle className="text-2xl font-serif font-medium">
            🎉 Welcome to Narrate!
          </DialogTitle>
        </DialogHeader>
        
        <div className="px-6 pb-6 space-y-6">
          <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-500 delay-200">
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              You're all set! Let's create your first AI-generated post.
            </p>
            
            <div className="bg-primary/5 rounded-lg p-4 border border-primary/20 animate-in slide-in-from-bottom-2 duration-500 delay-300">
              <p className="text-sm text-muted-foreground leading-relaxed">
                💡 Just speak naturally - we'll turn it into a LinkedIn post!
              </p>
            </div>
          </div>

          <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-500 delay-400">
            <Button 
              onClick={handleStartRecording}
              className="w-full h-12 sm:h-14 text-base sm:text-lg font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Mic className="h-5 w-5 mr-2" />
              Record Your First Thought
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={handleSkip}
              className="w-full h-10 text-sm sm:text-base text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
            >
              Skip for now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
