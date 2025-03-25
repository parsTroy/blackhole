'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, Ring } from '@react-three/drei'
import * as THREE from 'three'

interface BlackHoleProps {
  position: [number, number, number]
  size: number
}

export function BlackHole({ position, size }: BlackHoleProps) {
  const diskRef = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (diskRef.current) {
      diskRef.current.rotation.z += 0.001
    }
  })

  return (
    <group position={position}>
      {/* Event horizon (black sphere) */}
      <Sphere args={[size * 0.5, 32, 32]}>
        <meshBasicMaterial color="black" />
      </Sphere>

      {/* Accretion disk */}
      <Ring
        ref={diskRef}
        args={[size * 1.0, size * 2.0, 64]}
        rotation={[Math.PI / 4, 0, 0]}
      >
        <meshStandardMaterial
          color="#ffa500"
          emissive="#ff4400"
          emissiveIntensity={2}
          toneMapped={false}
        />
      </Ring>

      {/* Light source */}
      <pointLight position={[0, 2, 0]} intensity={1} color="#ff8800" />
    </group>
  )
} 