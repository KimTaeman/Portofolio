import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import * as THREE from 'three'
import useDayNight from '../../hooks/useDayNight'
import { getSceneOneAtmosphereStrength } from '../../config/sceneOneAtmosphere'

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
  transitionFog: new THREE.Color('#FFF0DE'),
})

const NIGHT = Object.freeze({
  sky: new THREE.Color('#0B0D17'),
  directional: new THREE.Color('#8CA8FF'),
  directionalIntensity: 1,
  ambient: new THREE.Color('#2B2B4A'),
  ambientIntensity: 0.8,
  hemisphereSky: new THREE.Color('#8CA8FF'),
  hemisphereGround: new THREE.Color('#232740'),
  hemisphereIntensity: 0.6,
  celestial: new THREE.Color('#E5EDFF'),
  celestialGlow: new THREE.Color('#B8CBFF'),
  halo: new THREE.Color('#B8CBFF'),
  transitionFog: new THREE.Color('#111735'),
})

const lightOffset = new THREE.Vector3(10, 14, 8)
const CELESTIAL_POSITION = Object.freeze([80, 90, -1000])
const GLOBAL_STARFIELD_POSITION = Object.freeze([10, 40, -90])
const INACTIVE_FOG_NEAR = 1990
const INACTIVE_FOG_FAR = 2000
const TRANSITION_FOG_NEAR = 5
const TRANSITION_FOG_FAR = 46
// A damping factor of 2 reaches about 95% of the target after 1.5 seconds.
const THEME_DAMPING = 2

const dampColor = (current, target, delta) => {
  current.r = THREE.MathUtils.damp(
    current.r,
    target.r,
    THEME_DAMPING,
    delta,
  )
  current.g = THREE.MathUtils.damp(
    current.g,
    target.g,
    THEME_DAMPING,
    delta,
  )
  current.b = THREE.MathUtils.damp(
    current.b,
    target.b,
    THEME_DAMPING,
    delta,
  )
}

const dampUniform = (uniform, target, delta) => {
  uniform.value = THREE.MathUtils.damp(
    uniform.value,
    target,
    THEME_DAMPING,
    delta,
  )
}

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

function GlobalNightStarfield({ starfieldRef }) {
  return (
    <Stars
      ref={starfieldRef}
      name="globalStationaryNightStarfield"
      position={GLOBAL_STARFIELD_POSITION}
      count={2200}
      depth={180}
      factor={1.35}
      fade
      radius={650}
      saturation={0.08}
      speed={0.08}
      visible={false}
    />
  )
}

export default function GlobalSceneEnvironment({ scrollOffset = 0 }) {
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
  const starsRef = useRef()
  const fogStrengthRef = useRef(0)
  const fogTargetColorRef = useRef(new THREE.Color('#FFF0E5'))
  const haloTexture = useMemo(() => createHaloTexture(), [])

  useEffect(() => {
    if (directionalRef.current && directionalTargetRef.current) {
      directionalRef.current.target = directionalTargetRef.current
    }
  }, [])

  useEffect(() => () => haloTexture.dispose(), [haloTexture])

  useLayoutEffect(() => {
    const material = starsRef.current?.material
    if (!material || material.uniforms.nightOpacity) return

    // Drei's Stars shader has no public opacity uniform. Add one once so the
    // field can stay mounted and cross-fade without rebuilding its geometry.
    material.uniforms.nightOpacity = { value: 0 }
    material.fragmentShader = material.fragmentShader
      .replace(
        'uniform float fade;',
        'uniform float fade;\nuniform float nightOpacity;',
      )
      .replace(
        'gl_FragColor = vec4(vColor, opacity);',
        'gl_FragColor = vec4(vColor, opacity * nightOpacity);',
      )
    material.needsUpdate = true
  }, [])

  useFrame((_, delta) => {
    const target = isNightMode ? NIGHT : DAY

    if (backgroundRef.current) {
      dampColor(backgroundRef.current, target.sky, delta)
    }
    if (fogRef.current) {
      fogStrengthRef.current = THREE.MathUtils.damp(
        fogStrengthRef.current,
        getSceneOneAtmosphereStrength(scrollOffset),
        8,
        delta,
      )
      fogTargetColorRef.current
        .copy(target.sky)
        .lerp(target.transitionFog, fogStrengthRef.current)
      dampColor(fogRef.current.color, fogTargetColorRef.current, delta)
      fogRef.current.near = THREE.MathUtils.lerp(
        INACTIVE_FOG_NEAR,
        TRANSITION_FOG_NEAR,
        fogStrengthRef.current,
      )
      fogRef.current.far = THREE.MathUtils.lerp(
        INACTIVE_FOG_FAR,
        TRANSITION_FOG_FAR,
        fogStrengthRef.current,
      )
    }
    if (ambientRef.current) {
      dampColor(ambientRef.current.color, target.ambient, delta)
      ambientRef.current.intensity = THREE.MathUtils.damp(
        ambientRef.current.intensity,
        target.ambientIntensity,
        THEME_DAMPING,
        delta,
      )
    }

    if (hemisphereRef.current) {
      dampColor(hemisphereRef.current.color, target.hemisphereSky, delta)
      dampColor(
        hemisphereRef.current.groundColor,
        target.hemisphereGround,
        delta,
      )
      hemisphereRef.current.intensity = THREE.MathUtils.damp(
        hemisphereRef.current.intensity,
        target.hemisphereIntensity,
        THEME_DAMPING,
        delta,
      )
    }

    if (directionalRef.current) {
      dampColor(directionalRef.current.color, target.directional, delta)
      directionalRef.current.intensity = THREE.MathUtils.damp(
        directionalRef.current.intensity,
        target.directionalIntensity,
        THEME_DAMPING,
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
      dampColor(celestialMaterialRef.current.color, target.celestial, delta)
      dampColor(
        celestialMaterialRef.current.emissive,
        target.celestialGlow,
        delta,
      )
    }

    if (haloMaterialRef.current) {
      dampColor(haloMaterialRef.current.color, target.halo, delta)
    }

    const stars = starsRef.current
    const starOpacity = stars?.material?.uniforms?.nightOpacity
    if (stars && starOpacity) {
      dampUniform(starOpacity, isNightMode ? 0.52 : 0, delta)
      stars.visible = starOpacity.value > 0.001
    }
  })

  return (
    <>
      <color ref={backgroundRef} attach="background" args={['#FFF0E5']} />
      <fog
        ref={fogRef}
        attach="fog"
        args={['#FFF0E5', INACTIVE_FOG_NEAR, INACTIVE_FOG_FAR]}
      />
      <ambientLight ref={ambientRef} color="#FFEDD9" intensity={0.8} />
      <hemisphereLight
        ref={hemisphereRef}
        color="#FFFFFF"
        groundColor="#8A817A"
        intensity={0.6}
      />
      <GlobalNightStarfield starfieldRef={starsRef} />
      <object3D ref={directionalTargetRef} />
      <directionalLight
        ref={directionalRef}
        color="#FFF5E6"
        intensity={1.2}
        position={[10, 14, 8]}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={70}
        shadow-camera-left={-24}
        shadow-camera-right={24}
        shadow-camera-top={24}
        shadow-camera-bottom={-24}
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
