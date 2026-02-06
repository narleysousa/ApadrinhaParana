import type { Demanda, Projeto, Responsavel } from './types'

export type RoleUsuario = 'Gestor' | 'Colaborador'

export interface UsuarioLogin extends Responsavel {
  role: RoleUsuario
}

export const USUARIOS_LOGIN: UsuarioLogin[] = [
  { id: '1', nome: 'Alana Brígida', iniciais: 'AB', role: 'Colaborador' },
  { id: '2', nome: 'Thami', iniciais: 'T', role: 'Colaborador' },
]

export const RESPONSAVEIS_INICIAIS: Responsavel[] = USUARIOS_LOGIN.map(
  ({ id, nome, iniciais }) => ({ id, nome, iniciais })
)

export const PROJETOS_INICIAIS: Projeto[] = []

export function getDemandasIniciais(): Demanda[] {
  return []
}
