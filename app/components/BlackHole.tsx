'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, Ring } from '@react-three/drei'
import * as THREE from 'three'

interface BlackHoleProps {
  position: [number, number, number]
  size: number
}

export function BlackHole({ position, size }: BlackHoleProps) {
  // Refs for animation
  const accretionDiskRef = useRef<THREE.Mesh>(null)
  const innerGlowRef = useRef<THREE.Mesh>(null)
  const outerGlowRef = useRef<THREE.Mesh>(null)

  // Create materials
  const blackHoleMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: 'black',
    transparent: true,
    opacity: 1,
  }), [])

  const accretionDiskMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color('#ffa500'),
    emissive: new THREE.Color('#ff4400'),
    emissiveIntensity: 2,
    metalness: 0.9,
    roughness: 0.3,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9,
  }), [])

  const glowMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color('#ff8800'),
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  }), [])

  // Animation
  useFrame((state, delta) => {
    if (accretionDiskRef.current) {
      accretionDiskRef.current.rotation.z += 0.001
    }
    if (innerGlowRef.current) {
      innerGlowRef.current.rotation.z -= 0.0005
    }
    if (outerGlowRef.current) {
      outerGlowRef.current.rotation.z += 0.0003
    }
  })

  return (
    <group position={position}>
      {/* Event horizon (black sphere) */}
      <Sphere args={[size * 0.5, 64, 64]}>
        <primitive object={blackHoleMaterial} attach="material" />
      </Sphere>

      {/* Accretion disk */}
      <Ring
        ref={accretionDiskRef}
        args={[size * 1.0, size * 2.5, 180]}
        rotation={[Math.PI / 4, 0, 0]}
      >
        <primitive object={accretionDiskMaterial} attach="material" />
      </Ring>

      {/* Inner glow */}
      <Ring
        ref={innerGlowRef}
        args={[size * 0.6, size * 1.2, 180]}
        rotation={[Math.PI / 6, 0, 0]}
      >
        <primitive object={glowMaterial} attach="material" />
      </Ring>

      {/* Outer glow */}
      <Ring
        ref={outerGlowRef}
        args={[size * 2.0, size * 3.0, 180]}
        rotation={[-Math.PI / 6, 0, 0]}
      >
        <primitive object={glowMaterial} attach="material" />
      </Ring>

      {/* Local lighting */}
      <pointLight position={[0, 2, 0]} intensity={1} color="#ff8800" />
      <pointLight position={[0, -2, 0]} intensity={1} color="#ff4400" />
    </group>
  )
} 