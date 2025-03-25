'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Sphere } from '@react-three/drei'

interface BlackHoleProps {
  position?: [number, number, number]
  size?: number
}

export function BlackHole({ position = [0, 0, 0], size = 5 }: BlackHoleProps) {
  const blackHoleRef = useRef<THREE.Mesh>(null)
  const mainDiskRef = useRef<THREE.Mesh>(null)
  const topArcRef = useRef<THREE.Mesh>(null)
  const bottomArcRef = useRef<THREE.Mesh>(null)
  const einsteinRingRef = useRef<THREE.Mesh>(null)

  // Create extremely bright emissive materials for the accretion disk
  const diskMaterial = new THREE.MeshStandardMaterial({
    color: "#ffff00", // Bright yellow
    emissive: "#ff7700", // More orange glow
    emissiveIntensity: 12, // Increased intensity
    metalness: 1.0,
    roughness: 0.0,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 1.0,
    blending: THREE.AdditiveBlending,
  })

  // Create material for the gravitational lensing effect (Einstein ring)
  const einsteinRingMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      radius: { value: size * 2.05 },
      thickness: { value: size * 0.08 },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vPosition;
      
      void main() {
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float radius;
      uniform float thickness;
      varying vec2 vUv;
      varying vec3 vPosition;
      
      void main() {
        // Calculate distance from center
        float dist = length(vPosition.xy);
        
        // Calculate angle for position-based effects
        float angle = atan(vPosition.y, vPosition.x);
        
        // Create ring effect with smooth edges
        float ring = smoothstep(radius - thickness, radius, dist) * 
                    (1.0 - smoothstep(radius, radius + thickness, dist));
        
        // Doppler and gravitational effects
        float blueshift = pow(sin(angle * 0.5 + time * 0.2), 2.0);
        float redshift = pow(cos(angle * 0.5 + time * 0.2), 2.0);
        
        // Create base colors with proper shifting
        vec3 blueshiftColor = vec3(0.7, 0.85, 1.0);
        vec3 redshiftColor = vec3(1.0, 0.6, 0.2);
        vec3 baseColor = mix(redshiftColor, blueshiftColor, blueshift);
        
        // Add brightness variation
        float brightness = 1.5 + 0.5 * sin(angle * 2.0 + time);
        baseColor *= brightness;
        
        // Calculate opacity with position-based fade
        float opacity = ring * (0.8 + 0.2 * sin(angle * 6.0 + time * 2.0));
        
        gl_FragColor = vec4(baseColor, opacity);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  })

  // Create material for the gravitational lensing arcs
  const arcMaterial = new THREE.MeshStandardMaterial({
    color: "#ffcc00", // More intense yellow
    emissive: "#ff5500", // More intense orange-red
    emissiveIntensity: 8, // Increased intensity
    metalness: 1.0,
    roughness: 0.0,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
  })

  // Create outer glow material
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: "#ff6600",
    transparent: true,
    opacity: 0.2,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
  })

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    if (mainDiskRef.current && topArcRef.current && bottomArcRef.current && einsteinRingRef.current) {
      // Very slow rotation for realism
      mainDiskRef.current.rotation.z += 0.0003
      topArcRef.current.rotation.z += 0.0003
      bottomArcRef.current.rotation.z += 0.0003
      
      // Update Einstein ring shader time
      einsteinRingMaterial.uniforms.time.value = time
    }
  })

  return (
    <group position={position}>
      {/* Black hole center */}
      <Sphere ref={blackHoleRef} args={[size * 1.05, 64, 64]}>
        <meshBasicMaterial color="black" transparent opacity={1.0} />
      </Sphere>

      {/* Einstein ring (complete gravitational lensing effect) */}
      <mesh ref={einsteinRingRef}>
        <ringGeometry args={[size * 2.0, size * 2.2, 360]} />
        <primitive object={einsteinRingMaterial} />
      </mesh>

      {/* Main accretion disk - horizontal orientation */}
      <mesh ref={mainDiskRef}>
        <ringGeometry args={[size * 2.0, size * 2.15, 360]} />
        <primitive object={diskMaterial} />
      </mesh>

      {/* Top gravitational lensing arc */}
      <mesh
        ref={topArcRef}
        rotation={[Math.PI * 0.05, 0, 0]}
      >
        <torusGeometry args={[size * 2.05, size * 0.08, 32, 200, Math.PI * 1.2]} />
        <primitive object={arcMaterial} />
      </mesh>

      {/* Bottom gravitational lensing arc */}
      <mesh
        ref={bottomArcRef}
        rotation={[Math.PI * 0.95, 0, 0]}
      >
        <torusGeometry args={[size * 2.05, size * 0.08, 32, 200, Math.PI * 1.2]} />
        <primitive object={arcMaterial} />
      </mesh>

      {/* Inner glow */}
      <Sphere args={[size * 1.1, 32, 32]}>
        <primitive object={glowMaterial} />
      </Sphere>

      {/* Outer glow */}
      <Sphere args={[size * 1.3, 32, 32]}>
        <meshBasicMaterial
          color="#ff4400"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>

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