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
import { carregarDadosNuvem, nuvemHabilitada, salvarDadosNuvem } from './lib/cloud'
import './App.css'

type Aba = 'demandas' | 'agentes'
const ROTA_DEMANDAS = '#/'
const ROTA_AGENTS = '#/agents'

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

function normalizarProjetos(lista: Projeto[]): Projeto[] {
  return lista.filter((p) => p && !projetoEhRemovido(p.nome))
}

function normalizarDemandas(lista: Demanda[]): Demanda[] {
  return lista.filter((d) => d?.projeto && !projetoEhRemovido(d.projeto.nome))
}

function normalizarPath(pathname: string): string {
  const semBarraFinal = pathname.replace(/\/+$/, '')
  return semBarraFinal === '' ? '/' : semBarraFinal.toLowerCase()
}

function normalizarHash(hash: string): string {
  const semPrefixo = hash.replace(/^#/, '')
  const semBarraFinal = semPrefixo.replace(/\/+$/, '')
  const base = semBarraFinal === '' ? '/' : semBarraFinal.toLowerCase()
  return base.startsWith('/') ? base : `/${base}`
}

function getAbaPorRota(hash: string, pathname: string): Aba {
  const rotaHash = normalizarHash(hash)
  if (rotaHash === '/agents' || rotaHash === '/agentes') return 'agentes'

  const path = normalizarPath(pathname)
  if (path === '/agents' || path === '/agentes') return 'agentes'
  if (path.endsWith('/agents') || path.endsWith('/agentes')) return 'agentes'
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
    return getAbaPorRota(window.location.hash, window.location.pathname)
  })
  const [projetos, setProjetos] = useState<Projeto[]>(() => {
    const saved = carregarProjetos()
    if (Array.isArray(saved)) {
      return normalizarProjetos(saved as Projeto[])
    }
    return normalizarProjetos(PROJETOS_INICIAIS)
  })
  const [demandas, setDemandas] = useState<Demanda[]>(() => {
    const saved = carregarDemandas()
    if (Array.isArray(saved)) {
      return normalizarDemandas(saved as Demanda[])
    }
    return normalizarDemandas(getDemandasIniciais())
  })
  const [agents, setAgents] = useState<Agent[]>(() => {
    const saved = carregarAgents()
    if (Array.isArray(saved)) return saved as Agent[]
    return []
  })
  const [mensagemSucesso, setMensagemSucesso] = useState('')
  const [nuvemInicializada, setNuvemInicializada] = useState(!nuvemHabilitada)

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
    if (!nuvemHabilitada) return

    let ativo = true
    ;(async () => {
      const dadosNuvem = await carregarDadosNuvem()
      if (!ativo) return

      if (dadosNuvem) {
        setProjetos(normalizarProjetos(dadosNuvem.projetos))
        setDemandas(normalizarDemandas(dadosNuvem.demandas))
        setAgents(dadosNuvem.agents)
      }

      setNuvemInicializada(true)
    })()

    return () => {
      ativo = false
    }
  }, [])

  useEffect(() => {
    if (!nuvemHabilitada || !nuvemInicializada) return

    const t = window.setTimeout(() => {
      salvarDadosNuvem({ projetos, demandas, agents }).catch((error) => {
        console.error('Falha ao salvar dados no Firebase:', error)
      })
    }, 650)

    return () => window.clearTimeout(t)
  }, [projetos, demandas, agents, nuvemInicializada])

  useEffect(() => {
    const onRouteChange = () => {
      setAba(getAbaPorRota(window.location.hash, window.location.pathname))
    }

    window.addEventListener('popstate', onRouteChange)
    window.addEventListener('hashchange', onRouteChange)
    return () => {
      window.removeEventListener('popstate', onRouteChange)
      window.removeEventListener('hashchange', onRouteChange)
    }
  }, [])

  useEffect(() => {
    const rotaEsperada = getPathPorAba(aba)
    if (window.location.hash !== rotaEsperada) {
      window.history.replaceState(
        window.history.state,
        '',
        `${window.location.pathname}${window.location.search}${rotaEsperada}`
      )
    }
  }, [aba])

  const handleMudarAba = useCallback((novaAba: Aba) => {
    setAba(novaAba)
    const novaRota = getPathPorAba(novaAba)
    if (window.location.hash !== novaRota) {
      window.history.pushState(
        window.history.state,
        '',
        `${window.location.pathname}${window.location.search}${novaRota}`
      )
    }
  }, [])

  const handleCriar = useCallback(
    (dados: {
      titulo: string
      projetoId: string
      responsaveisIds: string[]
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
        prioridade: dados.prioridade,
        descricao: dados.descricao,
        progresso: 0,
        criadaEm: new Date().toISOString(),
        finalizada: false,
        agentId: dados.agentId,
        comentarios: [],
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

  const handleAdicionarCidade = useCallback(
    (nome: string) => {
      const nomeLimpo = nome.trim()
      if (!nomeLimpo) return

      const existente = agents.find(
        (a) => a.nome.trim().toLowerCase() === nomeLimpo.toLowerCase()
      )
      if (existente) {
        if (!existente.ativo) {
          setAgents((prev) =>
            prev.map((a) => (a.id === existente.id ? { ...a, ativo: true } : a))
          )
        }
        return existente.id
      }

      const id = gerarId()
      setAgents((prev) => [
        ...prev,
        {
          id,
          nome: nomeLimpo,
          ativo: true,
          criadoEm: new Date().toISOString(),
        },
      ])
      return id
    },
    [agents]
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

  const handleAdicionarComentario = useCallback(
    (demandaId: string, texto: string) => {
      if (!usuarioLogado || !texto.trim()) return

      setDemandas((prev) =>
        prev.map((d) => {
          if (d.id !== demandaId) return d
          return {
            ...d,
            comentarios: [
              ...(d.comentarios ?? []),
              {
                id: gerarId(),
                texto: texto.trim(),
                criadoEm: new Date().toISOString(),
                autor: usuarioLogado,
              },
            ],
          }
        })
      )
    },
    [usuarioLogado]
  )

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
              onAdicionarCidade={handleAdicionarCidade}
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
              onAdicionarComentario={handleAdicionarComentario}
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
