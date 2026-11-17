import './App.css'

const sections = ['About', 'Projects', 'Experience', 'Contact']

function App() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <a className="brand" href="#home">BARRY HUA<span> / PORTFOLIO</span></a>
        <nav aria-label="Main navigation">{sections.map(section => <a key={section} href={`#${section.toLowerCase()}`}>{section}</a>)}</nav>
      </header>
      <main id="main">
        <section id="home" className="hero" aria-labelledby="hero-title">
          <p className="eyebrow">SOFTWARE · MATHEMATICS · EXPLORATION</p>
          <h1 id="hero-title">Hi, I’m Barry Hua.<br /><span>Welcome to my corner<br />of the internet.</span></h1>
          <p className="intro">Exploring software engineering through an applied mathematics lens.</p>
          <div className="actions"><a className="button" href="#projects">Explore my projects <span aria-hidden="true">↗</span></a><a className="text-link" href="#contact">Get in touch</a></div>
          <p className="note">Résumé coming soon</p>
        </section>
        <section id="about" aria-labelledby="about-title"><p className="eyebrow">01 / ABOUT</p><h2 id="about-title">A little about me.</h2><p className="section-copy">I study Computational and Applied Mathematics at Carnegie Mellon, with a minor in Computer Science. I’m interested in how algorithms and software can help people solve everyday problems.</p></section>
        <section id="projects" aria-labelledby="projects-title">
          <p className="eyebrow">02 / PROJECTS</p><h2 id="projects-title">Things I’ve built.</h2>
          <div className="project-list">
            <article className="project"><div><h3>Atlas</h3><p>A trip planner for putting together, mapping, and sharing itineraries. I built the web app and a routing system that finds the shortest path between stops, so people can see how a trip fits together.</p><p className="tech">TypeScript · Next.js · Node.js · PostgreSQL</p><span className="status">Live demo coming soon</span></div><span className="project-number" aria-hidden="true">01</span></article>
            <article className="project"><div><h3>Fire and Ice</h3><p>A Python game I built with a team. I worked on player movement, collision detection, and camera and keyboard controls to make the game feel more responsive.</p><p className="tech">Python · OpenCV · cmu_graphics</p><a className="project-link" href="https://github.com/TakinaHua/Fire-and-Ice" target="_blank" rel="noreferrer">View repository <span aria-hidden="true">↗</span></a></div><span className="project-number" aria-hidden="true">02</span></article>
            <article className="project"><div><h3>EV Optimization</h3><p>An operations research project exploring optimization for electric vehicles. More about the model and our work will be shared here soon.</p><p className="tech">Operations research · Optimization</p><span className="status">Coming soon</span></div><span className="project-number" aria-hidden="true">03</span></article>
          </div>
        </section>
        <section id="experience" aria-labelledby="experience-title">
          <p className="eyebrow">03 / EXPERIENCE</p><h2 id="experience-title">Where I’ve worked.</h2>
          <div className="experience-list">
            <article><h3>Avary AI</h3><p className="role">Software Engineer</p><p>I work on the backend for an interview platform, building APIs for interview links and candidate reports. I also handle access controls to keep each organization’s data separate and move file processing into background jobs so uploads don’t hold up requests.</p></article>
            <article><h3>Parasoft</h3><p className="role">Technical Support Engineer</p><p>I wrote tests and helped track down bugs in client software. Much of the work involved reproducing API failures and debugging C and C++ programs, including issues where threads interfered with each other or got stuck.</p></article>
            <article><h3>BigBet Research · Carnegie Mellon</h3><p className="role">Research Assistant</p><p>I built calculus quizzes that collected students’ answers and explanations, along with a service that gave feedback on their reasoning. I also wrote Python scripts to look for patterns in mistakes and worked on the prompts and grading criteria used to assess responses.</p></article>
          </div>
        </section>
        <section id="contact" aria-labelledby="contact-title"><p className="eyebrow">04 / CONTACT</p><h2 id="contact-title">Let’s connect.</h2><p className="section-copy">Have a question or want to work together? Send me an email or connect on LinkedIn.</p><div className="actions contact-links"><a className="button" href="mailto:barry.shanhua@gmail.com">barry.shanhua@gmail.com</a><a className="text-link" href="https://www.linkedin.com/in/barry-shan-hua/" target="_blank" rel="noreferrer">LinkedIn ↗</a><a className="text-link" href="https://github.com/TakinaHua" target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a></div></section>
      </main>
      <footer><span>Barry Hua</span><a href="#home">Back to top ↑</a></footer>
    </>
  )
}
export default App
