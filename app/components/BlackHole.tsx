'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface BlackHoleProps {
  size?: number
}

export function BlackHole({ size = 3 }: BlackHoleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // Setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    })

    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000)

    // Create black hole sphere
    const blackHoleGeometry = new THREE.SphereGeometry(size * 0.5, 32, 32)
    const blackHoleMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 })
    const blackHole = new THREE.Mesh(blackHoleGeometry, blackHoleMaterial)
    scene.add(blackHole)

    // Create accretion disk
    const diskGeometry = new THREE.RingGeometry(size * 1.0, size * 2.0, 64)
    const diskMaterial = new THREE.MeshStandardMaterial({
      color: 0xffa500,
      emissive: 0xff4400,
      emissiveIntensity: 2,
      side: THREE.DoubleSide,
    })
    const disk = new THREE.Mesh(diskGeometry, diskMaterial)
    disk.rotation.x = Math.PI / 4
    scene.add(disk)

    // Add lighting
    const light = new THREE.PointLight(0xff8800, 1)
    light.position.set(0, 2, 0)
    scene.add(light)
    scene.add(new THREE.AmbientLight(0xffffff, 0.1))

    // Position camera
    camera.position.z = 15

    // Animation
    function animate() {
      requestAnimationFrame(animate)
      disk.rotation.z += 0.001
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
    <canvas 
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }}
    />
  )
} 