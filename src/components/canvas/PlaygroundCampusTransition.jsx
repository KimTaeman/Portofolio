import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import * as THREE from 'three'
import useDayNight from '../../hooks/useDayNight'
import { getSceneOneAtmosphereStrength } from '../../config/sceneOneAtmosphere'

const CLOUD_PUFF_COUNT = 38
const WISP_COUNT = 26
const GLITTER_COUNT = 72
const CITY_LIGHT_COUNT = 46
const CLOUD_BANK_POSITION = Object.freeze([-1, 4.1, 3.42])
const CLOUD_BAND_BOTTOM = -10.6
// The upper wisps reach roughly world Y 18.7, leaving a safe buffer beneath
// the playground surface at Y 20 while making the descent feel continuous.
const CLOUD_BAND_TOP = 12.5

const DAY_CLOUD = new THREE.Color('#FFF8EC')
const NIGHT_CLOUD = new THREE.Color('#B9C9EB')
const DAY_GLOW = new THREE.Color('#FFE9B5')
const NIGHT_GLOW = new THREE.Color('#9DB9FF')
const DAY_WISP = new THREE.Color('#FFF4DF')
const NIGHT_WISP = new THREE.Color('#AFC4F2')
const LOCAL_Z_AXIS = new THREE.Vector3(0, 0, 1)

const pseudoRandom = (index, salt) => {
  const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453
  return value - Math.floor(value)
}

const createSoftCloudTexture = () => {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  const puffs = [
    [72, 145, 58],
    [112, 112, 72],
    [160, 132, 66],
    [196, 154, 46],
    [126, 166, 80],
  ]

  puffs.forEach(([x, y, radius]) => {
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius)
    gradient.addColorStop(0, 'rgba(255,255,255,0.82)')
    gradient.addColorStop(0.5, 'rgba(255,248,235,0.46)')
    gradient.addColorStop(1, 'rgba(255,245,224,0)')
    context.fillStyle = gradient
    context.fillRect(0, 0, size, size)
  })

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter
  return texture
}

const createGlowTexture = () => {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.18, 'rgba(255,244,190,0.8)')
  gradient.addColorStop(0.55, 'rgba(255,218,120,0.22)')
  gradient.addColorStop(1, 'rgba(255,210,100,0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, size, size)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

const createLightShaftTexture = () => {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 512
  const context = canvas.getContext('2d')
  const horizontal = context.createLinearGradient(0, 0, 128, 0)
  horizontal.addColorStop(0, 'rgba(255,245,205,0)')
  horizontal.addColorStop(0.5, 'rgba(255,245,205,0.58)')
  horizontal.addColorStop(1, 'rgba(255,245,205,0)')
  context.fillStyle = horizontal
  context.fillRect(0, 0, 128, 512)
  const vertical = context.createLinearGradient(0, 0, 0, 512)
  vertical.addColorStop(0, 'rgba(255,255,255,0.92)')
  vertical.addColorStop(1, 'rgba(255,255,255,0)')
  context.globalCompositeOperation = 'destination-in'
  context.fillStyle = vertical
  context.fillRect(0, 0, 128, 512)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

const createPointPositions = (count, spread, saltOffset = 0) => {
  const positions = new Float32Array(count * 3)
  for (let index = 0; index < count; index += 1) {
    positions[index * 3] = (pseudoRandom(index, 30 + saltOffset) - 0.5) * spread[0]
    positions[index * 3 + 1] =
      (pseudoRandom(index, 31 + saltOffset) - 0.5) * spread[1]
    positions[index * 3 + 2] =
      (pseudoRandom(index, 32 + saltOffset) - 0.5) * spread[2]
  }
  return positions
}

export default function PlaygroundCampusTransition() {
  const { isNightMode } = useDayNight()
  const scroll = useScroll()
  const { camera } = useThree()
  const cloudMeshRef = useRef()
  const cloudMaterialRef = useRef()
  const wispMeshRef = useRef()
  const wispMaterialRef = useRef()
  const shaftGroupRef = useRef()
  const shaftMaterialRefs = useRef([])
  const glitterRef = useRef()
  const glitterMaterialRef = useRef()
  const cityLightsRef = useRef()
  const cityMaterialRef = useRef()
  const localLightRef = useRef()
  const strengthRef = useRef(0)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const spinQuaternion = useMemo(() => new THREE.Quaternion(), [])
  const cloudTexture = useMemo(() => createSoftCloudTexture(), [])
  const glowTexture = useMemo(() => createGlowTexture(), [])
  const shaftTexture = useMemo(() => createLightShaftTexture(), [])
  const glitterPositions = useMemo(
    () => createPointPositions(GLITTER_COUNT, [22, 14, 18], 5),
    [],
  )
  const cityPositions = useMemo(() => {
    const positions = new Float32Array(CITY_LIGHT_COUNT * 3)
    for (let index = 0; index < CITY_LIGHT_COUNT; index += 1) {
      positions[index * 3] = -22 + pseudoRandom(index, 44) * 44
      positions[index * 3 + 1] = pseudoRandom(index, 45) * 2.8
      positions[index * 3 + 2] = (pseudoRandom(index, 46) - 0.5) * 5
    }
    return positions
  }, [])
  const cloudPuffs = useMemo(
    () =>
      Array.from({ length: CLOUD_PUFF_COUNT }, (_, index) => {
        const verticalProgress = (index + 0.5) / CLOUD_PUFF_COUNT
        const upperSpread = THREE.MathUtils.smoothstep(
          verticalProgress,
          0.58,
          1,
        )
        return {
          position: [
            (pseudoRandom(index, 1) - 0.5) *
              THREE.MathUtils.lerp(28, 34, upperSpread),
            THREE.MathUtils.lerp(
              CLOUD_BAND_BOTTOM,
              CLOUD_BAND_TOP,
              verticalProgress,
            ) +
              (pseudoRandom(index, 2) - 0.5) * 0.9,
            (pseudoRandom(index, 3) - 0.5) * 18,
          ],
          scale: [
            2 + pseudoRandom(index, 4) * 2.7,
            0.8 + pseudoRandom(index, 5) * 0.55,
            1.6 + pseudoRandom(index, 6) * 2.1,
          ],
          phase: pseudoRandom(index, 7) * Math.PI * 2,
        }
      }),
    [],
  )
  const wisps = useMemo(
    () =>
      Array.from({ length: WISP_COUNT }, (_, index) => {
        const verticalProgress = (index + 0.5) / WISP_COUNT
        const upperSpread = THREE.MathUtils.smoothstep(
          verticalProgress,
          0.58,
          1,
        )
        return {
          position: [
            (pseudoRandom(index, 11) - 0.5) *
              THREE.MathUtils.lerp(27, 33, upperSpread),
            THREE.MathUtils.lerp(
              CLOUD_BAND_BOTTOM,
              CLOUD_BAND_TOP,
              verticalProgress,
            ) +
              (pseudoRandom(index, 12) - 0.5) * 1.1,
            (pseudoRandom(index, 13) - 0.5) * 23,
          ],
          scale: [
            3.6 + pseudoRandom(index, 14) * 5.6,
            1.8 + pseudoRandom(index, 15) * 2.4,
          ],
          phase: pseudoRandom(index, 16) * Math.PI * 2,
        }
      }),
    [],
  )

  useEffect(() => {
    const cloudMesh = cloudMeshRef.current
    const wispMesh = wispMeshRef.current
    cloudMesh?.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    wispMesh?.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    if (cloudMesh) {
      cloudMesh.boundingBox = new THREE.Box3(
        new THREE.Vector3(-22, -14, -14),
        new THREE.Vector3(22, 16, 14),
      )
      cloudMesh.boundingSphere = new THREE.Sphere(
        new THREE.Vector3(0, 1, 0),
        32,
      )
    }
    if (wispMesh) {
      wispMesh.boundingBox = new THREE.Box3(
        new THREE.Vector3(-24, -15, -15),
        new THREE.Vector3(24, 17, 15),
      )
      wispMesh.boundingSphere = new THREE.Sphere(
        new THREE.Vector3(0, 1, 0),
        35,
      )
    }
    return () => {
      cloudTexture.dispose()
      glowTexture.dispose()
      shaftTexture.dispose()
    }
  }, [cloudTexture, glowTexture, shaftTexture])

  useFrame((state, delta) => {
    const targetStrength = getSceneOneAtmosphereStrength(scroll.offset)
    const strength = THREE.MathUtils.damp(
      strengthRef.current,
      targetStrength,
      9,
      delta,
    )
    strengthRef.current = strength
    const time = state.clock.elapsedTime
    const isActive = strength > 0.003
    const modeStrength = isNightMode ? 1 : 0

    const cloudMesh = cloudMeshRef.current
    const cloudMaterial = cloudMaterialRef.current
    if (cloudMesh && cloudMaterial) {
      cloudMesh.visible = isActive
      cloudMaterial.opacity = strength * 0.13
      cloudMaterial.color.lerp(
        isNightMode ? NIGHT_CLOUD : DAY_CLOUD,
        1 - Math.exp(-delta / 0.5),
      )
      cloudMaterial.emissive.lerp(
        isNightMode ? NIGHT_GLOW : DAY_GLOW,
        1 - Math.exp(-delta / 0.5),
      )

      if (isActive) {
        cloudPuffs.forEach((puff, index) => {
          const breath = 1 + Math.sin(time * 0.18 + puff.phase) * 0.035
          dummy.position.set(
            puff.position[0] + Math.sin(time * 0.06 + puff.phase) * 0.38,
            puff.position[1] + Math.sin(time * 0.1 + puff.phase) * 0.15,
            puff.position[2],
          )
          dummy.rotation.set(0, Math.sin(time * 0.04 + puff.phase) * 0.1, 0)
          dummy.scale.set(
            puff.scale[0] * breath,
            puff.scale[1] * breath,
            puff.scale[2] * breath,
          )
          dummy.updateMatrix()
          cloudMesh.setMatrixAt(index, dummy.matrix)
        })
        cloudMesh.instanceMatrix.needsUpdate = true
      }
    }

    const wispMesh = wispMeshRef.current
    const wispMaterial = wispMaterialRef.current
    if (wispMesh && wispMaterial) {
      wispMesh.visible = isActive
      wispMaterial.opacity = strength * 0.24
      wispMaterial.color.lerp(
        isNightMode ? NIGHT_WISP : DAY_WISP,
        1 - Math.exp(-delta / 0.5),
      )

      if (isActive) {
        wisps.forEach((wisp, index) => {
          dummy.position.set(
            wisp.position[0] + Math.sin(time * 0.05 + wisp.phase) * 0.7,
            wisp.position[1] + Math.cos(time * 0.07 + wisp.phase) * 0.28,
            wisp.position[2],
          )
          dummy.quaternion.copy(camera.quaternion)
          spinQuaternion.setFromAxisAngle(
            LOCAL_Z_AXIS,
            Math.sin(time * 0.06 + wisp.phase) * 0.16,
          )
          dummy.quaternion.multiply(spinQuaternion)
          dummy.scale.set(wisp.scale[0], wisp.scale[1], 1)
          dummy.updateMatrix()
          wispMesh.setMatrixAt(index, dummy.matrix)
        })
        wispMesh.instanceMatrix.needsUpdate = true
      }
    }

    if (shaftGroupRef.current) {
      shaftGroupRef.current.visible = isActive && !isNightMode
      shaftGroupRef.current.position.copy(camera.position)
      shaftGroupRef.current.quaternion.copy(camera.quaternion)
    }
    shaftMaterialRefs.current.forEach((material, index) => {
      if (material) {
        material.opacity = strength * (0.075 - index * 0.012) * (1 - modeStrength)
      }
    })

    if (glitterRef.current && glitterMaterialRef.current) {
      glitterRef.current.visible = isActive && isNightMode
      glitterRef.current.position.x =
        CLOUD_BANK_POSITION[0] + Math.sin(time * 0.11) * 0.8
      glitterRef.current.position.y =
        CLOUD_BANK_POSITION[1] + Math.cos(time * 0.09) * 0.35
      glitterMaterialRef.current.opacity =
        strength * (0.55 + Math.sin(time * 2.4) * 0.2) * modeStrength
    }
    if (cityLightsRef.current && cityMaterialRef.current) {
      cityLightsRef.current.visible = isActive && isNightMode
      cityMaterialRef.current.opacity = strength * 0.22 * modeStrength
    }
    if (localLightRef.current) {
      localLightRef.current.intensity = THREE.MathUtils.damp(
        localLightRef.current.intensity,
        strength * (isNightMode ? 1.8 : 1.3),
        6,
        delta,
      )
      localLightRef.current.color.lerp(
        isNightMode ? NIGHT_GLOW : DAY_GLOW,
        1 - Math.exp(-delta / 0.45),
      )
    }
  })

  return (
    <>
      <instancedMesh
        ref={cloudMeshRef}
        name="sceneOneAtmosphereCloudVolume"
        args={[null, null, CLOUD_PUFF_COUNT]}
        position={CLOUD_BANK_POSITION}
        visible={false}
      >
        <icosahedronGeometry args={[1, 2]} />
        <meshStandardMaterial
          ref={cloudMaterialRef}
          color="#FFF8EC"
          emissive="#FFE9B5"
          emissiveIntensity={0.14}
          roughness={1}
          metalness={0}
          transparent
          opacity={0}
          depthWrite={false}
          flatShading
        />
      </instancedMesh>

      <instancedMesh
        ref={wispMeshRef}
        name="sceneOneLayeredCloudWisps"
        args={[null, null, WISP_COUNT]}
        position={CLOUD_BANK_POSITION}
        visible={false}
        renderOrder={18}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          ref={wispMaterialRef}
          map={cloudTexture}
          color="#FFF4DF"
          transparent
          opacity={0}
          depthWrite={false}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </instancedMesh>

      <group ref={shaftGroupRef} name="sceneOneWarmLightShafts" visible={false}>
        {[
          [-2.7, 1.4, -4.8, -0.34, 2.4, 8.5],
          [0.2, 1.8, -5.5, -0.22, 2, 9.5],
          [2.8, 1, -6.2, -0.12, 1.7, 7.8],
        ].map(([x, y, z, rotationZ, scaleX, scaleY], index) => (
          <mesh
            key={`light-shaft-${index}`}
            position={[x, y, z]}
            rotation={[0, 0, rotationZ]}
            scale={[scaleX, scaleY, 1]}
            renderOrder={40}
          >
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial
              ref={(material) => {
                shaftMaterialRefs.current[index] = material
              }}
              map={shaftTexture}
              color="#FFE8A1"
              transparent
              opacity={0}
              blending={THREE.AdditiveBlending}
              depthTest={false}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>

      <points
        ref={glitterRef}
        name="sceneOneMoonlitGlitter"
        position={CLOUD_BANK_POSITION}
        visible={false}
      >
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[glitterPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={glitterMaterialRef}
          map={glowTexture}
          color="#AFCBFF"
          size={0.42}
          sizeAttenuation
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </points>

      <points
        ref={cityLightsRef}
        name="sceneOneDistantCityGlow"
        position={[-1, -7.8, -42]}
        visible={false}
      >
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[cityPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={cityMaterialRef}
          map={glowTexture}
          color="#FFD58A"
          size={1.15}
          sizeAttenuation
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </points>

      <pointLight
        ref={localLightRef}
        name="sceneOneAtmosphericSunMoonGlow"
        position={[-5, 10, 8]}
        color="#FFE9B5"
        intensity={0}
        distance={46}
        decay={2}
      />
    </>
  )
}
