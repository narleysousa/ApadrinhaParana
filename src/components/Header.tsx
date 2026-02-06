import type { Responsavel } from '../types'
import './Header.css'

interface HeaderProps {
  usuarioAtual: Responsavel
  onSair?: () => void
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

export function Header({ usuarioAtual, onSair }: HeaderProps) {
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
        <button type="button" className="header-btn-icon" aria-label="Notificações">
          <IconNotificacoes />
        </button>
        <div className="header-usuario">
          <span className="header-avatar" aria-hidden>{usuarioAtual.iniciais}</span>
          <span className="header-nome">{usuarioAtual.nome}</span>
        </div>
        <button
          type="button"
          className="header-btn-icon"
          aria-label="Sair"
          onClick={onSair}
        >
          <IconSair />
        </button>
      </div>
    </header>
  )
}
