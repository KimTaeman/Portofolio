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
import LowPolyGrassMaterial from '../LowPolyGrassMaterial'
import {
  getCharacterPositionAtOffset,
  getMountainTransitionTopY,
  MOUNTAIN_ORIGIN_Z,
  MOUNTAIN_PATH,
  MOUNTAIN_TRANSITION,
  MOUNTAIN_TRANSITION_STONES,
  MOUNTAIN_TRAIL_STONES,
} from '../../../config/narrativeTimeline'

const STEP_COLORS = ['#E5A9A9', '#F5F5F5']
const FLOWER_COLORS = ['#F6D365', '#FFFFFF', '#F2A7B5']
const BRIDGE_WIDTH = 2.8
const VALLEY_FLOOR_TOP_Y = -30
const TERRAIN_BOTTOM_Y = -32
const TREE_SURFACE_EMBED = 0.08

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

const CLIFF_MASSES = Object.freeze(
  [
    [-20, -2.2, 30, 11, 5.1, 18, '#557A46'],
    [18, -1.2, 20, 10, 5.8, 13, '#7C736B'],
    [-20, 1.2, 18, 10, 5.8, 11, '#557A46'],
    [-25, 1.9, 10.5, 9, 5.2, 8, '#7C736B'],
    [22, 5, -8, 10, 7, 8, '#557A46'],
    [29, 6.4, -13, 11, 7.1, 17, '#557A46'],
    [23, 8.4, -24, 10, 7.5, 14, '#7C736B'],
    [-17, 12.7, -27, 10, 7.3, 12, '#557A46'],
  ].map(([x, y, z, sx, sy, sz, color]) => {
    const originalTop = y + sy
    return [
      x,
      (originalTop + TERRAIN_BOTTOM_Y) / 2,
      z,
      sx,
      (originalTop - TERRAIN_BOTTOM_Y) / 2,
      sz,
      color,
    ]
  }),
)

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

const TRAIL_FOUNDATION_LAYOUT = Object.freeze(
  NON_BRIDGE_STONES.filter((_, index) => index % 3 === 0).map(
    (stone, index) => {
      const terrainTop = stone.topY - 0.42
      return Object.freeze({
        position: [
          stone.x,
          (terrainTop + TERRAIN_BOTTOM_Y) / 2,
          stone.z,
        ],
        scale: [
          3.8 + (index % 3) * 0.45,
          (terrainTop - TERRAIN_BOTTOM_Y) / 2,
          5 + (index % 2) * 0.55,
        ],
        rotation: [0.03 * (index % 2), stone.rotationY, index * 0.17],
        color: index % 3 === 1 ? '#7C736B' : '#557A46',
      })
    },
  ),
)

const TRANSITION_HILL_LAYOUT = Object.freeze(
  [
    {
      progress: 0.14,
      x: 0,
      scale: [12, 2, 45],
      pitch: -0.014,
      yaw: 0.05,
      topOffset: 0.274,
    },
    {
      progress: 0.54,
      x: 0.65,
      scale: [11.5, 5.2, 32],
      pitch: 0,
      yaw: -0.1,
      topOffset: -0.42,
    },
    {
      progress: 0.87,
      x: -0.35,
      scale: [12.5, 5.6, 29],
      pitch: 0,
      yaw: 0.16,
      topOffset: -0.42,
    },
  ].map(({ progress, x, scale, pitch, yaw, topOffset }) => {
    const surfaceY = getMountainTransitionTopY(progress) + topOffset
    return Object.freeze({
      position: [
        x,
        surfaceY - scale[1],
        MOUNTAIN_TRANSITION.startLocalZ +
          (MOUNTAIN_TRANSITION.endLocalZ -
            MOUNTAIN_TRANSITION.startLocalZ) *
            progress,
      ],
      scale,
      rotation: [pitch, yaw, 0],
    })
  }),
)

const TERRAIN_SAMPLE_GEOMETRY = new THREE.DodecahedronGeometry(1, 0)
const TERRAIN_SAMPLE_MATERIAL = new THREE.MeshBasicMaterial()
const TERRAIN_RAYCASTER = new THREE.Raycaster()
const TERRAIN_RAY_ORIGIN = new THREE.Vector3()
const TERRAIN_RAY_DIRECTION = new THREE.Vector3(0, -1, 0)
const TERRAIN_RAY_HITS = []

const createTerrainSampleMesh = (position, scale, rotation) => {
  const mesh = new THREE.Mesh(
    TERRAIN_SAMPLE_GEOMETRY,
    TERRAIN_SAMPLE_MATERIAL,
  )
  mesh.position.fromArray(position)
  mesh.scale.fromArray(scale)
  mesh.rotation.set(...rotation)
  mesh.updateMatrixWorld(true)
  return mesh
}

const SCENE3_TERRAIN_SAMPLE_MESHES = Object.freeze([
  ...CLIFF_MASSES.map(([x, y, z, sx, sy, sz], index) =>
    createTerrainSampleMesh(
      [x, y, z],
      [sx, sy, sz],
      [0.08 * (index % 2), index * 0.38, -0.04],
    ),
  ),
  ...TRAIL_FOUNDATION_LAYOUT.map((mass) =>
    createTerrainSampleMesh(mass.position, mass.scale, mass.rotation),
  ),
])

const TRANSITION_TERRAIN_SAMPLE_MESHES = Object.freeze(
  TRANSITION_HILL_LAYOUT.map((hill) =>
    createTerrainSampleMesh(hill.position, hill.scale, hill.rotation),
  ),
)

const sampleTerrainSurfaceY = (meshes, x, z, fallbackY) => {
  TERRAIN_RAY_ORIGIN.set(x, 100, z)
  TERRAIN_RAYCASTER.set(TERRAIN_RAY_ORIGIN, TERRAIN_RAY_DIRECTION)
  TERRAIN_RAY_HITS.length = 0
  TERRAIN_RAYCASTER.intersectObjects(meshes, false, TERRAIN_RAY_HITS)
  return TERRAIN_RAY_HITS[0]?.point.y ?? fallbackY
}

const getTreeScale = (index, seed = 0) => {
  const randomValue = Math.sin((index + seed + 1) * 12.9898) * 43758.5453
  const normalized = randomValue - Math.floor(randomValue)
  return THREE.MathUtils.lerp(0.7, 1.3, normalized)
}

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
    const x = stone.x + perpendicularX * offset * side
    const z = stone.z + perpendicularZ * offset * side
    const terrainSurfaceY = sampleTerrainSurfaceY(
      SCENE3_TERRAIN_SAMPLE_MESHES,
      x,
      z,
      stone.topY - 0.1,
    )
    const scale = getTreeScale(index)
    return Object.freeze({
      position: [x, terrainSurfaceY - TREE_SURFACE_EMBED, z],
      scale,
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
    const scale = getTreeScale(index, 101)
    const x = side * (4.6 + (index % 4) * 0.85)
    const z = stone.z + Math.sin(index * 1.41) * 1.1
    const terrainSurfaceY = sampleTerrainSurfaceY(
      TRANSITION_TERRAIN_SAMPLE_MESHES,
      x,
      z,
      stone.topY - 0.45,
    )
    return Object.freeze({
      position: [x, terrainSurfaceY - TREE_SURFACE_EMBED, z],
      scale,
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

function ValleyFloor() {
  return (
    <Box
      name="scene3ValleyFloor"
      args={[160, 4, 230]}
      position={[0, VALLEY_FLOOR_TOP_Y - 2, 60]}
      receiveShadow
    >
      <FlatMaterial color="#3F4937" />
    </Box>
  )
}

function TrailFoundations() {
  return (
    <group name="solidTrailFoundations">
      {TRAIL_FOUNDATION_LAYOUT.map((mass, index) => (
        <Dodecahedron
          key={`trail-foundation-${index}`}
          args={[1, 0]}
          position={mass.position}
          scale={mass.scale}
          rotation={mass.rotation}
          castShadow
          receiveShadow
        >
          <FlatMaterial color={mass.color} />
        </Dodecahedron>
      ))}
    </group>
  )
}

function ChasmAndWaterfall() {
  return (
    <group name="waterfallChasm">
      <mesh
        name="chasmWater"
        position={[0, VALLEY_FLOOR_TOP_Y + 0.12, 60]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[22, 190, 2, 8]} />
        <FlatMaterial color="#5BC0BE" side={THREE.DoubleSide} />
      </mesh>

      <Box
        name="waterfall"
        args={[6.2, 56, 0.5]}
        position={[6, -10, 11.8]}
        rotation={[-Math.PI / 4, 0, 0]}
        castShadow
        receiveShadow
      >
        <FlatMaterial color="#5BC0BE" />
      </Box>

      {[-1.6, 0, 1.55].map((streamOffset, index) => (
        <Box
          key={`waterfall-stream-${streamOffset}`}
          name="waterfallFlowStream"
          args={[index === 1 ? 0.72 : 0.46, 54.5, 0.09]}
          position={[6 + streamOffset, -10, 12.18]}
          rotation={[-Math.PI / 4, 0, 0]}
        >
          <FlatMaterial color={index === 1 ? '#FFFFFF' : '#EAFBFF'} />
        </Box>
      ))}

      {Array.from({ length: 12 }, (_, index) => (
        <Box
          key={`waterfall-foam-${index}`}
          args={[0.75 + (index % 3) * 0.24, 0.3, 0.58]}
          position={[
            3.4 + index * 0.66,
            VALLEY_FLOOR_TOP_Y + 0.35 + (index % 2) * 0.13,
            31.4 + Math.sin(index * 1.7) * 0.62,
          ]}
          rotation={[0.04, index * 0.43, 0.05]}
        >
          <FlatMaterial color="#F5F5F5" />
        </Box>
      ))}

      {Array.from({ length: 14 }, (_, index) => (
        <Dodecahedron
          key={`waterfall-foam-rock-${index}`}
          args={[1, 0]}
          position={[
            3.2 + (index % 7) * 0.88,
            VALLEY_FLOOR_TOP_Y + 0.32 + (index % 3) * 0.16,
            30.6 + Math.sin(index * 1.37) * 1.25,
          ]}
          rotation={[index * 0.21, index * 0.47, index * 0.16]}
          scale={[
            0.32 + (index % 3) * 0.13,
            0.2 + (index % 2) * 0.11,
            0.36 + (index % 4) * 0.09,
          ]}
        >
          <FlatMaterial color="#FFFFFF" />
        </Dodecahedron>
      ))}
    </group>
  )
}

function LowPolyPine({ position, scale }) {
  return (
    <group name="lowPolyPine" position={position} scale={scale}>
      <Cylinder
        args={[0.3, 0.3, 2.5, 6]}
        position={[0, -0.25, 0]}
        castShadow
        receiveShadow
      >
        <FlatMaterial color="#6A4632" />
      </Cylinder>
      <Cone
        args={[2, 3, 5]}
        position={[0, 2.25, 0]}
        castShadow
        receiveShadow
      >
        <FlatMaterial color="#2D4C3B" />
      </Cone>
      <Cone
        args={[1.5, 2.5, 5]}
        position={[0, 3.55, 0]}
        castShadow
        receiveShadow
      >
        <FlatMaterial color="#2D4C3B" />
      </Cone>
      <Cone
        args={[1, 2, 5]}
        position={[0, 4.65, 0]}
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
      <group name="organicTransitionHills">
        {TRANSITION_HILL_LAYOUT.map((hill, index) => (
          <Dodecahedron
            key={`transition-hill-${index}`}
            args={[1, 0]}
            position={hill.position}
            rotation={hill.rotation}
            scale={hill.scale}
            castShadow
            receiveShadow
          >
            <LowPolyGrassMaterial />
          </Dodecahedron>
        ))}
      </group>

      <group name="transitionSteppingStones">
        {MOUNTAIN_TRANSITION_STONES.map((stone, index) => (
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
      <ValleyFloor />

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
      <TrailFoundations />

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
