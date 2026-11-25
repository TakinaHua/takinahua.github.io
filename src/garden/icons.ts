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

// The menu and the project tray, cut by Codex from Barry's concept sheet (garden/ui/reference,
// see its README). These are painted pieces, so they scale smoothly.
import menuButton from '../../garden/ui/reference/menu-button.png'
import menuMap from '../../garden/ui/reference/folded-map.png'
import menuOpen from '../../garden/ui/reference/menu-open.png'
import trayBox from '../../garden/ui/reference/tray-empty.png'
import welcomeSignArt from '../../garden/ui/reference/welcome-sign.webp'
import trayDrawer from '../../garden/ui/reference/tray-drawer.png'
import cardAtlas from '../../garden/ui/reference/card-atlas.png'
import cardFireAndIce from '../../garden/ui/reference/card-fire-and-ice.png'
// The concept sheet shows two projects; the other two use Codex's 64 × 36 pixel pictures.
import cardLolPing from '../../garden/ui/card-lol-ping.png'
import cardEvOptimization from '../../garden/ui/card-ev-optimization.png'

// The Experience page (garden/ui/experience): the lantern-lit noticeboard (1536 × 1024), a
// pinned paper notice (1470 × 382) and an object for each role.
import noticeboard from '../../garden/ui/experience/noticeboard.webp'
import notice from '../../garden/ui/experience/notice.webp'
import roleAvary from '../../garden/ui/experience/avary-ai.webp'
import roleBigBet from '../../garden/ui/experience/bigbet-research.webp'
import roleParasoft from '../../garden/ui/experience/parasoft.webp'

export const experienceArt = {
  board: noticeboard,
  notice,
  roles: { 'avary-ai': roleAvary, 'bigbet-research': roleBigBet, 'parasoft': roleParasoft } as Partial<Record<string, string>>,
}

export const logoIcon = sakura
export const menuArt = { button: menuButton, map: menuMap, open: menuOpen }
export const trayArt = { box: trayBox, drawer: trayDrawer }
// The concept's first-visit sign (1659 × 948). The site uses its torn edge and its painted
// "Got it ▶"; the words in between are the site's own.
export const welcomeSign = welcomeSignArt

// Pictures whose frame is part of the art, and pictures the site frames itself.
export const projectCards: Partial<Record<string, { src: string, framed: boolean }>> = {
  'atlas': { src: cardAtlas, framed: true },
  'fire-and-ice': { src: cardFireAndIce, framed: true },
  'lol-ping': { src: cardLolPing, framed: false },
  'ev-optimization': { src: cardEvOptimization, framed: false },
}

export const navIcons = { home, projects, experience, about, contact }

export const projectIcons: Record<string, string> = {
  'atlas': atlas,
  'fire-and-ice': fireAndIce,
  'lol-ping': lolPing,
  'ev-optimization': evOptimization,
}
