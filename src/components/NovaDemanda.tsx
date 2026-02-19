import { useState, useRef, useEffect } from 'react'
import type { Prioridade, Projeto, Responsavel, Agent } from '../types'
import './NovaDemanda.css'

const PRIORIDADES: Prioridade[] = ['ALTA', 'MÉDIA', 'BAIXA']
const TIPOS_ACOLHIMENTO = ['Abrigo', 'Casa Lar', 'Família acolhedora'] as const
const OPCAO_TODOS_SERVICOS = 'Todos os serviços'
const SERVICOS_DESEJADOS_OPCOES = [
  'Curso preparatório online de padrinhos, certificado pela EJUD',
  'Entrevistas e acompanhamento de padrinhos pela equipe, incluindo cadastro e análise de antecedentes',
  'Encontros de acompanhamento entre padrinhos de diferentes Comarcas',
  'Encontros entre instituições de acolhimento de diferentes Comarcas',
  'Apoio para divulgação presencial (folders, cartazes, orientação de boas práticas e mobilização de divulgadores voluntários)',
  'Apoio para divulgação online (anúncios patrocinados e orientações estratégicas)',
  'Plataforma Conecte Afetos para exibição de vídeos e informações de adolescentes disponíveis ao apadrinhamento',
  'Todas as alternativas anteriores (se a Comarca já tiver programa, o Apadrinha Paraná funciona em paralelo)',
  OPCAO_TODOS_SERVICOS,
] as const

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
    numeroTotalCriancasAdolescentes?: number
    capacidadeAcolhimento?: number
    nomeInstituicao?: string
    tiposAcolhimento?: string[]
    nomeRespondentePesquisa?: string
    servicosDesejados?: string
    responsavelTecnicoNome?: string
    responsavelTecnicoTelefone?: string
    responsavelTecnicoEmail?: string
    representanteDivulgacaoNome?: string
    representanteDivulgacaoTelefone?: string
    representanteDivulgacaoEmail?: string
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
  const [numeroTotalCriancasAdolescentes, setNumeroTotalCriancasAdolescentes] = useState('')
  const [capacidadeAcolhimento, setCapacidadeAcolhimento] = useState('')
  const [nomeInstituicao, setNomeInstituicao] = useState('')
  const [tiposAcolhimento, setTiposAcolhimento] = useState<string[]>([])
  const [nomeRespondentePesquisa, setNomeRespondentePesquisa] = useState('')
  const [servicosDesejadosSelecionados, setServicosDesejadosSelecionados] = useState<string[]>([])
  const [responsavelTecnicoNome, setResponsavelTecnicoNome] = useState('')
  const [responsavelTecnicoTelefone, setResponsavelTecnicoTelefone] = useState('')
  const [responsavelTecnicoEmail, setResponsavelTecnicoEmail] = useState('')
  const [representanteDivulgacaoNome, setRepresentanteDivulgacaoNome] = useState('')
  const [representanteDivulgacaoTelefone, setRepresentanteDivulgacaoTelefone] = useState('')
  const [representanteDivulgacaoEmail, setRepresentanteDivulgacaoEmail] = useState('')
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

  useEffect(() => {
    if (!nomeInstituicao.trim() && tiposAcolhimento.length > 0) {
      setTiposAcolhimento([])
    }
    if (!nomeInstituicao.trim() && capacidadeAcolhimento.length > 0) {
      setCapacidadeAcolhimento('')
    }
  }, [nomeInstituicao, tiposAcolhimento.length, capacidadeAcolhimento.length])

  const toggleResponsavel = (id: string) => {
    setResponsaveisIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    )
  }

  const toggleTipoAcolhimento = (tipo: string) => {
    setTiposAcolhimento((prev) =>
      prev.includes(tipo) ? prev.filter((t) => t !== tipo) : [...prev, tipo]
    )
  }

  const toggleServicoDesejado = (servico: string) => {
    setServicosDesejadosSelecionados((prev) => {
      if (servico === OPCAO_TODOS_SERVICOS) {
        return prev.includes(OPCAO_TODOS_SERVICOS) ? [] : [OPCAO_TODOS_SERVICOS]
      }
      const semTodos = prev.filter((item) => item !== OPCAO_TODOS_SERVICOS)
      return semTodos.includes(servico)
        ? semTodos.filter((item) => item !== servico)
        : [...semTodos, servico]
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!titulo.trim() || !projetoId) return
    const textoOpcional = (valor: string) => {
      const texto = valor.trim()
      return texto || undefined
    }
    const numCriancas = numeroCriancas.trim()
      ? (() => {
          const n = parseInt(numeroCriancas, 10)
          return Number.isNaN(n) || n < 0 ? undefined : n
        })()
      : undefined
    const totalCriancasAdolescentes = numeroTotalCriancasAdolescentes.trim()
      ? (() => {
          const n = parseInt(numeroTotalCriancasAdolescentes, 10)
          return Number.isNaN(n) || n < 0 ? undefined : n
        })()
      : undefined
    const capacidade = capacidadeAcolhimento.trim()
      ? (() => {
          const n = parseInt(capacidadeAcolhimento, 10)
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
      numeroTotalCriancasAdolescentes: totalCriancasAdolescentes,
      capacidadeAcolhimento: capacidade,
      nomeInstituicao: textoOpcional(nomeInstituicao),
      tiposAcolhimento: nomeInstituicao.trim() ? tiposAcolhimento : undefined,
      nomeRespondentePesquisa: textoOpcional(nomeRespondentePesquisa),
      servicosDesejados:
        servicosDesejadosSelecionados.length > 0
          ? servicosDesejadosSelecionados.join('; ')
          : undefined,
      responsavelTecnicoNome: textoOpcional(responsavelTecnicoNome),
      responsavelTecnicoTelefone: textoOpcional(responsavelTecnicoTelefone),
      responsavelTecnicoEmail: textoOpcional(responsavelTecnicoEmail),
      representanteDivulgacaoNome: textoOpcional(representanteDivulgacaoNome),
      representanteDivulgacaoTelefone: textoOpcional(representanteDivulgacaoTelefone),
      representanteDivulgacaoEmail: textoOpcional(representanteDivulgacaoEmail),
    })
    setTitulo('')
    setProjetoId('')
    setDescricao('')
    setAgentId('')
    setNumeroCriancas('')
    setNumeroTotalCriancasAdolescentes('')
    setCapacidadeAcolhimento('')
    setNomeInstituicao('')
    setTiposAcolhimento([])
    setNomeRespondentePesquisa('')
    setServicosDesejadosSelecionados([])
    setResponsavelTecnicoNome('')
    setResponsavelTecnicoTelefone('')
    setResponsavelTecnicoEmail('')
    setRepresentanteDivulgacaoNome('')
    setRepresentanteDivulgacaoTelefone('')
    setRepresentanteDivulgacaoEmail('')
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
          Número total de crianças e adolescentes
          <input
            type="number"
            min="0"
            value={numeroTotalCriancasAdolescentes}
            onChange={(e) => setNumeroTotalCriancasAdolescentes(e.target.value)}
            className="nova-demanda-input"
            placeholder="Ex: 30 (opcional)"
            aria-label="Número total de crianças e adolescentes"
          />
        </label>

        <label className="nova-demanda-label">
          Nome da instituição
          <input
            type="text"
            value={nomeInstituicao}
            onChange={(e) => setNomeInstituicao(e.target.value)}
            className="nova-demanda-input"
            placeholder="Nome da instituição (opcional)"
            aria-label="Nome da instituição"
          />
        </label>

        {nomeInstituicao.trim().length > 0 && (
          <>
            <fieldset className="nova-demanda-acolhimento">
              <legend className="nova-demanda-acolhimento-titulo">Tipo de acolhimento</legend>
              <div className="nova-demanda-responsaveis">
                {TIPOS_ACOLHIMENTO.map((tipo) => (
                  <label key={tipo} className="nova-demanda-checkbox-item">
                    <input
                      type="checkbox"
                      checked={tiposAcolhimento.includes(tipo)}
                      onChange={() => toggleTipoAcolhimento(tipo)}
                    />
                    <span>{tipo}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="nova-demanda-label">
              Capacidade de acolhimento
              <input
                type="number"
                min="0"
                value={capacidadeAcolhimento}
                onChange={(e) => setCapacidadeAcolhimento(e.target.value)}
                className="nova-demanda-input"
                placeholder="Ex: 20 (opcional)"
                aria-label="Capacidade de acolhimento"
              />
            </label>
          </>
        )}

        <label className="nova-demanda-label">
          Nome de quem respondeu a pesquisa?
          <input
            type="text"
            value={nomeRespondentePesquisa}
            onChange={(e) => setNomeRespondentePesquisa(e.target.value)}
            className="nova-demanda-input"
            placeholder="Nome completo (opcional)"
            aria-label="Nome de quem respondeu a pesquisa"
          />
        </label>

        <label className="nova-demanda-label">
          Quais serviços desejam?
          <div className="nova-demanda-servicos-opcoes">
            {SERVICOS_DESEJADOS_OPCOES.map((servico) => (
              <label key={servico} className="nova-demanda-checkbox-item nova-demanda-checkbox-item--multiline">
                <input
                  type="checkbox"
                  checked={servicosDesejadosSelecionados.includes(servico)}
                  onChange={() => toggleServicoDesejado(servico)}
                />
                <span>{servico}</span>
              </label>
            ))}
          </div>
        </label>

        <label className="nova-demanda-label">
          Responsável técnico
          <input
            type="text"
            value={responsavelTecnicoNome}
            onChange={(e) => setResponsavelTecnicoNome(e.target.value)}
            className="nova-demanda-input"
            placeholder="Nome (opcional)"
            aria-label="Responsável técnico"
          />
        </label>

        <label className="nova-demanda-label">
          Telefone do responsável técnico
          <input
            type="tel"
            value={responsavelTecnicoTelefone}
            onChange={(e) => setResponsavelTecnicoTelefone(e.target.value)}
            className="nova-demanda-input"
            placeholder="(00) 00000-0000 (opcional)"
            aria-label="Telefone do responsável técnico"
          />
        </label>

        <label className="nova-demanda-label">
          Email do responsável técnico
          <input
            type="email"
            value={responsavelTecnicoEmail}
            onChange={(e) => setResponsavelTecnicoEmail(e.target.value)}
            className="nova-demanda-input"
            placeholder="email@exemplo.com (opcional)"
            aria-label="Email do responsável técnico"
          />
        </label>

        <label className="nova-demanda-label">
          Representante de divulgação
          <input
            type="text"
            value={representanteDivulgacaoNome}
            onChange={(e) => setRepresentanteDivulgacaoNome(e.target.value)}
            className="nova-demanda-input"
            placeholder="Nome (opcional)"
            aria-label="Representante de divulgação"
          />
        </label>

        <label className="nova-demanda-label">
          Telefone do representante de divulgação
          <input
            type="tel"
            value={representanteDivulgacaoTelefone}
            onChange={(e) => setRepresentanteDivulgacaoTelefone(e.target.value)}
            className="nova-demanda-input"
            placeholder="(00) 00000-0000 (opcional)"
            aria-label="Telefone do representante de divulgação"
          />
        </label>

        <label className="nova-demanda-label">
          Email do representante de divulgação
          <input
            type="email"
            value={representanteDivulgacaoEmail}
            onChange={(e) => setRepresentanteDivulgacaoEmail(e.target.value)}
            className="nova-demanda-input"
            placeholder="email@exemplo.com (opcional)"
            aria-label="Email do representante de divulgação"
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
