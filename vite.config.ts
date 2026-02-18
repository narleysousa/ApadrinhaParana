import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// No GitHub Actions defina VITE_BASE_PATH (ex.: /ApadrinhaParana/ ou /Demandas---Apadrinha-parana/)
// No Node (vite.config) usamos process.env; no browser o Vite injeta import.meta.env
const base = process.env.VITE_BASE_PATH as string | undefined

export default defineConfig(({ command }) => ({
  base: base?.trim() ? base : (command === 'serve' ? '/' : '/ApadrinhaParana/'),
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/xlsx')) return 'xlsx'
          if (id.includes('node_modules/firebase')) return 'firebase'
          if (
            id.includes('node_modules/react') ||
            id.includes('node_modules/react-dom') ||
            id.includes('node_modules/scheduler')
          ) {
            return 'react-vendor'
          }
          return undefined
        },
      },
    },
  },
}))
