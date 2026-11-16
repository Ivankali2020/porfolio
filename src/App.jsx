import { useLayoutEffect, useRef, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import Scene from './Scene.jsx'
import SkillIcon from './skillIcons.jsx'
import ProjectSlider from './ProjectSlider.jsx'
import { profile, skills, marquee, experience, projects, education } from './data.js'

gsap.registerPlugin(ScrollTrigger)

const NAV = [
  ['about', 'About'],
  ['skills', 'Skills'],
  ['experience', 'Experience'],
  ['work', 'Work'],
  ['education', 'Education'],
]

function Chars({ text }) {
  return (
    <span className="chars" aria-label={text}>
      {text.split('').map((c, i) => (
        <span className="ch" aria-hidden="true" key={i}>
          {c === ' ' ? ' ' : c}
        </span>
      ))}
    </span>
  )
}

function Heading({ index, label, children }) {
  return (
    <header className="sec-head">
      <p className="eyebrow" data-reveal>
        <span>{index}</span> {label}
      </p>
      <h2 className="h2">
        <span className="line">
          <span>{children}</span>
        </span>
      </h2>
    </header>
  )
}

// Stat card: tilts toward the pointer, shows a spotlight, and reveals a detail line.
function StatCard({ stat }) {
  const move = (e) => {
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    el.style.setProperty('--mx', `${x * 100}%`)
    el.style.setProperty('--my', `${y * 100}%`)
    el.style.setProperty('--rx', `${(y - 0.5) * -9}deg`)
    el.style.setProperty('--ry', `${(x - 0.5) * 9}deg`)
  }
  const leave = (e) => {
    e.currentTarget.style.setProperty('--rx', '0deg')
    e.currentTarget.style.setProperty('--ry', '0deg')
  }
  return (
    <div className="stat" tabIndex={0} onPointerMove={move} onPointerLeave={leave}>
      <strong data-count={stat.value}>{stat.value}</strong>
      <div className="stat-text">
        <span className="stat-label">{stat.label}</span>
        <span className="stat-more"><span>{stat.more}</span></span>
      </div>
    </div>
  )
}

export default function App() {
  const root = useRef(null)
  const lenisRef = useRef(null)
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'light')

  const toggleTheme = (e) => {
    const next = theme === 'dark' ? 'light' : 'dark'
    const html = document.documentElement
    const apply = () => {
      html.dataset.theme = next
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'dark' ? '#0d0d10' : '#f7f4ee')
      try { localStorage.setItem('theme', next) } catch { /* private mode: just don't remember it */ }
      setTheme(next)
    }
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!document.startViewTransition || calm) return apply()
    // the new theme expands as a circle from the button
    const r = e.currentTarget.getBoundingClientRect()
    const x = r.left + r.width / 2
    const y = r.top + r.height / 2
    html.style.setProperty('--vx', `${x}px`)
    html.style.setProperty('--vy', `${y}px`)
    html.style.setProperty('--vr', `${Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))}px`)
    document.startViewTransition(apply)
  }

  useLayoutEffect(() => {
    const mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // — smooth scrolling, driven by GSAP's ticker
      const lenis = new Lenis({ lerp: 0.09 })
      lenisRef.current = lenis
      lenis.on('scroll', ScrollTrigger.update)
      const tick = (time) => lenis.raf(time * 1000)
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)

      // — hero intro
      gsap.timeline({ defaults: { ease: 'power4.out' } })
        .from('.hero .ch', {
          yPercent: 120, duration: 1.2, stagger: 0.035,
          // once the letters are in, un-clip the rows so they can be dragged around
          onComplete: () => document.querySelector('.hero-title')?.classList.add('is-ready'),
        }, 0.15)
        .from('[data-intro]', { opacity: 0, y: 24, duration: 1, stagger: 0.12 }, 0.7)
        .from('.nav', { opacity: 0, y: -20, duration: 0.9 }, 0.9)

      // — jelly letters: drag any letter of the name and its neighbours stretch with it,
      //   then everything wobbles back into place
      const JELLY = { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 }
      const jellyCleanups = gsap.utils.toArray('.hero-title .chars').flatMap((rowEl) => {
        const row = gsap.utils.toArray('.ch', rowEl)
        return row.map((ch, i) => {
          let start = null
          const down = (e) => {
            start = { x: e.clientX, y: e.clientY }
            ch.setPointerCapture(e.pointerId)
            ch.classList.add('is-drag')
          }
          const move = (e) => {
            if (!start) return
            const dx = e.clientX - start.x
            const dy = e.clientY - start.y
            const pull = Math.min(Math.hypot(dx, dy) / 240, 0.7)
            const sideways = Math.abs(dx) >= Math.abs(dy)
            row.forEach((el, j) => {
              const dist = Math.abs(j - i)
              const f = Math.pow(0.55, dist) // neighbours follow less and less
              gsap.to(el, {
                x: dx * f, y: dy * f, rotation: dx * 0.05 * f,
                scaleX: 1 + pull * f * (sideways ? 0.55 : -0.3),
                scaleY: 1 + pull * f * (sideways ? -0.3 : 0.55),
                duration: 0.22 + dist * 0.07, ease: 'power3.out', overwrite: 'auto',
              })
            })
          }
          const up = () => {
            if (!start) return
            start = null
            ch.classList.remove('is-drag')
            row.forEach((el, j) => {
              gsap.to(el, {
                ...JELLY, duration: 1.7, ease: 'elastic.out(1.25, 0.26)',
                delay: Math.abs(j - i) * 0.035, overwrite: 'auto',
              })
            })
          }
          // a little squish when the pointer passes over a letter
          const squish = () => {
            if (start || gsap.isTweening(ch)) return
            gsap.fromTo(ch, { scaleX: 1.22, scaleY: 0.8 }, {
              scaleX: 1, scaleY: 1, duration: 1.1, ease: 'elastic.out(1.3, 0.3)', overwrite: 'auto',
            })
          }
          ch.addEventListener('pointerdown', down)
          ch.addEventListener('pointermove', move)
          ch.addEventListener('pointerup', up)
          ch.addEventListener('pointercancel', up)
          ch.addEventListener('pointerenter', squish)
          return () => {
            ch.removeEventListener('pointerdown', down)
            ch.removeEventListener('pointermove', move)
            ch.removeEventListener('pointerup', up)
            ch.removeEventListener('pointercancel', up)
            ch.removeEventListener('pointerenter', squish)
          }
        })
      })

      // — hero parallax on the way out
      const heroOut = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      gsap.to('.hero-title', { yPercent: -35, opacity: 0, ease: 'none', scrollTrigger: heroOut })
      gsap.to('.hero-foot', { yPercent: -160, opacity: 0, ease: 'none', scrollTrigger: heroOut })

      // — the 3D scene steps back behind the reading sections, then returns for the finale
      gsap.to('.scene', {
        opacity: 0.42, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'bottom 85%', end: 'bottom 25%', scrub: true },
      })
      gsap.fromTo('.scene', { opacity: 0.42 }, {
        opacity: 0.62, ease: 'none', immediateRender: false,
        scrollTrigger: { trigger: '.contact', start: 'top 75%', end: 'top 15%', scrub: true },
      })

      // — page progress
      gsap.to('.progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } })

      // — reveals
      gsap.utils.toArray('[data-reveal]').forEach((el) => {
        gsap.from(el, {
          opacity: 0, y: 46, duration: 1.1, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%' },
        })
      })
      gsap.utils.toArray('.h2 .line > span').forEach((el) => {
        gsap.from(el, {
          yPercent: 115, duration: 1.2, ease: 'power4.out',
          scrollTrigger: { trigger: el.parentElement, start: 'top 90%' },
        })
      })
      gsap.utils.toArray('[data-stagger]').forEach((list) => {
        gsap.from(list.children, {
          opacity: 0, x: -18, duration: 0.8, ease: 'power3.out', stagger: 0.07,
          scrollTrigger: { trigger: list, start: 'top 86%' },
        })
      })

      // — parallax layers: data-speed sets how far each one travels
      gsap.utils.toArray('[data-speed]').forEach((el) => {
        const s = parseFloat(el.dataset.speed)
        gsap.fromTo(el, { y: 110 * s }, {
          y: -110 * s, ease: 'none',
          scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
        })
      })
      // — oversized ghost words drifting sideways
      gsap.utils.toArray('[data-drift]').forEach((el) => {
        const d = parseFloat(el.dataset.drift)
        gsap.fromTo(el, { xPercent: 12 * d }, {
          xPercent: -12 * d, ease: 'none',
          scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
        })
      })

      // — stat numbers count up when they scroll into view
      gsap.utils.toArray('[data-count]').forEach((el) => {
        const final = el.dataset.count
        const end = parseInt(final, 10)
        const suffix = final.replace(/^\d+/, '')
        const counter = { n: 0 }
        gsap.to(counter, {
          n: end, duration: 1.6, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 90%' },
          onStart: () => { el.textContent = `0${suffix}` },
          onUpdate: () => { el.textContent = `${Math.round(counter.n)}${suffix}` },
        })
      })

      // — experience timeline draws itself
      gsap.from('.tl-line span', {
        scaleY: 0, ease: 'none',
        scrollTrigger: { trigger: '.timeline', start: 'top 70%', end: 'bottom 65%', scrub: true },
      })

      const refresh = () => ScrollTrigger.refresh()
      document.fonts?.ready.then(refresh)

      return () => {
        jellyCleanups.forEach((off) => off())
        document.querySelector('.hero-title')?.classList.remove('is-ready')
        gsap.ticker.remove(tick)
        lenis.destroy()
        lenisRef.current = null
      }
    }, root)

    return () => mm.revert()
  }, [])

  const go = (e, id) => {
    e.preventDefault()
    const target = document.getElementById(id)
    if (!target) return
    if (lenisRef.current) lenisRef.current.scrollTo(target, { offset: -40, duration: 1.4 })
    else target.scrollIntoView()
    history.replaceState(null, '', `#${id}`)
  }

  return (
    <div ref={root}>
      <Scene />
      <div className="grain" aria-hidden="true" />
      <div className="progress" aria-hidden="true" />

      <nav className="nav">
        <a className="brand" href="#top" onClick={(e) => go(e, 'top')} aria-label="Back to top">
          A<i>P</i>P
        </a>
        <ul>
          {NAV.map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`} onClick={(e) => go(e, id)}>{label}</a>
            </li>
          ))}
        </ul>
        <div className="nav-right">
          <button
            type="button"
            className="theme-btn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
          </button>
          <a className="nav-cta" href="#contact" onClick={(e) => go(e, 'contact')}>Contact</a>
        </div>
      </nav>

      <main>
        {/* ———————————————— HERO */}
        <section className="hero" id="top">
          <h1 className="hero-title">
            <span className="row"><Chars text="Aung Pyae" /></span>
            <span className="row row--alt"><Chars text="Phyo" /></span>
          </h1>
          <div className="hero-foot">
            <p className="hero-role" data-intro>{profile.role}</p>
            <p className="hero-intro" data-intro>{profile.intro}</p>
            <p className="hero-meta" data-intro>
              <span>{profile.location}</span>
              <span>Scroll</span>
            </p>
          </div>
        </section>

        {/* ———————————————— ABOUT */}
        <section className="sec" id="about">
          <span className="ghost" data-drift="1" aria-hidden="true">Profile</span>
          <Heading index="01" label="About">A career rewritten <em>in code.</em></Heading>
          <div className="about">
            <div className="about-text">
              {profile.about.map((p, i) => (
                <p key={i} className={i === 0 ? 'lead' : ''} data-reveal>{p}</p>
              ))}
            </div>
            <ul className="stats">
              {profile.stats.map((s, i) => (
                <li key={s.label} data-speed={0.12 + i * 0.14}>
                  <StatCard stat={s} />
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ———————————————— SKILLS */}
        <section className="sec" id="skills">
          <span className="ghost ghost--right" data-drift="-1" aria-hidden="true">Toolkit</span>
          <Heading index="02" label="Skills">Tools I reach for, <em>daily.</em></Heading>
          <div className="skills">
            {skills.map((group) => (
              <article className="skill-col" key={group.title} data-reveal>
                <h3>{group.title}</h3>
                <ul data-stagger>
                  {group.items.map((item) => (
                    <li key={item.name}>
                      <span>{item.name}</span>
                      <SkillIcon name={item.icon} />
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <div className="marquee" aria-hidden="true">
            <div className="marquee-track">
              {[...marquee, ...marquee].map((m, i) => <span key={i}>{m}</span>)}
            </div>
          </div>
        </section>

        {/* ———————————————— EXPERIENCE */}
        <section className="sec" id="experience">
          <span className="ghost" data-drift="1" aria-hidden="true">Journey</span>
          <Heading index="03" label="Experience">Five years, <em>three chapters.</em></Heading>
          <ol className="timeline">
            <li className="tl-line" aria-hidden="true"><span /></li>
            {experience.map((job) => (
              <li className="job" key={job.role + job.period}>
                <div className="job-when" data-reveal>
                  <span className="node" />
                  <p>{job.period}</p>
                </div>
                <div className="job-body" data-reveal>
                  <h3>{job.role}</h3>
                  <p className="job-co">
                    <a href={job.url} target="_blank" rel="noreferrer">
                      {job.logo && (
                        <img className="job-logo" src={import.meta.env.BASE_URL + job.logo} alt="" loading="lazy" />
                      )}
                      <span>{job.company}</span>
                      <span className="job-arrow" aria-hidden="true">↗</span>
                    </a>
                  </p>
                  <ul data-stagger>
                    {job.points.map((pt) => <li key={pt}>{pt}</li>)}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ———————————————— WORK */}
        <section className="sec" id="work">
          <span className="ghost ghost--right" data-drift="-1" aria-hidden="true">Selected</span>
          <Heading index="04" label="Self projects">Products built <em>end to end.</em></Heading>
          {projects.map((p, i) => (
            <article className={`project ${i % 2 ? 'project--flip' : ''}`} key={p.title}>
              <div className="visual" data-reveal>
                <ProjectSlider images={p.images} title={p.title} />
              </div>
              <div className="project-body">
                <p className="eyebrow" data-reveal><span>{String(i + 1).padStart(2, '0')}</span> Project</p>
                <h3 data-reveal>{p.title}</h3>
                <p className="project-sum" data-reveal>{p.summary}</p>
                <ul className="tags" data-stagger>
                  {p.stack.map((t) => <li key={t}>{t}</li>)}
                </ul>
                <ul className="points" data-stagger>
                  {p.points.map((pt) => <li key={pt}>{pt}</li>)}
                </ul>
                <a className="link" href={p.url} target="_blank" rel="noreferrer" data-reveal>
                  View on GitHub <span aria-hidden="true">↗</span>
                </a>
              </div>
            </article>
          ))}
        </section>

        {/* ———————————————— EDUCATION */}
        <section className="sec" id="education">
          <span className="ghost" data-drift="1" aria-hidden="true">Learning</span>
          <Heading index="05" label="Education">From classroom <em>to codebase.</em></Heading>
          <ul className="edu">
            {education.map((e) => (
              <li key={e.title} data-reveal>
                <p className="edu-when">{e.period}</p>
                <div>
                  <h3>{e.title}</h3>
                  <p className="edu-place">{e.place}</p>
                </div>
                <div>
                  <p className="edu-text">{e.text}</p>
                  {e.certificates && (
                    <div className="edu-certs">
                      <p className="edu-certs-label">Certificates · {e.certificates.length}</p>
                      <ProjectSlider images={e.certificates} title={`${e.title} certificates`} ratio={1414 / 2000} small />
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* ———————————————— CONTACT */}
        <section className="sec contact" id="contact">
          <p className="eyebrow" data-reveal><span>06</span> Contact</p>
          <h2 className="h2 h2--xl">
            <span className="line"><span>Let’s build</span></span>
            <span className="line"><span><em>something good.</em></span></span>
          </h2>
          <a className="mail" href={`mailto:${profile.email}`} data-reveal>{profile.email}</a>
          <div className="contact-row" data-reveal>
            <a className="link" href={profile.github} target="_blank" rel="noreferrer">
              GitHub — {profile.githubHandle} <span aria-hidden="true">↗</span>
            </a>
            <span>{profile.location}</span>
          </div>
        </section>
      </main>

      <footer className="foot">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <span>React · Three.js · GSAP</span>
      </footer>
    </div>
  )
}
