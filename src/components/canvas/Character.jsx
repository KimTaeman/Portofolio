import { forwardRef } from 'react'
import {
  Capsule,
  Cylinder,
  Dodecahedron,
  RoundedBox,
  Sphere,
  Torus,
} from '@react-three/drei'

const CHARACTER_COLORS = Object.freeze({
  navy: '#17233F',
  universityNavy: '#111111',
  belt: '#1A1A1A',
  buckle: '#C0C0C0',
  sneakers: '#FAFAFA',
  sneakerSole: '#E8E8E8',
  white: '#FFFFFF',
  hair: '#17171D',
  hairHighlight: '#29282E',
  shoes: '#8B5A2B',
  skin: '#F1C6AA',
  eyes: '#302721',
  iris: '#6B5140',
  glasses: '#FFFFFF',
  cheek: '#F2A8A0',
  mouth: '#5C2E35',
  skinShadow: '#D59D7D',
  collar: '#AEC6CF',
  bow: '#FF6B6B',
  hikerOrange: '#FFB380',
  hikerTan: '#D2B48C',
  backpack: '#77DD77',
  backpackFlap: '#FDF6E3',
})

function ClayMaterial({ color, ...props }) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={1}
      metalness={0}
      flatShading
      depthTest
      depthWrite
      {...props}
    />
  )
}

const HAIR_CURLS = Object.freeze([
  [-0.7, -0.22, -0.08, 0.24, 0.39, 0.26, 0.12],
  [0.7, -0.22, -0.08, 0.24, 0.39, 0.26, -0.12],
  [-0.57, -0.57, -0.12, 0.27, 0.22, 0.27, -0.16],
  [-0.29, -0.66, -0.16, 0.28, 0.2, 0.28, 0.09],
  [0, -0.68, -0.17, 0.29, 0.2, 0.29, 0],
  [0.29, -0.66, -0.16, 0.28, 0.2, 0.28, -0.09],
  [0.57, -0.57, -0.12, 0.27, 0.22, 0.27, 0.16],
])

const FRINGE_LOCKS = Object.freeze([
  [-0.47, 0.38, 0.45, 0.27, 0.32, 0.14, -0.34],
  [-0.25, 0.48, 0.5, 0.23, 0.36, 0.13, -0.2],
  [-0.07, 0.53, 0.51, 0.2, 0.35, 0.12, -0.08],
  [0.12, 0.53, 0.51, 0.2, 0.34, 0.12, 0.1],
  [0.31, 0.47, 0.49, 0.23, 0.33, 0.13, 0.22],
  [0.49, 0.36, 0.44, 0.25, 0.3, 0.14, 0.36],
])

const SKIRT_PLEATS = Object.freeze([-0.43, -0.29, -0.15, 0, 0.15, 0.29, 0.43])

function VoluminousWavyHair({ color, highlightColor }) {
  return (
    <group name="voluminousWavyHair">
      <Sphere args={[1, 14, 10]} scale={[0.84, 0.86, 0.63]} position={[0, 0.03, -0.14]} castShadow receiveShadow>
        <ClayMaterial color={color} />
      </Sphere>

      {HAIR_CURLS.map(([x, y, z, sx, sy, sz, rz], index) => (
        <Sphere
          key={`hair-curl-${index}`}
          args={[1, 9, 7]}
          position={[x, y, z]}
          rotation={[0, 0, rz]}
          scale={[sx, sy, sz]}
          castShadow
          receiveShadow
        >
          <ClayMaterial color={color} />
        </Sphere>
      ))}

      <Capsule args={[0.14, 0.48, 4, 8]} position={[-0.59, -0.2, 0.26]} rotation={[0.03, 0.12, 0.12]} castShadow receiveShadow>
        <ClayMaterial color={color} />
      </Capsule>
      <Capsule args={[0.14, 0.48, 4, 8]} position={[0.59, -0.2, 0.26]} rotation={[0.03, -0.12, -0.12]} castShadow receiveShadow>
        <ClayMaterial color={color} />
      </Capsule>

      <Dodecahedron args={[1, 0]} position={[-0.77, -0.53, -0.03]} rotation={[0, 0, -0.24]} scale={[0.22, 0.11, 0.18]} castShadow>
        <ClayMaterial color={color} />
      </Dodecahedron>
      <Dodecahedron args={[1, 0]} position={[0.77, -0.53, -0.03]} rotation={[0, 0, 0.24]} scale={[0.22, 0.11, 0.18]} castShadow>
        <ClayMaterial color={color} />
      </Dodecahedron>

      {FRINGE_LOCKS.map(([x, y, z, sx, sy, sz, rz], index) => (
        <Sphere
          key={`fringe-lock-${index}`}
          args={[1, 10, 7]}
          position={[x, y, z]}
          rotation={[0, 0, rz]}
          scale={[sx, sy, sz]}
          castShadow
          receiveShadow
        >
          <ClayMaterial color={color} />
        </Sphere>
      ))}

      <Sphere args={[1, 9, 6]} position={[-0.25, 0.67, 0.34]} rotation={[0.1, 0, -0.28]} scale={[0.08, 0.27, 0.035]}>
        <ClayMaterial color={highlightColor} />
      </Sphere>
      <Sphere args={[1, 9, 6]} position={[0.2, 0.69, 0.35]} rotation={[0.1, 0, 0.24]} scale={[0.065, 0.25, 0.03]}>
        <ClayMaterial color={highlightColor} />
      </Sphere>
    </group>
  )
}

function DetailedChibiFace({ colors }) {
  return (
    <group name="detailedChibiFace">
      <Sphere args={[1, 14, 10]} scale={[0.69, 0.66, 0.56]} position={[0, 0, 0.12]} castShadow receiveShadow>
        <ClayMaterial color={colors.skin} />
      </Sphere>

      {[-0.69, 0.69].map((x) => (
        <Sphere key={`ear-${x}`} args={[0.16, 9, 7]} position={[x, -0.02, 0.1]} scale={[0.78, 1, 0.72]} castShadow>
          <ClayMaterial color={colors.skin} />
        </Sphere>
      ))}

      <RoundedBox args={[0.2, 0.035, 0.025]} radius={0.018} smoothness={2} position={[-0.27, 0.3, 0.675]} rotation={[0, 0, -0.08]}>
        <ClayMaterial color={colors.hair} />
      </RoundedBox>
      <RoundedBox args={[0.2, 0.035, 0.025]} radius={0.018} smoothness={2} position={[0.27, 0.3, 0.675]} rotation={[0, 0, 0.08]}>
        <ClayMaterial color={colors.hair} />
      </RoundedBox>

      {[-0.25, 0.25].map((x) => (
        <group key={`eye-${x}`} position={[x, 0.06, 0.665]}>
          <Sphere args={[0.165, 10, 8]} scale={[0.86, 1.1, 0.42]}>
            <ClayMaterial color={colors.white} />
          </Sphere>
          <Sphere args={[0.105, 9, 7]} position={[0, -0.005, 0.064]} scale={[0.88, 1.08, 0.48]}>
            <ClayMaterial color={colors.iris} />
          </Sphere>
          <Sphere args={[0.061, 8, 6]} position={[0, -0.008, 0.105]} scale={[0.86, 1.08, 0.45]}>
            <ClayMaterial color={colors.eyes} />
          </Sphere>
          <Sphere args={[0.027, 7, 5]} position={[-0.025, 0.04, 0.137]}>
            <ClayMaterial color={colors.white} />
          </Sphere>
        </group>
      ))}

      <Dodecahedron args={[0.045, 0]} position={[0, -0.09, 0.69]} scale={[0.72, 1, 0.55]}>
        <ClayMaterial color={colors.skinShadow} />
      </Dodecahedron>

      {[-0.43, 0.43].map((x) => (
        <Sphere key={`cheek-${x}`} args={[0.09, 8, 6]} position={[x, -0.17, 0.61]} scale={[1.2, 0.52, 0.18]}>
          <ClayMaterial color={colors.cheek} />
        </Sphere>
      ))}

      <group name="friendlyBroadSmile">
        <Torus args={[0.13, 0.018, 5, 14, Math.PI]} position={[0, -0.24, 0.658]} rotation={[0, 0, Math.PI]} scale={[1.2, 0.72, 1]}>
          <ClayMaterial color={colors.mouth} />
        </Torus>
        <Sphere args={[0.021, 7, 5]} position={[-0.157, -0.24, 0.659]}>
          <ClayMaterial color={colors.mouth} />
        </Sphere>
        <Sphere args={[0.021, 7, 5]} position={[0.157, -0.24, 0.659]}>
          <ClayMaterial color={colors.mouth} />
        </Sphere>
      </group>

      <Sphere name="chinMole" args={[0.022, 7, 5]} position={[0.045, -0.4, 0.585]}>
        <ClayMaterial color="#2B211F" />
      </Sphere>

      <group name="oversizedRoundGlasses" position={[0, 0.075, 0.735]}>
        {[-0.25, 0.25].map((x) => (
          <Torus key={`glasses-lens-${x}`} args={[0.205, 0.027, 6, 18]} position={[x, 0, 0]} scale={[1, 1.06, 1]}>
            <ClayMaterial color={colors.glasses} />
          </Torus>
        ))}
        <RoundedBox args={[0.12, 0.025, 0.025]} radius={0.012} smoothness={2}>
          <ClayMaterial color={colors.glasses} />
        </RoundedBox>
        <RoundedBox args={[0.21, 0.025, 0.025]} radius={0.012} smoothness={2} position={[-0.48, 0.01, -0.03]} rotation={[0, 0, -0.05]}>
          <ClayMaterial color={colors.glasses} />
        </RoundedBox>
        <RoundedBox args={[0.21, 0.025, 0.025]} radius={0.012} smoothness={2} position={[0.48, 0.01, -0.03]} rotation={[0, 0, 0.05]}>
          <ClayMaterial color={colors.glasses} />
        </RoundedBox>
      </group>
    </group>
  )
}

function SchoolArm({
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
        args={[0.15, 0.18, 5, 9]}
        position={[0, -0.18, 0]}
        castShadow
        receiveShadow
      >
        <ClayMaterial color={colors.white} />
      </Capsule>
      <group
        ref={forearmRef}
        name={`${name}Forearm`}
        position={[0, -0.32, 0]}
      >
        <Capsule
          args={[0.14, 0.18, 5, 9]}
          position={[0, -0.16, 0]}
          castShadow
          receiveShadow
        >
          <ClayMaterial color={colors.white} />
        </Capsule>
        <Cylinder
          args={[0.16, 0.145, 0.1, 8]}
          position={[0, -0.38, 0]}
          castShadow
        >
          <ClayMaterial color={colors.white} />
        </Cylinder>
        <Sphere
          args={[0.17, 10, 8]}
          position={[0, -0.51, 0.02]}
          castShadow
          receiveShadow
        >
          <ClayMaterial color={colors.skin} />
        </Sphere>
      </group>
    </group>
  )
}

function SchoolLeg({ legRef, name, position, colors }) {
  return (
    <group ref={legRef} name={name} position={position}>
      <Capsule
        args={[0.13, 0.26, 5, 9]}
        position={[0, -0.25, 0]}
        castShadow
        receiveShadow
      >
        <ClayMaterial color={colors.skin} />
      </Capsule>
      <Capsule
        args={[0.14, 0.34, 5, 9]}
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
      <RoundedBox
        args={[0.31, 0.065, 0.29]}
        radius={0.025}
        smoothness={2}
        position={[0, -0.855, 0.12]}
        castShadow
      >
        <ClayMaterial color="#5D351F" />
      </RoundedBox>
      <RoundedBox
        args={[0.41, 0.065, 0.65]}
        radius={0.025}
        smoothness={2}
        position={[0, -1.12, 0.11]}
        castShadow
      >
        <ClayMaterial color="#3B261D" />
      </RoundedBox>
    </group>
  )
}

function SchoolUniform({ partRefs, colors }) {
  const { torso, leftArm, rightArm, rightForearm, leftLeg, rightLeg } = partRefs

  return (
    <group name="schoolUniform">
      <group ref={torso} name="torso">
        <Cylinder
          args={[0.16, 0.16, 0.22, 10]}
          position={[0, 2.48, 0]}
          castShadow
          receiveShadow
        >
          <ClayMaterial color={colors.skin} />
        </Cylinder>
        <Capsule
          args={[0.42, 0.18, 5, 10]}
          scale={[1.1, 1, 0.65]}
          position={[0, 2.02, 0]}
          castShadow
          receiveShadow
        >
          <ClayMaterial color={colors.white} />
        </Capsule>

        <Cylinder
          args={[0.4, 0.48, 0.58, 10]}
          position={[0, 2.01, 0.015]}
          scale={[1, 1, 0.72]}
          castShadow
          receiveShadow
        >
          <ClayMaterial color={colors.navy} />
        </Cylinder>

        <Cylinder
          args={[0.25, 0, 0.38, 3]}
          position={[0, 2.24, 0.31]}
          rotation={[0, Math.PI / 6, 0]}
          scale={[1, 1, 0.2]}
          castShadow
        >
          <ClayMaterial color={colors.white} />
        </Cylinder>

        <RoundedBox
          args={[0.34, 0.1, 0.055]}
          radius={0.035}
          smoothness={3}
          position={[-0.13, 2.27, 0.31]}
          rotation={[0, 0, -0.55]}
          castShadow
        >
          <ClayMaterial color={colors.white} />
        </RoundedBox>

        {[2.32, 2.24].map((buttonY) => (
          <Sphere key={`shirt-button-${buttonY}`} args={[0.025, 7, 5]} position={[0, buttonY, 0.375]} castShadow>
            <ClayMaterial color="#C9CDD3" />
          </Sphere>
        ))}
        <RoundedBox
          args={[0.34, 0.1, 0.055]}
          radius={0.035}
          smoothness={3}
          position={[0.13, 2.27, 0.31]}
          rotation={[0, 0, 0.55]}
          castShadow
        >
          <ClayMaterial color={colors.white} />
        </RoundedBox>

        <Dodecahedron
          args={[1, 0]}
          scale={[0.14, 0.09, 0.055]}
          position={[-0.09, 2.14, 0.34]}
          rotation={[0, 0, -0.18]}
          castShadow
        >
          <ClayMaterial color={colors.bow} />
        </Dodecahedron>
        <Dodecahedron
          args={[1, 0]}
          scale={[0.14, 0.09, 0.055]}
          position={[0.09, 2.14, 0.34]}
          rotation={[0, 0, 0.18]}
          castShadow
        >
          <ClayMaterial color={colors.bow} />
        </Dodecahedron>
        <Dodecahedron
          args={[0.06, 0]}
          position={[0, 2.14, 0.375]}
          castShadow
        >
          <ClayMaterial color={colors.bow} />
        </Dodecahedron>

        <Cylinder
          args={[0.45, 0.68, 0.76, 12]}
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

        <group name="pleatedSkirtFront">
          {SKIRT_PLEATS.map((x, index) => (
            <RoundedBox
              key={`skirt-pleat-${x}`}
              args={[0.055, 0.57, 0.035]}
              radius={0.014}
              smoothness={1}
              position={[x, 1.31, 0.48 + (1 - Math.abs(x) / 0.5) * 0.08]}
              rotation={[0, 0, x * -0.12]}
              castShadow
            >
              <ClayMaterial color={index % 2 === 0 ? '#111B32' : '#223252'} />
            </RoundedBox>
          ))}
        </group>
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
        forearmRef={rightForearm}
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
    hairColor = CHARACTER_COLORS.hair,
    hairHighlightColor,
    ...props
  },
  ref,
) {
  const { head } = partRefs
  const colors =
    hairColor === CHARACTER_COLORS.hair && !hairHighlightColor
      ? CHARACTER_COLORS
      : {
          ...CHARACTER_COLORS,
          hair: hairColor,
          hairHighlight: hairHighlightColor ?? hairColor,
        }

  return (
    <group
      ref={ref}
      name="character"
      position={position}
      rotation={rotation}
      scale={scale}
      {...props}
    >
      <group
        name="fullyVolumetricChibiRig"
        scale={[1, 1, 1.08]}
        userData={{ geometry: 'volumetric-primitives', usesTexture: false }}
      >
        {outfit === 'school' ? (
          <SchoolUniform partRefs={partRefs} colors={colors} />
        ) : outfit === 'university' ? (
          <UniversityUniform partRefs={partRefs} colors={colors} />
        ) : (
          <HikerUniform partRefs={partRefs} colors={colors} />
        )}

        <group ref={head} name="head" position={[0, 3.04, 0]}>
          <VoluminousWavyHair
            color={colors.hair}
            highlightColor={colors.hairHighlight}
          />
          <DetailedChibiFace colors={colors} />
        </group>
      </group>
    </group>
  )
})

export default Character
