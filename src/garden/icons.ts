// Pixel icons made with Codex (garden/icons). Nav icons are 16 × 16, project icons 32 × 32;
// both are shown at whole-number scales.
import sakura from '../../garden/icons/sakura.png'
import home from '../../garden/icons/home.png'
import projects from '../../garden/icons/projects.png'
import experience from '../../garden/icons/experience.png'
import about from '../../garden/icons/about.png'
import contact from '../../garden/icons/contact.png'
import atlas from '../../garden/icons/atlas.png'
import fireAndIce from '../../garden/icons/fire-and-ice.png'
import lolPing from '../../garden/icons/lol-ping.png'
import evOptimization from '../../garden/icons/ev-optimization.png'

export const logoIcon = sakura

export const navIcons = { home, projects, experience, about, contact }

export const projectIcons: Record<string, string> = {
  'atlas': atlas,
  'fire-and-ice': fireAndIce,
  'lol-ping': lolPing,
  'ev-optimization': evOptimization,
}
