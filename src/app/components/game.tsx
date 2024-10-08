"use client"

import React, { useState, useCallback, useMemo, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { Spider } from './spider'
import { Web } from './web'

const HOME_POSITION = new THREE.Vector3(0, 0, 0)
const CENTER_THRESHOLD = 0.025;

function GameContent({ shouldRefresh, setShouldRefresh }: { shouldRefresh: boolean; setShouldRefresh: (value: boolean) => void }) {
  const [spiderPosition, setSpiderPosition] = useState(HOME_POSITION.clone())
  const [targetPosition, setTargetPosition] = useState(HOME_POSITION.clone())
  const [webPoints, setWebPoints] = useState<THREE.Vector3[]>([HOME_POSITION.clone()])
  const [isMoving, setIsMoving] = useState(false)
  const lastMoveWasFromCenter = useRef(false)
  const previousPosition = useRef(HOME_POSITION.clone())

  const { viewport } = useThree()

  const isNearCenter = useCallback((position: THREE.Vector3) => {
    const centerThreshold = viewport.width * CENTER_THRESHOLD
    return position.distanceTo(HOME_POSITION) < centerThreshold
  }, [viewport])

  const isOnEdge = useCallback((position: THREE.Vector3) => {
    return Math.abs(position.x / (viewport.width / 2)) > 0.95 || Math.abs(position.y / (viewport.height / 2)) > 0.95
  }, [viewport])

  const handlePointerDown = useCallback((event: THREE.Event) => {
    if (isMoving) return

    const { point } = event as unknown as { point: THREE.Vector3 }
    const newPosition = new THREE.Vector3(point.x, point.y, 0)

    const clickIsOnEdge = isOnEdge(newPosition)
    const clickIsCenter = isNearCenter(newPosition)

    // Check if the click is on or near an existing web line
    const isOnWeb = webPoints.some((start, index) => {
      if (index === webPoints.length - 1) return false
      const end = webPoints[index + 1]
      const line = new THREE.Line3(start, end)
      const closestPoint = new THREE.Vector3()
      line.closestPointToPoint(newPosition, true, closestPoint)
      return closestPoint.distanceTo(newPosition) < 0.05
    })

    if (clickIsOnEdge || isOnWeb || clickIsCenter) {
      setTargetPosition(clickIsCenter ? HOME_POSITION : newPosition)
      setIsMoving(true)

      if (clickIsCenter) {
        if (lastMoveWasFromCenter.current && !isOnEdge(spiderPosition)) {
          // Don't create a new web when moving back to center from a line created from center
          setWebPoints(prev => {
            const newWebPoints = [...prev]
            newWebPoints.pop() // Remove the last point (which was the move away from center)
            return newWebPoints
          })
        }
        // Reset lastMoveWasFromCenter only if we're not on the edge
        lastMoveWasFromCenter.current = isOnEdge(spiderPosition) ? lastMoveWasFromCenter.current : false
      } else {
        lastMoveWasFromCenter.current = isNearCenter(spiderPosition)
      }
    }
  }, [isMoving, webPoints, viewport, spiderPosition, isNearCenter, isOnEdge])

  const handleReachTarget = useCallback(() => {
    if (!targetPosition.equals(HOME_POSITION) && !webPoints.some(point => point.equals(targetPosition))) {
      setWebPoints(prev => [...prev, previousPosition.current.clone(), targetPosition.clone()])
    }
    previousPosition.current.copy(spiderPosition)
    setSpiderPosition(targetPosition.clone())
    setIsMoving(false)
  }, [targetPosition, webPoints, spiderPosition])

  // Handle refresh
  React.useEffect(() => {
    if (shouldRefresh) {
      setSpiderPosition(HOME_POSITION.clone())
      setTargetPosition(HOME_POSITION.clone())
      setWebPoints([HOME_POSITION.clone()])
      setIsMoving(false)
      lastMoveWasFromCenter.current = false
      previousPosition.current.copy(HOME_POSITION)
      setShouldRefresh(false)
    }
  }, [shouldRefresh, setShouldRefresh])

  return (
    <>
      <mesh onPointerDown={handlePointerDown} visible={false}>
        <planeGeometry args={[viewport.width, viewport.height]} />
        <meshBasicMaterial />
      </mesh>

      <Spider 
        position={spiderPosition}
        targetPosition={targetPosition}
        onReachTarget={handleReachTarget}
      />

      <Web
        points={webPoints}
        currentPosition={spiderPosition}
        targetPosition={targetPosition}
        isMoving={isMoving}
      />
      <Background />
    </>
  )
}

function Background() {
  return (
    <mesh position={[0, 0, -1]}>
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial color="black" />
    </mesh>
  )
}

export function Game() {
  const [shouldRefresh, setShouldRefresh] = useState(false)

  const handleRefresh = useCallback(() => {
    setShouldRefresh(true)
  }, [])

  const refreshButton = useMemo(() => (
    <div className="absolute top-0 left-0 p-4 z-10">
      <button
        className="px-4 py-2 m-2 rounded-full bg-neutral-400 hover:bg-neutral-500 transition-colors duration-200"
        onClick={handleRefresh}
      >
        <svg fill="#fff" height="16px" width="16px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 489.645 489.645">
            <g>
                <path d="M460.656,132.911c-58.7-122.1-212.2-166.5-331.8-104.1c-9.4,5.2-13.5,16.6-8.3,27c5.2,9.4,16.6,13.5,27,8.3
                    c99.9-52,227.4-14.9,276.7,86.3c65.4,134.3-19,236.7-87.4,274.6c-93.1,51.7-211.2,17.4-267.6-70.7l69.3,14.5
                    c10.4,2.1,21.8-4.2,23.9-15.6c2.1-10.4-4.2-21.8-15.6-23.9l-122.8-25c-20.6-2-25,16.6-23.9,22.9l15.6,123.8
                    c1,10.4,9.4,17.7,19.8,17.7c12.8,0,20.8-12.5,19.8-23.9l-6-50.5c57.4,70.8,170.3,131.2,307.4,68.2
                    C414.856,432.511,548.256,314.811,460.656,132.911z"/>
            </g>
        </svg>
      </button>
    </div>
  ), [handleRefresh])

  return (
    <div className="w-full h-screen relative">
      {refreshButton}
      <Canvas>
        <ambientLight />
        <OrbitControls enableRotate={false} enableZoom={false} />
        <GameContent shouldRefresh={shouldRefresh} setShouldRefresh={setShouldRefresh} />
      </Canvas>
    </div>
  )
}