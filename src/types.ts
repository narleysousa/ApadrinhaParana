export type Prioridade = 'ALTA' | 'MÉDIA' | 'BAIXA'
export type Cargo = 'Psicóloga'

export interface Usuario {
  id: string
  nome: string
  email: string
  senha: string // 4 dígitos
  cargo: Cargo
  iniciais: string
  criadoEm: string
}

export interface Responsavel {
  id: string
  nome: string
  iniciais: string
}

export interface Projeto {
  id: string
  nome: string
}

export interface Agent {
  id: string
  nome: string
  ativo: boolean
  criadoEm: string
}

export interface ComentarioDemanda {
  id: string
  texto: string
  criadoEm: string
  autor: Responsavel
}

export interface Demanda {
  id: string
  titulo: string
  projeto: Projeto
  responsaveis: Responsavel[]
  prioridade: Prioridade
  descricao: string
  progresso: number
  criadaEm: string
  finalizada?: boolean
  agentId?: string
  numeroCriancasAcolhidas?: number
  comentarios?: ComentarioDemanda[]
}

/** Notificação in-app para o responsável (ex.: nova demanda atribuída) */
export interface Notificacao {
  id: string
  userId: string
  demandaId: string
  tituloDemanda: string
  prioridade: Prioridade
  lida: boolean
  criadaEm: string
}
