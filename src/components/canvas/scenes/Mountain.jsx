import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  Box,
  Cone,
  Cylinder,
  Dodecahedron,
  Html,
  Sphere,
  useScroll,
} from '@react-three/drei'
import * as THREE from 'three'
import {
  getCharacterPositionAtOffset,
  MOUNTAIN_ORIGIN_Z,
  MOUNTAIN_PATH,
  MOUNTAIN_TRANSITION_STONES,
  MOUNTAIN_TRAIL_STONES,
} from '../../../config/narrativeTimeline'

const STEP_COLORS = ['#E5A9A9', '#F5F5F5']
const FLOWER_COLORS = ['#F6D365', '#FFFFFF', '#F2A7B5']
const BRIDGE_WIDTH = 2.8

const PROJECTS = Object.freeze([
  {
    number: '01',
    title: 'CSFD',
    description: 'Full-stack React and Express application.',
    accent: '#E5A9A9',
  },
  {
    number: '02',
    title: 'UniShare',
    description: 'Cross-platform Flutter community platform.',
    accent: '#7FB7A3',
  },
  {
    number: '03',
    title: 'Dummy Project',
    description: 'A future product experience and case study.',
    accent: '#D5B4E8',
  },
  {
    number: '04',
    title: 'Dummy Project',
    description: 'A future interactive web project.',
    accent: '#F0B67F',
  },
  {
    number: '05',
    title: 'Dummy Project',
    description: 'A future mobile or open-source project.',
    accent: '#8CB8D8',
  },
  {
    number: '06',
    title: 'Dummy Project',
    description: 'A future experiment and technical write-up.',
    accent: '#A9C978',
  },
])

const CLIFF_MASSES = Object.freeze([
  [-20, -2.2, 30, 11, 5.1, 18, '#557A46'],
  [18, -1.2, 20, 10, 5.8, 13, '#7C736B'],
  [-20, 1.2, 18, 10, 5.8, 11, '#557A46'],
  [-25, 1.9, 10.5, 9, 5.2, 8, '#7C736B'],
  [22, 5, -8, 10, 7, 8, '#557A46'],
  [29, 6.4, -13, 11, 7.1, 17, '#557A46'],
  [23, 8.4, -24, 10, 7.5, 14, '#7C736B'],
  [-17, 12.7, -27, 10, 7.3, 12, '#557A46'],
])

const BRIDGE_POINTS = MOUNTAIN_TRAIL_STONES.filter(
  (stone) => stone.phase === 'bridge',
)

const BRIDGE_LAYOUT = Object.freeze(
  BRIDGE_POINTS.map((stone) => {
    const perpendicularX = Math.cos(stone.rotationY)
    const perpendicularZ = -Math.sin(stone.rotationY)
    const ropeLift =
      0.78 + Math.abs(stone.progress - 0.5) * 7.5
    return Object.freeze({
      stone,
      left: [
        stone.x - perpendicularX * (BRIDGE_WIDTH / 2),
        stone.topY + ropeLift,
        stone.z - perpendicularZ * (BRIDGE_WIDTH / 2),
      ],
      right: [
        stone.x + perpendicularX * (BRIDGE_WIDTH / 2),
        stone.topY + ropeLift,
        stone.z + perpendicularZ * (BRIDGE_WIDTH / 2),
      ],
      leftDeck: [
        stone.x - perpendicularX * (BRIDGE_WIDTH / 2),
        stone.topY,
        stone.z - perpendicularZ * (BRIDGE_WIDTH / 2),
      ],
      rightDeck: [
        stone.x + perpendicularX * (BRIDGE_WIDTH / 2),
        stone.topY,
        stone.z + perpendicularZ * (BRIDGE_WIDTH / 2),
      ],
    })
  }),
)

const UP = new THREE.Vector3(0, 1, 0)
const segmentStart = new THREE.Vector3()
const segmentEnd = new THREE.Vector3()
const segmentDirection = new THREE.Vector3()
const segmentMidpoint = new THREE.Vector3()
const segmentQuaternion = new THREE.Quaternion()

const createCylinderTransform = (start, end) => {
  segmentStart.fromArray(start)
  segmentEnd.fromArray(end)
  segmentDirection.copy(segmentEnd).sub(segmentStart)
  const length = segmentDirection.length()
  segmentMidpoint.copy(segmentStart).add(segmentEnd).multiplyScalar(0.5)
  segmentQuaternion.setFromUnitVectors(UP, segmentDirection.normalize())
  return Object.freeze({
    length,
    position: Object.freeze(segmentMidpoint.toArray()),
    quaternion: Object.freeze(segmentQuaternion.toArray()),
  })
}

const BRIDGE_ROPE_SEGMENTS = Object.freeze(
  BRIDGE_LAYOUT.slice(0, -1).flatMap((layout, index) => [
    createCylinderTransform(layout.left, BRIDGE_LAYOUT[index + 1].left),
    createCylinderTransform(layout.right, BRIDGE_LAYOUT[index + 1].right),
  ]),
)

const BRIDGE_VERTICALS = Object.freeze(
  BRIDGE_LAYOUT.flatMap((layout, index) =>
    index % 2
      ? []
      : [
          createCylinderTransform(layout.leftDeck, layout.left),
          createCylinderTransform(layout.rightDeck, layout.right),
        ],
  ),
)

const NON_BRIDGE_STONES = MOUNTAIN_TRAIL_STONES.filter(
  (stone) => stone.phase !== 'bridge',
)

const PINE_LAYOUT = Object.freeze(
  Array.from({ length: 36 }, (_, index) => {
    const stone =
      NON_BRIDGE_STONES[
        Math.floor((index / 35) * (NON_BRIDGE_STONES.length - 1))
      ]
    const side = index % 2 ? 1 : -1
    const offset = 4.3 + (index % 5) * 0.82
    const perpendicularX = Math.cos(stone.rotationY)
    const perpendicularZ = -Math.sin(stone.rotationY)
    return Object.freeze({
      position: [
        stone.x + perpendicularX * offset * side,
        stone.topY - 0.1,
        stone.z + perpendicularZ * offset * side,
      ],
      scale: 0.56 + (index % 5) * 0.1,
    })
  }),
)

const FLOWER_LAYOUT = Object.freeze(
  Array.from({ length: 66 }, (_, index) => {
    const stone =
      NON_BRIDGE_STONES[
        Math.floor((index / 65) * (NON_BRIDGE_STONES.length - 1))
      ]
    const side = index % 2 ? 1 : -1
    const offset = 2.6 + (index % 7) * 0.48
    const perpendicularX = Math.cos(stone.rotationY)
    const perpendicularZ = -Math.sin(stone.rotationY)
    return Object.freeze({
      position: [
        stone.x + perpendicularX * offset * side,
        stone.topY + 0.08,
        stone.z + perpendicularZ * offset * side,
      ],
      scale: 0.09 + (index % 3) * 0.025,
      color: FLOWER_COLORS[index % FLOWER_COLORS.length],
      rotation: [index * 0.3, index * 0.57, index * 0.19],
    })
  }),
)

const PROJECT_BALLOON_PROGRESS = Object.freeze([
  0.12,
  0.27,
  0.41,
  0.59,
  0.74,
  0.89,
])

const PROJECT_BALLOONS = Object.freeze(
  PROJECTS.map((project, index) => {
    const progress = PROJECT_BALLOON_PROGRESS[index]
    const stone =
      MOUNTAIN_TRAIL_STONES[
        Math.round(progress * (MOUNTAIN_TRAIL_STONES.length - 1))
      ]
    const side = index % 2 ? 1 : -1
    const perpendicularX = Math.cos(stone.rotationY)
    const perpendicularZ = -Math.sin(stone.rotationY)
    const sideOffset = 9 + (index % 3) * 0.75

    return Object.freeze({
      ...project,
      phase: index * 0.83,
      cardPosition: Object.freeze([side * 3.8, 4.8, 1.2]),
      basePosition: Object.freeze([
        stone.x + perpendicularX * sideOffset * side,
        stone.topY + 9.5 + (index % 2) * 0.9,
        stone.z + perpendicularZ * sideOffset * side,
      ]),
      worldZ:
        MOUNTAIN_ORIGIN_Z +
        stone.z +
        perpendicularZ * sideOffset * side,
    })
  }),
)

const TRANSITION_TREE_LAYOUT = Object.freeze(
  Array.from({ length: 22 }, (_, index) => {
    const stoneIndex = Math.round(
      ((index + 1) / 23) * (MOUNTAIN_TRANSITION_STONES.length - 1),
    )
    const stone = MOUNTAIN_TRANSITION_STONES[stoneIndex]
    const side = index % 2 ? 1 : -1
    return Object.freeze({
      position: [
        side * (4.6 + (index % 4) * 0.85),
        stone.topY - 0.08,
        stone.z + Math.sin(index * 1.41) * 1.1,
      ],
      scale: 0.5 + (index % 5) * 0.09,
    })
  }),
)

const TRANSITION_ROCK_LAYOUT = Object.freeze(
  Array.from({ length: 28 }, (_, index) => {
    const stoneIndex = Math.round(
      ((index + 0.7) / 29) * (MOUNTAIN_TRANSITION_STONES.length - 1),
    )
    const stone = MOUNTAIN_TRANSITION_STONES[stoneIndex]
    const side = index % 2 ? 1 : -1
    const scale = 0.35 + (index % 4) * 0.12
    return Object.freeze({
      position: [
        side * (2.8 + (index % 5) * 0.72),
        stone.topY + scale * 0.18,
        stone.z + Math.cos(index * 1.27) * 0.9,
      ],
      scale: [scale * 1.3, scale * 0.72, scale],
      rotation: [index * 0.13, index * 0.61, index * 0.09],
    })
  }),
)

const balloonCharacterPosition = new THREE.Vector3()

function FlatMaterial({
  color,
  emissive = '#000000',
  emissiveIntensity = 0,
  transparent = false,
  opacity = 1,
  side,
}) {
  return (
    <meshStandardMaterial
      color={color}
      emissive={emissive}
      emissiveIntensity={emissiveIntensity}
      roughness={1}
      metalness={0}
      flatShading
      transparent={transparent}
      opacity={opacity}
      side={side}
    />
  )
}

function RopeCylinder({ transform, radius = 0.055 }) {
  return (
    <Cylinder
      args={[radius, radius, transform.length, 8]}
      position={transform.position}
      quaternion={transform.quaternion}
      castShadow
    >
      <FlatMaterial color="#49392F" />
    </Cylinder>
  )
}

function SuspensionBridge() {
  return (
    <group name="suspensionBridge">
      {BRIDGE_LAYOUT.map(({ stone }, index) => (
        <Box
          key={`bridge-plank-${index}`}
          args={[BRIDGE_WIDTH, 0.24, 1.56]}
          position={[stone.x, stone.topY - 0.12, stone.z]}
          rotation={[0, stone.rotationY, 0]}
          castShadow
          receiveShadow
        >
          <FlatMaterial color={index % 2 ? '#8B5A2B' : '#9C6A3B'} />
        </Box>
      ))}

      {BRIDGE_ROPE_SEGMENTS.map((segment, index) => (
        <RopeCylinder key={`bridge-rope-${index}`} transform={segment} />
      ))}
      {BRIDGE_VERTICALS.map((segment, index) => (
        <RopeCylinder
          key={`bridge-vertical-${index}`}
          transform={segment}
          radius={0.038}
        />
      ))}
    </group>
  )
}

function ChasmAndWaterfall() {
  return (
    <group name="waterfallChasm">
      <mesh
        name="chasmWater"
        position={[0, -5.2, 6]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[22, 28, 2, 2]} />
        <FlatMaterial color="#5BC0BE" side={THREE.DoubleSide} />
      </mesh>

      <Box
        name="waterfall"
        args={[6.2, 20, 0.38]}
        position={[6, 2, -2.4]}
        rotation={[-Math.PI / 4, 0, 0]}
        castShadow
        receiveShadow
      >
        <FlatMaterial color="#5BC0BE" />
      </Box>

      {Array.from({ length: 9 }, (_, index) => (
        <Box
          key={`waterfall-foam-${index}`}
          args={[0.75 + (index % 3) * 0.24, 0.3, 0.58]}
          position={[
            3.4 + index * 0.66,
            -5 + (index % 2) * 0.13,
            3.1 + Math.sin(index * 1.7) * 0.48,
          ]}
          rotation={[0.04, index * 0.43, 0.05]}
        >
          <FlatMaterial color="#F5F5F5" />
        </Box>
      ))}
    </group>
  )
}

function LowPolyPine({ position, scale }) {
  return (
    <group name="lowPolyPine" position={position} scale={scale}>
      <Cylinder
        args={[0.15, 0.24, 1.45, 7]}
        position={[0, 0.72, 0]}
        castShadow
        receiveShadow
      >
        <FlatMaterial color="#6A4632" />
      </Cylinder>
      <Cone
        args={[1.05, 2.6, 7]}
        position={[0, 2.05, 0]}
        castShadow
        receiveShadow
      >
        <FlatMaterial color="#2D4C3B" />
      </Cone>
    </group>
  )
}

function TransitionCorridor() {
  const corridorRef = useRef()
  const scroll = useScroll()

  useFrame(() => {
    if (!corridorRef.current) return
    corridorRef.current.visible =
      scroll.offset >= MOUNTAIN_PATH.start - 0.04 &&
      scroll.offset <= MOUNTAIN_PATH.trailStart + 0.04
  })

  return (
    <group ref={corridorRef} name="sceneTransitionForestTrail" visible={false}>
      <group name="transitionSteppingStones">
        {MOUNTAIN_TRANSITION_STONES.slice(0, -1).map((stone, index) => (
          <Cylinder
            key={`transition-stone-${index}`}
            args={[1.08, 1.16, 0.56, 8]}
            position={[stone.x, stone.topY - 0.28, stone.z]}
            rotation={[0, stone.rotationY, 0]}
            scale={[stone.scale, 1, 1.04]}
            castShadow
            receiveShadow
          >
            <FlatMaterial color={STEP_COLORS[index % STEP_COLORS.length]} />
          </Cylinder>
        ))}
      </group>

      <group name="transitionPines">
        {TRANSITION_TREE_LAYOUT.map((tree, index) => (
          <LowPolyPine
            key={`transition-pine-${index}`}
            position={tree.position}
            scale={tree.scale}
          />
        ))}
      </group>

      <group name="transitionRocks">
        {TRANSITION_ROCK_LAYOUT.map((rock, index) => (
          <Dodecahedron
            key={`transition-rock-${index}`}
            args={[1, 0]}
            position={rock.position}
            rotation={rock.rotation}
            scale={rock.scale}
            castShadow
            receiveShadow
          >
            <FlatMaterial color={index % 2 ? '#7C736B' : '#8A8782'} />
          </Dodecahedron>
        ))}
      </group>
    </group>
  )
}

function Flora() {
  return (
    <group name="denseAlpineFlora">
      {PINE_LAYOUT.map((tree, index) => (
        <LowPolyPine
          key={`mountain-pine-${index}`}
          position={tree.position}
          scale={tree.scale}
        />
      ))}

      {FLOWER_LAYOUT.map((flower, index) => (
        <Dodecahedron
          key={`wildflower-${index}`}
          args={[1, 0]}
          position={flower.position}
          scale={flower.scale}
          rotation={flower.rotation}
        >
          <FlatMaterial color={flower.color} />
        </Dodecahedron>
      ))}
    </group>
  )
}

function ProjectBalloons() {
  const scroll = useScroll()
  const balloonRefs = useRef([])
  const cardRefs = useRef([])

  useFrame((state) => {
    getCharacterPositionAtOffset(scroll.offset, balloonCharacterPosition)
    const isOnTrail =
      scroll.offset >= MOUNTAIN_PATH.trailStart &&
      scroll.offset <= MOUNTAIN_PATH.end

    PROJECT_BALLOONS.forEach((balloon, index) => {
      const balloonGroup = balloonRefs.current[index]
      const card = cardRefs.current[index]
      if (balloonGroup) {
        balloonGroup.position.y =
          balloon.basePosition[1] +
          Math.sin(state.clock.elapsedTime * 0.75 + balloon.phase) * 0.48
      }
      if (!card) return

      const zDistance = Math.abs(balloonCharacterPosition.z - balloon.worldZ)
      const proximity = isOnTrail
        ? 1 - THREE.MathUtils.smoothstep(zDistance, 2.8, 7.5)
        : 0
      card.style.opacity = proximity.toFixed(3)
      card.style.visibility = proximity > 0.01 ? 'visible' : 'hidden'
      card.style.transform = `translateY(${(1 - proximity) * 10}px) scale(${0.96 + proximity * 0.04})`
    })
  })

  return (
    <group name="floatingProjectBalloons">
      {PROJECT_BALLOONS.map((balloon, index) => (
        <group
          ref={(group) => {
            balloonRefs.current[index] = group
          }}
          key={balloon.number}
          name={`projectBalloon${balloon.number}`}
          position={balloon.basePosition}
        >
          <Sphere
            args={[1, 12, 9]}
            scale={[2.5, 3.1, 2.5]}
            castShadow
          >
            <FlatMaterial color={balloon.accent} />
          </Sphere>
          <Cylinder
            args={[0.045, 0.045, 1.35, 6]}
            position={[-0.58, -3.7, 0]}
          >
            <FlatMaterial color="#5B4636" />
          </Cylinder>
          <Cylinder
            args={[0.045, 0.045, 1.35, 6]}
            position={[0.58, -3.7, 0]}
          >
            <FlatMaterial color="#5B4636" />
          </Cylinder>
          <Box args={[1.3, 0.8, 1]} position={[0, -4.75, 0]} castShadow>
            <FlatMaterial color="#8B5A2B" />
          </Box>

          <Html
            transform
            sprite
            center
            occlude={false}
            distanceFactor={10}
            position={balloon.cardPosition}
            style={{ pointerEvents: 'none' }}
          >
            <article
              ref={(element) => {
                cardRefs.current[index] = element
              }}
              className="invisible w-[260px] rounded-[22px] border border-white/90 bg-white/95 p-5 text-left text-[#3E3A36] opacity-0 shadow-[0_18px_50px_rgba(58,53,48,0.2)] transition-[opacity,transform] duration-200"
              aria-label={`Project ${balloon.number}: ${balloon.title}`}
            >
              <div
                className="mb-4 h-1.5 w-10 rounded-full"
                style={{ backgroundColor: balloon.accent }}
              />
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8A817A]">
                Project {balloon.number}
              </p>
              <h3 className="mt-2 text-xl font-semibold leading-tight">
                {balloon.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6C655F]">
                {balloon.description}
              </p>
            </article>
          </Html>
        </group>
      ))}
    </group>
  )
}

export default function Mountain({ position = [0, 0, MOUNTAIN_ORIGIN_Z] }) {
  return (
    <group name="mountainBase" position={position}>
      <TransitionCorridor />

      <group name="lowPolyCliffs">
        {CLIFF_MASSES.map(([x, y, z, sx, sy, sz, color], index) => (
          <Dodecahedron
            key={`cliff-${index}`}
            args={[1, 0]}
            position={[x, y, z]}
            scale={[sx, sy, sz]}
            rotation={[0.08 * (index % 2), index * 0.38, -0.04]}
            castShadow
            receiveShadow
          >
            <FlatMaterial color={color} />
          </Dodecahedron>
        ))}
      </group>

      <ChasmAndWaterfall />

      <group name="sCurveSteppingStones">
        {MOUNTAIN_TRAIL_STONES.filter(
          (stone) => stone.phase !== 'bridge',
        ).map((stone, index) => (
          <Cylinder
            key={`trail-stone-${index}`}
            args={[1.05, 1.14, 0.62, 8]}
            position={[stone.x, stone.topY - 0.35, stone.z]}
            rotation={[0, stone.rotationY, 0]}
            scale={[stone.scale, 1, 0.82 + (index % 3) * 0.07]}
            castShadow
            receiveShadow
          >
            <FlatMaterial color={STEP_COLORS[index % STEP_COLORS.length]} />
          </Cylinder>
        ))}
      </group>

      <SuspensionBridge />
      <Flora />

      <ProjectBalloons />
    </group>
  )
}
