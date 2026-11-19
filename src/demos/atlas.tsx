import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import './atlas.css'

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

export function AtlasDemo() {
  const [days, setDays] = useState(loadDays)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(days))
    } catch {
      // Storage is optional for the current page session.
    }
  }, [days])

  function updateDay(dayIndex: number, update: (day: Day) => Day) {
    setDays(current => current.map((day, index) => index === dayIndex ? update(day) : day))
  }

  function moveStop(dayIndex: number, index: number, direction: -1 | 1) {
    updateDay(dayIndex, day => {
      const next = index + direction
      if (next < 0 || next >= day.stops.length) return day
      const stops = [...day.stops]
      ;[stops[index], stops[next]] = [stops[next], stops[index]]
      return { ...day, stops }
    })
  }

  function addStop(event: FormEvent<HTMLFormElement>, dayIndex: number) {
    event.preventDefault()
    const form = event.currentTarget
    const name = String(new FormData(form).get('place') ?? '').trim()
    if (!name) return

    updateDay(dayIndex, day => {
      if (day.added >= maxAdds) return day
      const stop = { id: `${dayIndex}-added-${day.added}`, name }
      return { added: day.added + 1, stops: [...day.stops, stop] }
    })
    form.reset()
  }

  return (
    <main className="atlas-planner">
      <header className="atlas-header">
        <div>
          <p className="atlas-brand">Atlas</p>
          <h1>Hawaii · 4-day itinerary</h1>
        </div>
        <button className="atlas-reset" type="button" onClick={() => {
          setDays(initialDays())
          setNotice('Demo reset.')
        }}>Reset Demo</button>
      </header>
      <p className="atlas-notice">
        Demo · Reorder or remove stops and add up to two places per day. The four days are fixed. Edits stay in this browser tab.
      </p>
      <span className="atlas-sr-only" role="status">{notice}</span>
      <div className="atlas-days">
        {days.map((day, dayIndex) => (
          <section className="atlas-day" key={dayIndex} aria-labelledby={`day-${dayIndex}`}>
            <h2 id={`day-${dayIndex}`}>Day {dayIndex + 1}</h2>
            {day.stops.length === 0 ? <p className="atlas-muted">No stops yet.</p> : (
              <ol className="atlas-stops">
                {day.stops.map((stop, index) => (
                  <li key={stop.id}>
                    <span>{stop.name}</span>
                    <div className="atlas-stop-actions">
                      <button type="button" disabled={index === 0} onClick={() => moveStop(dayIndex, index, -1)} aria-label={`Move ${stop.name} up`}>↑</button>
                      <button type="button" disabled={index === day.stops.length - 1} onClick={() => moveStop(dayIndex, index, 1)} aria-label={`Move ${stop.name} down`}>↓</button>
                      <button type="button" onClick={() => updateDay(dayIndex, current => ({
                        ...current,
                        stops: current.stops.filter(item => item.id !== stop.id),
                      }))} aria-label={`Remove ${stop.name}`}>×</button>
                    </div>
                  </li>
                ))}
              </ol>
            )}
            <form className="atlas-add" onSubmit={event => addStop(event, dayIndex)}>
              <input name="place" placeholder="New place" aria-label={`New place for Day ${dayIndex + 1}`} maxLength={80} required disabled={day.added >= maxAdds} />
              <button type="submit" disabled={day.added >= maxAdds}>Add place</button>
            </form>
            <p className="atlas-limit">{maxAdds - day.added} of {maxAdds} additions left</p>
            <h3>Meal suggestions</h3>
            <dl className="atlas-meals">
              {['Breakfast', 'Lunch', 'Dinner'].map((meal, index) => (
                <div key={meal}>
                  <dt>{meal}</dt>
                  <dd>{itinerary[dayIndex].meals[index]}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<AtlasDemo />)
