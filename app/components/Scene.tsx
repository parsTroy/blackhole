'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, PerspectiveCamera, Sphere } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import { Suspense } from 'react'
import { BlackHole } from './BlackHole'

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
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.5,
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          {/* Camera */}
          <PerspectiveCamera
            makeDefault
            position={[0, 2, 15]}
            fov={60}
          />

          {/* Scene lighting */}
          <ambientLight intensity={0.1} />
          <pointLight position={[10, 10, 10]} intensity={0.5} />
          
          {/* Star field */}
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
          <BlackHole position={[0, 0, 0]} size={3} />
          
          {/* Post processing */}
          <EffectComposer>
            <Bloom
              intensity={1.5}
              luminanceThreshold={0.6}
              luminanceSmoothing={0.9}
            />
          </EffectComposer>

          {/* Controls */}
          <OrbitControls
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            minDistance={8}
            maxDistance={30}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI * 3/4}
          />
        </Suspense>
      </Canvas>
    </div>
  )
} 