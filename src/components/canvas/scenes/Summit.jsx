import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Cone, Cylinder, Sphere } from '@react-three/drei'
import * as THREE from 'three'

// Summit-local coordinates. With the scene origin at world Z -77, these peaks
// occupy the world-space Z -100…-150 horizon band.
const DISTANT_PEAKS = Object.freeze([
  [-62, -19, -23, 18, 60, '#8FA3B8'],
  [-31, -23, -38, 22, 68, '#8399AE'],
  [0, -20, -50, 21, 64, '#91A6B9'],
  [33, -25, -62, 23, 72, '#7F95AA'],
  [64, -18, -73, 18, 58, '#95A9BA'],
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
  [-34, 24, 16, 1.25, 1.05],
  [-10, 35, -5, 1.6, 0.82],
  [17, 29, -19, 1.35, 0.94],
  [39, 37, 8, 1.5, 0.74],
])

const BIRD_FLOCK = Object.freeze([
  [17, 25, -108, 0.72, 0, 0.16],
  [19, 28, -114, 0.58, 1.05, 0.14],
  [15, 23, -103, 0.64, 2.1, 0.18],
  [21, 30, -118, 0.52, 3.05, 0.13],
  [18, 26, -110, 0.6, 4.2, 0.15],
  [14, 24, -99, 0.5, 5.15, 0.19],
])

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
      transparent={opacity < 1}
      opacity={opacity}
      depthWrite={opacity === 1}
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
          <ClayMaterial color={isNight ? '#4A5258' : color} />
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
        <ClayMaterial color={isNight ? '#515A60' : '#808080'} />
      </Cylinder>
    </group>
  )
}

function CloudBank({ position, scale, isNight, cloudRef }) {
  const color = isNight ? '#D8D9E8' : '#FFFFFF'

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
          <ClayMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isNight ? 0.04 : 0.08}
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
        <group
          ref={(cloud) => {
            cloudRefs.current[cloudIndex] = cloud
          }}
          key={`sky-cloud-${cloudIndex}`}
          position={[x, y, z]}
          scale={scale}
        >
          {[
            [0, 0, 0, 1.8],
            [-1.45, -0.08, 0.12, 1.18],
            [1.5, -0.05, -0.08, 1.3],
            [0.35, 0.7, 0, 1.12],
          ].map(([cx, cy, cz, radius], sphereIndex) => (
            <Sphere
              key={`${cx}-${sphereIndex}`}
              args={[radius, 20, 16]}
              position={[cx, cy, cz]}
              scale={[1.35, 0.72, 0.78]}
              renderOrder={-1}
            >
              <ClayMaterial
                color="#FFFFFF"
                emissive={isNight ? '#C7D2FE' : '#FFFFFF'}
                emissiveIntensity={0.08}
                opacity={0.8}
              />
            </Sphere>
          ))}
        </group>
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

function SummitSunsetLight({ isActive, isNight }) {
  const lightRef = useRef()
  const targetRef = useRef()

  useEffect(() => {
    if (!lightRef.current || !targetRef.current) return
    lightRef.current.target = targetRef.current
  }, [])

  return (
    <>
      <object3D ref={targetRef} position={[0, 1.1, 0]} />
      <directionalLight
        ref={lightRef}
        color="#FF9A62"
        intensity={isActive && !isNight ? 1.65 : 0}
        position={[0, 10, -50]}
        castShadow={isActive && !isNight}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={100}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-bias={-0.0002}
        shadow-normalBias={0.03}
      />
    </>
  )
}

function DistantPeak({ peak, isNight }) {
  const [x, y, z, radius, height, color] = peak

  return (
    <group position={[x, y, z]}>
      <mesh receiveShadow>
        <coneGeometry args={[radius, height, 7]} />
        <ClayMaterial color={isNight ? '#374151' : color} />
      </mesh>
      <Sphere
        args={[1, 18, 14]}
        position={[0, height * 0.31, 0.1]}
        scale={[height * 0.16, height * 0.055, height * 0.12]}
      >
        <ClayMaterial color={isNight ? '#CBD5E1' : '#FFF7F0'} />
      </Sphere>
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
          <meshStandardMaterial
            color={isNight ? '#DDE2F1' : '#FFFFFF'}
            emissive={isNight ? '#A5B4FC' : '#FFFFFF'}
            emissiveIntensity={0.03}
            roughness={1}
            metalness={0}
            transparent
            opacity={0.18}
            depthWrite={false}
          />
        </Sphere>
      ))}
    </group>
  )
}

export default function Summit({
  position = [0, 0, 0],
  isNight = false,
  isActive = false,
}) {
  return (
    <group name="summitScene" position={position}>
      <SummitSunsetLight isActive={isActive} isNight={isNight} />
      <RockyPeak isNight={isNight} />
      <AlpineDecoration />
      <RollingMist isNight={isNight} />

      <SeaOfClouds isNight={isNight} />
      <FloatingSkyClouds isNight={isNight} />
      <BirdFlock />

      <group name="distantMountainSkyline">
        {DISTANT_PEAKS.map((peak, index) => (
          <DistantPeak key={`${peak[0]}-${peak[2]}-${index}`} peak={peak} isNight={isNight} />
        ))}
      </group>

      {!isNight && (
        <Sphere
          name="sunsetSun"
          args={[40, 32, 32]}
          position={[0, 9, -173]}
        >
          <meshStandardMaterial
            color="#FF8C00"
            emissive="#FF8C00"
            emissiveIntensity={2}
            roughness={1}
            metalness={0}
            fog
          />
        </Sphere>
      )}
    </group>
  )
}
