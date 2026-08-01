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
  universityNavy: '#111111',
  belt: '#1A1A1A',
  buckle: '#C0C0C0',
  sneakers: '#FAFAFA',
  sneakerSole: '#E8E8E8',
  white: '#FFFFFF',
  hair: '#17171D',
  shoes: '#8B5A2B',
  skin: '#F1C6AA',
  eyes: '#302721',
  glasses: '#FFFFFF',
  collar: '#AEC6CF',
  bow: '#FF6B6B',
  hikerOrange: '#FFB380',
  hikerTan: '#D2B48C',
  backpack: '#77DD77',
  backpackFlap: '#FDF6E3',
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

function SchoolArm({ armRef, name, position, rotation, colors }) {
  return (
    <group ref={armRef} name={name} position={position} rotation={rotation}>
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
  )
}

function SchoolLeg({ legRef, name, position, colors }) {
  return (
    <group ref={legRef} name={name} position={position}>
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
  )
}

function SchoolUniform({ partRefs, colors }) {
  const { torso, leftArm, rightArm, leftLeg, rightLeg } = partRefs

  return (
    <group name="schoolUniform">
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

      <SchoolArm
        armRef={leftArm}
        name="leftArm"
        position={[-0.57, 2.22, 0]}
        rotation={[0, 0, -0.12]}
        colors={colors}
      />
      <SchoolArm
        armRef={rightArm}
        name="rightArm"
        position={[0.57, 2.22, 0]}
        rotation={[0, 0, 0.12]}
        colors={colors}
      />
      <SchoolLeg
        legRef={leftLeg}
        name="leftLeg"
        position={[-0.24, 1.15, 0]}
        colors={colors}
      />
      <SchoolLeg
        legRef={rightLeg}
        name="rightLeg"
        position={[0.24, 1.15, 0]}
        colors={colors}
      />
    </group>
  )
}

function UniversityArm({ armRef, name, position, rotation, colors }) {
  return (
    <group ref={armRef} name={name} position={position} rotation={rotation}>
      <Capsule
        args={[0.16, 0.14, 8, 16]}
        position={[0, -0.14, 0]}
        castShadow
        receiveShadow
      >
        <ClayMaterial color={colors.white} />
      </Capsule>
      <Capsule
        args={[0.135, 0.26, 8, 16]}
        position={[0, -0.47, 0]}
        castShadow
        receiveShadow
      >
        <ClayMaterial color={colors.skin} />
      </Capsule>
      <Sphere
        args={[0.16, 20, 16]}
        position={[0, -0.72, 0.02]}
        castShadow
        receiveShadow
      >
        <ClayMaterial color={colors.skin} />
      </Sphere>
    </group>
  )
}

function UniversityLeg({ legRef, name, position, colors }) {
  return (
    <group ref={legRef} name={name} position={position}>
      <Capsule
        args={[0.135, 0.45, 8, 16]}
        position={[0, -0.42, 0]}
        castShadow
        receiveShadow
      >
        <ClayMaterial color={colors.skin} />
      </Capsule>
      <Capsule
        args={[0.14, 0.13, 8, 16]}
        position={[0, -0.76, 0]}
        castShadow
        receiveShadow
      >
        <ClayMaterial color={colors.white} />
      </Capsule>
      <RoundedBox
        args={[0.42, 0.25, 0.68]}
        radius={0.12}
        smoothness={5}
        position={[0, -1, 0.13]}
        castShadow
        receiveShadow
      >
        <ClayMaterial color={colors.sneakers} />
      </RoundedBox>
      <RoundedBox
        args={[0.43, 0.075, 0.7]}
        radius={0.03}
        smoothness={4}
        position={[0, -1.1, 0.13]}
        castShadow
        receiveShadow
      >
        <ClayMaterial color={colors.sneakerSole} />
      </RoundedBox>
    </group>
  )
}

function UniversityUniform({ partRefs, colors }) {
  const { torso, leftArm, rightArm, leftLeg, rightLeg } = partRefs

  return (
    <group name="universityUniform">
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

        {[2.2, 2.05, 1.9].map((buttonY) => (
          <Sphere
            key={buttonY}
            args={[0.035, 12, 10]}
            position={[0, buttonY, 0.31]}
            castShadow
          >
            <ClayMaterial color={colors.buckle} />
          </Sphere>
        ))}

        <Cylinder
          args={[0.47, 0.49, 0.085, 32]}
          position={[0, 1.69, 0]}
          castShadow
          receiveShadow
        >
          <ClayMaterial color={colors.belt} />
        </Cylinder>
        <RoundedBox
          args={[0.17, 0.12, 0.075]}
          radius={0.025}
          smoothness={4}
          position={[0, 1.69, 0.5]}
          castShadow
        >
          <ClayMaterial color={colors.buckle} />
        </RoundedBox>

        <Cylinder
          args={[0.45, 0.66, 0.76, 32]}
          position={[0, 1.34, 0]}
          castShadow
          receiveShadow
        >
          <ClayMaterial color={colors.universityNavy} />
        </Cylinder>
      </group>

      <UniversityArm
        armRef={leftArm}
        name="leftArm"
        position={[-0.57, 2.22, 0]}
        rotation={[0, 0, -0.12]}
        colors={colors}
      />
      <UniversityArm
        armRef={rightArm}
        name="rightArm"
        position={[0.57, 2.22, 0]}
        rotation={[0, 0, 0.12]}
        colors={colors}
      />
      <UniversityLeg
        legRef={leftLeg}
        name="leftLeg"
        position={[-0.24, 1.15, 0]}
        colors={colors}
      />
      <UniversityLeg
        legRef={rightLeg}
        name="rightLeg"
        position={[0.24, 1.15, 0]}
        colors={colors}
      />
    </group>
  )
}

function HikerArm({
  armRef,
  forearmRef,
  name,
  position,
  rotation,
  colors,
}) {
  return (
    <group ref={armRef} name={name} position={position} rotation={rotation}>
      <Capsule
        args={[0.17, 0.15, 8, 16]}
        position={[0, -0.14, 0]}
        castShadow
        receiveShadow
      >
        <ClayMaterial color={colors.hikerOrange} />
      </Capsule>
      <group ref={forearmRef} name={`${name}Forearm`} position={[0, -0.32, 0]}>
        <Capsule
          args={[0.14, 0.28, 8, 16]}
          position={[0, -0.16, 0]}
          castShadow
          receiveShadow
        >
          <ClayMaterial color={colors.skin} />
        </Capsule>
        <Sphere
          args={[0.16, 20, 16]}
          position={[0, -0.41, 0.02]}
          castShadow
          receiveShadow
        >
          <ClayMaterial color={colors.skin} />
        </Sphere>
      </group>
    </group>
  )
}

function HikerLeg({ legRef, name, position, colors }) {
  return (
    <group ref={legRef} name={name} position={position}>
      <Cylinder
        args={[0.22, 0.2, 0.42, 24]}
        position={[0, -0.18, 0]}
        castShadow
        receiveShadow
      >
        <ClayMaterial color={colors.hikerTan} />
      </Cylinder>
      <Capsule
        args={[0.14, 0.28, 8, 16]}
        position={[0, -0.52, 0]}
        castShadow
        receiveShadow
      >
        <ClayMaterial color={colors.skin} />
      </Capsule>
      <RoundedBox
        args={[0.45, 0.34, 0.72]}
        radius={0.13}
        smoothness={5}
        position={[0, -0.91, 0.14]}
        castShadow
        receiveShadow
      >
        <ClayMaterial color={colors.shoes} />
      </RoundedBox>
      <RoundedBox
        args={[0.46, 0.1, 0.74]}
        radius={0.04}
        smoothness={4}
        position={[0, -1.08, 0.14]}
        castShadow
        receiveShadow
      >
        <ClayMaterial color={colors.belt} />
      </RoundedBox>
    </group>
  )
}

function HikerUniform({ partRefs, colors }) {
  const { torso, leftArm, rightArm, rightForearm, leftLeg, rightLeg } = partRefs

  return (
    <group name="hikerUniform">
      <group ref={torso} name="torso">
        <Cylinder
          args={[0.16, 0.16, 0.22, 24]}
          position={[0, 2.48, 0]}
          castShadow
          receiveShadow
        >
          <ClayMaterial color={colors.skin} />
        </Cylinder>

        <Cylinder
          args={[0.43, 0.5, 0.72, 32]}
          position={[0, 2.02, 0]}
          castShadow
          receiveShadow
        >
          <ClayMaterial color={colors.hikerOrange} />
        </Cylinder>
        <Torus
          args={[0.18, 0.045, 12, 28]}
          position={[0, 2.39, 0.03]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
        >
          <ClayMaterial color={colors.hikerOrange} />
        </Torus>

        <RoundedBox
          args={[0.78, 0.77, 0.3]}
          radius={0.16}
          smoothness={5}
          position={[0, 2.02, -0.43]}
          castShadow
          receiveShadow
        >
          <ClayMaterial color={colors.backpack} />
        </RoundedBox>
        <RoundedBox
          args={[0.65, 0.22, 0.34]}
          radius={0.1}
          smoothness={5}
          position={[0, 2.27, -0.59]}
          castShadow
          receiveShadow
        >
          <ClayMaterial color={colors.backpackFlap} />
        </RoundedBox>
        <RoundedBox
          args={[0.22, 0.11, 0.12]}
          radius={0.04}
          smoothness={4}
          position={[0, 1.8, -0.61]}
          castShadow
        >
          <ClayMaterial color={colors.backpackFlap} />
        </RoundedBox>
        {[-0.35, 0.35].map((strapX) => (
          <Capsule
            key={strapX}
            args={[0.045, 0.52, 8, 12]}
            position={[strapX, 2.02, 0.3]}
            rotation={[0, 0, strapX < 0 ? -0.08 : 0.08]}
            castShadow
          >
            <ClayMaterial color={colors.backpack} />
          </Capsule>
        ))}
      </group>

      <HikerArm
        armRef={leftArm}
        name="leftArm"
        position={[-0.57, 2.22, 0]}
        rotation={[0, 0, -0.12]}
        colors={colors}
      />
      <HikerArm
        armRef={rightArm}
        forearmRef={rightForearm}
        name="rightArm"
        position={[0.57, 2.22, 0]}
        rotation={[0, 0, 0.12]}
        colors={colors}
      />
      <HikerLeg
        legRef={leftLeg}
        name="leftLeg"
        position={[-0.24, 1.55, 0]}
        colors={colors}
      />
      <HikerLeg
        legRef={rightLeg}
        name="rightLeg"
        position={[0.24, 1.55, 0]}
        colors={colors}
      />
    </group>
  )
}

const Character = forwardRef(function Character(
  {
    outfit = 'school',
    partRefs = {},
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    scale = 1,
    ...props
  },
  ref,
) {
  const { head } = partRefs
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
      {outfit === 'school' ? (
        <SchoolUniform partRefs={partRefs} colors={colors} />
      ) : outfit === 'university' ? (
        <UniversityUniform partRefs={partRefs} colors={colors} />
      ) : (
        <HikerUniform partRefs={partRefs} colors={colors} />
      )}

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
