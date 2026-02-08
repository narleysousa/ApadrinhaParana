import type { Demanda, Projeto, Cargo } from './types'

export const CARGOS_DISPONIVEIS: Cargo[] = ['Gestor', 'Colaborador', 'Analista', 'Coordenador']

export const PROJETOS_INICIAIS: Projeto[] = []

export function getDemandasIniciais(): Demanda[] {
  return []
}
