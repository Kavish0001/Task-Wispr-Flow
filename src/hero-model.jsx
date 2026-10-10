import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

/**
 * Full-screen backdrop built from the project's own GLB models, in plain three.js.
 *
 * - The reactor fills the viewport behind everything at very low opacity, like a
 *   containment vessel the whole interface sits inside.
 * - The four atoms are small and drift on slow closed ellipses, pushed apart when
 *   they get close so they never merge into one shape.
 * - The canvas is pointer-events:none and aria-hidden; reduced-motion holds it still.
 * - Every model is normalised from its bounding box, so a GLB authored at any scale
 *   lands at the intended size instead of filling the camera or vanishing.
 */

const BASE = import.meta.env.BASE_URL
const REACTOR = { file: 'reactor_model.glb', size: 28, opacity: 0.06, spin: 0.03 }
const ATOMS = [
  { file: 'atom_02_binary.glb', home: [-6.6, 2.7, -1], size: 2.2, spin: [0.11, 0.23, 0.05], drift: { x: 0.9, y: 0.6, rate: 0.09, phase: 0 } },
  { file: 'atom_03_tri.glb', home: [6.6, 2.5, -1.5], size: 2.3, spin: [-0.08, 0.19, 0.07], drift: { x: 0.8, y: 0.7, rate: 0.07, phase: 1.9 } },
  { file: 'atom_04_tetra.glb', home: [-6.0, -3.0, -0.5], size: 2.4, spin: [0.06, -0.17, 0.1], drift: { x: 1.0, y: 0.5, rate: 0.08, phase: 3.4 } },
  { file: 'atom_05_heavy.glb', home: [6.2, -2.9, -1], size: 2.5, spin: [-0.1, 0.15, -0.06], drift: { x: 0.7, y: 0.8, rate: 0.06, phase: 5.1 } },
]
const MIN_SEPARATION = 3.8

function normalise(scene, size, opacity) {
  scene.traverse((node) => {
    if (!node.isMesh) return
    const mats = Array.isArray(node.material) ? node.material : [node.material]
    const next = mats.map((m) => {
      const c = m.clone()
      c.transparent = true
      c.opacity = (m.opacity ?? 1) * opacity
      c.depthWrite = false
      if (c.emissive && c.emissive.getHex() !== 0) c.emissiveIntensity = Math.max(c.emissiveIntensity || 1, 1.6)
      return c
    })
    node.material = Array.isArray(node.material) ? next : next[0]
  })
  const box = new THREE.Box3().setFromObject(scene)
  const dims = box.getSize(new THREE.Vector3())
  scene.position.sub(box.getCenter(new THREE.Vector3()))
  const holder = new THREE.Group()
  holder.add(scene)
  holder.scale.setScalar(size / Math.max(dims.x, dims.y, dims.z, 1e-6))
  return holder
}

function resolvePositions(t) {
  const pos = ATOMS.map((a) => {
    const angle = t * a.drift.rate + a.drift.phase
    return [a.home[0] + Math.cos(angle) * a.drift.x, a.home[1] + Math.sin(angle * 0.8) * a.drift.y, a.home[2] + Math.sin(angle * 0.5) * 0.5]
  })
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < pos.length; i++) {
      for (let j = i + 1; j < pos.length; j++) {
        const a = pos[i], b = pos[j]
        const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
        const dist = Math.hypot(...d)
        if (dist >= MIN_SEPARATION) continue
        const n = dist === 0 ? [1, 0, 0] : d.map((v) => v / dist)
        const push = (MIN_SEPARATION - dist) / 2
        for (let k = 0; k < 3; k++) { a[k] -= n[k] * push; b[k] += n[k] * push }
      }
    }
  }
  return pos
}

export default function Backdrop() {
  const host = useRef(null)

  useEffect(() => {
    const el = host.current
    let renderer
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' }) } catch { return undefined }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200)
    camera.position.set(0, 0, 11)
    scene.add(new THREE.AmbientLight(0x9fb4d6, 1.2))
    const key = new THREE.DirectionalLight(0xdceaff, 2.2); key.position.set(4, 6, 5); scene.add(key)
    const cyan = new THREE.PointLight(0x08abff, 60, 0, 1.6); cyan.position.set(-6, -2, 4); scene.add(cyan)
    const violet = new THREE.PointLight(0x521cff, 45, 0, 1.6); violet.position.set(6, 3, 2); scene.add(violet)

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const loader = new GLTFLoader()
    let reactor = null
    const atoms = []
    loader.load(BASE + 'models/' + REACTOR.file, (g) => {
      reactor = normalise(g.scene, REACTOR.size, REACTOR.opacity)
      reactor.position.set(0, -1.5, -8)
      reactor.rotation.x = 0.35
      scene.add(reactor)
    }, undefined, () => {})
    ATOMS.forEach((spec, i) => loader.load(BASE + 'models/' + spec.file, (g) => {
      const obj = normalise(g.scene, spec.size, 0.35)
      obj.position.set(...spec.home)
      atoms[i] = obj
      scene.add(obj)
    }, undefined, () => {}))

    const resize = () => {
      const w = window.innerWidth, h = window.innerHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      // On narrow screens pull the camera back so the atoms stay inside the frame.
      camera.position.z = w < 700 ? 17 : 11
      camera.updateProjectionMatrix()
    }
    resize()
    window.addEventListener('resize', resize)

    const clock = new THREE.Clock()
    let raf = 0
    const tick = () => {
      const t = still ? 0 : clock.getElapsedTime()
      if (reactor) reactor.rotation.y = t * REACTOR.spin
      const pos = resolvePositions(t)
      atoms.forEach((obj, i) => {
        if (!obj) return
        const s = ATOMS[i].spin
        obj.rotation.set(t * s[0], t * s[1], t * s[2])
        obj.position.set(...pos[i])
      })
      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      renderer.dispose()
      el.removeChild(renderer.domElement)
    }
  }, [])

  return <div className="backdrop" ref={host} aria-hidden="true" />
}
