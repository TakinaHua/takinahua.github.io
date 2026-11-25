// The projects tray from Barry's concept sheet: an open lacquered box holding a framed picture
// for each project, above a drawer front whose brass pull opens and closes it. The art is cut
// from the concept (garden/ui/reference) at 608 × 239 (box) and 641 × 87 (drawer), drawn for two
// projects. To hold more, the box and drawer widen: their plain lacquer either side of the pull
// repeats, while the slanted ends, the pull and the "Projects" lettering stay whole.
import type { CSSProperties, MouseEvent } from 'react'
import { projects } from '../content'
import { projectCards, projectIcons, trayArt } from './icons'
import { BOX, DRAWER, trayGeometry } from './trayGeometry'

// How a box or drawer is cut: everything left of `center` is the left end, `center` holds the
// pull (and lettering), and `repeat` is a plain strip of lacquer either side of it.
const BOX_CUT = { ...BOX, center: [240, 368], repeat: [[200, 240], [368, 408]] }
const DRAWER_CUT = { ...DRAWER, center: [250, 410], repeat: [[210, 250], [410, 450]] }

type Cut = typeof BOX_CUT

// One horizontal piece of the art, x0 to x1, drawn into a box `width` art pixels wide. The
// border-image's middle slice is that piece; repeating pieces tile it side to side.
function Piece({ src, cut, x0, x1, width, repeat }: { src: string, cut: Cut, x0: number, x1: number, width: number, repeat?: boolean }) {
  return (
    <span className="tray-piece" style={{
      width: `calc(var(--tray-scale) * ${width}px)`,
      borderImage: `url(${src}) 0 ${cut.width - x1} 0 ${x0} fill / 0 / 0 ${repeat ? 'round' : 'stretch'} stretch`,
    }} />
  )
}

function Art({ src, cut, extra }: { src: string, cut: Cut, extra: number }) {
  const [c0, c1] = cut.center
  const [[a0, a1], [b0, b1]] = cut.repeat
  return (
    <span className="tray-art" aria-hidden="true">
      <Piece src={src} cut={cut} x0={0} x1={c0} width={c0} />
      {extra > 0 && <Piece src={src} cut={cut} x0={a0} x1={a1} width={extra / 2} repeat />}
      <Piece src={src} cut={cut} x0={c0} x1={c1} width={c1 - c0} />
      {extra > 0 && <Piece src={src} cut={cut} x0={b0} x1={b1} width={extra / 2} repeat />}
      <Piece src={src} cut={cut} x0={c1} x1={cut.width} width={cut.width - c1} />
    </span>
  )
}

type Props = {
  open: boolean
  onToggle: () => void
  hidden: boolean // a page is open over the garden
  windowWidth: number
  listId: string
  onProject: (event: MouseEvent<HTMLAnchorElement>) => void
}

export default function ProjectTray({ open, onToggle, hidden, windowWidth, listId, onProject }: Props) {
  const { scale, extra } = trayGeometry(windowWidth)
  return (
    <section className="tray" aria-labelledby="tray-title" inert={hidden} data-open={open || undefined}
      style={{ '--tray-scale': scale } as CSSProperties}>
      <div className="tray-box" inert={!open}>
        <Art src={trayArt.box} cut={BOX_CUT} extra={extra} />
        {/* The pull on the box's back rim closes it too. Keyboard users close it from the
            drawer, so this one is not a separate stop in the tab order. */}
        <button type="button" className="tray-box-pull" aria-label="Close projects" aria-controls={listId}
          tabIndex={-1} onClick={onToggle} />
        <ul className="tray-cards" id={listId}>
          {projects.map(project => {
            const card = projectCards[project.id]
            return (
              <li key={project.id}>
                <a className="tray-card" href={`/projects/${project.id}`} onClick={onProject}>
                  <span className={card?.framed ? 'tray-card-picture' : 'tray-card-picture is-framed-here'}>
                    <img src={card?.src ?? projectIcons[project.id]} alt="" />
                    {!project.demo && !project.repo && <span className="tray-card-soon">Coming soon</span>}
                  </span>
                  <span className="tray-card-title">{project.title}</span>
                </a>
              </li>
            )
          })}
        </ul>
      </div>
      {/* The drawer front, lettered "Projects": its pull opens and closes the tray. */}
      <h2 id="tray-title" className="tray-drawer">
        <button type="button" className="tray-toggle" aria-expanded={open} aria-controls={listId} onClick={onToggle}>
          <Art src={trayArt.drawer} cut={DRAWER_CUT} extra={extra} />
          <span className="visually-hidden">Projects</span>
        </button>
      </h2>
    </section>
  )
}
