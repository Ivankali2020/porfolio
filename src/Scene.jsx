import { useEffect, useRef } from 'react'
import * as THREE from 'three'
// Simple Icons — free, CC0-licensed brand glyphs.
import { siLaravel, siFilament, siFlutter, siReact, siLivewire, siGit } from 'simple-icons'

// Add or remove tools here; each one floats in the background as a logo tile.
const TOOLS = [siLaravel, siFilament, siFlutter, siReact, siLivewire, siGit]
const EXTRA_COPIES = 14 // smaller, deeper copies scattered behind the main six

// Draws a logo on a soft white rounded tile and returns it as a texture.
function makeTile(icon) {
  const S = 256
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = S
  const g = canvas.getContext('2d')
  const pad = 18
  g.shadowColor = 'rgba(70, 50, 20, 0.24)'
  g.shadowBlur = 14
  g.shadowOffsetY = 5
  g.fillStyle = '#ffffff'
  g.beginPath()
  g.roundRect(pad, pad, S - pad * 2, S - pad * 2, 54)
  g.fill()
  g.shadowColor = 'transparent'
  g.strokeStyle = 'rgba(23, 22, 26, 0.08)'
  g.lineWidth = 2
  g.stroke()
  const k = 4.6 // the glyphs are drawn on a 24×24 grid
  g.translate(S / 2 - 12 * k, S / 2 - 12 * k)
  g.scale(k, k)
  g.fillStyle = `#${icon.hex}`
  g.fill(new Path2D(icon.path))
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

// Small seeded generator so the layout is the same on every visit.
function seeded(seed) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const smooth = (a, b, x) => {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}
const popIn = (x) => {
  const t = THREE.MathUtils.clamp(x, 0, 1) - 1
  return 1 + 2.4 * t * t * t + 1.4 * t * t // ease-out-back
}

export default function Scene() {
  const mount = useRef(null)

  useEffect(() => {
    const el = mount.current
    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    } catch {
      return // no WebGL: the CSS background stands in
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0xf7f4ee, 0.045)
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
    camera.position.set(0, 0, 9)

    // — floating tool logos
    const rand = seeded(7)
    const textures = TOOLS.map(makeTile)
    const plane = new THREE.PlaneGeometry(1, 1)
    const cluster = new THREE.Group()
    const tiles = []
    const addTile = (toolIndex, angle, radius, z, size) => {
      const mesh = new THREE.Mesh(
        plane,
        new THREE.MeshBasicMaterial({
          map: textures[toolIndex], transparent: true, depthWrite: false, side: THREE.DoubleSide,
        }),
      )
      mesh.userData = {
        base: new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.8, z),
        near: THREE.MathUtils.clamp((z + 7) / 8, 0, 1), // 0 = far away, 1 = close to the camera
        size,
        phase: rand() * Math.PI * 2,
        delay: tiles.length * 0.07,
      }
      tiles.push(mesh)
      cluster.add(mesh)
    }
    // the main six, in a loose ring close to the camera
    TOOLS.forEach((_, i) => {
      addTile(i, (i / TOOLS.length) * Math.PI * 2 + 0.5, 1.5 + rand() * 0.9, -0.6 + rand() * 1.6, 0.98)
    })
    // extra copies, further back
    for (let i = 0; i < EXTRA_COPIES; i++) {
      addTile(i % TOOLS.length, rand() * Math.PI * 2, 2.8 + rand() * 3.2, -7 + rand() * 4.5, 0.78)
    }
    scene.add(cluster)

    // — dust
    const COUNT = 1800
    const pos = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 34
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40
      pos[i * 3 + 2] = -Math.random() * 26 + 5
    }
    const dustGeo = new THREE.BufferGeometry()
    dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const dust = new THREE.Points(
      dustGeo,
      new THREE.PointsMaterial({
        color: 0x6b5a3e, size: 0.04, sizeAttenuation: true, transparent: true, opacity: 0.45, depthWrite: false,
      }),
    )
    scene.add(dust)

    const mouse = { x: 0, y: 0 }
    const onMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    let narrow = false
    const onResize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      narrow = w < 820
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    onResize()
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('resize', onResize)

    const clock = new THREE.Clock()
    let progress = 0
    let raf = 0
    const frame = () => {
      raf = requestAnimationFrame(frame)
      const t = clock.getElapsedTime()
      const max = document.documentElement.scrollHeight - window.innerHeight
      const target = max > 0 ? window.scrollY / max : 0
      progress += (target - progress) * 0.07

      // Scrolling pushes the logos outward from the centre; the closest ones leave the
      // screen first. They gather again, as a wider ring, at the end of the page.
      const out = smooth(0, 0.24, progress) * (1 - smooth(0.84, 1, progress))
      const finale = smooth(0.84, 1, progress)
      const swirl = progress * 1.5

      cluster.position.set(narrow ? 0 : 2.4 * (1 - smooth(0, 0.2, progress)), narrow ? 1.3 : 0, narrow ? -3 : 0)
      cluster.rotation.z = swirl

      for (const m of tiles) {
        const { base, near, size, phase, delay } = m.userData
        const push = 1 + out * (1.1 + near * 3.4) + finale * near * 0.95
        const wave = reduce ? 0 : t
        m.position.set(
          base.x * push + Math.sin(wave * 0.5 + phase) * 0.12,
          base.y * push + Math.cos(wave * 0.6 + phase) * 0.16,
          base.z + out * near * 1.5,
        )
        m.rotation.set(
          Math.cos(wave * 0.5 + phase) * 0.22,
          Math.sin(wave * 0.6 + phase) * 0.38 + out * near * 1.2,
          -swirl + Math.sin(wave * 0.4 + phase) * 0.08, // stay upright while the cluster turns
        )
        m.scale.setScalar(size * (reduce ? 1 : popIn((t - 0.3 - delay) / 0.9)))
      }

      dust.rotation.y = t * 0.012 + mouse.x * 0.03
      dust.position.y = progress * 9

      camera.position.x += (mouse.x * 0.7 - camera.position.x) * 0.04
      camera.position.y += (-mouse.y * 0.45 - camera.position.y) * 0.04
      camera.lookAt(0, 0, 0)
      renderer.render(scene, camera)
    }
    frame()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('resize', onResize)
      textures.forEach((tex) => tex.dispose())
      scene.traverse((o) => {
        o.geometry?.dispose()
        o.material?.dispose()
      })
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return <div className="scene" ref={mount} aria-hidden="true" />
}
