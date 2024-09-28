import React, { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface SpiderProps {
  position: THREE.Vector3
  targetPosition: THREE.Vector3
  onReachTarget: () => void
}

export function Spider({ position, targetPosition, onReachTarget }: SpiderProps) {
  const mesh = useRef<THREE.Mesh>(null)
  const currentPosition = useRef(position.clone())
  const speed = 0.05

  useEffect(() => {
    currentPosition.current.copy(position)
  }, [position])

  useFrame(() => {
    if (mesh.current) {
      const direction = targetPosition.clone().sub(currentPosition.current)
      const distance = direction.length()
      
      if (distance > 0.001) { // Small threshold to avoid floating point issues
        direction.normalize().multiplyScalar(Math.min(speed, distance))
        currentPosition.current.add(direction)
        mesh.current.position.copy(currentPosition.current)
      } else {
        currentPosition.current.copy(targetPosition)
        mesh.current.position.copy(targetPosition)
        onReachTarget()
      }
    }
  })

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[0.05, 32, 32]} />
      <meshBasicMaterial color="white" />
    </mesh>
  )
}