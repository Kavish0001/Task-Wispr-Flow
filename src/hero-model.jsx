import React, { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { Center, Float, useGLTF } from '@react-three/drei'

function FallbackReactor() {
  return <mesh><cylinderGeometry args={[1.25, 1.65, 2.8, 32, 1, true]} /><meshBasicMaterial color="#8be0c7" transparent opacity={.42} wireframe /></mesh>
}

function LocalModel({ source, scale = 1, opacity = 1 }) {
  const { scene } = useGLTF(source)
  const model = useMemo(() => {
    const cloned = scene.clone(true)
    cloned.traverse((node) => {
      if (!node.isMesh) return
      const materials = Array.isArray(node.material) ? node.material : [node.material]
      node.material = materials.map((material) => {
        const next = material.clone()
        next.transparent = opacity < 1
        next.opacity = opacity
        next.depthWrite = opacity > .5
        return next
      })
    })
    return cloned
  }, [scene, opacity])
  return <Center><primitive object={model} scale={scale} /></Center>
}

class ModelBoundary extends React.Component {
  constructor(props) { super(props); this.state = { failed: false } }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

function Atom({ source, position, scale, speed }) {
  return <Float speed={speed} rotationIntensity={.28} floatIntensity={.6}><group position={position}><LocalModel source={source} scale={scale} opacity={.13} /></group></Float>
}

export function HeroModel() {
  return <>
    <div className="three-stage reactor-stage" aria-hidden="true"><Canvas camera={{ position: [0, .1, 6.6], fov: 34 }} dpr={[1, 1.5]}><ambientLight intensity={1.4} /><pointLight color="#a5ebd8" position={[3, 4, 4]} intensity={18} /><ModelBoundary fallback={<FallbackReactor />}><Suspense fallback={<FallbackReactor />}><LocalModel source="/models/reactor_model.glb" scale={1.08} opacity={.3} /></Suspense></ModelBoundary></Canvas></div>
    <div className="ambient-atoms" aria-hidden="true"><Canvas camera={{ position: [0, 0, 6], fov: 42 }} dpr={[1, 1.25]}><ambientLight intensity={1.5} /><pointLight color="#a5ebd8" position={[2, 3, 4]} intensity={8} /><ModelBoundary fallback={null}><Suspense fallback={null}><Atom source="/models/atom_02_binary.glb" position={[-2.2, 1.25, 0]} scale={.28} speed={.8} /><Atom source="/models/atom_03_tri.glb" position={[2.25, -1.25, -.3]} scale={.2} speed={1.15} /></Suspense></ModelBoundary></Canvas></div>
  </>
}

export function MissionModel({ index }) {
  const model = ['atom_02_binary.glb', 'atom_03_tri.glb', 'atom_04_tetra.glb'][Math.max(0, Number(index) - 1) % 3]
  return <div className="mission-model" aria-hidden="true"><Canvas camera={{ position: [0, 0, 4], fov: 45 }} dpr={[1, 1.25]}><ambientLight intensity={1.2} /><pointLight color="#9cebd7" position={[2, 3, 3]} intensity={12} /><ModelBoundary fallback={<FallbackReactor />}><Suspense fallback={<FallbackReactor />}><Float speed={1.2} rotationIntensity={.28}><LocalModel source={`/models/${model}`} scale={.75} opacity={.32} /></Float></Suspense></ModelBoundary></Canvas></div>
}
