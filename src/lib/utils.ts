import type { Usuario, Cargo } from '../types'

/** Gera um ID único. Usa crypto.randomUUID quando disponível. */
export function gerarId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36)
}

/** Gera iniciais a partir do nome (até 2 letras) */
export function gerarIniciais(nome: string): string {
  const palavras = nome.trim().split(/\s+/)
  if (palavras.length === 1) {
    return palavras[0].slice(0, 2).toUpperCase()
  }
  return (palavras[0][0] + palavras[palavras.length - 1][0]).toUpperCase()
}

const CHAVE_PROJETOS = 'apadrinha-parana-projetos'
const CHAVE_DEMANDAS = 'apadrinha-parana-demandas-v2'
const CHAVE_AGENTS = 'apadrinha-parana-agents'
const CHAVE_USUARIO_LOGADO = 'apadrinha-parana-usuario-v2'
const CHAVE_USUARIOS = 'apadrinha-parana-usuarios'

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

// ========== USUÁRIOS ==========

export function carregarUsuarios(): Usuario[] {
  const raw = localStorage.getItem(CHAVE_USUARIOS)
  if (raw == null || raw === '') return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function salvarUsuarios(usuarios: Usuario[]): void {
  localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios))
}

export interface ResultadoCadastro {
  sucesso: boolean
  erro?: string
  usuario?: Usuario
}

export function cadastrarUsuario(dados: {
  nome: string
  email: string
  senha: string
  cargo: Cargo
}): ResultadoCadastro {
  const { nome, email, senha, cargo } = dados

  // Validações
  if (!nome.trim()) {
    return { sucesso: false, erro: 'Nome é obrigatório' }
  }
  if (!email.trim() || !email.includes('@')) {
    return { sucesso: false, erro: 'Email inválido' }
  }
  if (!/^\d{4}$/.test(senha)) {
    return { sucesso: false, erro: 'Senha deve ter exatamente 4 dígitos' }
  }

  const usuarios = carregarUsuarios()

  // Verificar se email já existe
  const emailNormalizado = email.trim().toLowerCase()
  if (usuarios.some(u => u.email.toLowerCase() === emailNormalizado)) {
    return { sucesso: false, erro: 'Este email já está cadastrado' }
  }

  const novoUsuario: Usuario = {
    id: gerarId(),
    nome: nome.trim(),
    email: emailNormalizado,
    senha,
    cargo,
    iniciais: gerarIniciais(nome),
    criadoEm: new Date().toISOString(),
  }

  usuarios.push(novoUsuario)
  salvarUsuarios(usuarios)

  return { sucesso: true, usuario: novoUsuario }
}

export interface ResultadoLogin {
  sucesso: boolean
  erro?: string
  usuario?: Usuario
}

export function autenticarUsuario(email: string, senha: string): ResultadoLogin {
  if (!email.trim() || !senha) {
    return { sucesso: false, erro: 'Email e senha são obrigatórios' }
  }

  const usuarios = carregarUsuarios()
  const emailNormalizado = email.trim().toLowerCase()

  const usuario = usuarios.find(
    u => u.email.toLowerCase() === emailNormalizado && u.senha === senha
  )

  if (!usuario) {
    return { sucesso: false, erro: 'Email ou senha incorretos' }
  }

  return { sucesso: true, usuario }
}

export function carregarUsuarioLogado(): Usuario | null {
  const raw = localStorage.getItem(CHAVE_USUARIO_LOGADO)
  if (raw == null || raw === '') return null
  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed.id === 'string' && typeof parsed.email === 'string') {
      return parsed as Usuario
    }
    return null
  } catch {
    return null
  }
}

export function salvarUsuarioLogado(usuario: Usuario): void {
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
