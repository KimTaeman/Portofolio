import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import useDayNight from '../../hooks/useDayNight'

const DAY = Object.freeze({
  sky: new THREE.Color('#FFF0E5'),
  directional: new THREE.Color('#FFF5E6'),
  directionalIntensity: 1.2,
  ambient: new THREE.Color('#FFEDD9'),
  ambientIntensity: 0.8,
  hemisphereSky: new THREE.Color('#FFFFFF'),
  hemisphereGround: new THREE.Color('#8A817A'),
  hemisphereIntensity: 0.6,
  celestial: new THREE.Color('#FFE8A1'),
  celestialGlow: new THREE.Color('#FFD700'),
  halo: new THREE.Color('#FFE8A1'),
})

const NIGHT = Object.freeze({
  sky: new THREE.Color('#0B0D17'),
  directional: new THREE.Color('#8CA8FF'),
  directionalIntensity: 0.65,
  ambient: new THREE.Color('#1A1025'),
  ambientIntensity: 0.7,
  hemisphereSky: new THREE.Color('#8CA8FF'),
  hemisphereGround: new THREE.Color('#1A1025'),
  hemisphereIntensity: 0.45,
  celestial: new THREE.Color('#E5EDFF'),
  celestialGlow: new THREE.Color('#B8CBFF'),
  halo: new THREE.Color('#B8CBFF'),
})

const lightOffset = new THREE.Vector3(10, 14, 8)
const CELESTIAL_POSITION = Object.freeze([80, 90, -1000])

const createHaloTexture = () => {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size

  const context = canvas.getContext('2d')
  const center = size / 2
  const gradient = context.createRadialGradient(
    center,
    center,
    size * 0.08,
    center,
    center,
    center,
  )

  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.7)')
  gradient.addColorStop(0.28, 'rgba(255, 244, 188, 0.38)')
  gradient.addColorStop(0.62, 'rgba(255, 220, 112, 0.12)')
  gradient.addColorStop(1, 'rgba(255, 215, 0, 0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, size, size)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export default function GlobalSceneEnvironment() {
  const { isNightMode } = useDayNight()
  const { camera } = useThree()
  const backgroundRef = useRef()
  const fogRef = useRef()
  const ambientRef = useRef()
  const hemisphereRef = useRef()
  const directionalRef = useRef()
  const directionalTargetRef = useRef()
  const celestialMaterialRef = useRef()
  const haloMaterialRef = useRef()
  const haloTexture = useMemo(() => createHaloTexture(), [])

  useEffect(() => {
    if (directionalRef.current && directionalTargetRef.current) {
      directionalRef.current.target = directionalTargetRef.current
    }
  }, [])

  useEffect(() => () => haloTexture.dispose(), [haloTexture])

  useFrame((_, delta) => {
    const target = isNightMode ? NIGHT : DAY
    const colorAlpha = 1 - Math.exp(-delta / 0.65)

    backgroundRef.current?.lerp(target.sky, colorAlpha)
    fogRef.current?.color.lerp(target.sky, colorAlpha)

    if (ambientRef.current) {
      ambientRef.current.color.lerp(target.ambient, colorAlpha)
      ambientRef.current.intensity = THREE.MathUtils.damp(
        ambientRef.current.intensity,
        target.ambientIntensity,
        2.4,
        delta,
      )
    }

    if (hemisphereRef.current) {
      hemisphereRef.current.color.lerp(target.hemisphereSky, colorAlpha)
      hemisphereRef.current.groundColor.lerp(
        target.hemisphereGround,
        colorAlpha,
      )
      hemisphereRef.current.intensity = THREE.MathUtils.damp(
        hemisphereRef.current.intensity,
        target.hemisphereIntensity,
        2.4,
        delta,
      )
    }

    if (directionalRef.current) {
      directionalRef.current.color.lerp(target.directional, colorAlpha)
      directionalRef.current.intensity = THREE.MathUtils.damp(
        directionalRef.current.intensity,
        target.directionalIntensity,
        2.4,
        delta,
      )
      directionalRef.current.position.copy(camera.position).add(lightOffset)
    }

    if (directionalTargetRef.current) {
      directionalTargetRef.current.position.copy(camera.position)
      directionalTargetRef.current.position.y -= 2
      directionalTargetRef.current.updateMatrixWorld()
    }

    if (celestialMaterialRef.current) {
      celestialMaterialRef.current.color.lerp(target.celestial, colorAlpha)
      celestialMaterialRef.current.emissive.lerp(
        target.celestialGlow,
        colorAlpha,
      )
    }

    haloMaterialRef.current?.color.lerp(target.halo, colorAlpha)
  })

  return (
    <>
      <color ref={backgroundRef} attach="background" args={['#FFF0E5']} />
      <fog ref={fogRef} attach="fog" args={['#FFF0E5', 50, 400]} />
      <ambientLight ref={ambientRef} color="#FFEDD9" intensity={0.8} />
      <hemisphereLight
        ref={hemisphereRef}
        color="#FFFFFF"
        groundColor="#8A817A"
        intensity={0.6}
      />
      <object3D ref={directionalTargetRef} />
      <directionalLight
        ref={directionalRef}
        color="#FFF5E6"
        intensity={1.2}
        position={[10, 14, 8]}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={100}
        shadow-camera-left={-32}
        shadow-camera-right={32}
        shadow-camera-top={32}
        shadow-camera-bottom={-32}
        shadow-bias={-0.0005}
        shadow-normalBias={0.03}
        shadow-radius={4}
      />
      <group name="globalSunMoon" position={CELESTIAL_POSITION}>
        <sprite position={[0, 0, -8]} scale={[160, 160, 1]} renderOrder={-11}>
          <spriteMaterial
            ref={haloMaterialRef}
            map={haloTexture}
            color="#FFE8A1"
            transparent
            opacity={0.42}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            fog={false}
            toneMapped={false}
          />
        </sprite>
        <mesh name="visualSun" scale={[50, 50, 50]} renderOrder={-10}>
          <sphereGeometry args={[1, 32, 24]} />
          <meshStandardMaterial
            ref={celestialMaterialRef}
            color="#FFE8A1"
            emissive="#FFD700"
            emissiveIntensity={0.8}
            roughness={1}
            metalness={0}
            fog={false}
            toneMapped={false}
          />
        </mesh>
      </group>
    </>
  )
}
