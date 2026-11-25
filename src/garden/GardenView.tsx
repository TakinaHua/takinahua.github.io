import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import DateRange from '../DateRange'
import { education, interests, intro, links, projects, roles, skillGroups } from '../content'
import type { Project } from '../content'
import { navigate, routeClick } from '../router'
import type { Route } from '../router'
import { albumArt, experienceArt, postcardArt, projectBookArt } from './icons'
import { bookBack } from './scenes'
import NoticeboardMotion from './NoticeboardMotion'
import gardenSign from '../../garden/ui/experience/garden-sign.png'

type ViewRoute = Exclude<Route, { view: 'garden' }>

// A link written in ink on the page, or a quiet note when it is not ready yet.
function ActionSlot({ href, label, external }: { href?: string, label: string, external?: boolean }) {
  if (!href) {
    return <span className="book-action is-unavailable"><span className="visually-hidden">{label}: </span>{label} · coming soon</span>
  }
  return external
    ? <a className="book-action" href={href} target="_blank" rel="noreferrer">{label} <span aria-hidden="true">↗</span><span className="visually-hidden"> (opens in a new tab)</span></a>
    : <a className="book-action" href={href}>{label} <span aria-hidden="true">↗</span></a>
}

// The project's own book, taken down from the shelf (garden/ui/project): its words on the left
// page, its picture in the brass-cornered frame on the right.
function ProjectBook({ project }: { project: Project }) {
  return (
    <article className="project-book">
      <div className="book-page book-text">
        {project.dates && <p className="book-dates"><DateRange {...project.dates} /></p>}
        <p className="book-description">{project.description}</p>
        <p className="book-tech">{project.tech}</p>
        <div className="book-actions">
          <ActionSlot href={project.demo} label="Try the demo" />
          <ActionSlot href={project.repo} label="View on GitHub" external />
        </div>
      </div>
      <div className="book-picture">
        {project.image
          ? <img src={project.image.src} width={project.image.width} height={project.image.height} alt={project.image.alt} />
          : <p className="picture-placeholder">{project.mediaNote ?? 'Picture coming soon'}</p>}
      </div>
    </article>
  )
}

// A notice pinned to the board for each role: its object, the company and the role. Opening it
// shows the dates and what Barry did; one is open at a time.
function Noticeboard() {
  return (
    <ul className="notices">
      {roles.map(role => (
        <li key={role.id}>
          <details className="notice" name="role">
            <summary>
              {experienceArt.roles[role.id] && <img src={experienceArt.roles[role.id]} alt="" />}
              <span className="notice-name">
                <h3>{role.org}</h3>
                <span className="notice-role">{role.role}</span>
              </span>
            </summary>
            <div className="notice-detail">
              <p className="notice-dates"><DateRange {...role.dates} /></p>
              <p>{role.summary}</p>
            </div>
          </details>
        </li>
      ))}
      {/* Below the roles, the whole résumé as a PDF. */}
      <li>
        <a className="notice notice-resume" href={links.resume} target="_blank" rel="noreferrer">
          <img src={experienceArt.resume} alt="" />
          <span className="notice-name">
            <h3>Résumé</h3>
            <span className="notice-role">The full version, as a PDF</span>
          </span>
          <span className="notice-open" aria-hidden="true">↗</span>
          <span className="visually-hidden"> (opens in a new tab)</span>
        </a>
      </li>
    </ul>
  )
}

// The album on the bench (garden/ui/about): two spreads, "About me" with Barry's photo held in
// the painted brass corners, and "Education & skills". A page turn moves between them and keeps
// keyboard focus on the turn.
function Album() {
  const [spread, setSpread] = useState<1 | 2>(1)
  const turnRef = useRef<HTMLButtonElement>(null)
  const turned = useRef(false)

  useEffect(() => {
    if (turned.current) turnRef.current?.focus({ preventScroll: true })
  }, [spread])

  const turn = (to: 1 | 2) => { turned.current = true; setSpread(to) }

  if (spread === 1) {
    return (
      <div className="album" data-spread="1" key="1">
        <div className="album-page album-left">
          <img className="album-photo" src="/images/barry-waterfront.jpg" alt="Barry Hua standing by the waterfront"
            width="1200" height="675" />
        </div>
        <div className="album-page album-right">
          <p className="album-name">Barry Hua</p>
          <p className="album-major">Computational and Applied Mathematics</p>
          <p className="album-school">{education[0].school}</p>
          <p className="album-intro">{intro}</p>
          <p className="album-interests">{interests.join(' · ')}</p>
          <button type="button" className="album-turn" ref={turnRef} onClick={() => turn(2)}>Education &amp; skills ›</button>
        </div>
      </div>
    )
  }

  return (
    <div className="album" data-spread="2" key="2">
      <div className="album-page album-left">
        <h3 className="album-heading">Education &amp; skills</h3>
        <ul className="album-schools">
          {education.map(entry => (
            <li key={entry.school}>
              <strong>{entry.school}</strong>
              <span>{entry.detail}</span>
              <span className="album-small">{entry.place}{entry.dates && <>, <DateRange {...entry.dates} /></>}</span>
            </li>
          ))}
        </ul>
        <button type="button" className="album-turn" ref={turnRef} onClick={() => turn(1)}>‹ About me</button>
      </div>
      <div className="album-page album-right">
        {skillGroups.map(group => (
          <div key={group.title} className="album-skills">
            <h4>{group.title}</h4>
            <ul>
              {group.skills.map(([name, icon]) => (
                <li key={name}>
                  {icon ? <img src={`/skills/${icon}.svg`} width="20" height="20" alt="" /> : <span className="skill-mark" aria-hidden="true" />}
                  {name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

// The postcard by the mailbox (garden/ui/contact): "Thanks for visiting." is painted on its
// left; the ways to reach Barry are written on the three ruled lines on its right.
function Postcard() {
  const newTab = <span className="visually-hidden"> (opens in a new tab)</span>
  return (
    <div className="postcard">
      <p className="visually-hidden">Thanks for visiting the garden.</p>
      <p className="postcard-note">I’d love to hear from you.</p>
      <ul className="postcard-links">
        <li><a href={links.email}>Email <span aria-hidden="true">↗</span></a></li>
        <li><a href={links.linkedin} target="_blank" rel="noreferrer">LinkedIn <span aria-hidden="true">↗</span>{newTab}</a></li>
        <li><a href={links.github} target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span>{newTab}</a></li>
        <li><a href={links.resume} target="_blank" rel="noreferrer">Résumé <span aria-hidden="true">↗</span>{newTab}</a></li>
      </ul>
    </div>
  )
}

// The way back to the garden belongs to each page's world: a wooden arrow sign hung on the
// noticeboard, a ribbon bookmark in the album, and words inked on the postcard.
function GardenReturn({ kind, href, label }: { kind: 'experience' | 'about' | 'contact' | 'projects', href: string, label: string }) {
  if (kind === 'projects') {
    return (
      <a className="garden-return return-ribbon is-book" href={href} onClick={routeClick} aria-label={label}>
        <span aria-hidden="true">← Bookshelf</span>
      </a>
    )
  }
  if (kind === 'experience') {
    return (
      <a className="garden-return return-sign" href={href} onClick={routeClick} aria-label={label}>
        <img src={gardenSign} alt="" />
      </a>
    )
  }
  const cls = kind === 'about' ? 'garden-return return-ribbon' : 'garden-return return-ink'
  return (
    <a className={cls} href={href} onClick={routeClick} aria-label={label}>
      <span aria-hidden="true">← Garden</span>
    </a>
  )
}

function resolve(route: ViewRoute): { title: string, back: { href: string, label: string }, body: ReactNode } | null {
  const home = { href: '/', label: 'Back to the garden' }
  switch (route.view) {
    case 'projects': {
      // Only project books open over the workshop; the workshop and the shelf are scenes.
      const project = projects.find(item => item.id === route.projectId)
      if (!project) return null
      return { title: project.title, back: bookBack(), body: <ProjectBook project={project} /> }
    }
    case 'experience': return { title: 'Experience', back: home, body: <Noticeboard /> }
    case 'about': return { title: 'About me', back: home, body: <Album /> }
    case 'contact': return { title: 'Contact', back: home, body: <Postcard /> }
  }
}

export default function GardenView({ route }: { route: ViewRoute }) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const key = route.view === 'projects' ? `projects/${route.projectId ?? ''}` : route.view
  // eslint-disable-next-line react-hooks/exhaustive-deps -- the key identifies the route
  const view = useMemo(() => resolve(route), [key])

  // An unknown project address falls back to the workshop.
  useEffect(() => {
    if (!view) navigate('/projects', { replace: true })
  }, [view])

  useEffect(() => {
    if (!view) return
    document.title = `${view.title} · Barry Hua`
    headingRef.current?.focus({ preventScroll: true })
  }, [key, view])

  useEffect(() => {
    if (!view) return
    const backHref = view.back.href
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') navigate(backHref) }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [view])

  if (!view) return null

  return (
    <div className="view-layer">
      <a className="view-backdrop" href={view.back.href} onClick={routeClick} tabIndex={-1} aria-hidden="true" />
      <section className="view" data-kind={route.view} aria-labelledby="view-title"
        style={route.view === 'experience'
          ? { '--board': `url(${experienceArt.board})`, '--notice': `url(${experienceArt.notice})` } as CSSProperties
          : route.view === 'about' ? { '--album': `url(${albumArt.withCorners})`, '--album-plain': `url(${albumArt.plain})` } as CSSProperties
          : route.view === 'contact' ? { '--postcard': `url(${postcardArt})` } as CSSProperties
          : { '--book': `url(${projectBookArt})` } as CSSProperties}>
        {route.view === 'experience' && <NoticeboardMotion />}
        <header className="view-head">
          <h2 id="view-title" ref={headingRef} tabIndex={-1}>{view.title}</h2>
          <GardenReturn kind={route.view} href={view.back.href} label={view.back.label} />
        </header>
        {view.body}
      </section>
    </div>
  )
}
