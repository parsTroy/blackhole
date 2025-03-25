'use client'

import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Sphere } from '@react-three/drei'

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

  // Create extremely bright emissive materials for the accretion disk
  const diskMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(1, 0.7, 0),
    emissive: new THREE.Color(1, 0.5, 0),
    emissiveIntensity: 10,
    metalness: 0.8,
    roughness: 0.2,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9,
  })

  // Create material for the gravitational lensing effect (Einstein ring)
  const einsteinRingMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      radius: { value: size * 2.05 },
      thickness: { value: size * 0.08 },
      color1: { value: new THREE.Color(1.0, 0.6, 0.2) },  // redshift color
      color2: { value: new THREE.Color(0.7, 0.85, 1.0) }, // blueshift color
    },
    vertexShader: `
      varying vec3 vPosition;
      
      void main() {
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;

      uniform float time;
      uniform float radius;
      uniform float thickness;
      uniform vec3 color1;
      uniform vec3 color2;
      varying vec3 vPosition;
      
      void main() {
        // Calculate distance from center
        float dist = length(vPosition.xy);
        
        // Calculate angle for position-based effects
        float angle = atan(vPosition.y, vPosition.x);
        
        // Create ring effect with smooth edges
        float ring = smoothstep(radius - thickness, radius, dist) * 
                    (1.0 - smoothstep(radius, radius + thickness, dist));
        
        // Create time-based color shift
        float shift = sin(angle * 0.5 + time * 0.2);
        float colorMix = pow(shift * 0.5 + 0.5, 2.0);
        
        // Mix colors based on shift
        vec3 baseColor = mix(color1, color2, colorMix);
        
        // Add brightness variation
        float brightness = 1.5 + 0.5 * sin(angle * 2.0 + time);
        baseColor *= brightness;
        
        // Calculate opacity with position-based fade
        float opacity = ring * (0.8 + 0.2 * sin(angle * 6.0 + time * 2.0));
        
        // Output final color
        gl_FragColor = vec4(baseColor * opacity, opacity);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false, // Add this to fix transparency sorting issues
  })

  // Create material for the gravitational lensing arcs
  const arcMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(1, 0.7, 0),
    emissive: new THREE.Color(1, 0.5, 0),
    emissiveIntensity: 6,
    metalness: 0.8,
    roughness: 0.2,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.7,
  })

  // Create outer glow material
  const glowMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(1, 0.5, 0),
    emissive: new THREE.Color(1, 0.3, 0),
    emissiveIntensity: 4,
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  })

  // Event horizon (black sphere)
  const blackHoleMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 1,
  })

  useEffect(() => {
    console.log('BlackHole useEffect running')
    console.log('Disk ref:', mainDiskRef.current)
    console.log('Arc ref:', topArcRef.current)
    console.log('Glow ref:', bottomArcRef.current)
  }, [])

  useFrame((state, delta) => {
    try {
      const time = state.clock.getElapsedTime()
      
      // Update rotations
      const rotationSpeed = 0.0003
      mainDiskRef.current?.rotation.set(0, 0, mainDiskRef.current.rotation.z + rotationSpeed)
      topArcRef.current?.rotation.set(0, 0, topArcRef.current.rotation.z + rotationSpeed)
      bottomArcRef.current?.rotation.set(0, 0, bottomArcRef.current.rotation.z + rotationSpeed)
      einsteinRingRef.current?.rotation.set(0, 0, einsteinRingRef.current.rotation.z + 0.0002)
      
      // Update shader uniforms
      einsteinRingMaterial.uniforms.time.value = time
    } catch (error) {
      console.error('Error in animation frame:', error)
    }
  })

  return (
    <group position={position}>
      {/* Event horizon (black sphere) */}
      <mesh ref={blackHoleRef} scale={[size * 0.5, size * 0.5, size * 0.5]}>
        <sphereGeometry args={[1, 64, 64]} />
        <primitive object={blackHoleMaterial} attach="material" />
      </mesh>

      {/* Einstein ring (complete gravitational lensing effect) */}
      <mesh ref={einsteinRingRef}>
        <ringGeometry args={[size * 2.0, size * 2.2, 360]} />
        <primitive object={einsteinRingMaterial} attach="material" />
      </mesh>

      {/* Main accretion disk - horizontal orientation */}
      <mesh ref={mainDiskRef}>
        <ringGeometry args={[size * 1.1, size * 2.15, 360]} />
        <primitive object={diskMaterial} attach="material" />
      </mesh>

      {/* Top gravitational lensing arc */}
      <mesh
        ref={topArcRef}
        rotation={[0, 0, 0]}
      >
        <ringGeometry args={[size * 0.6, size * 0.72, 200]} />
        <primitive object={arcMaterial} attach="material" />
      </mesh>

      {/* Bottom gravitational lensing arc */}
      <mesh
        ref={bottomArcRef}
        rotation={[0, 0, 0]}
      >
        <ringGeometry args={[size * 0.6, size * 0.72, 200]} />
        <primitive object={arcMaterial} attach="material" />
      </mesh>

      {/* Outer glow */}
      <mesh ref={outerGlowRef}>
        <ringGeometry args={[size * 2.2, size * 3.5, 180]} />
        <primitive object={glowMaterial} attach="material" />
      </mesh>

      {/* Enhanced lighting setup */}
      <ambientLight intensity={0.15} />
      <pointLight position={[10, 10, 10]} intensity={3} color="#ffaa00" />
      <pointLight position={[-10, -10, -10]} intensity={2} color="#ff4400" />
      <pointLight position={[0, 0, 10]} intensity={3} color="#ffffff" />
      
      {/* Additional rim lighting for better disk visibility */}
      <pointLight position={[size * 2, 0, 0]} intensity={2} color="#ff8800" />
      <pointLight position={[-size * 2, 0, 0]} intensity={2} color="#ff8800" />
    </group>
  )
} 