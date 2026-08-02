import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Cone, Cylinder, Dodecahedron, Sphere } from '@react-three/drei'
import * as THREE from 'three'
import useDayNight from '../../../hooks/useDayNight'

// These summit-local ranges sit between the plateau (world Z -187) and the
// fixed celestial mesh (world Z -1000). Fog progressively softens each band.
const DISTANT_MOUNTAIN_LAYERS = Object.freeze([
  Object.freeze({
    name: 'nearSilhouette',
    z: -118,
    baseY: -38,
    depth: 22,
    dayColor: '#71635E',
    nightColor: '#292A35',
    ridge: Object.freeze([
      [-128, 19],
      [-112, 27],
      [-96, 22],
      [-78, 39],
      [-61, 29],
      [-43, 48],
      [-24, 34],
      [-7, 44],
      [12, 31],
      [31, 52],
      [50, 36],
      [69, 46],
      [88, 28],
      [108, 38],
      [128, 21],
    ]),
  }),
  Object.freeze({
    name: 'middleRoseRange',
    z: -238,
    baseY: -42,
    depth: 30,
    dayColor: '#C79F98',
    nightColor: '#343241',
    ridge: Object.freeze([
      [-145, 30],
      [-123, 47],
      [-101, 35],
      [-78, 61],
      [-55, 45],
      [-32, 70],
      [-9, 50],
      [15, 65],
      [39, 43],
      [63, 74],
      [87, 48],
      [111, 62],
      [132, 39],
      [148, 31],
    ]),
  }),
  Object.freeze({
    name: 'farPeachRange',
    z: -368,
    baseY: -46,
    depth: 38,
    dayColor: '#F0C9C1',
    nightColor: '#272838',
    ridge: Object.freeze([
      [-165, 38],
      [-139, 56],
      [-113, 44],
      [-87, 73],
      [-60, 52],
      [-33, 83],
      [-7, 59],
      [20, 78],
      [48, 55],
      [76, 88],
      [104, 61],
      [132, 74],
      [158, 47],
      [174, 39],
    ]),
  }),
])

const MIST_LAYERS = Object.freeze([
  [-7.5, 0.1, -3.8, 5.2, 0.07, 3.2, 0.32, 0],
  [-3.5, 0.08, 2.8, 4.6, 0.06, 2.8, 0.27, 1.4],
  [0.5, 0.06, -4.5, 5.8, 0.08, 3.5, 0.23, 2.7],
  [4.5, 0.09, 3.5, 4.8, 0.065, 3, 0.2, 4.1],
  [8, 0.07, 0, 5.4, 0.07, 3.3, 0.18, 5.3],
])

const ROCK_MASSES = Object.freeze([
  [0, -0.86, 0, 7.3, 1.08, 6.8, '#747A7D'],
  [-5.1, -1.05, 0.7, 3.8, 1.28, 3.6, '#85898A'],
  [4.8, -1.02, 0.2, 4.1, 1.22, 3.8, '#686F73'],
  [-2.8, -0.98, -4.25, 4.5, 1.18, 3.7, '#8B8E8F'],
  [2.8, -1.06, -4.2, 4.4, 1.3, 3.9, '#70777A'],
  [-2.4, -1.12, 4.2, 4.1, 1.22, 3.6, '#777D80'],
  [2.7, -1.18, 4, 4.3, 1.18, 3.5, '#898D8E'],
])

const CLOUD_BANKS = Object.freeze([
  [-22, -5.2, -5, 1.25],
  [-12, -6.5, -12, 1.5],
  [0, -5.6, -17, 1.65],
  [14, -6.8, -13, 1.35],
  [25, -5.4, -4, 1.55],
  [-27, -8.2, 6, 1.7],
  [-8, -8.7, 4, 1.45],
  [10, -8.4, 2, 1.7],
  [29, -8, 7, 1.35],
])

const ALPINE_GRASS_PATCHES = Object.freeze(
  Array.from({ length: 18 }, (_, index) => {
    const angle = (index / 18) * Math.PI * 2 + (index % 3) * 0.16
    const radius = 4.15 + (index % 4) * 0.42
    return Object.freeze({
      position: [
        Math.cos(angle) * radius,
        0.23 + (index % 2) * 0.025,
        Math.sin(angle) * radius,
      ],
      scale: [
        0.36 + (index % 3) * 0.09,
        0.075,
        0.22 + (index % 2) * 0.07,
      ],
      rotationY: angle + index * 0.37,
    })
  }),
)

const LOOSE_ROCKS = Object.freeze(
  Array.from({ length: 12 }, (_, index) => {
    const angle = (index / 12) * Math.PI * 2 + 0.28
    const radius = 4.5 + (index % 3) * 0.48
    const scale = 0.22 + (index % 4) * 0.075
    return Object.freeze({
      position: [
        Math.cos(angle) * radius,
        0.23 + scale * 0.3,
        Math.sin(angle) * radius,
      ],
      scale,
      rotationY: index * 0.71,
    })
  }),
)

const EDGE_PINES = Object.freeze([
  [-4.7, 0.18, -3.3, 0.72],
  [-2.1, 0.18, -5.05, 0.62],
  [2.25, 0.18, -5.15, 0.68],
  [4.75, 0.18, -3.25, 0.76],
])

const SKY_CLOUDS = Object.freeze([
  [-42, 36, -125, 3.2, 0.42],
  [-16, 47, -172, 3.8, 0.3],
  [21, 40, -143, 3.45, 0.36],
  [44, 51, -205, 4.05, 0.25],
])

const FOREGROUND_PINES = Object.freeze([
  [-9.2, -0.82, -2.7, 1.72],
  [9.35, -0.86, -3.15, 1.82],
  [-10.1, -0.98, 2.1, 1.42],
])

const FOREGROUND_ROCKS = Object.freeze([
  [-8.35, -0.66, 1.25, 2.1, 1.35, 1.7],
  [8.65, -0.72, 1.05, 2.35, 1.48, 1.8],
  [9.8, -0.88, -4.9, 1.65, 1.2, 1.4],
])

const BIRD_FLOCK = Object.freeze([
  [17, 25, -108, 0.72, 0, 0.16],
  [19, 28, -114, 0.58, 1.05, 0.14],
  [15, 23, -103, 0.64, 2.1, 0.18],
  [21, 30, -118, 0.52, 3.05, 0.13],
  [18, 26, -110, 0.6, 4.2, 0.15],
  [14, 24, -99, 0.5, 5.15, 0.19],
])

const createRidgelineGeometry = (ridge, depth) => {
  const positions = []
  const indices = []
  const halfDepth = depth / 2

  ridge.forEach(([x, height], index) => {
    const jitter = ((index * 7) % 5 - 2) * 0.85
    const backHeight = height * (0.9 + (index % 3) * 0.025)

    positions.push(
      x,
      0,
      halfDepth + jitter,
      x,
      height,
      halfDepth * 0.22 + jitter * 0.35,
      x,
      backHeight,
      -halfDepth + jitter * 0.28,
      x,
      0,
      -halfDepth + jitter * 0.42,
    )
  })

  for (let index = 0; index < ridge.length - 1; index += 1) {
    const current = index * 4
    const next = (index + 1) * 4

    // Front slope, back slope, ridge cap, and an unseen floor make each range
    // a proper low-poly volume rather than a camera-facing silhouette.
    indices.push(
      current,
      next,
      next + 1,
      current,
      next + 1,
      current + 1,
      current + 3,
      current + 2,
      next + 2,
      current + 3,
      next + 2,
      next + 3,
      current + 1,
      next + 1,
      next + 2,
      current + 1,
      next + 2,
      current + 2,
      current,
      current + 3,
      next + 3,
      current,
      next + 3,
      next,
    )
  }

  const last = (ridge.length - 1) * 4
  indices.push(
    0,
    1,
    2,
    0,
    2,
    3,
    last,
    last + 2,
    last + 1,
    last,
    last + 3,
    last + 2,
  )

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3),
  )
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  geometry.computeBoundingBox()
  geometry.computeBoundingSphere()
  return geometry
}

const createRiverRibbonGeometry = (curve, segments = 64) => {
  const positions = []
  const indices = []
  const point = new THREE.Vector3()
  const tangent = new THREE.Vector3()
  const side = new THREE.Vector3()

  for (let index = 0; index <= segments; index += 1) {
    const progress = index / segments
    curve.getPoint(progress, point)
    curve.getTangent(progress, tangent)
    side.set(-tangent.z, 0, tangent.x).normalize()

    const halfWidth = THREE.MathUtils.lerp(4.2, 1.5, progress)
    positions.push(
      point.x + side.x * halfWidth,
      point.y,
      point.z + side.z * halfWidth,
      point.x - side.x * halfWidth,
      point.y,
      point.z - side.z * halfWidth,
    )

    if (index < segments) {
      const current = index * 2
      const next = (index + 1) * 2
      indices.push(current, next, next + 1, current, next + 1, current + 1)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3),
  )
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  geometry.computeBoundingBox()
  geometry.computeBoundingSphere()
  return geometry
}

function ClayMaterial({
  color,
  emissive = '#000000',
  emissiveIntensity = 0,
  opacity = 1,
}) {
  return (
    <meshStandardMaterial
      color={color}
      emissive={emissive}
      emissiveIntensity={emissiveIntensity}
      roughness={1}
      metalness={0}
      flatShading
      transparent={opacity < 1}
      opacity={opacity}
      depthWrite={opacity === 1}
    />
  )
}

function AnimatedClayMaterial({ isNight, dayColor, nightColor }) {
  const materialRef = useRef()
  const dayColorRef = useRef(new THREE.Color(dayColor))
  const nightColorRef = useRef(new THREE.Color(nightColor))

  useFrame((_, delta) => {
    materialRef.current?.color.lerp(
      isNight ? nightColorRef.current : dayColorRef.current,
      1 - Math.exp(-delta / 0.65),
    )
  })

  return (
    <meshStandardMaterial
      ref={materialRef}
      color={dayColor}
      roughness={1}
      metalness={0}
      flatShading
    />
  )
}

function AnimatedAtmosphereMaterial({
  isNight,
  dayColor = '#FFFFFF',
  nightColor = '#AAB7D1',
  dayEmissive = '#FFFFFF',
  nightEmissive = '#8CA8FF',
  dayEmissiveIntensity = 0.06,
  nightEmissiveIntensity = 0.1,
  opacity,
}) {
  const materialRef = useRef()
  const dayColorRef = useRef(new THREE.Color(dayColor))
  const nightColorRef = useRef(new THREE.Color(nightColor))
  const dayEmissiveRef = useRef(new THREE.Color(dayEmissive))
  const nightEmissiveRef = useRef(new THREE.Color(nightEmissive))

  useFrame((_, delta) => {
    const alpha = 1 - Math.exp(-delta / 0.65)
    if (!materialRef.current) return
    materialRef.current.color.lerp(
      isNight ? nightColorRef.current : dayColorRef.current,
      alpha,
    )
    materialRef.current.emissive.lerp(
      isNight ? nightEmissiveRef.current : dayEmissiveRef.current,
      alpha,
    )
    materialRef.current.emissiveIntensity = THREE.MathUtils.damp(
      materialRef.current.emissiveIntensity,
      isNight ? nightEmissiveIntensity : dayEmissiveIntensity,
      2.4,
      delta,
    )
  })

  return (
    <meshStandardMaterial
      ref={materialRef}
      color={dayColor}
      emissive={dayEmissive}
      emissiveIntensity={dayEmissiveIntensity}
      roughness={1}
      metalness={0}
      flatShading
      transparent
      opacity={opacity}
      depthWrite={false}
    />
  )
}

function RockyPeak({ isNight }) {
  return (
    <group name="rockySummitPeak">
      {ROCK_MASSES.map(([x, y, z, sx, sy, sz, color], index) => (
        <Sphere
          key={`${x}-${z}-${index}`}
          args={[1, 28, 22]}
          position={[x, y, z]}
          scale={[sx, sy, sz]}
          rotation={[0.03 * (index % 2), index * 0.31, -0.025]}
          castShadow
          receiveShadow
        >
          <AnimatedClayMaterial
            isNight={isNight}
            dayColor={color}
            nightColor="#4A5258"
          />
        </Sphere>
      ))}

      {/* A recessed support keeps the walkable crown reliable while the
          overlapping spheres provide the visible irregular silhouette. */}
      <Cylinder
        name="summitWalkableCrown"
        args={[5.9, 6.45, 0.5, 48]}
        position={[0, -0.1, 0]}
        receiveShadow
      >
        <AnimatedClayMaterial
          isNight={isNight}
          dayColor="#808080"
          nightColor="#515A60"
        />
      </Cylinder>
    </group>
  )
}

function CloudBank({ position, scale, isNight, cloudRef }) {
  return (
    <group ref={cloudRef} name="cloudBank" position={position} scale={scale}>
      {[
        [0, 0, 0, 3.8, 0.82, 2.15],
        [-3.2, -0.08, 0.25, 3, 0.66, 1.9],
        [3.35, 0.02, -0.1, 3.3, 0.72, 2],
        [-1.2, 0.42, -0.18, 2.65, 0.7, 1.7],
        [1.55, 0.38, 0.1, 2.8, 0.68, 1.75],
      ].map(([x, y, z, sx, sy, sz], index) => (
        <Sphere
          key={`${x}-${z}-${index}`}
          args={[1, 20, 16]}
          position={[x, y, z]}
          scale={[sx, sy, sz]}
          renderOrder={-1}
        >
          <AnimatedAtmosphereMaterial
            isNight={isNight}
            nightColor="#AAB7D1"
            nightEmissive="#8CA8FF"
            dayEmissiveIntensity={0.08}
            nightEmissiveIntensity={0.12}
            opacity={0.6}
          />
        </Sphere>
      ))}
    </group>
  )
}

function SeaOfClouds({ isNight }) {
  const cloudRefs = useRef([])

  useFrame((state) => {
    const time = state.clock.elapsedTime
    cloudRefs.current.forEach((cloud, index) => {
      if (!cloud) return
      const [baseX] = CLOUD_BANKS[index]
      cloud.position.x =
        baseX + Math.sin(time * (0.035 + index * 0.004) + index * 1.7) * 3.4
    })
  })

  return (
    <group name="seaOfClouds">
      {CLOUD_BANKS.map(([x, y, z, scale], index) => (
        <CloudBank
          key={`${x}-${z}-${index}`}
          cloudRef={(cloud) => {
            cloudRefs.current[index] = cloud
          }}
          position={[x, y, z]}
          scale={scale}
          isNight={isNight}
        />
      ))}
    </group>
  )
}

function CloudCluster({ cloudRef, position, scale, isNight }) {
  return (
    <group ref={cloudRef} name="lowPolyCloudCluster" position={position} scale={scale}>
      {[
        [0, 0, 0, 1.45, 0.72, 0.82],
        [-1.1, -0.08, 0.1, 1.05, 0.58, 0.68],
        [1.18, -0.04, -0.08, 1.12, 0.62, 0.72],
        [-0.3, 0.62, -0.06, 0.92, 0.7, 0.66],
        [0.62, 0.45, 0.08, 0.86, 0.64, 0.62],
      ].map(([x, y, z, sx, sy, sz], index) => (
        <Dodecahedron
          key={`${x}-${z}-${index}`}
          args={[1, 0]}
          position={[x, y, z]}
          scale={[sx, sy, sz]}
          rotation={[index * 0.09, index * 0.28, -index * 0.04]}
        >
          <AnimatedAtmosphereMaterial
            isNight={isNight}
            dayColor="#FFF5E6"
            nightColor="#AAB7D1"
            dayEmissive="#FFF5E6"
            nightEmissive="#8CA8FF"
            dayEmissiveIntensity={0.06}
            nightEmissiveIntensity={0.1}
            opacity={0.88}
          />
        </Dodecahedron>
      ))}
    </group>
  )
}

function FloatingSkyClouds({ isNight }) {
  const cloudRefs = useRef([])

  useFrame((state, delta) => {
    cloudRefs.current.forEach((cloud, index) => {
      if (!cloud) return
      const speed = SKY_CLOUDS[index][4]
      cloud.position.x += speed * delta
      if (cloud.position.x > 58) cloud.position.x = -58
    })
  })

  return (
    <group name="floatingSkyClouds">
      {SKY_CLOUDS.map(([x, y, z, scale], cloudIndex) => (
        <CloudCluster
          cloudRef={(cloud) => {
            cloudRefs.current[cloudIndex] = cloud
          }}
          key={`sky-cloud-${cloudIndex}`}
          position={[x, y, z]}
          scale={scale}
          isNight={isNight}
        />
      ))}
    </group>
  )
}

function BirdFlock() {
  const leftWingsRef = useRef()
  const rightWingsRef = useRef()
  const leftWingDummyRef = useRef(new THREE.Object3D())
  const rightWingDummyRef = useRef(new THREE.Object3D())

  useEffect(() => {
    if (leftWingsRef.current) {
      leftWingsRef.current.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    }
    if (rightWingsRef.current) {
      rightWingsRef.current.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    }
  }, [])

  useFrame((state) => {
    const time = state.clock.elapsedTime
    const leftWing = leftWingDummyRef.current
    const rightWing = rightWingDummyRef.current

    BIRD_FLOCK.forEach(
      ([radius, baseY, centerZ, scale, phase, orbitSpeed], index) => {
        const angle = time * orbitSpeed + phase
        const heading = -angle
        const centerX = Math.cos(angle) * radius
        const centerY = baseY + Math.sin(time * 0.72 + phase) * 1.1
        const centerBirdZ = centerZ + Math.sin(angle) * radius * 0.48
        const separation = 0.38 * scale
        const rightX = Math.cos(heading)
        const rightZ = -Math.sin(heading)
        const flap = Math.sin(time * 8.5 + phase * 2) * 0.52

        leftWing.position.set(
          centerX - rightX * separation,
          centerY,
          centerBirdZ - rightZ * separation,
        )
        leftWing.rotation.set(flap, heading, 0.4)
        leftWing.scale.setScalar(scale)
        leftWing.updateMatrix()
        leftWingsRef.current?.setMatrixAt(index, leftWing.matrix)

        rightWing.position.set(
          centerX + rightX * separation,
          centerY,
          centerBirdZ + rightZ * separation,
        )
        rightWing.rotation.set(-flap, heading, -0.4)
        rightWing.scale.setScalar(scale)
        rightWing.updateMatrix()
        rightWingsRef.current?.setMatrixAt(index, rightWing.matrix)
      },
    )

    if (leftWingsRef.current) {
      leftWingsRef.current.instanceMatrix.needsUpdate = true
    }
    if (rightWingsRef.current) {
      rightWingsRef.current.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <group name="circlingSummitBirdFlock">
      <instancedMesh
        ref={leftWingsRef}
        args={[undefined, undefined, BIRD_FLOCK.length]}
        frustumCulled={false}
      >
        <boxGeometry args={[0.9, 0.08, 0.24]} />
        <meshStandardMaterial
          color="#111111"
          roughness={1}
          metalness={0}
          flatShading
        />
      </instancedMesh>
      <instancedMesh
        ref={rightWingsRef}
        args={[undefined, undefined, BIRD_FLOCK.length]}
        frustumCulled={false}
      >
        <boxGeometry args={[0.9, 0.08, 0.24]} />
        <meshStandardMaterial
          color="#111111"
          roughness={1}
          metalness={0}
          flatShading
        />
      </instancedMesh>
    </group>
  )
}

function AlpinePine({ position, scale }) {
  return (
    <group name="summitPine" position={position} scale={scale}>
      <Cylinder
        args={[0.12, 0.18, 1.05, 14]}
        position={[0, 0.52, 0]}
        castShadow
        receiveShadow
      >
        <ClayMaterial color="#6B4B35" />
      </Cylinder>
      {[
        [0.72, 1.05, 1.18],
        [0.58, 0.92, 1.62],
        [0.43, 0.76, 2.02],
      ].map(([radius, height, y], index) => (
        <Cone
          key={`${radius}-${y}`}
          args={[radius, height, 20]}
          position={[0, y, 0]}
          rotation={[0, index * 0.24, 0]}
          castShadow
          receiveShadow
        >
          <ClayMaterial color="#2D4C3B" />
        </Cone>
      ))}
    </group>
  )
}

function AlpineDecoration() {
  return (
    <group name="alpineSummitDecoration">
      {ALPINE_GRASS_PATCHES.map((patch, index) => (
        <Sphere
          key={`grass-${index}`}
          args={[1, 16, 12]}
          position={patch.position}
          scale={patch.scale}
          rotation={[0, patch.rotationY, 0]}
          receiveShadow
        >
          <ClayMaterial color="#6B8E23" />
        </Sphere>
      ))}

      {LOOSE_ROCKS.map((rock, index) => (
        <Sphere
          key={`loose-rock-${index}`}
          args={[1, 16, 12]}
          position={rock.position}
          scale={[rock.scale * 1.2, rock.scale * 0.72, rock.scale]}
          rotation={[0.08, rock.rotationY, -0.06]}
          castShadow
          receiveShadow
        >
          <ClayMaterial color={index % 2 ? '#9A9A9A' : '#73797C'} />
        </Sphere>
      ))}

      {EDGE_PINES.map(([x, y, z, scale], index) => (
        <AlpinePine
          key={`edge-pine-${index}`}
          position={[x, y, z]}
          scale={scale}
        />
      ))}
    </group>
  )
}

function MountainRangeLayer({ layer, isNight }) {
  const geometry = useMemo(
    () => createRidgelineGeometry(layer.ridge, layer.depth),
    [layer],
  )

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <mesh
      name={layer.name}
      geometry={geometry}
      position={[0, layer.baseY, layer.z]}
      receiveShadow
    >
      <AnimatedClayMaterial
        isNight={isNight}
        dayColor={layer.dayColor}
        nightColor={layer.nightColor}
      />
    </mesh>
  )
}

function ValleyFloorAndRiver({ isNight }) {
  const riverCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-22, 0.2, -8),
        new THREE.Vector3(-30, -0.1, -48),
        new THREE.Vector3(-8, 0.14, -88),
        new THREE.Vector3(22, -0.08, -128),
        new THREE.Vector3(-4, 0.12, -172),
        new THREE.Vector3(28, -0.12, -226),
      ]),
    [],
  )
  const riverGeometry = useMemo(
    () => createRiverRibbonGeometry(riverCurve),
    [riverCurve],
  )

  useEffect(() => () => riverGeometry.dispose(), [riverGeometry])

  return (
    <group name="distantValley">
      <mesh
        name="lowPolyValleyFloor"
        position={[0, -38, -120]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[190, 300, 1, 1]} />
        <AnimatedClayMaterial
          isNight={isNight}
          dayColor="#536F4A"
          nightColor="#25372F"
        />
      </mesh>

      <mesh
        name="windingValleyRiver"
        geometry={riverGeometry}
        position={[0, -37.92, 0]}
        receiveShadow
      >
        <ClayMaterial
          color="#43C6CE"
          emissive="#167D86"
          emissiveIntensity={0.18}
        />
      </mesh>
    </group>
  )
}

function ForegroundVistaFrame() {
  return (
    <group name="summitForegroundFrame">
      {FOREGROUND_PINES.map(([x, y, z, scale], index) => (
        <AlpinePine
          key={`foreground-pine-${index}`}
          position={[x, y, z]}
          scale={scale}
        />
      ))}

      {FOREGROUND_ROCKS.map(([x, y, z, sx, sy, sz], index) => (
        <Dodecahedron
          key={`foreground-rock-${index}`}
          args={[1, 0]}
          position={[x, y, z]}
          scale={[sx, sy, sz]}
          rotation={[0.08 + index * 0.04, index * 0.7, -0.09]}
          castShadow
          receiveShadow
        >
          <ClayMaterial color={index % 2 ? '#777D80' : '#666D71'} />
        </Dodecahedron>
      ))}
    </group>
  )
}

function RollingMist({ isNight }) {
  const mistRefs = useRef([])

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime

    MIST_LAYERS.forEach(([, , baseZ, scaleX, , , speed, phase], index) => {
      const mist = mistRefs.current[index]
      if (!mist) return

      mist.position.x += speed * delta
      if (mist.position.x > 12 + scaleX) {
        mist.position.x = -12 - scaleX
      }
      mist.position.z = baseZ + Math.sin(time * 0.08 + phase) * 1.1
      mist.rotation.y = Math.sin(time * 0.055 + phase) * 0.1
    })
  })

  return (
    <group name="rollingSummitMist">
      {MIST_LAYERS.map(([x, y, z, sx, sy, sz], index) => (
        <Sphere
          ref={(mesh) => {
            mistRefs.current[index] = mesh
          }}
          key={`${x}-${z}-${index}`}
          args={[1, 20, 12]}
          position={[x, y, z]}
          scale={[sx, sy, sz]}
          renderOrder={-2}
        >
          <AnimatedAtmosphereMaterial
            isNight={isNight}
            nightColor="#AAB7D1"
            nightEmissive="#8CA8FF"
            dayEmissiveIntensity={0.03}
            nightEmissiveIntensity={0.1}
            opacity={0.18}
          />
        </Sphere>
      ))}
    </group>
  )
}

export default function Summit({
  position = [0, 0, 0],
}) {
  const { isNightMode: isNight } = useDayNight()

  return (
    <group name="summitScene" position={position}>
      <RockyPeak isNight={isNight} />
      <AlpineDecoration />
      <ForegroundVistaFrame />
      <RollingMist isNight={isNight} />

      <ValleyFloorAndRiver isNight={isNight} />
      <SeaOfClouds isNight={isNight} />
      <FloatingSkyClouds isNight={isNight} />
      <BirdFlock />

      <group name="distantMountainSkyline">
        {DISTANT_MOUNTAIN_LAYERS.map((layer) => (
          <MountainRangeLayer
            key={layer.name}
            layer={layer}
            isNight={isNight}
          />
        ))}
      </group>

    </group>
  )
}
