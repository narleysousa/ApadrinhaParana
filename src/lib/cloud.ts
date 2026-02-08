import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import type { Agent, Demanda, Projeto } from '../types'
import { db, firebaseConfigurado } from './firebase'

const COLECAO_APP = 'apadrinhaParana'
const DOC_DADOS = 'dados'

interface DadosNuvem {
  projetos?: unknown
  demandas?: unknown
  agents?: unknown
}

export interface SnapshotNuvem {
  projetos: Projeto[]
  demandas: Demanda[]
  agents: Agent[]
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
    }
  } catch (error) {
    console.error('Falha ao carregar dados do Firebase:', error)
    return null
  }
}

export async function salvarDadosNuvem(dados: SnapshotNuvem): Promise<void> {
  if (!db || !firebaseConfigurado) return

  const ref = doc(db, COLECAO_APP, DOC_DADOS)
  await setDoc(
    ref,
    {
      projetos: dados.projetos,
      demandas: dados.demandas,
      agents: dados.agents,
      atualizadoEm: serverTimestamp(),
    },
    { merge: true }
  )
}

export const nuvemHabilitada = firebaseConfigurado
