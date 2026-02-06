import { useState, useCallback, useEffect } from 'react'
import { Header } from './components/Header'
import { Login } from './components/Login/Login'
import { NovaDemanda } from './components/NovaDemanda'
import { MinhasDemandas } from './components/MinhasDemandas'
import { Agents } from './components/Agents/Agents'
import type { Demanda, Projeto, Prioridade, Agent, Responsavel } from './types'
import {
  RESPONSAVEIS_INICIAIS,
  PROJETOS_INICIAIS,
  getDemandasIniciais,
  USUARIOS_LOGIN,
} from './constants'
import {
  gerarId,
  carregarProjetos,
  salvarProjetos,
  carregarDemandas,
  salvarDemandas,
  carregarAgents,
  salvarAgents,
  carregarUsuarioLogado,
  salvarUsuarioLogado,
  limparUsuarioLogado,
} from './lib/utils'
import './App.css'

type Aba = 'demandas' | 'agentes'
const ROTA_DEMANDAS = '/'
const ROTA_AGENTS = '/agents'

const NOMES_PROJETOS_REMOVIDOS = new Set([
  'em andamento',
  'finalizados',
  'automação do whatsapp',
  'sistema de acompanhamento',
  'ir na padaria',
])

function projetoEhRemovido(nome: string): boolean {
  return NOMES_PROJETOS_REMOVIDOS.has(nome.trim().toLowerCase())
}

function normalizarPath(pathname: string): string {
  const semBarraFinal = pathname.replace(/\/+$/, '')
  return semBarraFinal === '' ? '/' : semBarraFinal.toLowerCase()
}

function getAbaPorPath(pathname: string): Aba {
  const path = normalizarPath(pathname)
  if (path === '/agents' || path === '/agentes') return 'agentes'
  return 'demandas'
}

function getPathPorAba(aba: Aba): string {
  return aba === 'agentes' ? ROTA_AGENTS : ROTA_DEMANDAS
}

function App() {
  const [usuarioLogado, setUsuarioLogado] = useState<Responsavel | null>(() => {
    const saved = carregarUsuarioLogado()
    if (!saved) return null
    const atual = USUARIOS_LOGIN.find((u) => u.id === saved.id)
    if (atual) return { id: atual.id, nome: atual.nome, iniciais: atual.iniciais }
    return saved
  })

  useEffect(() => {
    const saved = carregarUsuarioLogado()
    if (!saved) return
    const atual = USUARIOS_LOGIN.find((u) => u.id === saved.id)
    if (atual && (saved.nome !== atual.nome || saved.iniciais !== atual.iniciais)) {
      salvarUsuarioLogado({ id: atual.id, nome: atual.nome, iniciais: atual.iniciais })
    }
  }, [])
  const [aba, setAba] = useState<Aba>(() => {
    if (typeof window === 'undefined') return 'demandas'
    return getAbaPorPath(window.location.pathname)
  })
  const [projetos, setProjetos] = useState<Projeto[]>(() => {
    const saved = carregarProjetos()
    if (Array.isArray(saved)) {
      return (saved as Projeto[]).filter(
        (p) => p && !projetoEhRemovido(p.nome)
      )
    }
    return PROJETOS_INICIAIS.filter((p) => p && !projetoEhRemovido(p.nome))
  })
  const [demandas, setDemandas] = useState<Demanda[]>(() => {
    const saved = carregarDemandas()
    if (Array.isArray(saved)) {
      return (saved as Demanda[]).filter(
        (d) => d?.projeto && !projetoEhRemovido(d.projeto.nome)
      )
    }
    return getDemandasIniciais().filter(
      (d) => d?.projeto && !projetoEhRemovido(d.projeto.nome)
    )
  })
  const [agents, setAgents] = useState<Agent[]>(() => {
    const saved = carregarAgents()
    if (Array.isArray(saved)) return saved as Agent[]
    return []
  })
  const [mensagemSucesso, setMensagemSucesso] = useState('')

  useEffect(() => {
    salvarProjetos(projetos)
  }, [projetos])

  useEffect(() => {
    salvarDemandas(demandas)
  }, [demandas])

  useEffect(() => {
    salvarAgents(agents)
  }, [agents])

  useEffect(() => {
    const onPopState = () => {
      setAba(getAbaPorPath(window.location.pathname))
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    const pathEsperado = getPathPorAba(aba)
    if (window.location.pathname !== pathEsperado) {
      window.history.replaceState(window.history.state, '', pathEsperado)
    }
  }, [aba])

  const handleMudarAba = useCallback((novaAba: Aba) => {
    setAba(novaAba)
    const novoPath = getPathPorAba(novaAba)
    if (window.location.pathname !== novoPath) {
      window.history.pushState(window.history.state, '', novoPath)
    }
  }, [])

  const handleCriar = useCallback(
    (dados: {
      titulo: string
      projetoId: string
      responsaveisIds: string[]
      categoria: string
      prioridade: Prioridade
      descricao: string
      agentId?: string
    }) => {
      const projeto = projetos.find((p) => p.id === dados.projetoId)
      if (!projeto) return
      const responsaveisDemanda = RESPONSAVEIS_INICIAIS.filter((r) =>
        dados.responsaveisIds.includes(r.id)
      )
      const nova: Demanda = {
        id: gerarId(),
        titulo: dados.titulo,
        projeto,
        responsaveis:
          responsaveisDemanda.length > 0
            ? responsaveisDemanda
            : [RESPONSAVEIS_INICIAIS[0]],
        categoria: dados.categoria,
        prioridade: dados.prioridade,
        descricao: dados.descricao,
        progresso: 0,
        criadaEm: new Date().toISOString(),
        finalizada: false,
        agentId: dados.agentId,
      }
      setDemandas((prev) => [nova, ...prev])
      setMensagemSucesso('Demanda criada com sucesso.')
      setTimeout(() => setMensagemSucesso(''), 3000)
    },
    [projetos]
  )

  const handleAdicionarProjeto = useCallback(
    (nome: string) => {
      const nomeLimpo = nome.trim()
      if (!nomeLimpo || projetoEhRemovido(nomeLimpo)) return
      const projetoExistente = projetos.find(
        (p) => p.nome.trim().toLowerCase() === nomeLimpo.toLowerCase()
      )
      if (projetoExistente) return projetoExistente.id
      const id = gerarId()
      setProjetos((prev) => [...prev, { id, nome: nomeLimpo }])
      return id
    },
    [projetos]
  )

  const handleExcluir = useCallback((id: string) => {
    if (window.confirm('Excluir esta demanda?')) {
      setDemandas((prev) => prev.filter((d) => d.id !== id))
    }
  }, [])

  const handleToggleFinalizada = useCallback((id: string) => {
    setDemandas((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, finalizada: !d.finalizada } : d
      )
    )
  }, [])

  const handleAgentsAdicionar = useCallback((dados: { nome: string }) => {
    setAgents((prev) => [
      ...prev,
      {
        id: gerarId(),
        nome: dados.nome,
        ativo: true,
        criadoEm: new Date().toISOString(),
      },
    ])
  }, [])

  const handleAgentsEditar = useCallback(
    (id: string, dados: { nome: string }) => {
      setAgents((prev) =>
        prev.map((a) => (a.id === id ? { ...a, nome: dados.nome } : a))
      )
    },
    []
  )

  const handleAgentsToggleAtivo = useCallback((id: string) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ativo: !a.ativo } : a))
    )
  }, [])

  const handleAgentsExcluir = useCallback((id: string) => {
    setAgents((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const handleEntrar = useCallback((usuario: Responsavel) => {
    salvarUsuarioLogado(usuario)
    setUsuarioLogado(usuario)
  }, [])

  const handleSair = useCallback(() => {
    limparUsuarioLogado()
    setUsuarioLogado(null)
  }, [])

  if (!usuarioLogado) {
    return (
      <Login
        usuarios={USUARIOS_LOGIN}
        onEntrar={handleEntrar}
      />
    )
  }

  return (
    <div className="app">
      <Header usuarioAtual={usuarioLogado} onSair={handleSair} />
      <nav className="app-nav" aria-label="Navegação principal">
        <button
          type="button"
          className={`app-nav-btn ${aba === 'demandas' ? 'ativo' : ''}`}
          onClick={() => handleMudarAba('demandas')}
          aria-pressed={aba === 'demandas'}
        >
          Demandas
        </button>
        <button
          type="button"
          className={`app-nav-btn ${aba === 'agentes' ? 'ativo' : ''}`}
          onClick={() => handleMudarAba('agentes')}
          aria-pressed={aba === 'agentes'}
        >
          Cidades
        </button>
      </nav>
      {mensagemSucesso && (
        <div className="app-toast" role="status" aria-live="polite">
          <span>{mensagemSucesso}</span>
          <button
            type="button"
            className="app-toast-fechar"
            onClick={() => setMensagemSucesso('')}
            aria-label="Fechar mensagem"
          >
            ×
          </button>
        </div>
      )}
      {aba === 'demandas' && (
        <main id="main" className="app-main">
          <aside className="app-aside">
            <NovaDemanda
              projetos={projetos}
              responsaveis={RESPONSAVEIS_INICIAIS}
              agents={agents}
              onCriar={handleCriar}
              onAdicionarProjeto={handleAdicionarProjeto}
            />
          </aside>
          <div className="app-conteudo">
            <MinhasDemandas
              demandas={demandas}
              responsaveis={RESPONSAVEIS_INICIAIS}
              agents={agents}
              usuarioAtualId={usuarioLogado.id}
              onExcluir={handleExcluir}
              onToggleFinalizada={handleToggleFinalizada}
            />
          </div>
        </main>
      )}
      {aba === 'agentes' && (
        <main id="main" className="app-main app-main--single">
          <Agents
            agents={agents}
            onAdicionar={handleAgentsAdicionar}
            onEditar={handleAgentsEditar}
            onToggleAtivo={handleAgentsToggleAtivo}
            onExcluir={handleAgentsExcluir}
          />
        </main>
      )}
    </div>
  )
}

export default App
