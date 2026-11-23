import { useEffect, useMemo, useRef } from 'react'
import type { ReactNode } from 'react'
import DateRange from '../DateRange'
import { education, interests, intro, links, projects, roles, skillGroups } from '../content'
import type { Project } from '../content'
import { navigate, routeClick } from '../router'
import type { Route } from '../router'
import { bookBack } from './scenes'

type ViewRoute = Exclude<Route, { view: 'garden' }>

function ActionSlot({ href, label, external }: { href?: string, label: string, external?: boolean }) {
  if (!href) {
    return <span className="pixel-button is-unavailable"><span className="visually-hidden">{label}: </span>Coming soon</span>
  }
  return external
    ? <a className="pixel-button" href={href} target="_blank" rel="noreferrer">{label}</a>
    : <a className="pixel-button" href={href}>{label}</a>
}

function ProjectBook({ project }: { project: Project }) {
  return (
    <article className="open-book">
      <div className="book-page">
        {project.dates && <p className="view-meta"><DateRange {...project.dates} /></p>}
        <p>{project.description}</p>
        <p className="view-meta">{project.tech}</p>
        <div className="book-actions">
          <ActionSlot href={project.demo} label="Try demo" />
          <ActionSlot href={project.repo} label="View on GitHub" external />
        </div>
      </div>
      <div className="book-page book-picture">
        {project.image
          ? <img src={project.image.src} width={project.image.width} height={project.image.height} alt={project.image.alt} />
          : <p className="picture-placeholder">{project.mediaNote ?? 'Picture coming soon'}</p>}
      </div>
    </article>
  )
}

function Noticeboard() {
  return (
    <ul className="notes">
      {roles.map(role => (
        <li key={role.id} className="pinned-note">
          <h3>{role.org}</h3>
          <p className="note-role">{role.role}</p>
          <p className="view-meta"><DateRange {...role.dates} /></p>
          <p>{role.summary}</p>
        </li>
      ))}
    </ul>
  )
}

function Album() {
  return (
    <div className="album">
      <div className="album-spread">
        <img src="/images/barry-waterfront.jpg" alt="Barry Hua standing by the waterfront" width="1200" height="675" />
        <div className="album-page">
          <p>{intro}</p>
          <h3>Interests</h3>
          <p>{interests.join(', ')}</p>
        </div>
      </div>
      <div className="album-spread">
        <div className="album-page">
          <h3>Education</h3>
          <ul className="plain-list">
            {education.map(entry => (
              <li key={entry.school}>
                <strong>{entry.school}</strong>
                <span>{entry.place}{entry.dates && <>, <DateRange {...entry.dates} /></>}</span>
                <span>{entry.detail}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="album-page">
          {skillGroups.map(group => (
            <div key={group.title}>
              <h3>{group.title}</h3>
              <ul className="skills">
                {group.skills.map(([name, icon]) => (
                  <li key={name}>
                    {icon && <img src={`/skills/${icon}.svg`} width="20" height="20" alt="" />}
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Postcard() {
  return (
    <div className="postcard">
      <p>Thanks for visiting the garden. I’d love to hear from you.</p>
      <ul className="postcard-links">
        <li><a className="pixel-button" href={links.email}>Email</a></li>
        <li><a className="pixel-button" href={links.linkedin} target="_blank" rel="noreferrer">LinkedIn</a></li>
        <li><a className="pixel-button" href={links.github} target="_blank" rel="noreferrer">GitHub</a></li>
      </ul>
    </div>
  )
}

function resolve(route: ViewRoute): { title: string, back: { href: string, label: string }, body: ReactNode } | null {
  const home = { href: '/', label: 'Back to the garden' }
  switch (route.view) {
    case 'projects': {
      // Only project books open over the workshop; the workshop and the shelf are scenes.
      const project = projects.find(item => item.id === route.projectId)
      if (!project) return null
      return { title: project.title, back: bookBack(project.id), body: <ProjectBook project={project} /> }
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
      <section className="view" data-kind={route.view} aria-labelledby="view-title">
        <header className="view-head">
          <h2 id="view-title" ref={headingRef} tabIndex={-1}>{view.title}</h2>
          <a className="pixel-button" href={view.back.href} onClick={routeClick}>{view.back.label}</a>
        </header>
        {view.body}
      </section>
    </div>
  )
}
