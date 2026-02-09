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

export async function carregarDadosNuvem(): Promise<SnapshotNuvem | null> {
  if (!db || !firebaseConfigurado) return null

  try {
    const ref = doc(db, COLECAO_APP, DOC_DADOS)
    const snap = await getDoc(ref)
    if (!snap.exists()) return null

    const data = snap.data() as DadosNuvem
    return {
      projetos: asArray<Projeto>(data.projetos),
      demandas: asArray<Demanda>(data.demandas),
      agents: asArray<Agent>(data.agents),
      usuarios: asArray<Usuario>(data.usuarios),
    }
  } catch (error) {
    // Silenciar erros de permissão - dados locais continuam funcionando
    console.warn('Firebase: não foi possível carregar dados da nuvem:', error)
    return null
  }
}

export interface ResultadoSync {
  sucesso: boolean
  offline?: boolean
  semPermissao?: boolean
}

export async function salvarDadosNuvem(dados: SnapshotNuvem): Promise<ResultadoSync> {
  if (!db || !firebaseConfigurado) {
    return { sucesso: true } // Sem Firebase configurado = tudo ok localmente
  }

  if (!navigator.onLine) {
    return { sucesso: true, offline: true }
  }

  try {
    const ref = doc(db, COLECAO_APP, DOC_DADOS)
    await setDoc(
      ref,
      {
        projetos: dados.projetos,
        demandas: dados.demandas,
        agents: dados.agents,
        usuarios: dados.usuarios,
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
      console.warn('Firebase: sem permissão para salvar. Dados salvos apenas localmente.')
      return { sucesso: true, semPermissao: true }
    }

    console.error('Firebase: falha ao salvar:', error)
    return { sucesso: false }
  }
}

export const nuvemHabilitada = firebaseConfigurado

