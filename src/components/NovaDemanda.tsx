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
    categoria: string
    prioridade: Prioridade
    descricao: string
    agentId?: string
  }) => void
  onAdicionarProjeto?: (nome: string) => string | void
}

export function NovaDemanda({
  projetos,
  responsaveis,
  agents,
  onCriar,
  onAdicionarProjeto,
}: NovaDemandaProps) {
  const [titulo, setTitulo] = useState('')
  const [projetoId, setProjetoId] = useState('')
  const [responsaveisIds, setResponsaveisIds] = useState<string[]>([])
  const [categoria, setCategoria] = useState('')
  const [prioridade, setPrioridade] = useState<Prioridade>('MÉDIA')
  const [descricao, setDescricao] = useState('')
  const [agentId, setAgentId] = useState('')
  const [novoProjetoNome, setNovoProjetoNome] = useState('')
  const [mostrarNovoProjeto, setMostrarNovoProjeto] = useState(false)
  const inputNovoProjetoRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (mostrarNovoProjeto) inputNovoProjetoRef.current?.focus()
  }, [mostrarNovoProjeto])

  const toggleResponsavel = (id: string) => {
    setResponsaveisIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!titulo.trim() || !projetoId) return
    onCriar({
      titulo: titulo.trim(),
      projetoId,
      responsaveisIds,
      categoria,
      prioridade,
      descricao: descricao.trim(),
      agentId: agentId || undefined,
    })
    setTitulo('')
    setDescricao('')
    setAgentId('')
    setResponsaveisIds([])
    setCategoria('')
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
              <button
                type="button"
                className="nova-demanda-btn-confirmar"
                onClick={handleAdicionarProjeto}
              >
                Adicionar
              </button>
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
          Categoria
          <input
            type="text"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="nova-demanda-input"
          />
        </label>

        <label className="nova-demanda-label">
          Cidade
          <select
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            className="nova-demanda-select"
            aria-label="Selecione a cidade"
          >
            <option value="">Selecione a cidade (opcional)</option>
            {agents.filter(a => a.ativo).map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome}
              </option>
            ))}
          </select>
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
