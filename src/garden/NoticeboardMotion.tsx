import { experienceArt } from './icons'
import lanternSheet from '../../garden/ui/experience/animations/lantern/lantern-sheet.webp'
import lanternPlace from '../../garden/ui/experience/animations/lantern/lantern.json'
import pondSheet from '../../garden/ui/experience/animations/pond/pond-sheet.webp'
import pondPlace from '../../garden/ui/experience/animations/pond/pond.json'

type Place = { x: number, y: number, width: number, height: number, frames: number, columns: number, frameMs: number }

// One of Codex's looping sprite sheets (garden/ui/experience/animations), laid over the board at
// its rectangle. The window onto the sheet steps from frame to frame, left to right, row by row.
function Sheet({ src, place }: { src: string, place: Place }) {
  const { x, y, width: w, height: h, frames, columns, frameMs } = place
  const rows = Math.ceil(frames / columns)
  const views = Array.from({ length: frames }, (_, f) => `${(f % columns) * w} ${Math.floor(f / columns) * h} ${w} ${h}`).join(';')
  return (
    <svg x={x} y={y} width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <image href={src} width={w * columns} height={h * rows} />
      <animate attributeName="viewBox" values={views} dur={`${(frames * frameMs) / 1000}s`} calcMode="discrete" repeatCount="indefinite" />
    </svg>
  )
}

// Coordinates follow the painted 1536 × 1024 board, including when the phone crops its sides.
// The lantern breathes and the pond's reflections waver from Codex's sheets; the blossoms keep
// the softer breeze, a gentle ripple of the board's own pixels.
export default function NoticeboardMotion() {
  return (
    <svg className="noticeboard-motion" viewBox="0 0 1536 1024" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <image id="noticeboard-paint" href={experienceArt.board} width="1536" height="1024" />
        <clipPath id="noticeboard-blossoms">
          <path d="M0 0H566V57Q410 69 323 43L222 63 147 143 96 149 0 224Z M0 665Q99 654 174 732L236 761 246 842 348 918 368 1024H0Z" />
        </clipPath>
        <filter id="noticeboard-breeze" filterUnits="userSpaceOnUse" x="0" y="0" width="574" height="1024">
          <feTurbulence type="fractalNoise" baseFrequency=".011 .008" numOctaves="1" seed="4" />
          <feDisplacementMap in="SourceGraphic" scale="0">
            <animate attributeName="scale" values="0;4;1;-3;0" dur="6.8s" repeatCount="indefinite" />
          </feDisplacementMap>
        </filter>
      </defs>
      <g clipPath="url(#noticeboard-blossoms)"><use href="#noticeboard-paint" filter="url(#noticeboard-breeze)" /></g>
      <Sheet src={pondSheet} place={pondPlace} />
      <Sheet src={lanternSheet} place={lanternPlace} />
    </svg>
  )
}
