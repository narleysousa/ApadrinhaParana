import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import type { Agent, Demanda, Projeto, Usuario } from '../types'
import { db, firebaseConfigurado } from './firebase'

const COLECAO_APP = 'apadrinhaParana'
const DOC_DADOS = 'dados'

interface DadosNuvem {
  projetos?: unknown
  demandas?: unknown
  agents?: unknown
  usuarios?: unknown
}

export interface SnapshotNuvem {
  projetos: Projeto[]
  demandas: Demanda[]
  agents: Agent[]
  usuarios: Usuario[]
}

function asArray<T>(valor: unknown): T[] {
  return Array.isArray(valor) ? (valor as T[]) : []
}

function limparUndefined<T>(valor: T): T {
  if (Array.isArray(valor)) {
    return valor.map((item) => limparUndefined(item)) as T
  }

  if (valor && typeof valor === 'object') {
    const resultado: Record<string, unknown> = {}
    for (const [chave, conteudo] of Object.entries(valor as Record<string, unknown>)) {
      if (conteudo !== undefined) {
        resultado[chave] = limparUndefined(conteudo)
      }
    }
    return resultado as T
  }

  return valor
}

export async function carregarDadosNuvem(): Promise<SnapshotNuvem> {
  if (!db || !firebaseConfigurado) {
    throw new Error('Firebase não está configurado.')
  }

  try {
    const ref = doc(db, COLECAO_APP, DOC_DADOS)
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      return {
        projetos: [],
        demandas: [],
        agents: [],
        usuarios: [],
      }
    }

    const data = snap.data() as DadosNuvem
    return {
      projetos: asArray<Projeto>(data.projetos),
      demandas: asArray<Demanda>(data.demandas),
      agents: asArray<Agent>(data.agents),
      usuarios: asArray<Usuario>(data.usuarios),
    }
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : String(error)
    throw new Error(`Não foi possível carregar dados da nuvem: ${mensagem}`)
  }
}

export interface ResultadoSync {
  sucesso: boolean
  offline?: boolean
  semPermissao?: boolean
}

export async function salvarDadosNuvem(dados: SnapshotNuvem): Promise<ResultadoSync> {
  if (!db || !firebaseConfigurado) {
    return { sucesso: false }
  }

  if (!navigator.onLine) {
    return { sucesso: false, offline: true }
  }

  try {
    const ref = doc(db, COLECAO_APP, DOC_DADOS)
    await setDoc(
      ref,
      {
        projetos: limparUndefined(dados.projetos),
        demandas: limparUndefined(dados.demandas),
        agents: limparUndefined(dados.agents),
        usuarios: limparUndefined(dados.usuarios),
        atualizadoEm: serverTimestamp(),
      },
      { merge: true }
    )
    return { sucesso: true }
  } catch (error: unknown) {
    // Verificar se é erro de permissão (comum quando Firebase não está configurado corretamente)
    const errorMessage = error instanceof Error ? error.message : String(error)
    const isPermissionError =
      errorMessage.includes('permission') ||
      errorMessage.includes('PERMISSION_DENIED') ||
      errorMessage.includes('Missing or insufficient permissions')

    if (isPermissionError) {
      console.warn('Firebase: sem permissão para salvar.')
      return { sucesso: false, semPermissao: true }
    }

    console.error('Firebase: falha ao salvar:', error)
    return { sucesso: false }
  }
}

export const nuvemHabilitada = firebaseConfigurado
