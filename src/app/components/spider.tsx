import React, { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface SpiderProps {
  position: THREE.Vector3
  targetPosition: THREE.Vector3
  onReachTarget: () => void
}

export function Spider({ position, targetPosition, onReachTarget }: SpiderProps) {
  const group = useRef<THREE.Group>(null)
  const currentPosition = useRef(position.clone())
  const speed = 0.05
  const legAnimationSpeed = 0.1

  useEffect(() => {
    currentPosition.current.copy(position)
  }, [position])

  useFrame((state) => {
    if (group.current) {
      const direction = targetPosition.clone().sub(currentPosition.current)
      const distance = direction.length()
      
      if (distance > 0.001) {
        direction.normalize().multiplyScalar(Math.min(speed, distance))
        currentPosition.current.add(direction)
        group.current.position.copy(currentPosition.current)

        // Rotate spider to face movement direction
        group.current.rotation.z = Math.atan2(direction.y, direction.x)

        // Animate legs
        group.current.children.forEach((leg, index) => {
          if (leg instanceof THREE.Mesh) {
            leg.rotation.y = Math.sin(state.clock.elapsedTime * legAnimationSpeed + index * Math.PI / 4) * 0.2
          }
        })
      } else {
        currentPosition.current.copy(targetPosition)
        group.current.position.copy(targetPosition)
        onReachTarget()
      }
    }
  })

  return (
    <group ref={group}>
      {/* Spider body */}
      <mesh>
        <sphereGeometry args={[0.05, 32, 32]} />
        <meshBasicMaterial color="white" />
      </mesh>
      
      {/* Spider legs */}
      {[...Array(8)].map((_, index) => (
        <mesh key={index} position={[Math.cos(index * Math.PI / 4) * 0.05, Math.sin(index * Math.PI / 4) * 0.05, 0]}>
          <boxGeometry args={[0.01, 0.08, 0.01]} />
          <meshBasicMaterial color="white" />
        </mesh>
      ))}
    </group>
  )
}