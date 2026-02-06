/** Gera um ID único. Usa crypto.randomUUID quando disponível. */
export function gerarId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36)
}

const CHAVE_PROJETOS = 'apadrinha-parana-projetos'
const CHAVE_DEMANDAS = 'apadrinha-parana-demandas-v2'
const CHAVE_AGENTS = 'apadrinha-parana-agents'
const CHAVE_USUARIO_LOGADO = 'apadrinha-parana-usuario'

export function carregarProjetos(): unknown[] | null {
  const raw = localStorage.getItem(CHAVE_PROJETOS)
  if (raw == null || raw === '') return null
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function salvarProjetos(projetos: unknown[]): void {
  localStorage.setItem(CHAVE_PROJETOS, JSON.stringify(projetos))
}

export function carregarDemandas(): unknown[] | null {
  const raw = localStorage.getItem(CHAVE_DEMANDAS)
  if (raw == null || raw === '') return null
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function salvarDemandas(demandas: unknown[]): void {
  localStorage.setItem(CHAVE_DEMANDAS, JSON.stringify(demandas))
}

/** Remove projetos e demandas do localStorage (para reiniciar sem dados antigos). */
export function limparProjetosEDemandas(): void {
  localStorage.removeItem(CHAVE_PROJETOS)
  localStorage.removeItem(CHAVE_DEMANDAS)
}

export function carregarAgents(): unknown[] | null {
  const raw = localStorage.getItem(CHAVE_AGENTS)
  if (raw == null || raw === '') return null
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function salvarAgents(agents: unknown[]): void {
  localStorage.setItem(CHAVE_AGENTS, JSON.stringify(agents))
}

export function carregarUsuarioLogado(): { id: string; nome: string; iniciais: string } | null {
  const raw = localStorage.getItem(CHAVE_USUARIO_LOGADO)
  if (raw == null || raw === '') return null
  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed.id === 'string' && typeof parsed.nome === 'string' && typeof parsed.iniciais === 'string') {
      return parsed
    }
    return null
  } catch {
    return null
  }
}

export function salvarUsuarioLogado(usuario: { id: string; nome: string; iniciais: string }): void {
  localStorage.setItem(CHAVE_USUARIO_LOGADO, JSON.stringify(usuario))
}

export function limparUsuarioLogado(): void {
  localStorage.removeItem(CHAVE_USUARIO_LOGADO)
}

/** Formata data para exibição em pt-BR */
export function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
