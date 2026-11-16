import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react'

const asset = (path) => import.meta.env.BASE_URL + path
const pad = (n) => String(n).padStart(2, '0')
const AUTO_MS = 3500 // time each slide stays up while auto-sliding

// Image slider. It slides on its own, pausing while hovered, focused, off-screen or maximized.
// Arrows (shown on hover), dots, swipe and arrow keys change the slide;
// the corner button (or a double-click) maximizes it, and Esc or the same button minimizes it.
//   images — file paths, or { src, alt } objects
//   ratio  — width ÷ height of the frame (1.6 = landscape screenshots, 0.707 = A4 portrait)
//   small  — compact controls for a thumbnail-sized slider
export default function ProjectSlider({ images: list, title, ratio = 1.6, small = false }) {
  const images = list.map((item, i) =>
    typeof item === 'string' ? { src: item, alt: `${title} — image ${i + 1}` } : item,
  )
  const [index, setIndex] = useState(0)
  const [open, setOpen] = useState(false)
  const [paused, setPaused] = useState(false)
  const [visible, setVisible] = useState(false)
  const rootRef = useRef(null)
  const dragStart = useRef(null)
  const count = images.length

  const go = useCallback((step) => setIndex((i) => (i + step + count) % count), [count])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    const root = document.documentElement
    const previous = root.style.overflow
    root.style.overflow = 'hidden' // keep the page still behind the maximized view
    window.addEventListener('keydown', onKey)
    return () => {
      root.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [open, go])

  // only auto-slide while the slider is actually on screen
  useEffect(() => {
    const el = rootRef.current
    if (!el || !('IntersectionObserver' in window)) return setVisible(true)
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // auto-slide; the timer restarts whenever the slide changes
  useEffect(() => {
    if (open || paused || !visible || count < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setTimeout(() => go(1), AUTO_MS)
    return () => clearTimeout(id)
  }, [index, open, paused, visible, count, go])

  const onPointerDown = (e) => { dragStart.current = e.clientX }
  const onPointerUp = (e) => {
    if (dragStart.current === null) return
    const dx = e.clientX - dragStart.current
    dragStart.current = null
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
  }
  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') go(1)
    if (e.key === 'ArrowLeft') go(-1)
  }

  const frame = (big) => (
    <div
      className={`slider ${big ? 'slider--big' : small ? 'slider--small' : ''}`}
      style={{ '--ar': ratio }}
      role="group"
      aria-roledescription="carousel"
      aria-label={`${title} images`}
      tabIndex={big ? -1 : 0}
      ref={big ? undefined : rootRef}
      onPointerEnter={big ? undefined : () => setPaused(true)}
      onPointerLeave={big ? undefined : () => setPaused(false)}
      onFocus={big ? undefined : () => setPaused(true)}
      onBlur={big ? undefined : () => setPaused(false)}
      onKeyDown={big ? undefined : onKeyDown}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onDoubleClick={() => setOpen(!big)}
    >
      <div className="slider-track" style={{ transform: `translateX(${-index * 100}%)` }}>
        {images.map(({ src, alt }, i) => (
          <div className="slide" key={src} aria-hidden={i !== index}>
            <img src={asset(src)} alt={alt} loading="lazy" draggable={false} />
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button type="button" className="slider-btn slider-btn--prev" onClick={() => go(-1)} aria-label="Previous image">
            <ChevronLeft aria-hidden="true" />
          </button>
          <button type="button" className="slider-btn slider-btn--next" onClick={() => go(1)} aria-label="Next image">
            <ChevronRight aria-hidden="true" />
          </button>
        </>
      )}
      <button
        type="button"
        className="slider-btn slider-btn--size"
        onClick={() => setOpen(!big)}
        aria-label={big ? 'Minimize image' : 'Maximize image'}
      >
        {big ? <Minimize2 aria-hidden="true" /> : <Maximize2 aria-hidden="true" />}
      </button>

      <div className="slider-foot">
        <span className="slider-count">{pad(index + 1)} / {pad(count)}</span>
        <div className="slider-dots">
          {images.map(({ src }, i) => (
            <button
              type="button"
              key={src}
              className={i === index ? 'is-on' : ''}
              onClick={() => setIndex(i)}
              aria-label={`Show image ${i + 1}`}
              aria-current={i === index}
            />
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {frame(false)}
      {open &&
        createPortal(
          <div
            className="lightbox"
            data-lenis-prevent
            onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
          >
            {frame(true)}
          </div>,
          document.body,
        )}
    </>
  )
}
