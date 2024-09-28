"use client"

import React, { useMemo } from 'react'
import * as THREE from 'three'
import { Line } from '@react-three/drei'

interface WebProps {
  points: THREE.Vector3[]
}

export function Web({ points }: WebProps) {
  const linePoints = useMemo(() => {
    return points.map(point => [point.x, point.y, point.z] as [number, number, number])
  }, [points])

  return (
    <Line
      points={linePoints}
      color="white"
      lineWidth={2}
    />
  )
}