import { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import 'leaflet/dist/leaflet.css'
import './atlas-original/atlas.css'
import TripMap from './atlas-original/components/TripMap'
import EditorDialog from './atlas-original/components/EditorDialog'
import type { DestinationLocation, Place } from './atlas-original/lib/types'

const storageKey = 'portfolio.atlas-demo.v1'
const maxAdds = 2

const itinerary = [
  {
    stops: ['Arrival', 'Waikiki Beach'],
    meals: ['Fruit and yogurt bowl', 'Poke bowl', 'Garlic shrimp plate'],
  },
  {
    stops: ['Lanikai Beach (morning)', 'Kualoa Ranch (afternoon)'],
    meals: ['Macadamia nut pancakes', 'Kālua pork plate lunch', 'Grilled fish and rice'],
  },
  {
    stops: ['Dole Plantation', 'Waikele Outlets'],
    meals: ['Pineapple and yogurt', 'Chicken katsu plate', 'Saimin and dumplings'],
  },
  {
    stops: ['Pearl Harbor'],
    meals: ['Portuguese sausage and eggs', 'Teriyaki chicken plate', 'Loco moco'],
  },
]

type Stop = { id: string; name: string }
type Day = { stops: Stop[]; added: number }

function initialDays(): Day[] {
  return itinerary.map(({ stops }, day) => ({
    stops: stops.map((name, index) => ({ id: `${day}-original-${index}`, name })),
    added: 0,
  }))
}

function loadDays(): Day[] {
  try {
    const saved: unknown = JSON.parse(sessionStorage.getItem(storageKey) ?? 'null')
    if (Array.isArray(saved) && saved.length === itinerary.length && saved.every(day =>
      Number.isInteger(day?.added) && day.added >= 0 && day.added <= maxAdds &&
      Array.isArray(day.stops) && day.stops.every((stop: Stop) =>
        typeof stop?.id === 'string' && typeof stop.name === 'string',
      ),
    )) return saved
  } catch {
    // The demo remains usable when tab storage is unavailable.
  }
  return initialDays()
}

// The itinerary uses approximate visitor locations on Oʻahu.
const coordinates: Record<string, readonly [number, number]> = {
  Arrival: [21.331, -157.923],
  'Waikiki Beach': [21.276, -157.827],
  'Lanikai Beach (morning)': [21.39294, -157.715622],
  'Kualoa Ranch (afternoon)': [21.520581, -157.837281],
  'Dole Plantation': [21.527051, -158.037614],
  'Waikele Outlets': [21.401673, -158.006973],
  'Pearl Harbor': [21.36719, -157.937905],
  'Kakaʻako': [21.297949, -157.861889],
  'Haleʻiwa Town': [21.590892, -158.102737],
  'Waimea Valley': [21.636026, -158.054024],
}

const extraPlaces = ['Kakaʻako', 'Haleʻiwa Town', 'Waimea Valley']
const oahu: DestinationLocation = {
  id: 'oahu', name: 'Oʻahu', label: 'Oʻahu, Hawaii', kind: 'city',
  state: 'Hawaii', stateCode: 'HI', latitude: 21.47, longitude: -157.98, zoom: 10,
}

function mapPlace(stop: Stop): Place {
  const pin = Object.hasOwn(coordinates, stop.name) ? coordinates[stop.name] : undefined
  return {
    ...stop, address: '', category: 'Sightseeing', notes: '',
    latitude: pin?.[0] ?? null, longitude: pin?.[1] ?? null,
  }
}

export function AtlasDemo() {
  const [days, setDays] = useState(loadDays)
  const [dayIndex, setDayIndex] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const day = days[dayIndex]
  const places = useMemo(() => day.stops.map(mapPlace), [day.stops])
  const pins = places.filter(place => place.latitude !== null).length

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(days))
    } catch {
      // The demo remains usable when tab storage is unavailable.
    }
  }, [days])

  function updateDay(update: (day: Day) => Day) {
    setDays(current => current.map((entry, index) => index === dayIndex ? update(entry) : entry))
  }

  function moveStop(index: number, direction: -1 | 1) {
    updateDay(current => {
      const target = index + direction
      if (target < 0 || target >= current.stops.length) return current
      const stops = [...current.stops]
      const [stop] = stops.splice(index, 1)
      stops.splice(target, 0, stop)
      return { ...current, stops }
    })
  }

  async function addStop(data: FormData) {
    const name = String(data.get('place') ?? '').trim()
    if (!name || name.length > 80) throw new Error('Enter a place name up to 80 characters.')
    if (day.added >= maxAdds) throw new Error('This day has reached the demo limit.')
    updateDay(current => {
      if (current.added >= maxAdds) return current
      const stop = { id: `${dayIndex}-added-${current.added}`, name }
      return { added: current.added + 1, stops: [...current.stops, stop] }
    })
  }

  function resetDemo() {
    setDays(initialDays())
    setDayIndex(0)
    setSelectedId(null)
    setEditorOpen(false)
  }

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="topbar">
        <a className="brand" href="#main"><span aria-hidden="true" className="brand-mark">↗</span> Atlas</a>
        <span className="brand-tagline">A little less rush. A lot more world.</span>
      </header>
      <main id="main">
        <div className="trip-overview">
          <div className="destination-photo">
            <img src="/images/atlas-oahu.jpg" alt="Waikīkī coastline and Honolulu, Oʻahu" />
          </div>
          <div>
            <p className="eyebrow">Oʻahu, Hawaii</p>
            <h1>Hawaii itinerary</h1>
            <p>4 days</p>
          </div>
          <div className="actions">
            <button className="secondary" type="button" onClick={resetDemo}>Reset Demo</button>
          </div>
        </div>
        <p className="sample-notice">Demo · Reorder or remove stops and add up to two places per day. The four days are fixed. Edits stay in this browser tab.</p>
        <nav className="days" aria-label="Itinerary days">
          {days.map((entry, index) => (
            <button
              key={index}
              type="button"
              className={dayIndex === index ? 'active' : 'secondary'}
              aria-current={dayIndex === index ? 'step' : undefined}
              onClick={() => {
                setDayIndex(index)
                setSelectedId(null)
              }}
            >
              Day {index + 1}
              <span className="day-count">{entry.stops.length} {entry.stops.length === 1 ? 'stop' : 'stops'}</span>
            </button>
          ))}
        </nav>
        <div className="planner">
          <section className="itinerary" aria-labelledby="itinerary-heading">
            <div className="section-heading">
              <div>
                <p className="eyebrow">YOUR ITINERARY · {places.length} STOPS</p>
                <h2 id="itinerary-heading">A day to discover</h2>
              </div>
              <button type="button" disabled={day.added >= maxAdds} onClick={() => setEditorOpen(true)}>＋ Add place</button>
            </div>
            <p className="muted" role="status">{maxAdds - day.added} of {maxAdds} additions left</p>
            {places.length === 0 && <p className="empty">Start with one place you can’t wait to see.</p>}
            <ol className="stops">
              {places.map((place, index) => (
                <li className={selectedId === place.id ? 'selected' : ''} key={place.id}>
                  <button type="button" className="stop-title" aria-pressed={selectedId === place.id} onClick={() => setSelectedId(place.id)}>
                    <span className="stop-number">{index + 1}</span>
                    <strong>{place.name}</strong>
                  </button>
                  {place.latitude === null && <p className="muted">This stop has no map pin.</p>}
                  <div className="stop-tools">
                    <div className="actions">
                      <button type="button" className="text-button" aria-label={`Move ${place.name} up`} disabled={index === 0} onClick={() => moveStop(index, -1)}>↑</button>
                      <button type="button" className="text-button" aria-label={`Move ${place.name} down`} disabled={index === places.length - 1} onClick={() => moveStop(index, 1)}>↓</button>
                      <button type="button" className="text-button" aria-label={`Remove ${place.name}`} onClick={() => {
                        updateDay(current => ({ ...current, stops: current.stops.filter(item => item.id !== place.id) }))
                        if (selectedId === place.id) setSelectedId(null)
                      }}>Remove</button>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            <div className="route-box">
              <h3>Meal suggestions</h3>
              <dl className="atlas-meals">
                {['Breakfast', 'Lunch', 'Dinner'].map((meal, index) => (
                  <div key={meal}><dt>{meal}</dt><dd>{itinerary[dayIndex].meals[index]}</dd></div>
                ))}
              </dl>
            </div>
          </section>
          <section className="map-panel" aria-labelledby="map-heading">
            <div className="section-heading">
              <div>
                <p className="eyebrow">FOLLOW YOUR CURIOSITY</p>
                <h2 id="map-heading">Your day, mapped.</h2>
              </div>
              <span className="badge">{pins} {pins === 1 ? 'pin' : 'pins'}</span>
            </div>
            <TripMap destinationLocation={oahu} places={places} route={null} selectedId={selectedId} onSelect={setSelectedId} />
            <p className="muted">Drag to explore, scroll to zoom, or select a numbered destination. Map tiles use OpenStreetMap.</p>
          </section>
        </div>
      </main>
      <footer>Atlas ✳ <span>Leave a little room for the unexpected.</span></footer>
      {editorOpen && (
        <EditorDialog title="Add a place" onClose={() => setEditorOpen(false)} onSave={addStop}>
          <label>
            Place name
            <input name="place" list="atlas-place-suggestions" maxLength={80} required />
          </label>
          <datalist id="atlas-place-suggestions">
            {extraPlaces.map(name => <option key={name} value={name} />)}
          </datalist>
          <p className="muted">Choose a suggested place for a map pin, or enter your own stop.</p>
        </EditorDialog>
      )}
    </>
  )
}

createRoot(document.getElementById('root')!).render(<AtlasDemo />)
