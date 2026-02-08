import { useState } from 'react'
import type { Responsavel } from '../../types'
import type { UsuarioLogin } from '../../constants'
import './Login.css'

interface LoginProps {
  usuarios: UsuarioLogin[]
  onEntrar: (usuario: Responsavel) => void
}

const DESCRICAO_SISTEMA =
  'Sistema centralizado para priorização e acompanhamento de demandas do Apadrinha Paraná.'

const BENEFICIOS = [
  'Priorize e acompanhe demandas em um só lugar',
  'Atribua responsáveis e acompanhe o progresso',
  'Organize por projeto e cidade',
]

export function Login({ usuarios, onEntrar }: LoginProps) {
  const [aba, setAba] = useState<'entrar' | 'criar'>('entrar')
  const [entrando, setEntrando] = useState<string | null>(null)

  const handleEntrar = (u: UsuarioLogin) => {
    setEntrando(u.id)
    setTimeout(() => onEntrar(u), 400)
  }

  return (
    <div className="login">
      <div className="login-container">
        <aside className="login-panel login-panel-esq">
          <div className="login-panel-icon-wrap" aria-hidden>
            <span className="login-panel-icon">🔧</span>
          </div>
          <h1 className="login-panel-titulo">
            Apadrinha Paraná
            <span className="login-panel-subtitulo">Gestão de Demandas</span>
          </h1>
          <p className="login-panel-descricao">{DESCRICAO_SISTEMA}</p>
          <ul className="login-panel-beneficios" aria-hidden>
            {BENEFICIOS.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </aside>

        <div className="login-panel login-panel-dir">
          <nav className="login-tabs" aria-label="Entrar ou criar conta">
            <button
              type="button"
              className={`login-tab ${aba === 'entrar' ? 'ativo' : ''}`}
              onClick={() => setAba('entrar')}
              aria-pressed={aba === 'entrar'}
            >
              Entrar
            </button>
            <button
              type="button"
              className={`login-tab ${aba === 'criar' ? 'ativo' : ''}`}
              onClick={() => setAba('criar')}
              aria-pressed={aba === 'criar'}
            >
              Criar Conta
            </button>
          </nav>

          {aba === 'entrar' && (
            <div className="login-conteudo login-conteudo-entrar">
              <h2 className="login-bemvindo">Bem-vindo</h2>
              <p className="login-instruction">
                Selecione seu usuário para entrar:
              </p>
              <ul className="login-grid" role="list">
                {usuarios.map((u) => (
                  <li key={u.id}>
                    <button
                      type="button"
                      className={`login-card ${entrando === u.id ? 'login-card-entrando' : ''} role-${u.role.toLowerCase()}`}
                      onClick={() => handleEntrar(u)}
                      disabled={entrando !== null}
                      aria-label={`Entrar como ${u.nome}, ${u.role}`}
                    >
                      <span className="login-card-avatar">{u.iniciais}</span>
                      <span className="login-card-nome">{u.nome}</span>
                      <span className="login-card-role">{u.role}</span>
                      {entrando === u.id ? (
                        <span className="login-card-loader" aria-hidden />
                      ) : (
                        <span className="login-card-hint">Clique para entrar</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {aba === 'criar' && (
            <div className="login-conteudo login-conteudo-criar">
              <h2 className="login-bemvindo">Criar Conta</h2>
              <p className="login-instruction">
                Para solicitar acesso ao sistema, entre em contato com o administrador.
              </p>
              <div className="login-criar-cta">
                <a
                  href="mailto:admin@apadrinhaparana.gov.br"
                  className="login-criar-link"
                >
                  Solicitar acesso
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
