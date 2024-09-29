import React, { useMemo } from 'react'
import * as THREE from 'three'
import { Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

interface WebProps {
  points: THREE.Vector3[]
  currentPosition: THREE.Vector3
  targetPosition: THREE.Vector3
}

export function Web({ points, currentPosition, targetPosition }: WebProps) {
  const linePoints = useMemo(() => {
    return [...points, currentPosition].map(point => [point.x, point.y, point.z] as [number, number, number])
  }, [points, currentPosition])

  useFrame(() => {
    // Update the last point of linePoints to match currentPosition
    if (linePoints.length > 0) {
      const lastIndex = linePoints.length - 1
      linePoints[lastIndex] = [currentPosition.x, currentPosition.y, currentPosition.z]
    }
  })

  return (
    <Line
      points={linePoints}
      color="white"
      lineWidth={2}
    />
  )
}