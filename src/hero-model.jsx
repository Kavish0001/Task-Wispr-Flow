import React, { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { Bounds, Center, Float, OrbitControls, useGLTF } from '@react-three/drei'

const BASE = import.meta.env.BASE_URL

function FallbackCore() {
  return (
    <Float speed={1.3} rotationIntensity={0.4} floatIntensity={0.7}>
      <mesh><icosahedronGeometry args={[1.1, 2]} /><meshStandardMaterial color="#9cebd7" emissive="#37ae96" emissiveIntensity={1.3} wireframe /></mesh>
      <mesh rotation={[1.2, 0.2, 0.7]}><torusGeometry args={[1.6, 0.03, 12, 80]} /><meshStandardMaterial color="#c7fff3" emissive="#4bcdb4" emissiveIntensity={0.9} /></mesh>
    </Float>
  )
}

function LocalModel({ file }) {
  const { scene } = useGLTF(BASE + 'models/' + file)
  const model = useMemo(() => {
    const cloned = scene.clone(true)
    cloned.traverse((node) => {
      if (!node.isMesh) return
      const mats = Array.isArray(node.material) ? node.material : [node.material]
      node.material = mats.map((m) => {
        const next = m.clone()
        next.transparent = false
        next.opacity = 1
        next.depthWrite = true
        if (next.emissive) next.emissiveIntensity = Math.max(next.emissiveIntensity || 0, 0.6)
        return next
      })
    })
    return cloned
  }, [scene])
  return <Center><primitive object={model} /></Center>
}

class ModelBoundary extends React.Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

// Bounds auto-fits the camera to whatever size the GLB is, so the model is always fully in frame.
export default function ModelStage({ file = 'reactor_model.glb', interactive = true }) {
  return (
    <Canvas camera={{ position: [0, 0.4, 6], fov: 38 }} dpr={[1, 1.75]} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={1.6} />
      <directionalLight position={[4, 6, 5]} intensity={3.2} color="#ffffff" />
      <pointLight position={[-4, -2, 3]} intensity={40} color="#4fe0c0" />
      <pointLight position={[3, 2, -4]} intensity={30} color="#b6f58e" />
      <ModelBoundary fallback={<FallbackCore />}>
        <Suspense fallback={<FallbackCore />}>
          <Bounds fit clip observe margin={1.15}>
            <Float speed={1.1} rotationIntensity={0.25} floatIntensity={0.5}>
              <LocalModel file={file} />
            </Float>
          </Bounds>
        </Suspense>
      </ModelBoundary>
      <OrbitControls enablePan={false} enableZoom={false} enableRotate={interactive} autoRotate autoRotateSpeed={0.9} makeDefault />
    </Canvas>
  )
}
