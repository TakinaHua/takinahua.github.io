import { useEffect, useId, useRef, useState } from 'react'
import './App.css'

const skillGroups = [
  {
    id: 'programming-languages',
    title: 'Programming Languages',
    skills: [
      ['Python', 'python'], ['Java', 'java'], ['C', 'c'], ['C++', 'cplusplus'],
      ['TypeScript', 'typescript'], ['JavaScript', 'javascript'],
      ['SQL', 'sql'], ['Bash', 'bash'],
    ],
  },
  {
    id: 'frameworks',
    title: 'Frameworks',
    skills: [
      ['Spring Boot', 'spring'], ['NumPy', 'numpy'], ['Pandas', 'pandas'],
      ['PyTorch', 'pytorch'], ['Node.js', 'nodejs'], ['React.js', 'react'],
      ['Django', 'django'], ['RPC', 'rpc'], ['MySQL', 'mysql'],
      ['PostgreSQL', 'postgresql'], ['HTML/CSS', 'html-css'],
    ],
  },
]

const compactCompass = '(max-width: 1350px), (hover: none), (max-height: 520px)'

const compassStops = [
  {
    id: 'about',
    label: 'About me',
    subsections: [
      { id: 'education', label: 'Education' },
      { id: 'interests', label: 'Interests' },
      { id: 'programming-languages', label: 'Programming Languages' },
      { id: 'frameworks', label: 'Frameworks' },
    ],
  },
  {
    id: 'projects',
    label: 'Projects',
    subsections: [
      { id: 'atlas', label: 'Atlas' },
      { id: 'fire-and-ice', label: 'Fire and Ice' },
      { id: 'lol-ping', label: 'LoL Ping' },
      { id: 'ev-optimization', label: 'EV Optimization' },
    ],
  },
  {
    id: 'experience',
    label: 'Experiences',
    subsections: [
      { id: 'avary-ai', label: 'Avary AI' },
      { id: 'bigbet-research', label: 'BigBet Research' },
      { id: 'parasoft', label: 'Parasoft' },
    ],
  },
]

const compassBars = compassStops.flatMap(({ id, label, subsections }) => [
  { id, label, main: true },
  ...subsections.map(section => ({ ...section, main: false })),
])

function SectionCompass() {
  const dial = useRef<HTMLElement>(null)
  const menuId = useId()
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)

  useEffect(() => {
    const sections = compassStops.flatMap(({ id }) => {
      const section = document.getElementById(id)
      return section ? [section] : []
    })
    let frame: number | null = null

    function updateActiveSection() {
      frame = null
      const page = document.documentElement
      const atBottom = window.scrollY > 0 && window.scrollY + window.innerHeight >= page.scrollHeight - 2
      const readingLine = Math.min(140, window.innerHeight * 0.3)
      const section = atBottom
        ? sections.at(-1)
        : sections.findLast(item => item.getBoundingClientRect().top <= readingLine)
      setActiveSection(section?.id ?? null)
    }

    function scheduleUpdate() {
      if (frame === null) frame = requestAnimationFrame(updateActiveSection)
    }

    updateActiveSection()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    return () => {
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      if (frame !== null) cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    const nav = dial.current
    if (!nav) return

    let lastSpin = -Infinity
    let wheelDistance = 0

    function spin(event: WheelEvent) {
      if (matchMedia(compactCompass).matches || event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) || !event.deltaY) return

      event.preventDefault()
      const now = performance.now()
      if (now - lastSpin < 400) return

      wheelDistance += event.deltaMode ? Math.sign(event.deltaY) * 18 : event.deltaY
      if (Math.abs(wheelDistance) < 18) return

      const direction = Math.sign(wheelDistance)
      wheelDistance = 0
      lastSpin = now

      const current = compassStops.findLastIndex(({ id }) =>
        (document.getElementById(id)?.getBoundingClientRect().top ?? Infinity) <= 140,
      )
      const next = current < 0
        ? (direction > 0 ? 0 : compassStops.length - 1)
        : (current + direction + compassStops.length) % compassStops.length
      nav?.querySelector<HTMLAnchorElement>(`a[href="#${compassStops[next].id}"]`)?.click()
    }

    nav.addEventListener('wheel', spin, { passive: false })
    return () => nav.removeEventListener('wheel', spin)
  }, [])

  return (
    <div className="compass-zone">
      <button
        type="button"
        className="compass-toggle"
        aria-label="Sections"
        aria-controls={menuId}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(open => !open)}
      >
        <span aria-hidden="true" />
      </button>
      <nav className="compass" id={menuId} ref={dial} aria-label="Section compass" data-open={menuOpen}>
        <ul className="compass-bars">
          {compassBars.map(({ id, label, main }, index) => {
            const position = (2 * index) / (compassBars.length - 1) - 1
            const curveOffset = 15 * (1 - position ** 2)

            return (
              <li key={id} style={{ marginInlineStart: curveOffset }}>
                <a
                  className={main ? 'compass-main' : 'compass-sub'}
                  href={`#${id}`}
                  aria-label={label}
                  aria-current={id === activeSection ? 'location' : undefined}
                  onClick={() => setMenuOpen(false)}
                />
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}

const interests = [
  {
    label: 'Backend development',
    skills: ['Java', 'TypeScript', 'Spring Boot', 'Node.js', 'PostgreSQL'],
    project: { id: 'atlas', label: 'Atlas' },
  },
  {
    label: 'Algorithms',
    skills: ['Python', 'C', 'C++', 'TypeScript'],
    project: { id: 'atlas', label: 'Atlas' },
  },
  {
    label: 'Operations research',
    skills: ['Python', 'NumPy', 'Pandas'],
    project: { id: 'ev-optimization', label: 'EV Optimization' },
  },
  {
    label: 'Agent development',
    skills: ['Python', 'TypeScript', 'Node.js', 'PyTorch'],
  },
]

function App() {
  const [activeInterest, setActiveInterest] = useState<number | null>(null)
  const selectedInterest = activeInterest === null ? undefined : interests[activeInterest]

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <a className="brand" href="#home">BARRY HUA<span> / PORTFOLIO</span></a>
      </header>
      <SectionCompass />
      <main id="main" tabIndex={-1}>
        <section id="home" className="hero" aria-labelledby="hero-title">
          <h1 id="hero-title">Hi, I’m Barry Hua.</h1>
          <p className="intro">I’m a junior at Carnegie Mellon studying computational and applied mathematics. I like taking problems I run into in everyday life and building something to solve them. That’s where many of my projects start.</p>
          <div className="actions hero-links">
            <a className="button" href="#projects">Explore my projects</a>
            <a className="text-link" href="https://github.com/TakinaHua">GitHub</a>
            <a className="text-link" href="https://www.linkedin.com/in/barry-shan-hua/">LinkedIn</a>
            <a className="text-link" href="mailto:barry.shanhua@gmail.com">Email</a>
          </div>
          <p className="note">Résumé coming soon</p>
        </section>
        <section id="about" aria-labelledby="about-title">
          <h2 id="about-title">About me</h2>
          <div className="about-grid">
            <div className="about-education">
              <h3 id="education">Education</h3>
              <ul className="education-list">
                <li>
                  <strong>Carnegie Mellon University</strong>
                  <span>Pittsburgh, Pennsylvania · Expected graduation 2028</span>
                  <span>B.S. in Computational and Applied Mathematics · Computer Science minor</span>
                </li>
                <li>
                  <strong>Avon Old Farms School</strong>
                  <span>Avon, Connecticut</span>
                  <span>Cum Laude Society</span>
                </li>
              </ul>
            </div>
            <div className="about-portrait">
              <img
                src="/images/barry-waterfront.jpg"
                alt="Barry Hua standing by the waterfront"
                width="1200"
                height="675"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
          <div className="about-details">
            <div>
              <h3 id="interests">Interests</h3>
              <ul className="interest-list">
                {interests.map(({ label }, index) => (
                  <li key={label}>
                    <button
                      type="button"
                      aria-pressed={activeInterest === index}
                      aria-controls="about-skills"
                      onClick={() => setActiveInterest(current => current === index ? null : index)}
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
              {selectedInterest?.project && (
                <a className="interest-project" href={`#${selectedInterest.project.id}`}>
                  Related project: {selectedInterest.project.label} <span aria-hidden="true">↗</span>
                </a>
              )}
              <span className="about-announcement" role="status">
                {selectedInterest && `Related skills: ${selectedInterest.skills.join(', ')}.`}
              </span>
            </div>
            <div className="skills" id="about-skills">
              <h3>Technical skills</h3>
              {skillGroups.map(({ id, title, skills }) => (
                <div className="skill-group" id={id} key={id}>
                  <h4>{title}</h4>
                  <ul className="skills-list">
                    {skills.map(([name, icon]) => (
                      <li key={name} data-related={selectedInterest?.skills.includes(name) ? true : undefined}>
                        {icon === 'sql' || icon === 'rpc' ? (
                          <span className="skill-mark" aria-hidden="true">{name}</span>
                        ) : icon === 'html-css' ? (
                          <span className="skill-pair" aria-hidden="true">
                            <img src="/skills/html5.svg" width="24" height="24" alt="" />
                            <img src="/skills/css3.svg" width="24" height="24" alt="" />
                          </span>
                        ) : (
                          <img src={`/skills/${icon}.svg`} width="24" height="24" alt="" />
                        )}
                        {name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section id="projects" aria-labelledby="projects-title">
          <h2 id="projects-title">Things I’ve built.</h2>
          <div className="project-list">
            <article className="project" id="atlas"><div className="project-copy"><h3>Atlas</h3>
              <p className="entry-date"><time dateTime="2026-08">Aug 2026</time> – Present</p><p>A trip planner for putting together, mapping, and sharing itineraries. I built the web app and a routing system that finds the shortest path between stops, so people can see how a trip fits together.</p><p className="tech">TypeScript · Next.js · Node.js · PostgreSQL</p><span className="status">Live demo coming soon</span></div><div className="project-media">Project screenshot coming soon</div></article>
            <article className="project" id="fire-and-ice"><div className="project-copy"><h3>Fire and Ice</h3>
              <p className="entry-date"><time dateTime="2025-03">Mar 2025</time> – <time dateTime="2025-04">Apr 2025</time></p><p>A Python game I built with a team. I worked on player movement, collision detection, and camera and keyboard controls to make the game feel more responsive.</p><p className="tech">Python · OpenCV · cmu_graphics</p><a className="project-link" href="https://github.com/TakinaHua/Fire-and-Ice" target="_blank" rel="noreferrer">View repository <span aria-hidden="true">↗</span></a><span className="project-link-placeholder">Demo link coming soon</span></div><div className="project-media">Gameplay preview coming soon</div></article>
            <article className="project" id="lol-ping">
              <div className="project-copy">
                <h3>LoL Ping</h3>
                <p>I built a macOS menu bar app inspired by the League of Legends ping wheel. Hold a keyboard shortcut and move your cursor to place a directional ping anywhere on your desktop.</p>
                <p className="tech">Swift · AppKit · macOS</p>
                <div className="actions project-actions">
                  <a className="button" href="/demos/lol-ping/">Try demo</a>
                  <a
                    className="project-link"
                    href="https://github.com/TakinaHua/lol-ping-mac"
                    target="_blank"
                    rel="noreferrer"
                  >
                    GitHub repository <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </div>
              <a className="project-preview" href="/images/lol-ping-preview.png">
                <img
                  src="/images/lol-ping-preview.png"
                  width="1360"
                  height="760"
                  loading="lazy"
                  alt="LoL Ping wheel with eight directional options and Danger selected. Open full-size preview."
                />
              </a>
            </article>
            <article className="project" id="ev-optimization"><div className="project-copy"><h3>EV Optimization</h3><p>An operations research project exploring optimization for electric vehicles. More about the model and our work will be shared here soon.</p><p className="tech">Operations research · Optimization</p><span className="status">Coming soon</span></div><div className="project-media">Project preview coming soon</div></article>
          </div>
        </section>
        <section id="experience" aria-labelledby="experience-title">
          <h2 id="experience-title">Experience</h2>
          <div className="experience-list">
            <article>
              <h3 id="avary-ai">Avary AI</h3>
              <p className="entry-date"><time dateTime="2026-10">Oct 2026</time> – Present</p>
              <p className="role">Software Engineer</p>
              <p>I build Spring Boot APIs that let clients create secure interview links and retrieve candidate evaluation reports. I implemented role-based access controls and request validation to keep each organization’s data separate, and moved file processing to background jobs so uploads don’t block other requests.</p>
            </article>
            <article>
              <h3 id="bigbet-research">BigBet Research · Carnegie Mellon</h3>
              <p className="entry-date"><time dateTime="2026-05">May 2026</time> – <time dateTime="2026-08">Aug 2026</time></p>
              <p className="role">Research Assistant</p>
              <p>I built interactive calculus assessments that collected students’ answers and explanations. I developed a Node.js service that gave feedback on their reasoning, used Python to identify patterns in common mistakes, and refined the prompts and grading criteria used to assess responses.</p>
            </article>
            <article>
              <h3 id="parasoft">Parasoft</h3>
              <p className="entry-date"><time dateTime="2025-06">Jun 2025</time> – <time dateTime="2025-07">Jul 2025</time></p>
              <p className="role">Technical Support Engineer</p>
              <p>I wrote unit and regression tests and investigated API failures in client software. I also reproduced and diagnosed race conditions and deadlocks in multithreaded C and C++ applications.</p>
            </article>
          </div>
        </section>
      </main>
      <footer><span>Barry Hua</span><a href="#home">Back to top ↑</a></footer>
    </>
  )
}
export default App
