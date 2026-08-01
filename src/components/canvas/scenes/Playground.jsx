import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  Box,
  ContactShadows,
  Cylinder,
  RoundedBox,
  Sphere,
} from '@react-three/drei'
import Sun from './Sun'

const COLORS = Object.freeze({
  cream: '#FDF6E3',
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
  { position: [-4.6, 3.55, -6], scale: 0.62, speed: 0.08, phase: 0 },
  { position: [-0.8, 4.15, -8], scale: 0.78, speed: 0.055, phase: 3.5 },
  { position: [3.1, 3.45, -5.5], scale: 0.5, speed: 0.09, phase: 7 },
  { position: [6, 4.05, -9], scale: 0.7, speed: 0.045, phase: 10.5 },
]

const NIGHT_STARS = [
  { position: [-1.15, 0.45, 0], scale: 0.24, phase: 0 },
  { position: [-0.65, -0.35, 0.15], scale: 0.17, phase: 1.2 },
  { position: [0.75, 0.62, 0.1], scale: 0.2, phase: 2.4 },
  { position: [1.15, -0.22, 0.05], scale: 0.15, phase: 3.6 },
  { position: [0.25, -0.72, 0.18], scale: 0.13, phase: 4.8 },
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

function ClayMaterial({ color }) {
  return <meshStandardMaterial color={color} roughness={1} metalness={0} />
}

function CloudMaterial() {
  return (
    <meshStandardMaterial
      color="#FFFFFF"
      roughness={1}
      metalness={0}
      emissive="#FFFFFF"
      emissiveIntensity={0.1}
    />
  )
}

function ClayStar({ position, scale, starRef }) {
  return (
    <group ref={starRef} position={position} scale={scale}>
      <RoundedBox
        args={[0.075, 0.42, 0.075]}
        radius={0.03}
        smoothness={4}
        rotation={[0, 0, Math.PI / 4]}
      >
        <ClayMaterial color={COLORS.sun} />
      </RoundedBox>
      <RoundedBox
        args={[0.075, 0.42, 0.075]}
        radius={0.03}
        smoothness={4}
        rotation={[0, 0, -Math.PI / 4]}
      >
        <ClayMaterial color={COLORS.sun} />
      </RoundedBox>
    </group>
  )
}

function Moon() {
  const starRefs = useRef([])

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime
    starRefs.current.forEach((star, index) => {
      if (!star) return
      const { position, phase } = NIGHT_STARS[index]
      star.position.y = position[1] + Math.sin(elapsed * 1.15 + phase) * 0.09
    })
  })

  return (
    <group name="moon" position={[4.65, 4.2, -6]}>
      <Sphere args={[0.58, 28, 22]} castShadow>
        <ClayMaterial color={COLORS.moon} />
      </Sphere>
      {NIGHT_STARS.map(({ position, scale }, index) => (
        <ClayStar
          key={index}
          position={position}
          scale={scale}
          starRef={(element) => {
            starRefs.current[index] = element
          }}
        />
      ))}
    </group>
  )
}

function Cloud({ position, scale, speed, phase }) {
  const cloudRef = useRef()

  useFrame((state) => {
    if (!cloudRef.current) return
    cloudRef.current.position.x =
      position[0] + Math.sin(state.clock.elapsedTime * speed + phase) * 1.15
  })

  return (
    <group
      ref={cloudRef}
      name="puffyCloud"
      position={position}
      scale={scale}
    >
      <Sphere args={[1, 24, 18]} scale={[1.15, 0.56, 0.62]}>
        <CloudMaterial />
      </Sphere>
      <Sphere
        args={[1, 22, 18]}
        position={[-0.86, -0.03, 0.02]}
        scale={[0.72, 0.46, 0.5]}
      >
        <CloudMaterial />
      </Sphere>
      <Sphere
        args={[1, 22, 18]}
        position={[0.86, -0.02, 0]}
        scale={[0.7, 0.45, 0.48]}
      >
        <CloudMaterial />
      </Sphere>
      <Sphere
        args={[1, 22, 18]}
        position={[-0.34, 0.38, -0.03]}
        scale={[0.62, 0.58, 0.54]}
      >
        <CloudMaterial />
      </Sphere>
      <Sphere
        args={[1, 22, 18]}
        position={[0.38, 0.33, 0]}
        scale={[0.68, 0.62, 0.56]}
      >
        <CloudMaterial />
      </Sphere>
    </group>
  )
}

function Daisy({ position, scale }) {
  return (
    <group name="daisy" position={position} scale={scale}>
      <Cylinder args={[0.018, 0.024, 0.24, 10]} position={[0, 0.12, 0]}>
        <ClayMaterial color={COLORS.leaves} />
      </Cylinder>
      <Sphere args={[0.075, 14, 12]} position={[0, 0.28, 0.02]}>
        <ClayMaterial color={COLORS.flowerCenter} />
      </Sphere>
      {DAISY_PETALS.map(([x, y], index) => (
        <Sphere
          key={index}
          args={[0.075, 14, 12]}
          position={[x, y + 0.28, 0]}
          scale={[1.2, 0.82, 0.65]}
        >
          <ClayMaterial color="#FFFFFF" />
        </Sphere>
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
          castShadow
        >
          <ClayMaterial color={COLORS.fence} />
        </Box>
      ))}
      <Box args={[10.2, 0.12, 0.12]} position={[0, 0.28, 0]} castShadow>
        <ClayMaterial color={COLORS.fence} />
      </Box>
      <Box args={[10.2, 0.12, 0.12]} position={[0, 0.62, 0]} castShadow>
        <ClayMaterial color={COLORS.fence} />
      </Box>
    </group>
  )
}

function GumdropTree({ position, scale = 1 }) {
  return (
    <group name="gumdropTree" position={position} scale={scale}>
      <Cylinder
        args={[0.15, 0.21, 1.05, 18]}
        position={[0, 0.52, 0]}
        castShadow
      >
        <ClayMaterial color={COLORS.trunk} />
      </Cylinder>

      <group position={[0, 1.34, 0]}>
        <Sphere args={[1, 24, 20]} scale={[0.68, 0.58, 0.62]} castShadow>
          <ClayMaterial color={COLORS.leaves} />
        </Sphere>
        <Sphere
          args={[1, 22, 18]}
          position={[-0.4, 0.02, 0.02]}
          scale={[0.48, 0.44, 0.48]}
          castShadow
        >
          <ClayMaterial color={COLORS.leaves} />
        </Sphere>
        <Sphere
          args={[1, 22, 18]}
          position={[0.4, 0.06, 0]}
          scale={[0.5, 0.46, 0.48]}
          castShadow
        >
          <ClayMaterial color={COLORS.leaves} />
        </Sphere>
        <Sphere
          args={[1, 22, 18]}
          position={[0, 0.38, -0.02]}
          scale={[0.46, 0.43, 0.45]}
          castShadow
        >
          <ClayMaterial color={COLORS.leaves} />
        </Sphere>
      </group>
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
        args={[0.075, 0.075, 2.08, 18]}
        position={[-2.4, 1.1, 1.05]}
        rotation={[-0.615, 0, 0]}
        castShadow
      >
        <ClayMaterial color={COLORS.teal} />
      </Cylinder>
      <Cylinder
        args={[0.075, 0.075, 2.08, 18]}
        position={[-1.6, 1.1, 1.05]}
        rotation={[-0.615, 0, 0]}
        castShadow
      >
        <ClayMaterial color={COLORS.teal} />
      </Cylinder>

      {stepPositions.map(([y, z]) => (
        <Cylinder
          key={`${y}-${z}`}
          args={[0.055, 0.055, 0.78, 16]}
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
          <ClayMaterial color={COLORS.stone} />
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
          args={[0.09, 0.12, 2.2, 18]}
          position={[x, 1.12, z]}
          rotation={[rotationX, 0, 0]}
          castShadow
        >
          <ClayMaterial color={COLORS.wood} />
        </Cylinder>
      ))}

      <Cylinder
        args={[0.12, 0.12, 3, 20]}
        position={[0, 2.18, 0]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <ClayMaterial color={COLORS.wood} />
      </Cylinder>

      {swingPositions.map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <Cylinder
            args={[0.018, 0.018, 1.32, 10]}
            position={[-0.22, 1.46, 0]}
          >
            <ClayMaterial color={COLORS.chain} />
          </Cylinder>
          <Cylinder
            args={[0.018, 0.018, 1.32, 10]}
            position={[0.22, 1.46, 0]}
          >
            <ClayMaterial color={COLORS.chain} />
          </Cylinder>
          <RoundedBox
            args={[0.72, 0.12, 0.46]}
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

export default function Playground({
  isNight = false,
  isSunset = false,
  isSummitActive = false,
  castDirectionalShadow = false,
}) {
  const slidePosition = { x: -2, y: 1.1, z: -1.5 }
  const slideRotationX = -0.35
  const skyColor = isNight
    ? '#1E1B4B'
    : isSunset
      ? '#FFE5D9'
      : '#E8F4FA'
  const ambientColor = isNight
    ? '#312E81'
    : isSunset
      ? '#E6E6FA'
      : '#FFFFFF'
  const directionalColor = isNight
    ? '#818CF8'
    : isSunset
      ? '#FFB347'
      : '#FFF9E6'

  return (
    <>
      <color attach="background" args={[skyColor]} />
      <ambientLight
        color={ambientColor}
        intensity={
          isNight ? 0.6 : isSummitActive ? 0.55 : isSunset ? 0.8 : 1.35
        }
      />
      <directionalLight
        color={directionalColor}
        intensity={
          isNight ? 0.5 : isSummitActive ? 0.25 : isSunset ? 1.5 : 1.9
        }
        position={isSunset ? [10, 5, 5] : [5, 10, 5]}
        castShadow={castDirectionalShadow}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={120}
        shadow-camera-left={-45}
        shadow-camera-right={45}
        shadow-camera-top={45}
        shadow-camera-bottom={-45}
        shadow-bias={-0.0002}
        shadow-normalBias={0.03}
      />

      {isNight ? <Moon /> : <Sun />}
      {CLOUD_LAYOUT.map(({ position, scale, speed, phase }) => (
        <Cloud
          key={position.join('-')}
          position={position}
          scale={scale}
          speed={speed}
          phase={phase}
        />
      ))}

      <group rotation={[0, Math.PI, 0]}>
        <RoundedBox
          args={[12, 0.65, 6.4]}
          radius={0.24}
          smoothness={6}
          position={[0, -0.325, 0]}
          castShadow
          receiveShadow
        >
          <ClayMaterial color={COLORS.cream} />
        </RoundedBox>

        <RoundedBox
          args={[1, 0.25, 4]}
          radius={0.12}
          smoothness={5}
          position={[slidePosition.x, slidePosition.y, slidePosition.z]}
          rotation={[slideRotationX, 0, 0]}
          castShadow
          receiveShadow
        >
          <ClayMaterial color={COLORS.slide} />
        </RoundedBox>

        <Cylinder
          args={[0.055, 0.055, 4, 12]}
          position={[-2.48, 1.42, -1.5]}
          rotation={[Math.PI / 2 + slideRotationX, 0, 0]}
          castShadow
        >
          <ClayMaterial color={COLORS.slideRail} />
        </Cylinder>
        <Cylinder
          args={[0.055, 0.055, 4, 12]}
          position={[-1.52, 1.42, -1.5]}
          rotation={[Math.PI / 2 + slideRotationX, 0, 0]}
          castShadow
        >
          <ClayMaterial color={COLORS.slideRail} />
        </Cylinder>

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
          <GumdropTree
            key={position.join('-')}
            position={position}
            scale={scale}
          />
        ))}
      </group>

      <ContactShadows
        position={[0, 0.01, 0]}
        scale={10}
        blur={2}
        far={4}
        opacity={0.4}
        resolution={512}
      />
    </>
  )
}
