import type { Demanda, Projeto, Cargo } from './types'

export const CARGOS_DISPONIVEIS: Cargo[] = ['Psicóloga', 'Assistente Social', 'Coordenador', 'Técnico', 'Administrativo']

export const PROJETOS_INICIAIS: Projeto[] = []

export function getDemandasIniciais(): Demanda[] {
  return []
}
