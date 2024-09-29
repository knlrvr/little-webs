import React, { useMemo } from 'react'
import * as THREE from 'three'
import { Line } from '@react-three/drei'

interface WebProps {
  points: THREE.Vector3[]
  currentPosition: THREE.Vector3
  targetPosition: THREE.Vector3
  isMoving: boolean
}

export function Web({ points, currentPosition, isMoving }: WebProps) {
  const linePoints = useMemo(() => {
    return points.map(point => [point.x, point.y, point.z] as [number, number, number])
  }, [points])

  const movingLinePoints = useMemo(() => {
    if (isMoving && points.length > 0) {
      const lastPoint = points[points.length - 1]
      return [
        [lastPoint.x, lastPoint.y, lastPoint.z] as [number, number, number],
        [currentPosition.x, currentPosition.y, currentPosition.z] as [number, number, number]
      ]
    }
    return []
  }, [points, currentPosition, isMoving])

  return (
    <>
      <Line
        points={linePoints}
        color="white"
        lineWidth={2}
      />
      {isMoving && movingLinePoints.length > 0 && (
        <Line
          points={movingLinePoints}
          color="white"
          lineWidth={2}
        />
      )}
    </>
  )
}