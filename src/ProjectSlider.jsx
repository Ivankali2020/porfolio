import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react'

const asset = (path) => import.meta.env.BASE_URL + path
const pad = (n) => String(n).padStart(2, '0')

// Image slider for a project. Arrows, dots, swipe and arrow keys change the slide;
// the corner button (or a double-click) maximizes it, and Esc or the same button minimizes it.
export default function ProjectSlider({ images, title }) {
  const [index, setIndex] = useState(0)
  const [open, setOpen] = useState(false)
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
      className={`slider ${big ? 'slider--big' : ''}`}
      role="group"
      aria-roledescription="carousel"
      aria-label={`${title} screenshots`}
      tabIndex={big ? -1 : 0}
      onKeyDown={big ? undefined : onKeyDown}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onDoubleClick={() => setOpen(!big)}
    >
      <div className="slider-track" style={{ transform: `translateX(${-index * 100}%)` }}>
        {images.map((src, i) => (
          <div className="slide" key={src} aria-hidden={i !== index}>
            <img src={asset(src)} alt={`${title} — screenshot ${i + 1}`} loading="lazy" draggable={false} />
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
          {images.map((src, i) => (
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
