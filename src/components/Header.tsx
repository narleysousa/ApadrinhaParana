import { useState, useRef, useEffect } from 'react'
import type { Notificacao, Responsavel } from '../types'
import { formatarData } from '../lib/utils'
import './Header.css'

interface HeaderProps {
  usuarioAtual: Responsavel
  onSair?: () => void
  notificacoesNaoLidas?: Notificacao[]
  onMarcarNotificacaoLida?: (id: string) => void
  onLimparNotificacoes?: () => void
}

function IconLogo() {
  return (
    <svg className="header-svg header-svg-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  )
}

function IconNotificacoes() {
  return (
    <svg className="header-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function IconSair() {
  return (
    <svg className="header-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

export function Header({
  usuarioAtual,
  onSair,
  notificacoesNaoLidas = [],
  onMarcarNotificacaoLida,
  onLimparNotificacoes,
}: HeaderProps) {
  const [dropdownAberto, setDropdownAberto] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickFora(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownAberto(false)
      }
    }
    if (dropdownAberto) {
      document.addEventListener('click', handleClickFora)
      return () => document.removeEventListener('click', handleClickFora)
    }
  }, [dropdownAberto])

  const totalNaoLidas = notificacoesNaoLidas.length

  return (
    <header className="header">
      <div className="header-logo">
        <span className="header-icon-wrap" aria-hidden>
          <IconLogo />
        </span>
        <span className="header-titulo">Apadrinha Paraná</span>
        <span className="header-subtitulo">Gestão de Demandas</span>
      </div>
      <div className="header-acoes">
        <div className="header-notif-wrap" ref={dropdownRef}>
          <button
            type="button"
            className="header-btn-icon header-btn-notif"
            aria-label={totalNaoLidas > 0 ? `${totalNaoLidas} notificação(ões)` : 'Notificações'}
            aria-expanded={dropdownAberto}
            onClick={() => setDropdownAberto((v) => !v)}
          >
            <IconNotificacoes />
            {totalNaoLidas > 0 && (
              <span className="header-notif-badge" aria-hidden>
                {totalNaoLidas > 99 ? '99+' : totalNaoLidas}
              </span>
            )}
          </button>
          {dropdownAberto && (
            <div className="header-notif-dropdown" role="dialog" aria-label="Notificações">
              <div className="header-notif-dropdown-header">
                <span>Notificações</span>
                <div className="header-notif-dropdown-acoes">
                  {totalNaoLidas > 0 && (
                    <span className="header-notif-dropdown-count">{totalNaoLidas} nova(s)</span>
                  )}
                  {totalNaoLidas > 0 && (
                    <button
                      type="button"
                      className="header-notif-limpar"
                      onClick={() => onLimparNotificacoes?.()}
                    >
                      Limpar
                    </button>
                  )}
                </div>
              </div>
              {notificacoesNaoLidas.length === 0 ? (
                <p className="header-notif-vazio">Nenhuma notificação nova.</p>
              ) : (
                <ul className="header-notif-lista">
                  {notificacoesNaoLidas.map((n) => (
                    <li key={n.id} className="header-notif-item">
                      <button
                        type="button"
                        className="header-notif-item-btn"
                        onClick={() => {
                          onMarcarNotificacaoLida?.(n.id)
                          setDropdownAberto(false)
                        }}
                      >
                        <span className="header-notif-item-titulo">{n.tituloDemanda}</span>
                        <span className="header-notif-item-meta">
                          Nova demanda atribuída a você · {formatarData(n.criadaEm)}
                        </span>
                        <span className={`header-notif-item-prioridade prioridade-${n.prioridade === 'ALTA' ? 'alta' : n.prioridade === 'MÉDIA' ? 'media' : 'baixa'}`}>
                          {n.prioridade}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        <div className="header-usuario">
          <span className="header-avatar" aria-hidden>{usuarioAtual.iniciais}</span>
          <span className="header-nome">{usuarioAtual.nome}</span>
        </div>
        <button
          type="button"
          className="header-btn-icon"
          aria-label="Sair"
          onClick={() => onSair?.()}
        >
          <IconSair />
        </button>
      </div>
    </header>
  )
}
