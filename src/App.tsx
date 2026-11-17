import './App.css'

const sections = ['About', 'Projects', 'Experience', 'Contact']

function App() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <a className="brand" href="#home">TAKINAHUA<span> / PORTFOLIO</span></a>
        <nav aria-label="Main navigation">{sections.map(section => <a key={section} href={`#${section.toLowerCase()}`}>{section}</a>)}</nav>
      </header>
      <main id="main">
        <section id="home" className="hero" aria-labelledby="hero-title">
          <p className="eyebrow">SOFTWARE · MATHEMATICS · EXPLORATION</p>
          <h1 id="hero-title">Hi, I’m TakinaHua.<br /><span>Welcome to my corner<br />of the internet.</span></h1>
          <p className="intro">Exploring software engineering through an applied mathematics lens.</p>
          <div className="actions"><a className="button" href="#projects">Explore my projects <span aria-hidden="true">↗</span></a><a className="text-link" href="#contact">Get in touch</a></div>
          <p className="note">Résumé coming soon</p>
        </section>
        <section id="about" aria-labelledby="about-title"><p className="eyebrow">01 / ABOUT</p><h2 id="about-title">Curiosity meets engineering.</h2><p className="section-copy">My interests connect software engineering and applied mathematics. This portfolio is a space to share the projects I build and what I learn along the way.</p></section>
        <section id="projects" aria-labelledby="projects-title"><p className="eyebrow">02 / PROJECTS</p><h2 id="projects-title">Selected work.</h2><article className="project"><div><p className="eyebrow">FEATURED PROJECT</p><h3>Atlas</h3><p>Project overview, technical details, and screenshots coming soon.</p><span className="status">Live demo coming soon</span></div><span className="project-number" aria-hidden="true">01</span></article><p className="note">More projects will be added here.</p></section>
        <section id="experience" aria-labelledby="experience-title"><p className="eyebrow">03 / EXPERIENCE</p><h2 id="experience-title">A growing journey.</h2><div className="experience-grid"><article><h3>Experience</h3><p>Work experience and accomplishments will be added here.</p></article><article><h3>Education</h3><p>Education details and relevant coursework will be added here.</p></article></div></section>
        <section id="contact" aria-labelledby="contact-title"><p className="eyebrow">04 / CONTACT</p><h2 id="contact-title">Let’s connect.</h2><p className="section-copy">Find my work on GitHub. Email and LinkedIn links will be added soon.</p><a className="button" href="https://github.com/TakinaHua" target="_blank" rel="noreferrer">Visit GitHub <span aria-hidden="true">↗</span></a></section>
      </main>
      <footer><span>TakinaHua</span><a href="#home">Back to top ↑</a></footer>
    </>
  )
}
export default App
