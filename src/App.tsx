import './App.css'

const skills = [
  { name: 'Python', icon: 'python' },
  { name: 'TypeScript', icon: 'typescript' },
  { name: 'Java', icon: 'java' },
  { name: 'C', icon: 'c' },
  { name: 'React', icon: 'react' },
  { name: 'Next.js', icon: 'nextjs' },
  { name: 'Node.js', icon: 'nodejs' },
  { name: 'Spring Boot', icon: 'spring' },
  { name: 'PostgreSQL', icon: 'postgresql' },
  { name: 'OpenCV', icon: 'opencv' },
]

function App() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <a className="brand" href="#home">BARRY HUA<span> / PORTFOLIO</span></a>
      </header>
      <main id="main">
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
            <div>
              <h3>Education</h3>
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
            <div>
              <h3>Interests</h3>
              <ul className="interest-list">
                <li>Backend development</li>
                <li>Algorithms</li>
                <li>Operations research</li>
                <li>Agent development</li>
              </ul>
            </div>
          </div>
          <div className="skills">
            <h3>Technical skills</h3>
            <ul className="skills-list">
              {skills.map(({ name, icon }) => (
                <li key={icon}>
                  <img src={`/skills/${icon}.svg`} width="24" height="24" alt="" />
                  {name}
                </li>
              ))}
            </ul>
          </div>
        </section>
        <section id="projects" aria-labelledby="projects-title">
          <h2 id="projects-title">Things I’ve built.</h2>
          <div className="project-list">
            <article className="project"><div className="project-copy"><h3>Atlas</h3><p>A trip planner for putting together, mapping, and sharing itineraries. I built the web app and a routing system that finds the shortest path between stops, so people can see how a trip fits together.</p><p className="tech">TypeScript · Next.js · Node.js · PostgreSQL</p><span className="status">Live demo coming soon</span></div><div className="project-media">Project screenshot coming soon</div></article>
            <article className="project"><div className="project-copy"><h3>Fire and Ice</h3><p>A Python game I built with a team. I worked on player movement, collision detection, and camera and keyboard controls to make the game feel more responsive.</p><p className="tech">Python · OpenCV · cmu_graphics</p><a className="project-link" href="https://github.com/TakinaHua/Fire-and-Ice" target="_blank" rel="noreferrer">View repository <span aria-hidden="true">↗</span></a><span className="project-link-placeholder">Demo link coming soon</span></div><div className="project-media">Gameplay preview coming soon</div></article>
            <article className="project"><div className="project-copy"><h3>EV Optimization</h3><p>An operations research project exploring optimization for electric vehicles. More about the model and our work will be shared here soon.</p><p className="tech">Operations research · Optimization</p><span className="status">Coming soon</span></div><div className="project-media">Project preview coming soon</div></article>
          </div>
        </section>
        <section id="experience" aria-labelledby="experience-title">
          <h2 id="experience-title">Experience</h2>
          <div className="experience-list">
            <article>
              <h3>Avary AI</h3>
              <p className="role">Software Engineer</p>
              <p>I build Spring Boot APIs that let clients create secure interview links and retrieve candidate evaluation reports. I implemented role-based access controls and request validation to keep each organization’s data separate, and moved file processing to background jobs so uploads don’t block other requests.</p>
            </article>
            <article>
              <h3>BigBet Research · Carnegie Mellon</h3>
              <p className="role">Research Assistant</p>
              <p>I built interactive calculus assessments that collected students’ answers and explanations. I developed a Node.js service that gave feedback on their reasoning, used Python to identify patterns in common mistakes, and refined the prompts and grading criteria used to assess responses.</p>
            </article>
            <article>
              <h3>Parasoft</h3>
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
