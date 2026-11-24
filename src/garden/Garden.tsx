import { Fragment, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, MouseEvent } from 'react'
import { projects } from '../content'
import { navigate, parseRoute, routeClick, usePath } from '../router'
import type { Route } from '../router'
import { computeWholeLayout } from './fit'
import type { GardenLayout } from './fit'
import GardenCanvas from './GardenCanvas'
import GardenView from './GardenView'
import { useSilhouettes } from './silhouettes'
import { logoIcon, navIcons, projectIcons } from './icons'
import { returnSpot, sceneFor, scenes, SHELF_ID } from './scenes'
import type { Scene } from './scenes'
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

// The projects tray belongs to the garden; the workshop and the shelf use the whole height.
function measureLayout(width: number, height: number, trayOpen: boolean, scene: Scene) {
  const { bar, tray } = chrome(width)
  const bottom = scene.id === 'garden' ? (trayOpen ? tray : TRAY_HEAD) : 0
  return computeWholeLayout(width, height, devicePixelRatio || 1, { top: bar, bottom }, scene.focusX, scene.art)
}

// A garden page or a project book is open over the scene.
const hasOverlay = (route: Route) =>
  route.view === 'projects' ? Boolean(route.projectId && route.projectId !== SHELF_ID) : route.view !== 'garden'

export default function Garden() {
  const path = usePath()
  const route = parseRoute(path)
  const scene = scenes[sceneFor(route)]
  const viewOpen = hasOverlay(route)
  const inGarden = scene.id === 'garden'
  const viewportRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const [size, setSize] = useState({ width: innerWidth, height: innerHeight, dpr: devicePixelRatio || 1 })
  const [trayOpen, setTrayOpen] = useState(readTrayOpen)
  // dpr is part of size so that zooming re-fits the art.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const layout: GardenLayout = useMemo(() => measureLayout(size.width, size.height, trayOpen, scene), [size, trayOpen, scene])
  const trayTilesId = useId()
  const silhouettes = useSilhouettes(scene.outlines)
  const sceneHeadingRef = useRef<HTMLHeadingElement>(null)
  const [panEdge, setPanEdge] = useState({ start: true, end: false })
  const [menuOpen, setMenuOpen] = useState(false)
  const [welcomeOpen, setWelcomeOpen] = useState(readWelcomeOpen)
  const [touch] = useState(() => matchMedia('(hover: none)').matches)
  const welcomeId = useId()
  const sceneHeadingId = useId()
  const welcomeVisible = welcomeOpen && !viewOpen && inGarden
  const previousRoute = useRef<Route | null>(null)
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

  // In pan mode, start centred on the scene's main objects.
  useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (viewport) viewport.scrollLeft = layout.pan ? layout.panTo : 0
  }, [layout.pan, layout.panTo, scene.id])

  // With no page open over it, a scene names itself in the title. Coming back from a page or
  // a deeper scene returns focus to the object the visitor came from; entering a new scene
  // moves focus to its heading.
  useEffect(() => {
    const from = previousRoute.current
    previousRoute.current = route
    if (viewOpen) return
    document.title = inGarden ? 'Barry Hua | Portfolio' : `${scene.title} · Barry Hua`
    if (!from) return
    const spot = returnSpot(from, scene.id)
    const target = spot && document.querySelector<HTMLElement>(`.landmark[data-landmark="${spot}"]`)
    if (target) target.focus({ preventScroll: true })
    else if (sceneFor(from) !== scene.id) sceneHeadingRef.current?.focus({ preventScroll: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the path identifies the route
  }, [path])

  // Escape steps back out of the workshop and the shelf, as it does from a page.
  useEffect(() => {
    const back = scene.back
    if (viewOpen || !back) return
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape' && !menuOpen) navigate(back.href) }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [scene, viewOpen, menuOpen])

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
    width: scene.art.width * layout.scale,
    height: scene.art.height * layout.scale,
    left: layout.left,
    top: layout.top,
    backgroundImage: `url(${scene.master})`,
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
      data-scene={scene.id}
      data-render={scene.art.pixel ? 'pixel' : 'painted'}
      data-view-open={viewOpen || undefined}
      style={{
        '--art-scale': layout.scale,
        '--art-url': `url(${scene.master})`,
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

      <main className="garden-viewport" ref={viewportRef} inert={viewOpen} aria-labelledby={sceneHeadingId}
        onScroll={layout.pan ? trackPan : undefined}>
        <h2 id={sceneHeadingId} className="visually-hidden" ref={sceneHeadingRef} tabIndex={-1}>{scene.title}</h2>
        <div className="garden-stage" style={stageStyle}>
          <GardenCanvas key={scene.id} masterUrl={scene.master} layers={scene.layers}
            width={scene.art.width} height={scene.art.height} />
          {/* Each spot's hover and click area follows its outline's shape once it is read. */}
          {scene.spots.map(({ id, href, label, title, area: box, outline }, index) => {
            const silhouette = silhouettes[id]
            const area = silhouette?.area ?? box
            return (
              <Fragment key={id}>
                <a
                  href={href}
                  onClick={go}
                  className={title ? 'landmark spine-spot' : 'landmark'}
                  data-landmark={id}
                  data-outline={outline ? '' : undefined}
                  aria-label={title ? undefined : label}
                  style={{
                    left: percent(area.x, scene.art.width),
                    top: percent(area.y, scene.art.height),
                    width: percent(area.w, scene.art.width),
                    height: percent(area.h, scene.art.height),
                    clipPath: silhouette?.clipPath,
                  }}
                >
                  {title}
                </a>
                {/* Laid over the whole stage, right after its spot so CSS can show it on hover. */}
                {outline && (
                  <img className="landmark-outline" src={outline} alt="" draggable={false}
                    style={{ '--intro-order': index } as CSSProperties} />
                )}
              </Fragment>
            )
          })}
        </div>
      </main>

      {/* A way back drawn in the picture replaces the button, except while the picture pans
          (phones), where it can start off-screen. */}
      {scene.back && (!scene.back.inPicture || layout.pan) && !viewOpen && (
        <a className="pixel-button scene-back" href={scene.back.href} onClick={routeClick}>{scene.back.label}</a>
      )}

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

      {inGarden && <section className="tray" aria-labelledby="tray-title" inert={viewOpen} data-open={trayOpen || undefined}>
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
      </section>}

      {viewOpen && route.view !== 'garden' && <GardenView route={route} />}
    </div>
  )
}
