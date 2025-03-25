'use client'

import { Scene } from './components/Scene'
import { useEffect, useState } from 'react'

export default function Home() {
  const [hasWebGL, setHasWebGL] = useState(true)

  useEffect(() => {
    // Check for WebGL support
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('webgl2')
      setHasWebGL(!!gl)
    } catch (e) {
      setHasWebGL(false)
      console.error('WebGL not supported:', e)
    }
  }, [])

  if (!hasWebGL) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white p-4 text-center">
        <div>
          <h1 className="text-xl font-bold mb-2">WebGL Not Supported</h1>
          <p>Your browser or device does not support WebGL, which is required for 3D graphics.</p>
        </div>
      </div>
    )
  }

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black">
      <Scene />
    </main>
  )
}
