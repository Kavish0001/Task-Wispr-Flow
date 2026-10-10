import React, { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { Center, Float, OrbitControls, useGLTF } from '@react-three/drei'

function FallbackReactor() {
  return <Float speed={1.3} rotationIntensity={0.4} floatIntensity={0.7}>
    <mesh><icosahedronGeometry args={[1.05, 2]} /><meshStandardMaterial color="#9cebd7" emissive="#3dbca4" emissiveIntensity={1.4} roughness={0.25} /></mesh>
    <mesh rotation={[1.35, 0.2, 0.7]}><torusGeometry args={[1.55, .025, 12, 80]} /><meshStandardMaterial color="#c7fff3" emissive="#58d7c2" emissiveIntensity={.8} /></mesh>
    <mesh rotation={[-.5, 1.3, .1]}><torusGeometry args={[1.86, .018, 12, 80]} /><meshStandardMaterial color="#80d9c8" emissive="#2e8e7d" emissiveIntensity={.7} /></mesh>
  </Float>
}

function LocalModel({ source, scale = 1 }) {
  const { scene } = useGLTF(source)
  const model = useMemo(() => scene.clone(), [scene])
  return <Center><primitive object={model} scale={scale} /></Center>
}

class ModelBoundary extends React.Component {
  constructor(props) { super(props); this.state = { failed: false } }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

export function HeroModel() {
  return <div className="three-stage" aria-label="Animated Human Operations reactor model">
    <Canvas camera={{ position: [0, 0, 5.2], fov: 40 }} dpr={[1, 1.5]}>
      <ambientLight intensity={1.2} /><pointLight color="#9cebd7" position={[3, 3, 4]} intensity={35} /><pointLight color="#4ba892" position={[-3, -2, 2]} intensity={12} />
      <ModelBoundary fallback={<FallbackReactor />}><Suspense fallback={<FallbackReactor />}><Float speed={1.1} rotationIntensity={.25} floatIntensity={.45}><LocalModel source="/models/reactor_model.glb" scale={1.1} /></Float></Suspense></ModelBoundary>
      <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={.45} />
    </Canvas>
  </div>
}

export function MissionModel({ index }) {
  const model = ['atom_02_binary.glb', 'atom_03_tri.glb', 'atom_04_tetra.glb'][Math.max(0, Number(index) - 1) % 3]
  return <div className="mission-model" aria-hidden="true"><Canvas camera={{ position: [0, 0, 4], fov: 45 }} dpr={[1, 1.25]}><ambientLight intensity={1.2} /><pointLight color="#9cebd7" position={[2, 3, 3]} intensity={20} /><ModelBoundary fallback={<FallbackReactor />}><Suspense fallback={<FallbackReactor />}><Float speed={1.6} rotationIntensity={.5}><LocalModel source={`/models/${model}`} scale={.8} /></Float></Suspense></ModelBoundary></Canvas></div>
}
