"use client"

import { Button } from "@/components/ui/button"
import { Mic } from "lucide-react"
import Link from "next/link"

export function RecordingButton() {
  return (
    <div className="flex justify-center">
      <Link href="/recording">
        <Button className="relative h-20 w-20 rounded-full text-lg font-semibold shadow-lg transition-all hover:scale-105 active:scale-95 animate-pulse-subtle">
          <Mic className="h-8 w-8" />
          <span className="sr-only">Start Recording</span>
        </Button>
      </Link>
    </div>
  )
}
