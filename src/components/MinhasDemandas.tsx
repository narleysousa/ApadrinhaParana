import { useState, useMemo, useEffect } from 'react'
import type { Demanda, Responsavel, Agent } from '../types'
import { exportarDemandasExcel } from '../lib/exportExcel'
import './MinhasDemandas.css'

const DIAS_DEMANDA_ANTIGA = 14
const DEBOUNCE_BUSCA_MS = 280
const CHAVE_COMENTARIOS_VISTOS = 'apadrinha-comentarios-vistos'
type AbaDemandas = 'andamento' | 'finalizadas'
type AbaCard = 'detalhes' | 'comentarios'

function getChaveComentariosVistos(usuarioId: string, demandaId: string): string {
  return `${CHAVE_COMENTARIOS_VISTOS}-${usuarioId}-${demandaId}`
}

function getLatestCommentTime(demanda: Demanda): string {
  const comentarios = Array.isArray(demanda.comentarios) ? demanda.comentarios : []
  if (comentarios.length === 0) return ''
  return comentarios.reduce((max, c) => (c.criadoEm > max ? c.criadoEm : max), comentarios[0].criadoEm)
}

interface MinhasDemandasProps {
  demandas: Demanda[]
  responsaveis: Responsavel[]
  agents: Agent[]
  usuarioAtualId: string
  onExcluir: (id: string) => void
  onToggleFinalizada: (id: string) => void
  onAdicionarComentario: (demandaId: string, texto: string) => void
  onExcluirComentario: (demandaId: string, comentarioId: string) => void
}

export function MinhasDemandas({
  demandas,
  responsaveis,
  agents,
  usuarioAtualId,
  onExcluir,
  onToggleFinalizada,
  onAdicionarComentario,
  onExcluirComentario,
}: MinhasDemandasProps) {
  const [buscaInput, setBuscaInput] = useState('')
  const [busca, setBusca] = useState('')
  const [filtroProjeto, setFiltroProjeto] = useState('todos')
  const [filtroResponsavel, setFiltroResponsavel] = useState('todos')
  const [abaDemandas, setAbaDemandas] = useState<AbaDemandas>('andamento')
  const [abasCard, setAbasCard] = useState<Record<string, AbaCard>>({})
  const [comentariosInput, setComentariosInput] = useState<Record<string, string>>({})
  const [comentariosVistosEm, setComentariosVistosEm] = useState<Record<string, string>>({})

  useEffect(() => {
    try {
      const prefix = `${CHAVE_COMENTARIOS_VISTOS}-${usuarioAtualId}-`
      const visto: Record<string, string> = {}
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith(prefix)) {
          const demandaId = key.slice(prefix.length)
          const val = localStorage.getItem(key)
          if (val) visto[demandaId] = val
        }
      }
      setComentariosVistosEm(visto)
    } catch {
      // ignorar localStorage indisponível
    }
  }, [usuarioAtualId])

  useEffect(() => {
    const t = setTimeout(() => setBusca(buscaInput), DEBOUNCE_BUSCA_MS)
    return () => clearTimeout(t)
  }, [buscaInput])

  const projetosUnicos = useMemo(() => {
    const map = new Map<string, { id: string; nome: string }>()
    demandas.forEach((d) => {
      if (!map.has(d.projeto.id)) map.set(d.projeto.id, d.projeto)
    })
    return Array.from(map.values())
  }, [demandas])

  const demandasBaseFiltradas = useMemo(() => {
    return demandas.filter((d) => {
      const titulo = (d.titulo ?? '').toLowerCase()
      const descricao = (d.descricao ?? '').toLowerCase()
      const termoBusca = busca.toLowerCase()
      const matchBusca =
        !busca ||
        titulo.includes(termoBusca) ||
        descricao.includes(termoBusca)
      const matchProjeto =
        filtroProjeto === 'todos' || d.projeto.id === filtroProjeto
      const responsaveisDemanda = getResponsaveisDemanda(d)
      const matchResponsavel =
        filtroResponsavel === 'todos' ||
        (filtroResponsavel === 'eu' && responsaveisDemanda.some((r) => r.id === usuarioAtualId)) ||
        responsaveisDemanda.some((r) => r.id === filtroResponsavel)
      return (
        matchBusca &&
        matchProjeto &&
        matchResponsavel
      )
    })
  }, [
    demandas,
    busca,
    filtroProjeto,
    filtroResponsavel,
    usuarioAtualId,
  ])

  const demandasFiltradas = useMemo(() => {
    return demandasBaseFiltradas.filter((d) =>
      abaDemandas === 'andamento' ? !d.finalizada : d.finalizada
    )
  }, [demandasBaseFiltradas, abaDemandas])

  const resumo = useMemo(() => {
    const ativas = demandas.filter((d) => !d.finalizada)
    return {
      total: ativas.length,
      alta: ativas.filter((d) => d.prioridade === 'ALTA').length,
      media: ativas.filter((d) => d.prioridade === 'MÉDIA').length,
      baixa: ativas.filter((d) => d.prioridade === 'BAIXA').length,
    }
  }, [demandas])

  const demandasAntigas = useMemo(() => {
    const agora = new Date()
    return demandas.filter((d) => {
      if (d.finalizada) return false
      const criada = new Date(d.criadaEm)
      const ts = criada.getTime()
      if (Number.isNaN(ts)) return false
      const dias = (agora.getTime() - ts) / (1000 * 60 * 60 * 24)
      return dias >= DIAS_DEMANDA_ANTIGA
    })
  }, [demandas])

  const contagemAbertas = useMemo(
    () => demandas.filter((d) => !d.finalizada).length,
    [demandas]
  )
  const contagemFinalizadas = useMemo(
    () => demandas.filter((d) => d.finalizada).length,
    [demandas]
  )

  const marcarComentariosVistos = (demandaId: string, ultimoComentarioEm: string) => {
    if (!ultimoComentarioEm) return
    setComentariosVistosEm((prev) => ({ ...prev, [demandaId]: ultimoComentarioEm }))
    try {
      localStorage.setItem(
        getChaveComentariosVistos(usuarioAtualId, demandaId),
        ultimoComentarioEm
      )
    } catch {
      // ignorar
    }
  }

  const handleMudarAbaCard = (demandaId: string, aba: AbaCard, demanda?: Demanda) => {
    setAbasCard((prev) => ({ ...prev, [demandaId]: aba }))
    if (aba === 'comentarios' && demanda) {
      const latest = getLatestCommentTime(demanda)
      if (latest) marcarComentariosVistos(demandaId, latest)
    }
  }

  const temComentariosNaoVistos = (demanda: Demanda): boolean => {
    const comentarios = Array.isArray(demanda.comentarios) ? demanda.comentarios : []
    if (comentarios.length === 0) return false
    const latest = getLatestCommentTime(demanda)
    const vistoEm = comentariosVistosEm[demanda.id]
    return !vistoEm || latest > vistoEm
  }

  const handleComentarioChange = (demandaId: string, texto: string) => {
    setComentariosInput((prev) => ({ ...prev, [demandaId]: texto }))
  }

  const handleComentarioSubmit = (demandaId: string) => {
    const texto = (comentariosInput[demandaId] ?? '').trim()
    if (!texto) return
    onAdicionarComentario(demandaId, texto)
    setComentariosInput((prev) => ({ ...prev, [demandaId]: '' }))
    setAbasCard((prev) => ({ ...prev, [demandaId]: 'comentarios' }))
  }

  const formatarDataHora = (iso: string) => {
    const data = new Date(iso)
    if (Number.isNaN(data.getTime())) return '-'
    return `${data.toLocaleDateString('pt-BR')} às ${data.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })}`
  }

  const formatarContato = (nome?: string, telefone?: string, email?: string) => {
    const partes = [nome, telefone, email].filter((valor) => typeof valor === 'string' && valor.trim())
    return partes.length > 0 ? partes.join(' | ') : '-'
  }

  function getResponsaveisDemanda(demanda: Demanda): Responsavel[] {
    return Array.isArray(demanda.responsaveis) ? demanda.responsaveis : []
  }

  return (
    <div className="minhas-demandas">
      <section className="minhas-demandas-resumo">
        <h2 className="minhas-demandas-titulo">Minhas Demandas</h2>
        <p className="minhas-demandas-total">{resumo.total} demandas</p>
        <div className="minhas-demandas-caixas">
          <div className="minhas-demandas-caixa minhas-demandas-caixa-alta">
            {resumo.alta} ALTA
          </div>
          <div className="minhas-demandas-caixa minhas-demandas-caixa-media">
            {resumo.media} MÉDIA
          </div>
          <div className="minhas-demandas-caixa minhas-demandas-caixa-baixa">
            {resumo.baixa} BAIXA
          </div>
        </div>
      </section>

      {demandasAntigas.length > 0 && (
        <section className="minhas-demandas-alerta">
          <h3 className="minhas-demandas-alerta-titulo">
            Atenção: Demanda Antiga
          </h3>
          {demandasAntigas.slice(0, 3).map((d) => (
            <div key={d.id} className="minhas-demandas-alerta-item">
              <span className="minhas-demandas-alerta-icon">⏱</span>
              <div>
                <p className="minhas-demandas-alerta-nome">{d.titulo}</p>
                <p className="minhas-demandas-alerta-data">
                  Criada em {new Date(d.criadaEm).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          ))}
        </section>
      )}

      <section className="minhas-tarefas">
        <h2 className="minhas-tarefas-titulo">
          <span className="minhas-tarefas-icon">📋</span>
          Minhas Tarefas
        </h2>
        <div className="minhas-tarefas-status">
          <button
            type="button"
            className={`minhas-tarefas-btn ${abaDemandas === 'andamento' ? 'ativo' : ''}`}
            onClick={() => setAbaDemandas('andamento')}
            aria-pressed={abaDemandas === 'andamento'}
          >
            Em andamento ({contagemAbertas})
          </button>
          <button
            type="button"
            className={`minhas-tarefas-btn ${abaDemandas === 'finalizadas' ? 'ativo' : ''}`}
            onClick={() => setAbaDemandas('finalizadas')}
            aria-pressed={abaDemandas === 'finalizadas'}
          >
            Finalizadas ({contagemFinalizadas})
          </button>
          <button
            type="button"
            className="minhas-tarefas-btn-exportar"
            onClick={() => {
              const demandasParaExportar = demandas.filter(d =>
                abaDemandas === 'andamento' ? !d.finalizada : d.finalizada
              )
              const nomeArquivo = abaDemandas === 'andamento'
                ? 'demandas_em_andamento'
                : 'demandas_finalizadas'
              void exportarDemandasExcel(demandasParaExportar, agents, nomeArquivo).catch((error) => {
                console.error('Falha ao exportar demandas para Excel:', error)
                alert('Não foi possível exportar para Excel.')
              })
            }}
            title={`Exportar ${abaDemandas === 'andamento' ? 'em andamento' : 'finalizadas'} para Excel`}
          >
            📥 Exportar Excel
          </button>
        </div>

        <div className="minhas-tarefas-filtros">
          <div className="minhas-tarefas-busca">
            <span className="minhas-tarefas-busca-icon">🔍</span>
            <input
              type="search"
              value={buscaInput}
              onChange={(e) => setBuscaInput(e.target.value)}
              className="minhas-tarefas-input"
              aria-label="Buscar demandas"
            />
          </div>
          <div className="minhas-tarefas-botoes">
            <select
              value={filtroProjeto}
              onChange={(e) => setFiltroProjeto(e.target.value)}
              className="minhas-tarefas-select"
              aria-label="Filtrar por projeto"
            >
              <option value="todos">Todos Projetos</option>
              {projetosUnicos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="minhas-tarefas-responsavel">
            <span>Responsável:</span>
            <select
              value={filtroResponsavel}
              onChange={(e) => setFiltroResponsavel(e.target.value)}
              className="minhas-tarefas-select"
              aria-label="Filtrar por responsável"
            >
              <option value="todos">Todos</option>
              <option value="eu">Eu</option>
              {responsaveis
                .filter((r) => r.id !== usuarioAtualId)
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nome}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <ul className="minhas-tarefas-lista">
          {demandasFiltradas.map((d) => {
            const abaCard = abasCard[d.id] ?? 'detalhes'
            const comentarios = Array.isArray(d.comentarios) ? d.comentarios : []
            const responsaveisDemanda = getResponsaveisDemanda(d)
            const textoComentario = comentariosInput[d.id] ?? ''
            return (
              <li
                key={d.id}
                className={`minhas-tarefas-card ${d.finalizada ? 'finalizada' : ''}`}
              >
                <div className="minhas-tarefas-card-topo">
                  <h3 className="minhas-tarefas-card-titulo">{d.titulo}</h3>
                  <span
                    className={`minhas-tarefas-card-prioridade prioridade-${d.prioridade === 'ALTA' ? 'alta' : d.prioridade === 'MÉDIA' ? 'media' : 'baixa'
                      }`}
                    title={`Prioridade ${d.prioridade}`}
                  >
                    {d.prioridade}
                  </span>
                </div>
                <div className="minhas-tarefas-card-meta">
                  <span className="minhas-tarefas-card-projeto">
                    {d.projeto.nome.length > 24
                      ? `${d.projeto.nome.slice(0, 24)}...`
                      : d.projeto.nome}
                  </span>
                  {d.agentId && (() => {
                    const cidade = agents.find(a => a.id === d.agentId)
                    return cidade ? (
                      <span className="minhas-tarefas-card-cidade" title={cidade.nome}>
                        📍 {cidade.nome}
                      </span>
                    ) : null
                  })()}
                </div>

                <div className="minhas-tarefas-card-abas" role="tablist" aria-label="Abas da atividade">
                  <button
                    type="button"
                    id={`tab-detalhes-${d.id}`}
                    className={`minhas-tarefas-card-aba ${abaCard === 'detalhes' ? 'ativa' : ''}`}
                    onClick={() => handleMudarAbaCard(d.id, 'detalhes')}
                    role="tab"
                    aria-selected={abaCard === 'detalhes'}
                    aria-controls={`panel-detalhes-${d.id}`}
                  >
                    Detalhes
                  </button>
                  <button
                    type="button"
                    id={`tab-comentarios-${d.id}`}
                    className={`minhas-tarefas-card-aba ${abaCard === 'comentarios' ? 'ativa' : ''} ${comentarios.length > 0 ? (temComentariosNaoVistos(d) ? 'minhas-tarefas-card-aba--novos' : 'minhas-tarefas-card-aba--visto') : ''}`}
                    onClick={() => handleMudarAbaCard(d.id, 'comentarios', d)}
                    role="tab"
                    aria-selected={abaCard === 'comentarios'}
                    aria-controls={`panel-comentarios-${d.id}`}
                    title={temComentariosNaoVistos(d) ? 'Novos comentários não visualizados' : undefined}
                  >
                    Comentários ({comentarios.length})
                  </button>
                </div>

                {abaCard === 'detalhes' && (
                  <div
                    id={`panel-detalhes-${d.id}`}
                    className="minhas-tarefas-card-painel"
                    role="tabpanel"
                    aria-labelledby={`tab-detalhes-${d.id}`}
                  >
                    <dl className="minhas-tarefas-card-detalhes-lista">
                      <div className="minhas-tarefas-card-detalhes-item">
                        <dt>Projeto</dt>
                        <dd>{d.projeto?.nome ?? '-'}</dd>
                      </div>
                      <div className="minhas-tarefas-card-detalhes-item">
                        <dt>Cidade</dt>
                        <dd>
                          {d.agentId
                            ? (agents.find((a) => a.id === d.agentId)?.nome ?? '-')
                            : '-'}
                        </dd>
                      </div>
                      <div className="minhas-tarefas-card-detalhes-item">
                        <dt>Prioridade</dt>
                        <dd>{d.prioridade}</dd>
                      </div>
                      <div className="minhas-tarefas-card-detalhes-item">
                        <dt>Criada em</dt>
                        <dd>{formatarDataHora(d.criadaEm)}</dd>
                      </div>
                      {d.finalizadaEm && (
                        <div className="minhas-tarefas-card-detalhes-item">
                          <dt>Finalizada em</dt>
                          <dd>{formatarDataHora(d.finalizadaEm)}</dd>
                        </div>
                      )}
                      {d.reabertaEm && (
                        <div className="minhas-tarefas-card-detalhes-item">
                          <dt>Reaberta em</dt>
                          <dd>{formatarDataHora(d.reabertaEm)}</dd>
                        </div>
                      )}
                      {typeof d.numeroCriancasAcolhidas === 'number' && (
                        <div className="minhas-tarefas-card-detalhes-item">
                          <dt>Nº de crianças acolhidas</dt>
                          <dd>{d.numeroCriancasAcolhidas}</dd>
                        </div>
                      )}
                      {typeof d.numeroTotalCriancasAdolescentes === 'number' && (
                        <div className="minhas-tarefas-card-detalhes-item">
                          <dt>Nº total de crianças e adolescentes</dt>
                          <dd>{d.numeroTotalCriancasAdolescentes}</dd>
                        </div>
                      )}
                      {d.nomeInstituicao && (
                        <div className="minhas-tarefas-card-detalhes-item">
                          <dt>Instituição</dt>
                          <dd>{d.nomeInstituicao}</dd>
                        </div>
                      )}
                      {Array.isArray(d.tiposAcolhimento) && d.tiposAcolhimento.length > 0 && (
                        <div className="minhas-tarefas-card-detalhes-item">
                          <dt>Tipo de acolhimento</dt>
                          <dd>{d.tiposAcolhimento.join(', ')}</dd>
                        </div>
                      )}
                      {typeof d.capacidadeAcolhimento === 'number' && (
                        <div className="minhas-tarefas-card-detalhes-item">
                          <dt>Capacidade de acolhimento</dt>
                          <dd>{d.capacidadeAcolhimento}</dd>
                        </div>
                      )}
                      {d.nomeRespondentePesquisa && (
                        <div className="minhas-tarefas-card-detalhes-item">
                          <dt>Nome de quem respondeu</dt>
                          <dd>{d.nomeRespondentePesquisa}</dd>
                        </div>
                      )}
                      {d.servicosDesejados && (
                        <div className="minhas-tarefas-card-detalhes-item">
                          <dt>Serviços desejados</dt>
                          <dd>{d.servicosDesejados}</dd>
                        </div>
                      )}
                      {(d.responsavelTecnicoNome || d.responsavelTecnicoTelefone || d.responsavelTecnicoEmail) && (
                        <div className="minhas-tarefas-card-detalhes-item">
                          <dt>Responsável técnico</dt>
                          <dd>{formatarContato(d.responsavelTecnicoNome, d.responsavelTecnicoTelefone, d.responsavelTecnicoEmail)}</dd>
                        </div>
                      )}
                      {(d.representanteDivulgacaoNome || d.representanteDivulgacaoTelefone || d.representanteDivulgacaoEmail) && (
                        <div className="minhas-tarefas-card-detalhes-item">
                          <dt>Representante de divulgação</dt>
                          <dd>{formatarContato(d.representanteDivulgacaoNome, d.representanteDivulgacaoTelefone, d.representanteDivulgacaoEmail)}</dd>
                        </div>
                      )}
                    </dl>
                    {d.descricao && (
                      <p className="minhas-tarefas-card-descricao">{d.descricao}</p>
                    )}
                    <div className="minhas-tarefas-card-responsaveis">
                      {responsaveisDemanda.map((r) => (
                        <span
                          key={r.id}
                          className="minhas-tarefas-card-avatar"
                          title={r.nome}
                        >
                          {r.iniciais}
                        </span>
                      ))}
                      <span className="minhas-tarefas-card-resp-texto">
                        {responsaveisDemanda.length} Resp.
                        {responsaveisDemanda.some((r) => r.id === usuarioAtualId)
                          ? ' (Você)'
                          : ''}
                      </span>
                    </div>
                  </div>
                )}

                {abaCard === 'comentarios' && (
                  <div
                    id={`panel-comentarios-${d.id}`}
                    className="minhas-tarefas-card-painel"
                    role="tabpanel"
                    aria-labelledby={`tab-comentarios-${d.id}`}
                  >
                    {comentarios.length === 0 ? (
                      <p className="minhas-tarefas-card-sem-comentarios">
                        Nenhum comentário ainda. Adicione uma observação abaixo.
                      </p>
                    ) : (
                      <ul className="minhas-tarefas-comentarios-lista">
                        {comentarios.map((comentario) => (
                          <li key={comentario.id} className="minhas-tarefas-comentario-item">
                            <span
                              className="minhas-tarefas-card-avatar"
                              title={comentario.autor.nome}
                            >
                              {comentario.autor.iniciais}
                            </span>
                            <div className="minhas-tarefas-comentario-conteudo">
                              <p className="minhas-tarefas-comentario-meta">
                                <strong>{comentario.autor.nome}</strong> • {formatarDataHora(comentario.criadoEm)}
                              </p>
                              <p className="minhas-tarefas-comentario-texto">{comentario.texto}</p>
                            </div>
                            <button
                              type="button"
                              className="minhas-tarefas-comentario-excluir"
                              onClick={() => {
                                if (window.confirm('Excluir este comentário?')) {
                                  onExcluirComentario(d.id, comentario.id)
                                }
                              }}
                              title="Excluir comentário"
                              aria-label="Excluir comentário"
                            >
                              🗑
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

                    <form
                      className="minhas-tarefas-comentario-form"
                      onSubmit={(e) => {
                        e.preventDefault()
                        handleComentarioSubmit(d.id)
                      }}
                    >
                      <textarea
                        value={textoComentario}
                        onChange={(e) => handleComentarioChange(d.id, e.target.value)}
                        className="minhas-tarefas-comentario-textarea"
                        rows={3}
                        placeholder="Escreva um comentário ou observação sobre esta demanda..."
                      />
                      <div className="minhas-tarefas-comentario-acoes">
                        <button
                          type="submit"
                          className="minhas-tarefas-comentario-btn"
                          disabled={!textoComentario.trim()}
                        >
                          Comentar
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="minhas-tarefas-card-acoes">
                  <button
                    type="button"
                    className="minhas-tarefas-card-btn"
                    onClick={() => onToggleFinalizada(d.id)}
                    title={d.finalizada ? 'Reabrir atividade' : 'Marcar como finalizada'}
                    aria-label={d.finalizada ? 'Reabrir atividade' : 'Marcar como finalizada'}
                  >
                    {d.finalizada ? '↩' : '✓'}
                  </button>
                  <button
                    type="button"
                    className="minhas-tarefas-card-btn excluir"
                    onClick={() => onExcluir(d.id)}
                    title="Excluir atividade"
                    aria-label="Excluir atividade"
                  >
                    🗑
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
        {demandasFiltradas.length === 0 && (
          <div className="minhas-tarefas-vazio" role="status">
            <p>
              {demandas.length === 0
                ? 'Nenhuma demanda ainda. Crie a primeira usando o formulário ao lado.'
                : abaDemandas === 'andamento'
                  ? 'Nenhuma tarefa em andamento com os filtros aplicados.'
                  : 'Nenhuma tarefa finalizada com os filtros aplicados.'}
            </p>
            {demandas.length === 0 && (
              <button
                type="button"
                className="minhas-tarefas-vazio-cta"
                onClick={() =>
                  document.getElementById('form-nova-demanda')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  })
                }
              >
                Criar primeira demanda
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
