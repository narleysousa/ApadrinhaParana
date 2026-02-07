import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {}
const githubRepository = env.GITHUB_REPOSITORY
const repositoryName = githubRepository?.split('/')[1]

function resolveBasePath(command: string): string {
  if (command === 'serve') {
    return '/'
  }

  if (!repositoryName) {
    return '/ApadrinhaParana/'
  }

  return repositoryName.toLowerCase().slice(-10) === '.github.io' ? '/' : `/${repositoryName}/`
}

export default defineConfig(({ command }) => ({
  base: resolveBasePath(command),
  plugins: [react()],
}))
