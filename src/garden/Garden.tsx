import { Fragment, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, MouseEvent } from 'react'
import { projects } from '../content'
import { parseRoute, routeClick, usePath } from '../router'
import { computeWholeLayout } from './fit'
import type { GardenLayout } from './fit'
import GardenCanvas from './GardenCanvas'
import GardenView from './GardenView'
import { useSilhouettes } from './silhouettes'
import { logoIcon, navIcons, projectIcons } from './icons'
import { ART_HEIGHT, ART_WIDTH, hoverOutlines, landmarks, masterUrl } from './layers'
import './garden.css'
import './views.css'

const percent = (value: number, total: number) => `${(value / total) * 100}%`

// Bar and tray heights, shared with the CSS through custom properties. The tray's header
// strip stays visible when the tray is hidden.
const COMPACT_WIDTH = 1020
const TRAY_HEAD = 40
const chrome = (width: number) => width < COMPACT_WIDTH ? { bar: 56, tray: 128 } : { bar: 60, tray: 140 }

const TRAY_KEY = 'garden-tray-open'
function readTrayOpen() {
  try { return localStorage.getItem(TRAY_KEY) !== 'false' } catch { return true }
}
function saveTrayOpen(open: boolean) {
  try { localStorage.setItem(TRAY_KEY, String(open)) } catch { /* storage unavailable: keep it for this visit */ }
}

// The welcome sign shows until the visitor dismisses it or goes anywhere, once per browser.
const WELCOME_KEY = 'garden-welcome-seen'
function readWelcomeOpen() {
  try { return localStorage.getItem(WELCOME_KEY) !== 'true' } catch { return true }
}
function saveWelcomeSeen() {
  try { localStorage.setItem(WELCOME_KEY, 'true') } catch { /* storage unavailable: hide it for this visit */ }
}

const navItems = [
  { href: '/', view: 'garden', label: 'Home', icon: navIcons.home },
  { href: '/projects', view: 'projects', label: 'Projects', icon: navIcons.projects },
  { href: '/experience', view: 'experience', label: 'Experience', icon: navIcons.experience },
  { href: '/about', view: 'about', label: 'About', icon: navIcons.about },
  { href: '/contact', view: 'contact', label: 'Contact', icon: navIcons.contact },
] as const

// A stepped chevron drawn on a 5 × 7 pixel grid, to match the art.
function PixelChevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 5 7" width="15" height="21" aria-hidden="true" shapeRendering="crispEdges"
      style={direction === 'left' ? { transform: 'scaleX(-1)' } : undefined}>
      <path d="M0 0h2v1h1v1h1v1h1v1h-1v1h-1v1h-1v1h-2v-1h1v-1h1v-1h1v-1h-1v-1h-1v-1h-1z" fill="currentColor" />
    </svg>
  )
}

function measureLayout(width: number, height: number, trayOpen: boolean) {
  const { bar, tray } = chrome(width)
  return computeWholeLayout(width, height, devicePixelRatio || 1, { top: bar, bottom: trayOpen ? tray : TRAY_HEAD })
}

export default function Garden() {
  const path = usePath()
  const route = parseRoute(path)
  const viewOpen = route.view !== 'garden'
  const viewportRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const [size, setSize] = useState({ width: innerWidth, height: innerHeight, dpr: devicePixelRatio || 1 })
  const [trayOpen, setTrayOpen] = useState(readTrayOpen)
  // dpr is part of size so that zooming re-fits the art.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const layout: GardenLayout = useMemo(() => measureLayout(size.width, size.height, trayOpen), [size, trayOpen])
  const trayTilesId = useId()
  const silhouettes = useSilhouettes()
  const [panEdge, setPanEdge] = useState({ start: true, end: false })
  const [menuOpen, setMenuOpen] = useState(false)
  const [welcomeOpen, setWelcomeOpen] = useState(readWelcomeOpen)
  const [touch] = useState(() => matchMedia('(hover: none)').matches)
  const welcomeId = useId()
  const welcomeVisible = welcomeOpen && !viewOpen
  const cameFrom = useRef<string | null>(null)
  const { bar, tray } = chrome(size.width)
  const compact = size.width < COMPACT_WIDTH

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const measure = () => setSize(current => {
      const next = { width: viewport.clientWidth, height: viewport.clientHeight, dpr: devicePixelRatio || 1 }
      return next.width === current.width && next.height === current.height && next.dpr === current.dpr ? current : next
    })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(viewport)
    // Zooming changes devicePixelRatio without always resizing the element.
    addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      removeEventListener('resize', measure)
    }
  }, [])

  // In pan mode, start centred on the landmarks.
  useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (viewport) viewport.scrollLeft = layout.pan ? layout.panTo : 0
  }, [layout.pan, layout.panTo])

  // Back in the garden, return focus to the landmark the visitor came from.
  useEffect(() => {
    if (viewOpen) {
      cameFrom.current ??= route.view
      return
    }
    document.title = 'Barry Hua | Portfolio'
    if (cameFrom.current) {
      document.querySelector<HTMLElement>(`.landmark[data-landmark="${cameFrom.current}"]`)?.focus({ preventScroll: true })
      cameFrom.current = null
    }
  }, [path, viewOpen, route.view])

  function trackPan() {
    const viewport = viewportRef.current
    if (!viewport) return
    setPanEdge({
      start: viewport.scrollLeft <= 1,
      end: viewport.scrollLeft >= viewport.scrollWidth - viewport.clientWidth - 1,
    })
  }

  function pan(direction: -1 | 1) {
    const viewport = viewportRef.current
    const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches
    viewport?.scrollBy({ left: direction * viewport.clientWidth * 0.6, behavior: smooth ? 'smooth' : 'auto' })
  }

  const stageStyle = {
    width: ART_WIDTH * layout.scale,
    height: ART_HEIGHT * layout.scale,
    left: layout.left,
    top: layout.top,
    backgroundImage: `url(${masterUrl})`,
  } as CSSProperties

  function dismissWelcome() {
    if (!welcomeOpen) return
    saveWelcomeSeen()
    setWelcomeOpen(false)
  }

  // Following any link into the site also counts as having read the sign.
  function go(event: MouseEvent<HTMLAnchorElement>) {
    dismissWelcome()
    routeClick(event)
  }

  return (
    <div
      className="garden"
      data-intro={welcomeVisible || undefined}
      data-pan={layout.pan || undefined}
      data-view-open={viewOpen || undefined}
      style={{
        '--art-scale': layout.scale,
        '--art-url': `url(${masterUrl})`,
        '--bar-h': `${bar}px`,
        '--tray-h': `${tray}px`,
        '--tray-head': `${TRAY_HEAD}px`,
      } as CSSProperties}
    >
      <header className="topbar">
        <a className="skip-link" href="/projects" onClick={go}>Skip to projects</a>
        <a className="brand" href="/" onClick={routeClick}>
          <img src={logoIcon} width="32" height="32" alt="" />
          <span className="brand-text">
            <h1>Barry Hua</h1>
            <span className="brand-tagline">Software Engineer, CMU math</span>
          </span>
        </a>
        <nav className="topnav" aria-label="Main">
          {compact && (
            <button type="button" className="menu-button" aria-expanded={menuOpen} aria-controls={menuId}
              onClick={() => setMenuOpen(open => !open)}
              onKeyDown={event => { if (event.key === 'Escape') setMenuOpen(false) }}>
              Menu
            </button>
          )}
          <ul id={menuId} className={compact ? 'menu-list' : 'topnav-list'} hidden={compact && !menuOpen}>
            {navItems.map(item => (
              <li key={item.href}>
                <a href={item.href} aria-current={route.view === item.view ? 'page' : undefined}
                  onClick={event => { setMenuOpen(false); go(event) }}>
                  <img src={item.icon} width="32" height="32" alt="" />
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* First visit only: says who made the garden and how to use it, without covering it. */}
      {welcomeVisible && (
        <aside className="welcome" aria-labelledby={welcomeId}
          style={{ bottom: (trayOpen ? tray : TRAY_HEAD) + (layout.pan ? 80 : 16) }}>
          <h2 id={welcomeId}>Hi, I’m Barry.</h2>
          <p>
            I build software and study math at Carnegie Mellon. This is my garden: {touch ? 'tap' : 'click'} anything
            that glows, or use the menu above.
          </p>
          <button type="button" className="pixel-button" onClick={dismissWelcome}>Got it</button>
        </aside>
      )}

      <main className="garden-viewport" ref={viewportRef} inert={viewOpen} aria-label="The garden"
        onScroll={layout.pan ? trackPan : undefined}>
        <div className="garden-stage" style={stageStyle}>
          <GardenCanvas />
          {/* Each landmark's hover and click area follows its outline's shape once it is read. */}
          {landmarks.map(({ id, label, area: box }, index) => {
            const silhouette = silhouettes[id]
            const area = silhouette?.area ?? box
            return (
              <Fragment key={id}>
                <a
                  href={`/${id}`}
                  onClick={go}
                  className="landmark"
                  data-landmark={id}
                  data-outline={hoverOutlines[id] ? '' : undefined}
                  aria-label={label}
                  style={{
                    left: percent(area.x, ART_WIDTH),
                    top: percent(area.y, ART_HEIGHT),
                    width: percent(area.w, ART_WIDTH),
                    height: percent(area.h, ART_HEIGHT),
                    clipPath: silhouette?.clipPath,
                  }}
                />
                {/* Laid over the whole stage, right after its landmark so CSS can show it on hover. */}
                {hoverOutlines[id] && (
                  <img className="landmark-outline" src={hoverOutlines[id]} alt="" draggable={false}
                    style={{ '--intro-order': index } as CSSProperties} />
                )}
              </Fragment>
            )
          })}
        </div>
      </main>

      {layout.pan && !viewOpen && (
        <div className="pan-controls">
          <button type="button" className="pan-button" aria-label="Look left" disabled={panEdge.start} onClick={() => pan(-1)}>
            <PixelChevron direction="left" />
          </button>
          <button type="button" className="pan-button" aria-label="Look right" disabled={panEdge.end} onClick={() => pan(1)}>
            <PixelChevron direction="right" />
          </button>
        </div>
      )}

      <section className="tray" aria-labelledby="tray-title" inert={viewOpen} data-open={trayOpen || undefined}>
        <div className="tray-head">
          <h2 id="tray-title" className="tray-title">
            <img src={navIcons.projects} width="16" height="16" alt="" />
            Projects
          </h2>
          <button type="button" className="tray-toggle" aria-expanded={trayOpen} aria-controls={trayTilesId}
            onClick={() => setTrayOpen(open => { saveTrayOpen(!open); return !open })}>
            {trayOpen ? 'Hide' : 'Show'}<span className="visually-hidden"> projects</span>
            <svg viewBox="0 0 7 5" width="14" height="10" aria-hidden="true" shapeRendering="crispEdges"
              style={trayOpen ? undefined : { transform: 'scaleY(-1)' }}>
              <path d="M0 0h1v1h1v1h1v1h1v-1h1v-1h1v-1h1v1h-1v1h-1v1h-1v1h-1v-1h-1v-1h-1v-1h-1z" fill="currentColor" />
            </svg>
          </button>
        </div>
        <ul className="tray-tiles" id={trayTilesId} inert={!trayOpen}>
          {projects.map(project => (
            <li key={project.id}>
              <a className="tray-tile" href={`/projects/${project.id}`} onClick={go}>
                <img src={projectIcons[project.id]} width="64" height="64" alt="" />
                <span>
                  <span className="tray-tile-title">{project.title}</span>
                  {project.demo || project.repo
                    ? <span className="tray-tile-tech">{project.tech}</span>
                    : <span className="tray-tile-tech" data-soon="">Coming soon</span>}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {route.view !== 'garden' && <GardenView route={route} />}
    </div>
  )
}
