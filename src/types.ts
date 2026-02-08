export type Prioridade = 'ALTA' | 'MÉDIA' | 'BAIXA'

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
  comentarios?: ComentarioDemanda[]
}
