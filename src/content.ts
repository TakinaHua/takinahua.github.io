// Shared portfolio content, rendered both by the garden panels and the long-form sections.

export type DateMark = { dateTime: string, label: string }
export type DateRange = { start: DateMark, end: DateMark | 'present' }

export type Project = {
  id: string
  title: string
  dates?: DateRange
  description: string
  tech: string
  demo?: string
  repo?: string
  image?: { src: string, width: number, height: number, alt: string }
  mediaNote?: string
  // Shown on the workshop desk; every project sits on the shelf.
  onDesk?: boolean
}

export type Education = { school: string, place: string, dates?: DateRange, detail: string }

export const education: Education[] = [
  {
    school: 'Carnegie Mellon University',
    place: 'Pittsburgh, Pennsylvania (expected graduation 2028)',
    detail: 'B.S. in Computational and Applied Mathematics, Computer Science minor',
  },
  {
    school: 'Avon Old Farms School',
    place: 'Avon, Connecticut',
    dates: { start: { dateTime: '2020', label: '2020' }, end: { dateTime: '2024', label: '2024' } },
    detail: 'Cum Laude Society',
  },
]

export const interests = ['Backend development', 'Algorithms', 'Operations research', 'Agent development']

// [label, icon file in /public/skills, or null for a text mark]
export const skillGroups: { title: string, skills: [string, string | null][] }[] = [
  {
    title: 'Programming languages',
    skills: [
      ['Python', 'python'], ['Java', 'java'], ['C', 'c'], ['C++', 'cplusplus'],
      ['TypeScript', 'typescript'], ['JavaScript', 'javascript'], ['SQL', 'sql'], ['Bash', 'bash'],
    ],
  },
  {
    title: 'Frameworks and tools',
    skills: [
      ['Spring Boot', 'spring'], ['NumPy', 'numpy'], ['Pandas', 'pandas'], ['PyTorch', 'pytorch'],
      ['Node.js', 'nodejs'], ['React.js', 'react'], ['Django', 'django'], ['RPC', 'rpc'],
      ['MySQL', 'mysql'], ['PostgreSQL', 'postgresql'], ['HTML/CSS', 'html5'],
    ],
  },
]

export type Role = {
  id: string
  org: string
  role: string
  dates: DateRange
  summary: string
}

export const intro = 'I’m a junior at Carnegie Mellon studying computational and applied mathematics. I like taking problems I run into in everyday life and building something to solve them. That’s where many of my projects start.'

export const links = {
  github: 'https://github.com/TakinaHua',
  linkedin: 'https://www.linkedin.com/in/barry-shan-hua/',
  email: 'mailto:barry.shanhua@gmail.com',
}

export const projects: Project[] = [
  {
    id: 'atlas',
    onDesk: true,
    title: 'Atlas',
    dates: { start: { dateTime: '2026-08', label: 'Aug 2026' }, end: 'present' },
    description: 'A trip planner for putting together, mapping, and sharing itineraries. I built the web app and a routing system that finds the shortest path between stops, so people can see how a trip fits together.',
    tech: 'TypeScript, Next.js, Node.js, PostgreSQL',
    demo: '/demos/atlas/',
    mediaNote: 'Project screenshot coming soon',
  },
  {
    id: 'fire-and-ice',
    onDesk: true,
    title: 'Fire and Ice',
    dates: { start: { dateTime: '2025-03', label: 'Mar 2025' }, end: { dateTime: '2025-04', label: 'Apr 2025' } },
    description: 'A Python game I built with a team. I worked on player movement, collision detection, and camera and keyboard controls to make the game feel more responsive.',
    tech: 'Python, OpenCV, cmu_graphics',
    repo: 'https://github.com/TakinaHua/Fire-and-Ice',
    mediaNote: 'Gameplay preview coming soon',
  },
  {
    id: 'lol-ping',
    onDesk: true,
    title: 'LoL Ping',
    description: 'I built a macOS menu bar app inspired by the League of Legends ping wheel. Hold a keyboard shortcut and move your cursor to place a directional ping anywhere on your desktop.',
    tech: 'Swift, AppKit, macOS',
    demo: '/demos/lol-ping/',
    repo: 'https://github.com/TakinaHua/lol-ping-mac',
    image: {
      src: '/images/lol-ping-preview.png',
      width: 1360,
      height: 760,
      alt: 'LoL Ping wheel with eight directional options and Danger selected.',
    },
  },
  {
    id: 'ev-optimization',
    title: 'EV Optimization',
    description: 'An operations research project exploring optimization for electric vehicles. More about the model and our work will be shared here soon.',
    tech: 'Operations research, Optimization',
    mediaNote: 'Project preview coming soon',
  },
]

export const roles: Role[] = [
  {
    id: 'avary-ai',
    org: 'Avary AI',
    role: 'Software Engineer',
    dates: { start: { dateTime: '2026-10', label: 'Oct 2026' }, end: 'present' },
    summary: 'I build Spring Boot APIs that let clients create secure interview links and retrieve candidate evaluation reports. I implemented role-based access controls and request validation to keep each organization’s data separate, and moved file processing to background jobs so uploads don’t block other requests.',
  },
  {
    id: 'bigbet-research',
    org: 'BigBet Research · Carnegie Mellon',
    role: 'Research Assistant',
    dates: { start: { dateTime: '2026-05', label: 'May 2026' }, end: { dateTime: '2026-08', label: 'Aug 2026' } },
    summary: 'I built interactive calculus assessments that collected students’ answers and explanations. I developed a Node.js service that gave feedback on their reasoning, used Python to identify patterns in common mistakes, and refined the prompts and grading criteria used to assess responses.',
  },
  {
    id: 'parasoft',
    org: 'Parasoft',
    role: 'Technical Support Engineer',
    dates: { start: { dateTime: '2025-06', label: 'Jun 2025' }, end: { dateTime: '2025-07', label: 'Jul 2025' } },
    summary: 'I wrote unit and regression tests and investigated API failures in client software. I also reproduced and diagnosed race conditions and deadlocks in multithreaded C and C++ applications.',
  },
]
