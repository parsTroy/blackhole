'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sphere } from '@react-three/drei'
import * as THREE from 'three'
import { Suspense } from 'react'

function LoadingFallback() {
  return (
    <div className="text-white p-4 absolute inset-0 flex items-center justify-center bg-black">
      Loading 3D scene...
    </div>
  )
}

// Simple sphere component to test 3D rendering
function TestSphere() {
  return (
    <Sphere args={[1, 32, 32]}>
      <meshStandardMaterial color="#ff0000" />
    </Sphere>
  )
}

export function Scene() {
  return (
    <div className="fixed inset-0 w-full h-full bg-black">
      <Canvas
        camera={{
          position: [0, 0, 5],
          fov: 75
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          {/* Basic lighting */}
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          
          {/* Test sphere */}
          <TestSphere />
          
          {/* Camera controls */}
          <OrbitControls />
        </Suspense>
      </Canvas>
    </div>
  )
} 