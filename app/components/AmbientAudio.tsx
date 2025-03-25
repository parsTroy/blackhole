'use client'

import { useEffect, useRef, useState } from 'react'

export function AmbientAudio() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.15 // Set initial volume to 15%
      
      const playAudio = async () => {
        try {
          if (audioRef.current) {
            // First check if the file exists
            const response = await fetch('/ambient-space.mp3')
            if (!response.ok) {
              throw new Error('Audio file not found')
            }

            // Create and resume AudioContext to handle browser autoplay policy
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext
            const audioContext = new AudioContext()
            await audioContext.resume()
            
            // Play the audio
            await audioRef.current.play()
            setError(null)
            document.removeEventListener('click', playAudio)
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Audio playback failed'
          console.warn('Audio playback failed:', message)
          setError(message)
          // Don't remove the event listener on error so we can retry
        }
      }
      
      document.addEventListener('click', playAudio)
      
      return () => {
        document.removeEventListener('click', playAudio)
      }
    }
  }, [])

  // Only show error in development
  if (error && process.env.NODE_ENV === 'development') {
    return (
      <div className="fixed bottom-4 left-4 bg-red-500/80 text-white px-4 py-2 rounded-md text-sm">
        Audio Error: {error}
      </div>
    )
  }

  return (
    <audio
      ref={audioRef}
      src="/ambient-space.mp3"
      loop
      preload="auto"
      className="hidden"
    />
  )
} 