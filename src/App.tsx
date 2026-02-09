import { useState, useCallback, useEffect, useMemo } from 'react'
import { Header } from './components/Header'
import { Login } from './components/Login/Login'
import { LoadingScreen } from './components/LoadingScreen'
import { NovaDemanda } from './components/NovaDemanda'
import { MinhasDemandas } from './components/MinhasDemandas'
import { Agents } from './components/Agents/Agents'
import type { Demanda, Projeto, Prioridade, Agent, Responsavel, Usuario } from './types'
import { gerarId, gerarIniciais } from './lib/utils'
import {
  carregarDadosNuvem,
  nuvemHabilitada,
  salvarDadosNuvem,
  type ResultadoSync,
} from './lib/cloud'
import './components/LoadingScreen.css'
import './App.css'

type Aba = 'demandas' | 'agentes'
type StatusSync = 'sincronizado' | 'sincronizando' | 'offline' | 'erro'

interface ResultadoAcesso {
  sucesso: boolean
  erro?: string
  usuario?: Usuario
}

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

function mensagemErroSync(resultado: ResultadoSync): string {
  if (resultado.offline) return 'Sem internet para salvar na nuvem.'
  if (resultado.semPermissao) return 'Sem permissão para gravar no Firebase.'
  return 'Falha ao salvar na nuvem.'
}

function App() {
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null)

  const [carregandoInicial, setCarregandoInicial] = useState(true)
  const [erroInicial, setErroInicial] = useState('')
  const [online, setOnline] = useState(navigator.onLine)
  const [statusSync, setStatusSync] = useState<StatusSync>(
    navigator.onLine ? 'sincronizado' : 'offline'
  )

  const [aba, setAba] = useState<Aba>(() => {
    if (typeof window === 'undefined') return 'demandas'
    return getAbaPorRota(window.location.hash, window.location.pathname)
  })

  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [demandas, setDemandas] = useState<Demanda[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])

  const [mensagemSucesso, setMensagemSucesso] = useState('')
  const [nuvemInicializada, setNuvemInicializada] = useState(false)

  const responsaveis: Responsavel[] = useMemo(() => {
    return usuarios.map((u) => ({
      id: u.id,
      nome: u.nome,
      iniciais: u.iniciais,
    }))
  }, [usuarios])

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true)
      setStatusSync('sincronizado')
    }
    const handleOffline = () => {
      setOnline(false)
      setStatusSync('offline')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    let ativo = true

    ;(async () => {
      if (!nuvemHabilitada) {
        if (!ativo) return
        setErroInicial('Firebase não configurado. Este app funciona somente com nuvem.')
        setCarregandoInicial(false)
        return
      }

      try {
        const dadosNuvem = await carregarDadosNuvem()
        if (!ativo) return

        setProjetos(normalizarProjetos(dadosNuvem.projetos))
        setDemandas(normalizarDemandas(dadosNuvem.demandas))
        setAgents(dadosNuvem.agents)
        setUsuarios(dadosNuvem.usuarios)
      } catch (error) {
        if (!ativo) return
        const mensagem = error instanceof Error ? error.message : String(error)
        setErroInicial(mensagem)
      } finally {
        if (ativo) {
          setNuvemInicializada(true)
          setCarregandoInicial(false)
        }
      }
    })()

    return () => {
      ativo = false
    }
  }, [])

  useEffect(() => {
    if (!nuvemHabilitada || !nuvemInicializada) return

    if (!online) {
      setStatusSync('offline')
      return
    }

    let ativo = true
    setStatusSync('sincronizando')

    salvarDadosNuvem({ projetos, demandas, agents, usuarios })
      .then((resultado) => {
        if (!ativo) return
        if (resultado.offline) {
          setStatusSync('offline')
        } else if (resultado.sucesso) {
          setStatusSync('sincronizado')
        } else {
          setStatusSync('erro')
        }
      })
      .catch((error) => {
        if (!ativo) return
        console.error('Falha ao salvar dados no Firebase:', error)
        setStatusSync('erro')
      })

    return () => {
      ativo = false
    }
  }, [projetos, demandas, agents, usuarios, nuvemInicializada, online])

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
      numeroCriancasAcolhidas?: number
    }) => {
      const projeto = projetos.find((p) => p.id === dados.projetoId)
      if (!projeto || !usuarioLogado) return

      const responsaveisDemanda = usuarios
        .filter((u) => dados.responsaveisIds.includes(u.id))
        .map((u) => ({ id: u.id, nome: u.nome, iniciais: u.iniciais }))

      const nova: Demanda = {
        id: gerarId(),
        titulo: dados.titulo,
        projeto,
        responsaveis:
          responsaveisDemanda.length > 0
            ? responsaveisDemanda
            : [{ id: usuarioLogado.id, nome: usuarioLogado.nome, iniciais: usuarioLogado.iniciais }],
        prioridade: dados.prioridade,
        descricao: dados.descricao,
        progresso: 0,
        criadaEm: new Date().toISOString(),
        finalizada: false,
        agentId: dados.agentId,
        numeroCriancasAcolhidas: dados.numeroCriancasAcolhidas,
        comentarios: [],
      }

      setDemandas((prev) => [nova, ...prev])
      setMensagemSucesso('Demanda criada com sucesso.')
      setTimeout(() => setMensagemSucesso(''), 3000)
    },
    [projetos, usuarioLogado, usuarios]
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
    setDemandas((prev) => prev.map((d) => (d.id === id ? { ...d, finalizada: !d.finalizada } : d)))
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
                autor: {
                  id: usuarioLogado.id,
                  nome: usuarioLogado.nome,
                  iniciais: usuarioLogado.iniciais,
                },
              },
            ],
          }
        })
      )
    },
    [usuarioLogado]
  )

  const handleExcluirComentario = useCallback(
    (demandaId: string, comentarioId: string) => {
      setDemandas((prev) =>
        prev.map((d) => {
          if (d.id !== demandaId) return d
          return {
            ...d,
            comentarios: (d.comentarios ?? []).filter((c) => c.id !== comentarioId),
          }
        })
      )
    },
    []
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
      setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, nome: dados.nome } : a)))
    },
    []
  )

  const handleAgentsToggleAtivo = useCallback((id: string) => {
    setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, ativo: !a.ativo } : a)))
  }, [])

  const handleAgentsExcluir = useCallback((id: string) => {
    setAgents((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const handleAutenticar = useCallback(
    async (email: string, senha: string): Promise<ResultadoAcesso> => {
      if (!email.trim() || !senha) {
        return { sucesso: false, erro: 'Email e senha são obrigatórios' }
      }

      const emailNormalizado = email.trim().toLowerCase()
      const usuario = usuarios.find(
        (u) => u.email.toLowerCase() === emailNormalizado && u.senha === senha
      )

      if (!usuario) {
        return { sucesso: false, erro: 'Email ou senha incorretos' }
      }

      return { sucesso: true, usuario }
    },
    [usuarios]
  )

  const handleCadastrar = useCallback(
    async (dados: { nome: string; email: string; senha: string; cargo: Usuario['cargo'] }): Promise<ResultadoAcesso> => {
      const { nome, email, senha, cargo } = dados

      if (!nome.trim()) {
        return { sucesso: false, erro: 'Nome é obrigatório' }
      }
      if (!email.trim() || !email.includes('@')) {
        return { sucesso: false, erro: 'Email inválido' }
      }
      if (!/^\d{4}$/.test(senha)) {
        return { sucesso: false, erro: 'Senha deve ter exatamente 4 dígitos' }
      }

      const emailNormalizado = email.trim().toLowerCase()
      const emailExiste = usuarios.some((u) => u.email.toLowerCase() === emailNormalizado)
      if (emailExiste) {
        return { sucesso: false, erro: 'Este email já está cadastrado' }
      }

      const novoUsuario: Usuario = {
        id: gerarId(),
        nome: nome.trim(),
        email: emailNormalizado,
        senha,
        cargo,
        iniciais: gerarIniciais(nome),
        criadoEm: new Date().toISOString(),
      }

      const proximoUsuarios = [...usuarios, novoUsuario]
      const resultadoSync = await salvarDadosNuvem({
        projetos,
        demandas,
        agents,
        usuarios: proximoUsuarios,
      })

      if (!resultadoSync.sucesso) {
        return { sucesso: false, erro: mensagemErroSync(resultadoSync) }
      }

      setUsuarios(proximoUsuarios)
      return { sucesso: true, usuario: novoUsuario }
    },
    [usuarios, projetos, demandas, agents]
  )

  const handleEntrar = useCallback((usuario: Usuario) => {
    setUsuarioLogado(usuario)
  }, [])

  const handleSair = useCallback(() => {
    setUsuarioLogado(null)
  }, [])

  if (carregandoInicial) {
    return <LoadingScreen mensagem="Sincronizando dados na nuvem..." />
  }

  if (erroInicial) {
    return <LoadingScreen mensagem={erroInicial} />
  }

  if (!usuarioLogado) {
    return (
      <Login
        onEntrar={handleEntrar}
        onAutenticar={handleAutenticar}
        onCadastrar={handleCadastrar}
      />
    )
  }

  const getStatusSyncLabel = () => {
    switch (statusSync) {
      case 'sincronizando':
        return '⟳ Sincronizando...'
      case 'offline':
        return '⚡ Offline'
      case 'erro':
        return '⚠️ Erro ao sincronizar'
      default:
        return '✓ Sincronizado'
    }
  }

  return (
    <div className="app">
      <Header usuarioAtual={usuarioLogado} onSair={handleSair} />

      {nuvemHabilitada && (
        <div className={`app-status app-status--${statusSync}`} role="status" aria-live="polite">
          {getStatusSyncLabel()}
        </div>
      )}

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
              responsaveis={responsaveis}
              agents={agents}
              onCriar={handleCriar}
              onAdicionarProjeto={handleAdicionarProjeto}
              onAdicionarCidade={handleAdicionarCidade}
            />
          </aside>
          <div className="app-conteudo">
            <MinhasDemandas
              demandas={demandas}
              responsaveis={responsaveis}
              agents={agents}
              usuarioAtualId={usuarioLogado.id}
              onExcluir={handleExcluir}
              onToggleFinalizada={handleToggleFinalizada}
              onAdicionarComentario={handleAdicionarComentario}
              onExcluirComentario={handleExcluirComentario}
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
