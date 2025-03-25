'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing'
import * as THREE from 'three'
import { BlackHole } from './BlackHole'
import { AmbientAudio } from './AmbientAudio'
import { Suspense, useState, useEffect } from 'react'
import { Debug } from './Debug'

function ErrorBoundaryFallback() {
  return (
    <div className="text-white p-4">
      Error loading 3D content. Please check console for details.
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="text-white p-4 absolute inset-0 flex items-center justify-center bg-black">
      Loading 3D scene...
    </div>
  )
}

export function Scene() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <LoadingFallback />
  }

  return (
    <div className="fixed inset-0 w-full h-full bg-black">
      <Debug />
      <AmbientAudio />
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: false,
          stencil: false,
          depth: true,
          powerPreference: "high-performance",
        }}
        style={{ 
          position: 'absolute', 
          width: '100%', 
          height: '100%',
          background: 'black',
          touchAction: 'none'
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          {/* Camera setup */}
          <PerspectiveCamera
            makeDefault
            position={[0, 5, 15]}
            fov={60}
            near={0.1}
            far={1000}
          />

          {/* Scene background */}
          <color attach="background" args={[0, 0, 0]} />
          
          {/* Base lighting */}
          <ambientLight intensity={0.1} />
          <pointLight position={[10, 10, 10]} intensity={0.5} />
          
          {/* Enhanced star field */}
          <Stars
            radius={100}
            depth={50}
            count={5000}
            factor={4}
            saturation={0}
            fade
            speed={0.5}
          />
          
          {/* Black hole */}
          <BlackHole position={[0, 0, 0]} size={5} />
          
          {/* Post-processing effects */}
          <EffectComposer>
            <Bloom
              intensity={1.5}
              luminanceThreshold={0.1}
              luminanceSmoothing={0.9}
              height={300}
            />
            <ChromaticAberration
              offset={[0.0005, 0.0005]}
            />
          </EffectComposer>
          
          {/* Camera controls */}
          <OrbitControls
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            zoomSpeed={0.5}
            panSpeed={0.5}
            rotateSpeed={0.5}
            minDistance={10}
            maxDistance={50}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI * 3/4}
          />
        </Suspense>
      </Canvas>
    </div>
  )
} 