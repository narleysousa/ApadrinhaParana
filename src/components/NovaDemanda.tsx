import { useState, useRef, useEffect } from 'react'
import type { Prioridade, Projeto, Responsavel, Agent } from '../types'
import './NovaDemanda.css'

const PRIORIDADES: Prioridade[] = ['ALTA', 'MÉDIA', 'BAIXA']

interface NovaDemandaProps {
  projetos: Projeto[]
  responsaveis: Responsavel[]
  agents: Agent[]
  onCriar: (dados: {
    titulo: string
    projetoId: string
    responsaveisIds: string[]
    prioridade: Prioridade
    descricao: string
    agentId?: string
    numeroCriancasAcolhidas?: number
  }) => void
  onAdicionarProjeto?: (nome: string) => string | void
  onAdicionarCidade?: (nome: string) => string | void
}

export function NovaDemanda({
  projetos,
  responsaveis,
  agents,
  onCriar,
  onAdicionarProjeto,
  onAdicionarCidade,
}: NovaDemandaProps) {
  const [titulo, setTitulo] = useState('')
  const [projetoId, setProjetoId] = useState('')
  const [responsaveisIds, setResponsaveisIds] = useState<string[]>([])
  const [prioridade, setPrioridade] = useState<Prioridade>('MÉDIA')
  const [descricao, setDescricao] = useState('')
  const [agentId, setAgentId] = useState('')
  const [numeroCriancas, setNumeroCriancas] = useState('')
  const [novoProjetoNome, setNovoProjetoNome] = useState('')
  const [mostrarNovoProjeto, setMostrarNovoProjeto] = useState(false)
  const [novaCidadeNome, setNovaCidadeNome] = useState('')
  const [mostrarNovaCidade, setMostrarNovaCidade] = useState(false)
  const inputNovoProjetoRef = useRef<HTMLInputElement>(null)
  const inputNovaCidadeRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (mostrarNovoProjeto) inputNovoProjetoRef.current?.focus()
  }, [mostrarNovoProjeto])

  useEffect(() => {
    if (mostrarNovaCidade) inputNovaCidadeRef.current?.focus()
  }, [mostrarNovaCidade])

  const toggleResponsavel = (id: string) => {
    setResponsaveisIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!titulo.trim() || !projetoId) return
    const numCriancas = numeroCriancas.trim()
      ? (() => {
          const n = parseInt(numeroCriancas, 10)
          return Number.isNaN(n) || n < 0 ? undefined : n
        })()
      : undefined

    onCriar({
      titulo: titulo.trim(),
      projetoId,
      responsaveisIds,
      prioridade,
      descricao: descricao.trim(),
      agentId: agentId || undefined,
      numeroCriancasAcolhidas: numCriancas,
    })
    setTitulo('')
    setProjetoId('')
    setDescricao('')
    setAgentId('')
    setNumeroCriancas('')
    setResponsaveisIds([])
    setPrioridade('MÉDIA')
  }

  const handleAdicionarProjeto = () => {
    if (novoProjetoNome.trim() && onAdicionarProjeto) {
      const novoId = onAdicionarProjeto(novoProjetoNome.trim())
      if (novoId) setProjetoId(novoId)
      setNovoProjetoNome('')
      setMostrarNovoProjeto(false)
    }
  }

  const handleAdicionarCidade = () => {
    if (novaCidadeNome.trim() && onAdicionarCidade) {
      const novoId = onAdicionarCidade(novaCidadeNome.trim())
      if (novoId) setAgentId(novoId)
      setNovaCidadeNome('')
      setMostrarNovaCidade(false)
    }
  }

  const podeCriar = titulo.trim().length > 0 && projetoId.length > 0

  return (
    <section className="nova-demanda" id="form-nova-demanda">
      <h2 className="nova-demanda-titulo">Nova Demanda</h2>
      <form onSubmit={handleSubmit} className="nova-demanda-form">
        <label className="nova-demanda-label">
          <span>Título da Tarefa <span className="nova-demanda-required" aria-hidden>*</span></span>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="nova-demanda-input"
            autoFocus
            required
            aria-required="true"
          />
        </label>

        <label className="nova-demanda-label">
          Projeto
          <div className="nova-demanda-projeto-row">
            <select
              value={projetoId}
              onChange={(e) => setProjetoId(e.target.value)}
              className="nova-demanda-select"
              disabled={mostrarNovoProjeto}
              aria-label="Selecione o projeto"
            >
              <option value="">Selecione o projeto</option>
              {projetos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="nova-demanda-btn-add"
              onClick={() => setMostrarNovoProjeto(!mostrarNovoProjeto)}
              title="Adicionar projeto"
            >
              +
            </button>
          </div>
          {mostrarNovoProjeto && (
            <div className="nova-demanda-novo-projeto">
              <input
                ref={inputNovoProjetoRef}
                type="text"
                value={novoProjetoNome}
                onChange={(e) => setNovoProjetoNome(e.target.value)}
                className="nova-demanda-input"
                aria-label="Nome do novo projeto"
                onKeyDown={(e) => e.key === 'Escape' && setMostrarNovoProjeto(false)}
              />
              <div className="nova-demanda-novo-projeto-botoes">
                <button
                  type="button"
                  className="nova-demanda-btn-confirmar"
                  onClick={handleAdicionarProjeto}
                >
                  Adicionar
                </button>
                <button
                  type="button"
                  className="nova-demanda-btn-cancelar"
                  onClick={() => {
                    setNovoProjetoNome('')
                    setMostrarNovoProjeto(false)
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </label>

        <label className="nova-demanda-label">
          Responsável
          <div className="nova-demanda-responsaveis">
            {responsaveis.map((r) => (
              <label key={r.id} className="nova-demanda-checkbox-item">
                <input
                  type="checkbox"
                  checked={responsaveisIds.includes(r.id)}
                  onChange={() => toggleResponsavel(r.id)}
                />
                <span>{r.nome}</span>
              </label>
            ))}
          </div>
        </label>

        <label className="nova-demanda-label">
          Cidade
          <div className="nova-demanda-projeto-row">
            <select
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              className="nova-demanda-select"
              disabled={mostrarNovaCidade}
              aria-label="Selecione a cidade"
            >
              <option value="">Selecione a cidade (opcional)</option>
              {agents.filter((a) => a.ativo).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nome}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="nova-demanda-btn-add"
              onClick={() => setMostrarNovaCidade(!mostrarNovaCidade)}
              title="Adicionar cidade"
            >
              +
            </button>
          </div>
          {mostrarNovaCidade && (
            <div className="nova-demanda-novo-projeto">
              <input
                ref={inputNovaCidadeRef}
                type="text"
                value={novaCidadeNome}
                onChange={(e) => setNovaCidadeNome(e.target.value)}
                className="nova-demanda-input"
                aria-label="Nome da nova cidade"
                onKeyDown={(e) => e.key === 'Escape' && setMostrarNovaCidade(false)}
              />
              <div className="nova-demanda-novo-projeto-botoes">
                <button
                  type="button"
                  className="nova-demanda-btn-confirmar"
                  onClick={handleAdicionarCidade}
                >
                  Adicionar
                </button>
                <button
                  type="button"
                  className="nova-demanda-btn-cancelar"
                  onClick={() => {
                    setNovaCidadeNome('')
                    setMostrarNovaCidade(false)
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </label>

        <label className="nova-demanda-label">
          Número de Crianças Acolhidas
          <input
            type="number"
            min="0"
            value={numeroCriancas}
            onChange={(e) => setNumeroCriancas(e.target.value)}
            className="nova-demanda-input"
            placeholder="Ex: 5 (opcional)"
            aria-label="Número de crianças acolhidas"
          />
        </label>

        <label className="nova-demanda-label">
          Prioridade
          <select
            value={prioridade}
            onChange={(e) => setPrioridade(e.target.value as Prioridade)}
            className="nova-demanda-select"
          >
            {PRIORIDADES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>

        <label className="nova-demanda-label">
          Descrição / Justificativa
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="nova-demanda-textarea"
            rows={4}
          />
        </label>

        <button
          type="submit"
          className="nova-demanda-btn-criar"
          disabled={!podeCriar}
          title={!podeCriar ? 'Preencha o título e selecione um projeto' : undefined}
        >
          <span className="nova-demanda-btn-icon">+</span>
          Criar e Notificar Responsável
        </button>
      </form>
    </section>
  )
}
