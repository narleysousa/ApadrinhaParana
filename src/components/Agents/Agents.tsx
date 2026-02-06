import { useState } from 'react'
import type { Agent } from '../../types'
import './Agents.css'

interface AgentsProps {
  agents: Agent[]
  onAdicionar: (dados: { nome: string }) => void
  onEditar: (id: string, dados: { nome: string }) => void
  onToggleAtivo: (id: string) => void
  onExcluir: (id: string) => void
}

export function Agents({
  agents,
  onAdicionar,
  onEditar,
  onToggleAtivo,
  onExcluir,
}: AgentsProps) {
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [nome, setNome] = useState('')
  const [busca, setBusca] = useState('')

  const limparForm = () => {
    setNome('')
    setEditandoId(null)
    setMostrarForm(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome.trim()) return
    if (editandoId) {
      onEditar(editandoId, { nome: nome.trim() })
    } else {
      onAdicionar({ nome: nome.trim() })
    }
    limparForm()
  }

  const iniciarEdicao = (a: Agent) => {
    setEditandoId(a.id)
    setNome(a.nome)
    setMostrarForm(true)
  }

  const agentsFiltrados = agents.filter(
    (a) => !busca || a.nome.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="agents">
      <header className="agents-header">
        <h1 className="agents-titulo">Cidades</h1>
        <p className="agents-subtitulo">
          Gerencie as cidades vinculadas às demandas.
        </p>
        <div className="agents-acoes">
          <div className="agents-busca">
            <span className="agents-busca-icon">🔍</span>
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="agents-input agents-input-busca"
            />
          </div>
          <button
            type="button"
            className="agents-btn-novo"
            onClick={() => {
              limparForm()
              setMostrarForm(!mostrarForm)
            }}
          >
            {mostrarForm ? 'Cancelar' : '+ Nova Cidade'}
          </button>
        </div>
      </header>

      {mostrarForm && (
        <section className="agents-form-section">
          <h2 className="agents-form-titulo">
            {editandoId ? 'Editar Cidade' : 'Nova Cidade'}
          </h2>
          <form onSubmit={handleSubmit} className="agents-form">
            <label className="agents-label">
              Nome
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="agents-input"
                required
              />
            </label>
            <div className="agents-form-botoes">
              <button type="submit" className="agents-btn-salvar">
                {editandoId ? 'Salvar' : 'Criar Cidade'}
              </button>
              <button
                type="button"
                className="agents-btn-cancelar"
                onClick={limparForm}
              >
                Cancelar
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="agents-lista">
        <h2 className="agents-lista-titulo">Lista de Cidades ({agents.length})</h2>
        {agentsFiltrados.length === 0 ? (
          <p className="agents-vazio">
            {agents.length === 0
              ? 'Nenhuma cidade cadastrada. Clique em "Nova Cidade" para criar.'
              : 'Nenhuma cidade encontrada na busca.'}
          </p>
        ) : (
          <ul className="agents-cards">
            {agentsFiltrados.map((agent) => (
              <li
                key={agent.id}
                className={`agents-card ${!agent.ativo ? 'agents-card-inativo' : ''}`}
              >
                <div className="agents-card-cabecalho">
                  <span className="agents-card-nome">{agent.nome}</span>
                </div>
                <div className="agents-card-rodape">
                  <label className="agents-card-toggle">
                    <input
                      type="checkbox"
                      checked={agent.ativo}
                      onChange={() => onToggleAtivo(agent.id)}
                    />
                    <span>{agent.ativo ? 'Ativo' : 'Inativo'}</span>
                  </label>
                  <span className="agents-card-data">
                    Criado em {new Date(agent.criadoEm).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="agents-card-acoes">
                  <button
                    type="button"
                    className="agents-card-btn"
                    onClick={() => iniciarEdicao(agent)}
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    className="agents-card-btn agents-card-btn-excluir"
                    onClick={() => {
                      if (window.confirm(`Excluir a cidade "${agent.nome}"?`)) {
                        onExcluir(agent.id)
                      }
                    }}
                    title="Excluir"
                  >
                    🗑
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
