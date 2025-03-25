'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

interface BlackHoleProps {
  size?: number
}

export function BlackHole({ size = 3 }: BlackHoleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  // Function to initialize and play audio
  const initializeAudio = async () => {
    try {
      if (audioContextRef.current?.state === 'running') return

      // Create or resume AudioContext
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      await audioContextRef.current.resume()

      // Create gain node if it doesn't exist
      if (!gainNodeRef.current) {
        const gainNode = audioContextRef.current.createGain()
        gainNode.gain.value = 0.5
        gainNode.connect(audioContextRef.current.destination)
        gainNodeRef.current = gainNode
      }

      // Create and start oscillator for the deep rumble
      const oscillator = audioContextRef.current.createOscillator()
      oscillator.type = 'sine'
      oscillator.frequency.value = 20
      
      const oscillatorGain = audioContextRef.current.createGain()
      oscillatorGain.gain.value = 0.2
      
      oscillator.connect(oscillatorGain)
      oscillatorGain.connect(gainNodeRef.current)
      oscillator.start()

      setIsPlaying(true)
      setAudioError(null)

      // Store cleanup function
      cleanupRef.current = () => {
        oscillator.stop()
        oscillator.disconnect()
        oscillatorGain.disconnect()
      }
    } catch (error) {
      console.error('Audio initialization error:', error)
      setAudioError('Failed to initialize audio')
    }
  }

  // Cleanup function
  const cleanup = () => {
    if (cleanupRef.current) {
      cleanupRef.current()
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    setIsPlaying(false)
  }

  useEffect(() => {
    return () => cleanup()
  }, [])

  useEffect(() => {
    if (!canvasRef.current) return

    // Setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    })

    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.8

    // Create stars
    const starGeometry = new THREE.BufferGeometry()
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.05,
    })

    const starVertices = []
    for (let i = 0; i < 10000; i++) {
      const x = (Math.random() - 0.5) * 2000
      const y = (Math.random() - 0.5) * 2000
      const z = (Math.random() - 0.5) * 2000
      starVertices.push(x, y, z)
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3))
    const stars = new THREE.Points(starGeometry, starMaterial)
    scene.add(stars)

    // Create black hole sphere (event horizon)
    const blackHoleGeometry = new THREE.SphereGeometry(size * 0.5, 64, 64)
    const blackHoleMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x000000,
      transparent: true,
      opacity: 0.95,
    })
    const blackHole = new THREE.Mesh(blackHoleGeometry, blackHoleMaterial)
    scene.add(blackHole)

    // Create accretion disk with gradient
    const diskGeometry = new THREE.RingGeometry(size * 0.6, size * 1.8, 180)
    const diskMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        innerColor: { value: new THREE.Color(0x4444ff) },  // Blue-shifted
        outerColor: { value: new THREE.Color(0xff4400) },  // Red-shifted
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 innerColor;
        uniform vec3 outerColor;
        varying vec2 vUv;
        void main() {
          float intensity = 1.0 - vUv.y;
          vec3 color = mix(innerColor, outerColor, vUv.x);
          float glow = 0.5 + 0.5 * sin(time * 2.0 + vUv.x * 10.0);
          gl_FragColor = vec4(color * intensity * glow, 1.0);
        }
      `,
      side: THREE.DoubleSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
    })
    
    const disk = new THREE.Mesh(diskGeometry, diskMaterial)
    disk.rotation.x = Math.PI / 3  // More realistic angle
    scene.add(disk)

    // Add glow effect
    const glowGeometry = new THREE.RingGeometry(size * 0.55, size * 2.0, 180)
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xff6600,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    })
    const glow = new THREE.Mesh(glowGeometry, glowMaterial)
    glow.rotation.x = disk.rotation.x
    scene.add(glow)

    // Add lighting
    const light1 = new THREE.PointLight(0xff8800, 2)
    light1.position.set(0, 2, 0)
    scene.add(light1)
    
    const light2 = new THREE.PointLight(0x4444ff, 1)
    light2.position.set(0, -2, 0)
    scene.add(light2)

    scene.add(new THREE.AmbientLight(0xffffff, 0.1))

    // Position camera
    camera.position.set(0, 8, 20)
    camera.lookAt(0, 0, 0)

    // Animation
    let time = 0
    function animate() {
      requestAnimationFrame(animate)
      time += 0.01

      // Rotate disk
      disk.rotation.z += 0.001
      glow.rotation.z -= 0.0005

      // Update shader time
      diskMaterial.uniforms.time.value = time

      // Add subtle camera movement
      camera.position.x = Math.sin(time * 0.1) * 2
      camera.position.y = 8 + Math.sin(time * 0.15) * 0.5
      camera.lookAt(0, 0, 0)

      renderer.render(scene, camera)
    }

    // Handle resize
    function handleResize() {
      const width = window.innerWidth
      const height = window.innerHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    window.addEventListener('resize', handleResize)
    animate()

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
    }
  }, [size])

  return (
    <>
      <canvas 
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'black',
        }}
      />
      <div 
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'rgba(0, 0, 0, 0.5)',
          padding: '10px',
          borderRadius: '5px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: 'white',
        }}
      >
        <button
          onClick={isPlaying ? cleanup : initializeAudio}
          style={{
            background: isPlaying ? '#ff4400' : '#4444ff',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          {isPlaying ? 'Stop Sound' : 'Start Sound'}
        </button>
        {isPlaying && (
          <>
            <label htmlFor="volume">Volume:</label>
            <input
              id="volume"
              type="range"
              min="0"
              max="1"
              step="0.1"
              defaultValue="0.5"
              onChange={(e) => {
                if (gainNodeRef.current) {
                  gainNodeRef.current.gain.value = parseFloat(e.target.value)
                }
              }}
              style={{
                width: '100px',
              }}
            />
          </>
        )}
        {audioError && (
          <span style={{ color: '#ff4444' }}>{audioError}</span>
        )}
      </div>
    </>
  )
} 