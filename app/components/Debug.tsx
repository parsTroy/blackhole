'use client'

import { useEffect, useState } from 'react'

export function Debug() {
  const [debugInfo, setDebugInfo] = useState<{
    hasWebGL: boolean
    webGLVersion: string | null
    maxTextureSize: number | null
    vendor: string | null
    renderer: string | null
    error: string | null
  }>({
    hasWebGL: false,
    webGLVersion: null,
    maxTextureSize: null,
    vendor: null,
    renderer: null,
    error: null
  })

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')

      if (!gl) {
        setDebugInfo(prev => ({
          ...prev,
          error: 'WebGL not supported'
        }))
        return
      }

      setDebugInfo({
        hasWebGL: true,
        webGLVersion: gl instanceof WebGL2RenderingContext ? 'WebGL 2.0' : 'WebGL 1.0',
        maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
        vendor: gl.getParameter(gl.VENDOR),
        renderer: gl.getParameter(gl.RENDERER),
        error: null
      })

      // Log debug info to console
      console.log('WebGL Debug Info:', {
        version: gl instanceof WebGL2RenderingContext ? 'WebGL 2.0' : 'WebGL 1.0',
        maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
        vendor: gl.getParameter(gl.VENDOR),
        renderer: gl.getParameter(gl.RENDERER),
        extensions: gl.getSupportedExtensions()
      })

    } catch (error) {
      console.error('Error checking WebGL support:', error)
      setDebugInfo(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error checking WebGL support'
      }))
    }
  }, [])

  if (debugInfo.error) {
    return (
      <div className="fixed top-0 left-0 bg-red-500 text-white p-4 z-50">
        WebGL Error: {debugInfo.error}
      </div>
    )
  }

  if (!debugInfo.hasWebGL) {
    return (
      <div className="fixed top-0 left-0 bg-yellow-500 text-black p-4 z-50">
        Checking WebGL support...
      </div>
    )
  }

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed top-0 left-0 bg-black/50 text-white p-4 z-50 font-mono text-sm">
      <div>WebGL Version: {debugInfo.webGLVersion}</div>
      <div>Vendor: {debugInfo.vendor}</div>
      <div>Renderer: {debugInfo.renderer}</div>
      <div>Max Texture Size: {debugInfo.maxTextureSize}</div>
    </div>
  )
} 