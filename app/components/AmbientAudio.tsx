'use client'

import { useEffect, useRef } from 'react'

export function AmbientAudio() {
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.15 // Set initial volume to 15%
      
      const playAudio = async () => {
        try {
          if (audioRef.current) {
            // Create and resume AudioContext to handle browser autoplay policy
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext
            const audioContext = new AudioContext()
            await audioContext.resume()
            
            // Play the audio
            await audioRef.current.play()
            document.removeEventListener('click', playAudio)
          }
        } catch (error) {
          console.warn('Audio playback failed:', error)
          // Retry on next click if playback failed
          return
        }
      }
      
      document.addEventListener('click', playAudio)
      
      return () => {
        document.removeEventListener('click', playAudio)
      }
    }
  }, [])

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