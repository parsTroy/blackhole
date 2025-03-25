'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing'
import * as THREE from 'three'
import { BlackHole } from './BlackHole'
import { AmbientAudio } from './AmbientAudio'
import { Suspense } from 'react'

export function Scene() {
  return (
    <div className="h-screen w-screen">
      <AmbientAudio />
      <Canvas
        camera={{
          position: [15, 8, 15],
          fov: 60,
          near: 0.1,
          far: 1000,
        }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.8,
          powerPreference: "high-performance",
        }}
      >
        <Suspense fallback={null}>
          {/* Minimal ambient light */}
          <ambientLight intensity={0.02} />
          
          {/* Distant star light */}
          <pointLight position={[50, 30, 50]} intensity={0.3} />
          <pointLight position={[-50, -30, -50]} intensity={0.2} />
          
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
          <BlackHole />
          
          {/* Enhanced post-processing */}
          <EffectComposer>
            <Bloom
              intensity={2.0}
              luminanceThreshold={0.2}
              luminanceSmoothing={0.9}
              height={300}
            />
            <ChromaticAberration
              offset={new THREE.Vector2(0.0005, 0.0005)}
              radialModulation={false}
              modulationOffset={1.0}
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
            minDistance={12}
            maxDistance={100}
            minPolarAngle={Math.PI / 4} // Limit vertical rotation
            maxPolarAngle={Math.PI * 3/4}
          />
        </Suspense>
      </Canvas>
    </div>
  )
} 