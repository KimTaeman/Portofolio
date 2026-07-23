export default function SceneSetup() {
  return (
    <>
      <ambientLight color="#FFF8EC" intensity={0.85} />
      <directionalLight
        name="softKeyLight"
        color="#FFF1DD"
        intensity={2.2}
        position={[5, 8, 6]}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0001}
        shadow-normalBias={0.025}
        shadow-radius={5}
      />
    </>
  )
}
