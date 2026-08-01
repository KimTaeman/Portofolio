export const LOW_POLY_GRASS_COLOR = '#7CB342'

export default function LowPolyGrassMaterial() {
  return (
    <meshStandardMaterial
      color={LOW_POLY_GRASS_COLOR}
      roughness={1}
      metalness={0}
      flatShading
    />
  )
}
