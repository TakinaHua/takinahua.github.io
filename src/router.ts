// A tiny History API router: the garden is "/", and each landmark opens its own address.
import { useSyncExternalStore } from 'react'
import type { MouseEvent } from 'react'
import { flushSync } from 'react-dom'

export type Route =
  | { view: 'garden' }
  | { view: 'projects', projectId?: string }
  | { view: 'experience' }
  | { view: 'about' }
  | { view: 'contact' }

const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  addEventListener('popstate', listener)
  return () => {
    listeners.delete(listener)
    removeEventListener('popstate', listener)
  }
}

const currentPath = () => location.pathname

export function usePath() {
  return useSyncExternalStore(subscribe, currentPath)
}

export function parseRoute(path: string): Route {
  const [first, second] = path.split('/').filter(Boolean)
  if (first === 'projects') return { view: 'projects', projectId: second }
  if (first === 'experience' || first === 'about' || first === 'contact') return { view: first }
  return { view: 'garden' }
}

export function navigate(path: string, { replace = false } = {}) {
  if (path === location.pathname) return
  const update = () => {
    history[replace ? 'replaceState' : 'pushState'](null, '', path)
    flushSync(() => listeners.forEach(listener => listener()))
  }
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!document.startViewTransition || reduceMotion) {
    update()
    return
  }
  // A quick second navigation skips the first transition; that rejection is expected.
  const transition = document.startViewTransition(update)
  const ignore = () => {}
  transition.ready.catch(ignore)
  transition.finished.catch(ignore)
  transition.updateCallbackDone.catch(ignore)
}

// Let ordinary links route in place, while keeping new-tab and modified clicks native.
export function routeClick(event: MouseEvent<HTMLAnchorElement>) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  navigate(event.currentTarget.pathname)
}
