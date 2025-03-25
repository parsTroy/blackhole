'use client'

import { useEffect, useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshDistortMaterial, Ring, Sphere, useTexture } from '@react-three/drei'
import * as THREE from 'three'

interface BlackHoleProps {
  position: [number, number, number]
  size: number
}

export function BlackHole({ position, size }: BlackHoleProps) {
  console.log('BlackHole component rendering', { position, size })

  const blackHoleRef = useRef<THREE.Mesh>(null)
  const mainDiskRef = useRef<THREE.Mesh>(null)
  const topArcRef = useRef<THREE.Mesh>(null)
  const bottomArcRef = useRef<THREE.Mesh>(null)
  const einsteinRingRef = useRef<THREE.Mesh>(null)
  const outerGlowRef = useRef<THREE.Mesh>(null)

  // Create materials using Three.js built-in materials
  const diskMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color('#ffaa00'),
    emissive: new THREE.Color('#ff5500'),
    emissiveIntensity: 5,
    metalness: 0.8,
    roughness: 0.2,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  }), [])

  const einsteinRingMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color('#4488ff'),
    emissive: new THREE.Color('#0044ff'),
    emissiveIntensity: 3,
    metalness: 1,
    roughness: 0,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.7,
  }), [])

  const arcMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color('#ffaa00'),
    emissive: new THREE.Color('#ff5500'),
    emissiveIntensity: 4,
    metalness: 0.8,
    roughness: 0.2,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
  }), [])

  const glowMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color('#ff5500'),
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }), [])

  useFrame((state, delta) => {
    try {
      // Update rotations
      const rotationSpeed = 0.0003
      mainDiskRef.current?.rotation.set(0, 0, mainDiskRef.current.rotation.z + rotationSpeed)
      topArcRef.current?.rotation.set(0, 0, topArcRef.current.rotation.z + rotationSpeed)
      bottomArcRef.current?.rotation.set(0, 0, bottomArcRef.current.rotation.z + rotationSpeed)
      einsteinRingRef.current?.rotation.set(0, 0, einsteinRingRef.current.rotation.z + 0.0002)
    } catch (error) {
      console.error('Error in animation frame:', error)
    }
  })

  return (
    <group position={position}>
      {/* Event horizon (black sphere) */}
      <Sphere ref={blackHoleRef} args={[size * 0.5, 64, 64]}>
        <meshBasicMaterial color="black" transparent opacity={1} />
      </Sphere>

      {/* Einstein ring */}
      <Ring ref={einsteinRingRef} args={[size * 2.0, size * 2.2, 360]}>
        <MeshDistortMaterial
          color="#4488ff"
          emissive="#0044ff"
          emissiveIntensity={5}
          metalness={1}
          roughness={0}
          distort={0.3}
          speed={2}
          transparent
          opacity={0.7}
          depthWrite={false}
        />
      </Ring>

      {/* Main accretion disk */}
      <Ring ref={mainDiskRef} args={[size * 1.1, size * 2.15, 360]} rotation={[Math.PI / 6, 0, 0]}>
        <primitive object={diskMaterial} attach="material" />
      </Ring>

      {/* Top gravitational lensing arc */}
      <Ring
        ref={topArcRef}
        args={[size * 0.6, size * 0.72, 200]}
        rotation={[Math.PI / 4, 0, 0]}
      >
        <primitive object={arcMaterial} attach="material" />
      </Ring>

      {/* Bottom gravitational lensing arc */}
      <Ring
        ref={bottomArcRef}
        args={[size * 0.6, size * 0.72, 200]}
        rotation={[-Math.PI / 4, 0, 0]}
      >
        <primitive object={arcMaterial} attach="material" />
      </Ring>

      {/* Outer glow */}
      <Ring ref={outerGlowRef} args={[size * 2.2, size * 3.5, 180]}>
        <primitive object={glowMaterial} attach="material" />
      </Ring>

      {/* Local lighting for the black hole */}
      <pointLight position={[0, 2, 0]} intensity={2} color="#ffaa00" />
      <pointLight position={[0, -2, 0]} intensity={2} color="#ff4400" />
      <pointLight position={[2, 0, 0]} intensity={2} color="#ff8800" />
      <pointLight position={[-2, 0, 0]} intensity={2} color="#ff8800" />
    </group>
  )
} 