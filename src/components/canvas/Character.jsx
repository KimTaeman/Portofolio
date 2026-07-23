import { forwardRef } from 'react'
import {
  Capsule,
  Cylinder,
  RoundedBox,
  Sphere,
  Torus,
} from '@react-three/drei'

const CHARACTER_COLORS = Object.freeze({
  navy: '#34495E',
  white: '#FFFFFF',
  hair: '#17171D',
  shoes: '#8B5A2B',
  skin: '#F1C6AA',
  eyes: '#302721',
  glasses: '#FFFFFF',
  collar: '#AEC6CF',
  bow: '#FF6B6B',
})

function ClayMaterial({ color }) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={1}
      metalness={0}
    />
  )
}

const Character = forwardRef(function Character(
  {
    partRefs = {},
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    scale = 1,
    ...props
  },
  ref,
) {
  const {
    head,
    torso,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
  } = partRefs
  const colors = CHARACTER_COLORS

  return (
    <group
      ref={ref}
      name="character"
      position={position}
      rotation={rotation}
      scale={scale}
      {...props}
    >
      <group ref={torso} name="torso">
        <Cylinder
          args={[0.16, 0.16, 0.22, 24]}
          position={[0, 2.48, 0]}
          castShadow
          receiveShadow
        >
          <ClayMaterial color={colors.skin} />
        </Cylinder>

        <Capsule
          args={[0.42, 0.18, 8, 20]}
          scale={[1.1, 1, 0.65]}
          position={[0, 2.02, 0]}
          castShadow
          receiveShadow
        >
          <ClayMaterial color={colors.white} />
        </Capsule>

        <RoundedBox
          args={[0.34, 0.1, 0.055]}
          radius={0.035}
          smoothness={3}
          position={[-0.13, 2.27, 0.31]}
          rotation={[0, 0, -0.55]}
          castShadow
        >
          <ClayMaterial color={colors.collar} />
        </RoundedBox>
        <RoundedBox
          args={[0.34, 0.1, 0.055]}
          radius={0.035}
          smoothness={3}
          position={[0.13, 2.27, 0.31]}
          rotation={[0, 0, 0.55]}
          castShadow
        >
          <ClayMaterial color={colors.collar} />
        </RoundedBox>

        <Sphere
          args={[1, 16, 12]}
          scale={[0.13, 0.085, 0.05]}
          position={[-0.09, 2.14, 0.34]}
          castShadow
        >
          <ClayMaterial color={colors.bow} />
        </Sphere>
        <Sphere
          args={[1, 16, 12]}
          scale={[0.13, 0.085, 0.05]}
          position={[0.09, 2.14, 0.34]}
          castShadow
        >
          <ClayMaterial color={colors.bow} />
        </Sphere>
        <Sphere
          args={[0.055, 14, 12]}
          position={[0, 2.14, 0.375]}
          castShadow
        >
          <ClayMaterial color={colors.bow} />
        </Sphere>

        <Cylinder
          args={[0.45, 0.66, 0.76, 32]}
          position={[0, 1.35, 0]}
          castShadow
          receiveShadow
        >
          <ClayMaterial color={colors.navy} />
        </Cylinder>
        <RoundedBox
          args={[0.84, 0.13, 0.46]}
          radius={0.055}
          smoothness={4}
          position={[0, 1.69, 0]}
          castShadow
          receiveShadow
        >
          <ClayMaterial color={colors.navy} />
        </RoundedBox>
      </group>

      <group
        ref={leftArm}
        name="leftArm"
        position={[-0.57, 2.22, 0]}
        rotation={[0, 0, -0.12]}
      >
        <Capsule
          args={[0.15, 0.48, 8, 16]}
          position={[0, -0.33, 0]}
          castShadow
          receiveShadow
        >
          <ClayMaterial color={colors.white} />
        </Capsule>
        <Sphere
          args={[0.17, 20, 16]}
          position={[0, -0.71, 0.02]}
          castShadow
          receiveShadow
        >
          <ClayMaterial color={colors.skin} />
        </Sphere>
      </group>

      <group
        ref={rightArm}
        name="rightArm"
        position={[0.57, 2.22, 0]}
        rotation={[0, 0, 0.12]}
      >
        <Capsule
          args={[0.15, 0.48, 8, 16]}
          position={[0, -0.33, 0]}
          castShadow
          receiveShadow
        >
          <ClayMaterial color={colors.white} />
        </Capsule>
        <Sphere
          args={[0.17, 20, 16]}
          position={[0, -0.71, 0.02]}
          castShadow
          receiveShadow
        >
          <ClayMaterial color={colors.skin} />
        </Sphere>
      </group>

      <group ref={leftLeg} name="leftLeg" position={[-0.24, 1.15, 0]}>
        <Capsule
          args={[0.13, 0.26, 8, 16]}
          position={[0, -0.25, 0]}
          castShadow
          receiveShadow
        >
          <ClayMaterial color={colors.skin} />
        </Capsule>
        <Capsule
          args={[0.14, 0.34, 8, 16]}
          position={[0, -0.65, 0]}
          castShadow
          receiveShadow
        >
          <ClayMaterial color={colors.white} />
        </Capsule>
        <RoundedBox
          args={[0.4, 0.25, 0.64]}
          radius={0.11}
          smoothness={5}
          position={[0, -1, 0.11]}
          castShadow
          receiveShadow
        >
          <ClayMaterial color={colors.shoes} />
        </RoundedBox>
      </group>

      <group ref={rightLeg} name="rightLeg" position={[0.24, 1.15, 0]}>
        <Capsule
          args={[0.13, 0.26, 8, 16]}
          position={[0, -0.25, 0]}
          castShadow
          receiveShadow
        >
          <ClayMaterial color={colors.skin} />
        </Capsule>
        <Capsule
          args={[0.14, 0.34, 8, 16]}
          position={[0, -0.65, 0]}
          castShadow
          receiveShadow
        >
          <ClayMaterial color={colors.white} />
        </Capsule>
        <RoundedBox
          args={[0.4, 0.25, 0.64]}
          radius={0.11}
          smoothness={5}
          position={[0, -1, 0.11]}
          castShadow
          receiveShadow
        >
          <ClayMaterial color={colors.shoes} />
        </RoundedBox>
      </group>

      <group ref={head} name="head" position={[0, 3.04, 0]}>
        <Sphere
          args={[1, 32, 24]}
          scale={[0.82, 0.78, 0.64]}
          position={[0, 0, -0.12]}
          castShadow
          receiveShadow
        >
          <ClayMaterial color={colors.hair} />
        </Sphere>

        <Sphere
          args={[1, 32, 24]}
          scale={[0.69, 0.66, 0.56]}
          position={[0, -0.03, 0.12]}
          castShadow
          receiveShadow
        >
          <ClayMaterial color={colors.skin} />
        </Sphere>

        <Sphere
          args={[0.16, 18, 14]}
          position={[-0.7, -0.02, 0.03]}
          castShadow
        >
          <ClayMaterial color={colors.skin} />
        </Sphere>
        <Sphere
          args={[0.16, 18, 14]}
          position={[0.7, -0.02, 0.03]}
          castShadow
        >
          <ClayMaterial color={colors.skin} />
        </Sphere>

        <Capsule
          args={[0.18, 0.43, 8, 16]}
          position={[-0.61, -0.31, -0.06]}
          rotation={[0, 0, 0.08]}
          castShadow
          receiveShadow
        >
          <ClayMaterial color={colors.hair} />
        </Capsule>
        <Capsule
          args={[0.18, 0.43, 8, 16]}
          position={[0.61, -0.31, -0.06]}
          rotation={[0, 0, -0.08]}
          castShadow
          receiveShadow
        >
          <ClayMaterial color={colors.hair} />
        </Capsule>

        <Sphere
          args={[1, 24, 18]}
          scale={[0.44, 0.24, 0.18]}
          position={[-0.27, 0.43, 0.46]}
          rotation={[0.08, -0.1, -0.3]}
          castShadow
        >
          <ClayMaterial color={colors.hair} />
        </Sphere>
        <Sphere
          args={[1, 24, 18]}
          scale={[0.42, 0.22, 0.17]}
          position={[0.27, 0.44, 0.47]}
          rotation={[0.08, 0.1, 0.32]}
          castShadow
        >
          <ClayMaterial color={colors.hair} />
        </Sphere>

        <Sphere
          args={[1, 20, 16]}
          scale={[0.17, 0.2, 0.055]}
          position={[-0.23, 0.04, 0.65]}
        >
          <ClayMaterial color={colors.white} />
        </Sphere>
        <Sphere
          args={[1, 20, 16]}
          scale={[0.17, 0.2, 0.055]}
          position={[0.23, 0.04, 0.65]}
        >
          <ClayMaterial color={colors.white} />
        </Sphere>
        <Sphere
          args={[1, 18, 14]}
          scale={[0.085, 0.12, 0.04]}
          position={[-0.23, 0.025, 0.705]}
        >
          <ClayMaterial color={colors.eyes} />
        </Sphere>
        <Sphere
          args={[1, 18, 14]}
          scale={[0.085, 0.12, 0.04]}
          position={[0.23, 0.025, 0.705]}
        >
          <ClayMaterial color={colors.eyes} />
        </Sphere>

        <group name="glasses">
          <Torus
            args={[0.2, 0.032, 12, 32]}
            position={[-0.23, 0.04, 0.735]}
          >
            <ClayMaterial color={colors.glasses} />
          </Torus>
          <Torus
            args={[0.2, 0.032, 12, 32]}
            position={[0.23, 0.04, 0.735]}
          >
            <ClayMaterial color={colors.glasses} />
          </Torus>
          <RoundedBox
            args={[0.1, 0.035, 0.035]}
            radius={0.012}
            smoothness={3}
            position={[0, 0.04, 0.735]}
          >
            <ClayMaterial color={colors.glasses} />
          </RoundedBox>
          <RoundedBox
            args={[0.13, 0.035, 0.035]}
            radius={0.012}
            smoothness={3}
            position={[-0.51, 0.08, 0.64]}
            rotation={[0, -0.55, 0]}
          >
            <ClayMaterial color={colors.glasses} />
          </RoundedBox>
          <RoundedBox
            args={[0.13, 0.035, 0.035]}
            radius={0.012}
            smoothness={3}
            position={[0.51, 0.08, 0.64]}
            rotation={[0, 0.55, 0]}
          >
            <ClayMaterial color={colors.glasses} />
          </RoundedBox>
        </group>

        <RoundedBox
          args={[0.13, 0.025, 0.025]}
          radius={0.01}
          smoothness={3}
          position={[0, -0.28, 0.69]}
        >
          <ClayMaterial color={colors.shoes} />
        </RoundedBox>
      </group>
    </group>
  )
})

export default Character
