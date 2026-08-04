import { memo, useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  Box,
  Capsule,
  Cone,
  Cylinder,
  Dodecahedron,
  RoundedBox,
  useScroll,
} from '@react-three/drei'
import * as THREE from 'three'
import LowPolyGrassMaterial from '../LowPolyGrassMaterial'
import useDayNight from '../../../hooks/useDayNight'
import {
  CAMPUS_PATH,
  PLAYGROUND_MOTION_OFFSETS,
  PLAYGROUND_SLIDE,
  PLAYGROUND_SLIDE_ROTATION_X,
} from '../../../config/narrativeTimeline'

const COLORS = Object.freeze({
  slide: '#FFB380',
  slideRail: '#FFC89F',
  teal: '#59BFAE',
  stone: '#E0D8C8',
  wood: '#8B5A2B',
  chain: '#4B5563',
  swingSeat: '#D98246',
  trunk: '#8B6348',
  leaves: '#77DD77',
  sun: '#FFE17B',
  moon: '#FFF6E0',
  fence: '#D6A46B',
  flowerCenter: '#F8C95C',
})
const DAY_CLOUD_COLOR = new THREE.Color('#FFFFFF')
const NIGHT_CLOUD_COLOR = new THREE.Color('#AAB7D1')
const DAY_CLOUD_GLOW = new THREE.Color('#FFFFFF')
const NIGHT_CLOUD_GLOW = new THREE.Color('#8CA8FF')

const PLATEAU_STEP_COLORS = Object.freeze([
  '#E5A9A9',
  '#F5F5F5',
  '#FFD15C',
  '#A8E6CF',
  '#B8C9F4',
])

const pseudoRandom = (index, salt) => {
  const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453
  return value - Math.floor(value)
}

const PLATEAU_TERRAIN = Object.freeze([
  { position: [0, -1.05, -1.2], scale: [7.4, 1.15, 4.2], color: null },
  { position: [-5.4, -1.18, -1.4], scale: [4.6, 1.25, 4], color: '#72A93B' },
  { position: [5.2, -1.12, -1.35], scale: [4.5, 1.2, 3.95], color: '#86BA48' },
])

const BACKGROUND_MOUNTAIN = Object.freeze({
  // Playground is elevated by 20 units, so this resolves to the requested
  // world-space backdrop position of [-50, -10, -80].
  position: [-50, -30, -80],
  radius: 24,
  height: 38,
  color: '#688F4E',
})

const ROCK_LAYOUT = Object.freeze([
  [-5.1, 0.12, -1.6, 0.42],
  [-3.8, 0.08, 1.8, 0.3],
  [-0.5, 0.1, 2.2, 0.36],
  [3.7, 0.11, 1.7, 0.4],
  [5.1, 0.08, -1.3, 0.32],
  [0.9, 0.09, -2.6, 0.28],
])

const LANDING_BURST_COUNT = 180
const LANDING_BURST_DURATION = 1.45

const STEPPING_STONES = [
  { position: [-2.05, 0.06, -2.72], scale: [1.12, 1, 0.78], rotationY: 0.12 },
  { position: [-2.32, 0.06, -2.9], scale: [0.88, 1, 1.04], rotationY: -0.18 },
  { position: [-2.63, 0.06, -2.7], scale: [1.18, 1, 0.76], rotationY: 0.28 },
  { position: [-2.95, 0.06, -2.92], scale: [0.92, 1, 1.08], rotationY: -0.32 },
  { position: [-3.27, 0.06, -2.73], scale: [1.2, 1, 0.8], rotationY: 0.2 },
  { position: [-3.58, 0.06, -2.95], scale: [0.9, 1, 1.06], rotationY: -0.12 },
  { position: [-3.9, 0.06, -2.72], scale: [1.16, 1, 0.8], rotationY: 0.35 },
  { position: [-4.2, 0.06, -2.91], scale: [0.9, 1, 1.02], rotationY: -0.25 },
  { position: [-4.5, 0.06, -2.68], scale: [1.08, 1, 0.82], rotationY: 0.16 },
  { position: [-4.78, 0.06, -2.88], scale: [0.86, 1, 1.08], rotationY: -0.38 },
  { position: [-5.02, 0.06, -2.62], scale: [1.12, 1, 0.78], rotationY: 0.24 },
]

const TREE_LAYOUT = [
  { position: [4.85, 0, 2.45], scale: 0.72 },
  { position: [2.65, 0, 2.72], scale: 0.58 },
  { position: [0.35, 0, 2.78], scale: 0.68 },
  { position: [-2.05, 0, 2.7], scale: 0.6 },
  { position: [-4.65, 0, 2.35], scale: 0.78 },
  { position: [-5.15, 0, -0.2], scale: 0.52 },
  { position: [4.8, 0, -0.65], scale: 0.48 },
]

const CLOUD_LAYOUT = [
  { position: [-38, 10, -64], scale: 1.05, speed: 0.07, phase: 1.4 },
  { position: [-58, 1, -72], scale: 1.25, speed: 0.055, phase: 4.8 },
  { position: [-28, 18, -82], scale: 0.9, speed: 0.08, phase: 8.2 },
  { position: [-18, 30, -58], scale: 1.8, speed: 0.08, phase: 0 },
  { position: [-2, 34, -86], scale: 2.2, speed: 0.055, phase: 3.5 },
  { position: [18, 28, -52], scale: 1.5, speed: 0.09, phase: 7 },
  { position: [34, 33, -94], scale: 2, speed: 0.045, phase: 10.5 },
]

const DAISY_PETALS = Array.from({ length: 5 }, (_, index) => {
  const angle = (index / 5) * Math.PI * 2
  return [Math.cos(angle) * 0.12, Math.sin(angle) * 0.12]
})

const DAISY_LAYOUT = [
  { position: [-2.36, 0, -2.5], scale: 0.72 },
  { position: [-2.88, 0, -3.08], scale: 0.58 },
  { position: [-3.38, 0, -2.5], scale: 0.68 },
  { position: [-3.92, 0, -3.07], scale: 0.6 },
  { position: [-4.42, 0, -2.46], scale: 0.66 },
  { position: [-4.9, 0, -3.03], scale: 0.54 },
]

const FENCE_POSTS = [-5, -3.75, -2.5, -1.25, 0, 1.25, 2.5, 3.75, 5]

function ClayMaterial({ color, flatShading = true }) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={1}
      metalness={0}
      flatShading={flatShading}
    />
  )
}

function PlaygroundClouds() {
  const { isNightMode } = useDayNight()
  const cloudRefs = useRef([])
  const geometry = useMemo(() => {
    const sharedGeometry = new THREE.SphereGeometry(1, 12, 8)
    sharedGeometry.computeBoundingBox()
    sharedGeometry.computeBoundingSphere()
    return sharedGeometry
  }, [])
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: DAY_CLOUD_COLOR,
        roughness: 1,
        metalness: 0,
        emissive: DAY_CLOUD_GLOW,
        emissiveIntensity: 0.1,
        flatShading: true,
      }),
    [],
  )

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material],
  )

  useFrame((state, delta) => {
    const alpha = 1 - Math.exp(-delta / 0.65)
    material.color.lerp(
      isNightMode ? NIGHT_CLOUD_COLOR : DAY_CLOUD_COLOR,
      alpha,
    )
    material.emissive.lerp(
      isNightMode ? NIGHT_CLOUD_GLOW : DAY_CLOUD_GLOW,
      alpha,
    )

    const elapsed = state.clock.elapsedTime
    CLOUD_LAYOUT.forEach(({ position, speed, phase }, index) => {
      const cloud = cloudRefs.current[index]
      if (cloud) {
        cloud.position.x =
          position[0] + Math.sin(elapsed * speed + phase) * 1.15
      }
    })
  })

  return (
    <>
      {CLOUD_LAYOUT.map(({ position, scale }, index) => (
        <Cloud
          key={position.join('-')}
          cloudRef={(cloud) => {
            cloudRefs.current[index] = cloud
          }}
          geometry={geometry}
          material={material}
          position={position}
          scale={scale}
        />
      ))}
    </>
  )
}

function Cloud({ cloudRef, geometry, material, position, scale }) {
  return (
    <group
      ref={cloudRef}
      name="puffyCloud"
      position={position}
      scale={scale}
    >
      <mesh geometry={geometry} material={material} scale={[1.15, 0.56, 0.62]} />
      <mesh
        geometry={geometry}
        material={material}
        position={[-0.86, -0.03, 0.02]}
        scale={[0.72, 0.46, 0.5]}
      />
      <mesh
        geometry={geometry}
        material={material}
        position={[0.86, -0.02, 0]}
        scale={[0.7, 0.45, 0.48]}
      />
      <mesh
        geometry={geometry}
        material={material}
        position={[-0.34, 0.38, -0.03]}
        scale={[0.62, 0.58, 0.54]}
      />
      <mesh
        geometry={geometry}
        material={material}
        position={[0.38, 0.33, 0]}
        scale={[0.68, 0.62, 0.56]}
      />
    </group>
  )
}

function Daisy({ position, scale }) {
  return (
    <group name="daisy" position={position} scale={scale}>
      <Cylinder args={[0.018, 0.024, 0.24, 10]} position={[0, 0.12, 0]}>
        <ClayMaterial color={COLORS.leaves} />
      </Cylinder>
      <Dodecahedron args={[0.075, 0]} position={[0, 0.28, 0.02]}>
        <ClayMaterial color={COLORS.flowerCenter} />
      </Dodecahedron>
      {DAISY_PETALS.map(([x, y], index) => (
        <Dodecahedron
          key={index}
          args={[0.075, 0]}
          position={[x, y + 0.28, 0]}
          scale={[1.2, 0.82, 0.65]}
        >
          <ClayMaterial color="#FFFFFF" />
        </Dodecahedron>
      ))}
    </group>
  )
}

function PastelFence() {
  return (
    <group name="pastelFence" position={[0, 0, 2.95]}>
      {FENCE_POSTS.map((x) => (
        <Box
          key={x}
          args={[0.16, 0.82, 0.16]}
          position={[x, 0.41, 0]}
        >
          <ClayMaterial color={COLORS.fence} />
        </Box>
      ))}
      <Box args={[10.2, 0.12, 0.12]} position={[0, 0.28, 0]}>
        <ClayMaterial color={COLORS.fence} />
      </Box>
      <Box args={[10.2, 0.12, 0.12]} position={[0, 0.62, 0]}>
        <ClayMaterial color={COLORS.fence} />
      </Box>
    </group>
  )
}

function LowPolyPlaygroundTree({ position, scale = 1 }) {
  return (
    <group name="layeredLowPolyTree" position={position} scale={scale}>
      <Cylinder
        args={[0.22, 0.28, 1.5, 7]}
        position={[0, 0.75, 0]}
      >
        <ClayMaterial color={COLORS.trunk} />
      </Cylinder>
      <Cone args={[1.35, 2.15, 6]} position={[0, 1.75, 0]}>
        <ClayMaterial color="#4F8A45" />
      </Cone>
      <Cone args={[1.05, 1.8, 6]} position={[0, 2.65, 0]}>
        <ClayMaterial color="#5E9E50" />
      </Cone>
      <Cone args={[0.72, 1.4, 6]} position={[0, 3.4, 0]}>
        <ClayMaterial color={COLORS.leaves} />
      </Cone>
    </group>
  )
}

function SlideLadder() {
  const stepPositions = [
    [0.55, 1.44],
    [0.83, 1.24],
    [1.11, 1.04],
    [1.39, 0.84],
    [1.67, 0.64],
  ]

  return (
    <group name="slideLadder">
      <Cylinder
        args={[0.12, 0.12, 2.08, 8]}
        position={[-2.4, 1.1, 1.05]}
        rotation={[-0.615, 0, 0]}
        castShadow
      >
        <ClayMaterial color={COLORS.teal} />
      </Cylinder>
      <Cylinder
        args={[0.12, 0.12, 2.08, 8]}
        position={[-1.6, 1.1, 1.05]}
        rotation={[-0.615, 0, 0]}
        castShadow
      >
        <ClayMaterial color={COLORS.teal} />
      </Cylinder>

      {stepPositions.map(([y, z]) => (
        <Cylinder
          key={`${y}-${z}`}
          args={[0.08, 0.08, 0.78, 8]}
          position={[-2, y, z]}
          rotation={[0, 0, Math.PI / 2]}
          castShadow
        >
          <ClayMaterial color={COLORS.teal} />
        </Cylinder>
      ))}
    </group>
  )
}

function SteppingStonePath() {
  return (
    <group name="steppingStonePath">
      {STEPPING_STONES.map(({ position, scale, rotationY }, index) => (
        <Cylinder
          key={index}
          args={[0.29, 0.32, 0.12, 24]}
          position={position}
          scale={scale}
          rotation={[0, rotationY, 0]}
          receiveShadow
        >
          <ClayMaterial
            color={PLATEAU_STEP_COLORS[index % PLATEAU_STEP_COLORS.length]}
          />
        </Cylinder>
      ))}
    </group>
  )
}

function SwingSet() {
  const frameLegs = [
    { x: -1.25, z: -0.34, rotationX: 0.3 },
    { x: -1.25, z: 0.34, rotationX: -0.3 },
    { x: 1.25, z: -0.34, rotationX: 0.3 },
    { x: 1.25, z: 0.34, rotationX: -0.3 },
  ]
  const swingPositions = [-0.55, 0.55]

  return (
    <group name="swingSet" position={[0.65, 0, 1.72]}>
      {frameLegs.map(({ x, z, rotationX }) => (
        <Cylinder
          key={`${x}-${z}`}
          args={[0.15, 0.19, 2.2, 8]}
          position={[x, 1.12, z]}
          rotation={[rotationX, 0, 0]}
          castShadow
        >
          <ClayMaterial color={COLORS.wood} />
        </Cylinder>
      ))}

      <Cylinder
        args={[0.18, 0.18, 3.15, 8]}
        position={[0, 2.18, 0]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <ClayMaterial color={COLORS.wood} />
      </Cylinder>

      {swingPositions.map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <Cylinder
            args={[0.025, 0.025, 1.32, 6]}
            position={[-0.22, 1.46, 0]}
          >
            <ClayMaterial color={COLORS.chain} />
          </Cylinder>
          <Cylinder
            args={[0.025, 0.025, 1.32, 6]}
            position={[0.22, 1.46, 0]}
          >
            <ClayMaterial color={COLORS.chain} />
          </Cylinder>
          <RoundedBox
            args={[0.8, 0.16, 0.54]}
            radius={0.05}
            smoothness={4}
            position={[0, 0.78, 0]}
            castShadow
          >
            <ClayMaterial color={COLORS.swingSeat} />
          </RoundedBox>
        </group>
      ))}
    </group>
  )
}

function LowPolyPlateauTerrain() {
  return (
    <group name="continuousPlaygroundTerrain">
      {PLATEAU_TERRAIN.map(({ position, scale, color }, index) => (
        <Dodecahedron
          key={`plateau-${index}`}
          args={[1, 0]}
          position={position}
          scale={scale}
          receiveShadow
        >
          {color ? <ClayMaterial color={color} /> : <LowPolyGrassMaterial />}
        </Dodecahedron>
      ))}

      <Cone
        name="distantFallMountain"
        args={[
          BACKGROUND_MOUNTAIN.radius,
          BACKGROUND_MOUNTAIN.height,
          7,
        ]}
        position={BACKGROUND_MOUNTAIN.position}
        rotation={[0, 0.18, -0.025]}
      >
        <ClayMaterial color={BACKGROUND_MOUNTAIN.color} />
      </Cone>

      <group name="plateauRocks">
        {ROCK_LAYOUT.map(([x, y, z, scale], index) => (
          <Dodecahedron
            key={`plateau-rock-${index}`}
            args={[1, 0]}
            position={[x, y, z]}
            rotation={[index * 0.22, index * 0.41, index * 0.12]}
            scale={[scale * 1.35, scale, scale]}
            castShadow
            receiveShadow
          >
            <ClayMaterial color={index % 2 ? '#8F928A' : '#A7AAA3'} />
          </Dodecahedron>
        ))}
      </group>
    </group>
  )
}

function LandingPetalBurst() {
  const meshRef = useRef()
  const previousOffsetRef = useRef(0)
  const triggerTimeRef = useRef(null)
  const hasTriggeredRef = useRef(false)
  const scroll = useScroll()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const particles = useMemo(
    () =>
      Array.from({ length: LANDING_BURST_COUNT }, (_, index) => {
        const angle = pseudoRandom(index, 1) * Math.PI * 2
        const speed = 2.4 + pseudoRandom(index, 2) * 4.6

        return Object.freeze({
          velocityX: Math.cos(angle) * speed,
          velocityY: 4.6 + pseudoRandom(index, 3) * 6.2,
          velocityZ: Math.sin(angle) * speed,
          spinX: 1.5 + pseudoRandom(index, 4) * 5,
          spinZ: 1.5 + pseudoRandom(index, 5) * 5,
          phase: pseudoRandom(index, 6) * Math.PI * 2,
          size: 0.055 + pseudoRandom(index, 7) * 0.09,
        })
      }),
    [],
  )

  useEffect(() => {
    if (!meshRef.current) return
    const mesh = meshRef.current
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    mesh.boundingBox = new THREE.Box3(
      new THREE.Vector3(
        CAMPUS_PATH.startX - 12,
        CAMPUS_PATH.surfaceY - 3,
        CAMPUS_PATH.characterZ - 12,
      ),
      new THREE.Vector3(
        CAMPUS_PATH.startX + 12,
        CAMPUS_PATH.surfaceY + 12,
        CAMPUS_PATH.characterZ + 12,
      ),
    )
    mesh.boundingSphere = new THREE.Sphere(
      new THREE.Vector3(
        CAMPUS_PATH.startX,
        CAMPUS_PATH.surfaceY + 4,
        CAMPUS_PATH.characterZ,
      ),
      18,
    )
    mesh.visible = false
  }, [])

  useFrame((state) => {
    if (!meshRef.current) return

    const offset = scroll.offset
    const elapsed = state.clock.elapsedTime
    const crossedLanding =
      previousOffsetRef.current < PLAYGROUND_MOTION_OFFSETS.groundContact &&
      offset >= PLAYGROUND_MOTION_OFFSETS.groundContact

    if (crossedLanding && !hasTriggeredRef.current) {
      triggerTimeRef.current = elapsed
      hasTriggeredRef.current = true
    }
    if (offset < PLAYGROUND_MOTION_OFFSETS.slideEnd) {
      triggerTimeRef.current = null
      hasTriggeredRef.current = false
    }
    previousOffsetRef.current = offset

    const age =
      triggerTimeRef.current === null ? -1 : elapsed - triggerTimeRef.current
    if (age < 0 || age > LANDING_BURST_DURATION) {
      meshRef.current.visible = false
      return
    }

    meshRef.current.visible = true
    const progress = age / LANDING_BURST_DURATION
    const fadeScale = 1 - THREE.MathUtils.smoothstep(progress, 0.68, 1)

    particles.forEach((particle, index) => {
      dummy.position.set(
        CAMPUS_PATH.startX + particle.velocityX * age,
        CAMPUS_PATH.surfaceY +
          0.12 +
          particle.velocityY * age -
          4.9 * age * age,
        CAMPUS_PATH.characterZ + particle.velocityZ * age,
      )
      dummy.rotation.set(
        particle.phase + age * particle.spinX,
        particle.phase * 0.4,
        age * particle.spinZ,
      )
      dummy.scale.setScalar(particle.size * fadeScale)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(index, dummy.matrix)
    })

    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={meshRef}
      name="landingCherryBlossomBurst"
      args={[null, null, LANDING_BURST_COUNT]}
    >
      <circleGeometry args={[1, 5]} />
      <meshStandardMaterial
        color="#FF9FBA"
        roughness={1}
        metalness={0}
        flatShading
        transparent
        opacity={0.92}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  )
}

function Playground({
  position = [0, 20, 0],
}) {
  return (
    <>
      <PlaygroundClouds />

      <group name="elevatedPlaygroundPlateau" position={position}>
        <LowPolyPlateauTerrain />

        <group rotation={[0, Math.PI, 0]}>
          <RoundedBox
            args={[
              PLAYGROUND_SLIDE.width,
              PLAYGROUND_SLIDE.thickness,
              PLAYGROUND_SLIDE.length,
            ]}
            radius={PLAYGROUND_SLIDE.radius}
            smoothness={6}
            position={PLAYGROUND_SLIDE.localPosition}
            rotation={[PLAYGROUND_SLIDE_ROTATION_X, 0, 0]}
            castShadow
            receiveShadow
          >
            <ClayMaterial color={COLORS.slide} flatShading={false} />
          </RoundedBox>

          <Capsule
            args={[0.1, PLAYGROUND_SLIDE.length - 0.2, 6, 12]}
            position={[-2.48, 1.42, -1.5]}
            rotation={[Math.PI / 2 + PLAYGROUND_SLIDE_ROTATION_X, 0, 0]}
            castShadow
          >
            <ClayMaterial color={COLORS.slideRail} flatShading={false} />
          </Capsule>
          <Capsule
            args={[0.1, PLAYGROUND_SLIDE.length - 0.2, 6, 12]}
            position={[-1.52, 1.42, -1.5]}
            rotation={[Math.PI / 2 + PLAYGROUND_SLIDE_ROTATION_X, 0, 0]}
            castShadow
          >
            <ClayMaterial color={COLORS.slideRail} flatShading={false} />
          </Capsule>

          <SlideLadder />
          <SteppingStonePath />
          <SwingSet />
          <PastelFence />

          {DAISY_LAYOUT.map(({ position, scale }) => (
            <Daisy
              key={position.join('-')}
              position={position}
              scale={scale}
            />
          ))}

          {TREE_LAYOUT.map(({ position, scale }) => (
            <LowPolyPlaygroundTree
              key={position.join('-')}
              position={position}
              scale={scale}
            />
          ))}
        </group>

      </group>

      <LandingPetalBurst />
    </>
  )
}

export default memo(Playground)
