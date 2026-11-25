import { copyFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'

// GitHub Pages serves 404.html for unknown paths. Making it a copy of the app lets
// addresses like /projects/atlas open directly instead of showing a GitHub error.
function spaFallback(): Plugin {
  let outDir = 'dist'
  return {
    name: 'spa-fallback-404',
    apply: 'build',
    configResolved(config) { outDir = config.build.outDir },
    closeBundle() { copyFileSync(`${outDir}/index.html`, `${outDir}/404.html`) },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), spaFallback()],
  build: {
    rolldownOptions: {
      input: [
        fileURLToPath(new URL('./index.html', import.meta.url)),
        fileURLToPath(new URL('./demos/lol-ping/index.html', import.meta.url)),
        fileURLToPath(new URL('./demos/atlas/index.html', import.meta.url)),
        fileURLToPath(new URL('./demos/atlas/planner/index.html', import.meta.url)),
      ],
    },
  },
})
