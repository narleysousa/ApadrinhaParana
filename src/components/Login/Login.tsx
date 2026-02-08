import { useState } from 'react'
import type { Usuario, Cargo } from '../../types'
import { CARGOS_DISPONIVEIS } from '../../constants'
import { cadastrarUsuario, autenticarUsuario } from '../../lib/utils'
import './Login.css'

interface LoginProps {
  onEntrar: (usuario: Usuario) => void
}

const DESCRICAO_SISTEMA =
  'Sistema centralizado para priorização e acompanhamento de demandas do Apadrinha Paraná.'

const BENEFICIOS = [
  'Priorize e acompanhe demandas em um só lugar',
  'Atribua responsáveis e acompanhe o progresso',
  'Organize por projeto e cidade',
]

export function Login({ onEntrar }: LoginProps) {
  const [aba, setAba] = useState<'entrar' | 'criar'>('entrar')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  // Login
  const [emailLogin, setEmailLogin] = useState('')
  const [senhaLogin, setSenhaLogin] = useState('')

  // Cadastro
  const [nome, setNome] = useState('')
  const [emailCadastro, setEmailCadastro] = useState('')
  const [cargo, setCargo] = useState<Cargo>('Colaborador')
  const [senhaCadastro, setSenhaCadastro] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')

  const limparErro = () => setErro('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    limparErro()
    setCarregando(true)

    setTimeout(() => {
      const resultado = autenticarUsuario(emailLogin, senhaLogin)

      if (resultado.sucesso && resultado.usuario) {
        onEntrar(resultado.usuario)
      } else {
        setErro(resultado.erro || 'Erro ao fazer login')
        setCarregando(false)
      }
    }, 300)
  }

  const handleCadastro = (e: React.FormEvent) => {
    e.preventDefault()
    limparErro()

    if (senhaCadastro !== confirmarSenha) {
      setErro('As senhas não coincidem')
      return
    }

    setCarregando(true)

    setTimeout(() => {
      const resultado = cadastrarUsuario({
        nome,
        email: emailCadastro,
        senha: senhaCadastro,
        cargo,
      })

      if (resultado.sucesso && resultado.usuario) {
        onEntrar(resultado.usuario)
      } else {
        setErro(resultado.erro || 'Erro ao cadastrar')
        setCarregando(false)
      }
    }, 300)
  }

  const handleSenhaChange = (valor: string, setter: (v: string) => void) => {
    // Permitir apenas dígitos e máximo 4 caracteres
    const apenasDigitos = valor.replace(/\D/g, '').slice(0, 4)
    setter(apenasDigitos)
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
              onClick={() => { setAba('entrar'); limparErro() }}
              aria-pressed={aba === 'entrar'}
            >
              Entrar
            </button>
            <button
              type="button"
              className={`login-tab ${aba === 'criar' ? 'ativo' : ''}`}
              onClick={() => { setAba('criar'); limparErro() }}
              aria-pressed={aba === 'criar'}
            >
              Criar Conta
            </button>
          </nav>

          {erro && (
            <div className="login-erro" role="alert">
              <span>⚠️</span> {erro}
            </div>
          )}

          {aba === 'entrar' && (
            <form className="login-form" onSubmit={handleLogin}>
              <h2 className="login-bemvindo">Bem-vindo de volta</h2>
              <p className="login-instruction">
                Entre com seu email e senha de 4 dígitos:
              </p>

              <label className="login-label">
                <span>Email</span>
                <input
                  type="email"
                  className="login-input"
                  value={emailLogin}
                  onChange={(e) => setEmailLogin(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  autoComplete="email"
                  disabled={carregando}
                />
              </label>

              <label className="login-label">
                <span>Senha (4 dígitos)</span>
                <input
                  type="password"
                  className="login-input login-input-senha"
                  value={senhaLogin}
                  onChange={(e) => handleSenhaChange(e.target.value, setSenhaLogin)}
                  placeholder="••••"
                  maxLength={4}
                  pattern="\d{4}"
                  inputMode="numeric"
                  required
                  autoComplete="current-password"
                  disabled={carregando}
                />
              </label>

              <button
                type="submit"
                className="login-btn-submit"
                disabled={carregando || !emailLogin || senhaLogin.length !== 4}
              >
                {carregando ? (
                  <span className="login-btn-loader" />
                ) : (
                  'Entrar'
                )}
              </button>
            </form>
          )}

          {aba === 'criar' && (
            <form className="login-form" onSubmit={handleCadastro}>
              <h2 className="login-bemvindo">Criar Conta</h2>
              <p className="login-instruction">
                Preencha seus dados para se cadastrar:
              </p>

              <label className="login-label">
                <span>Nome completo</span>
                <input
                  type="text"
                  className="login-input"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome"
                  required
                  autoComplete="name"
                  disabled={carregando}
                />
              </label>

              <label className="login-label">
                <span>Email</span>
                <input
                  type="email"
                  className="login-input"
                  value={emailCadastro}
                  onChange={(e) => setEmailCadastro(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  autoComplete="email"
                  disabled={carregando}
                />
              </label>

              <label className="login-label">
                <span>Cargo</span>
                <select
                  className="login-select"
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value as Cargo)}
                  required
                  disabled={carregando}
                >
                  {CARGOS_DISPONIVEIS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>

              <div className="login-row">
                <label className="login-label">
                  <span>Senha (4 dígitos)</span>
                  <input
                    type="password"
                    className="login-input login-input-senha"
                    value={senhaCadastro}
                    onChange={(e) => handleSenhaChange(e.target.value, setSenhaCadastro)}
                    placeholder="••••"
                    maxLength={4}
                    pattern="\d{4}"
                    inputMode="numeric"
                    required
                    autoComplete="new-password"
                    disabled={carregando}
                  />
                </label>

                <label className="login-label">
                  <span>Confirmar</span>
                  <input
                    type="password"
                    className="login-input login-input-senha"
                    value={confirmarSenha}
                    onChange={(e) => handleSenhaChange(e.target.value, setConfirmarSenha)}
                    placeholder="••••"
                    maxLength={4}
                    pattern="\d{4}"
                    inputMode="numeric"
                    required
                    autoComplete="new-password"
                    disabled={carregando}
                  />
                </label>
              </div>

              <button
                type="submit"
                className="login-btn-submit"
                disabled={
                  carregando ||
                  !nome ||
                  !emailCadastro ||
                  senhaCadastro.length !== 4 ||
                  confirmarSenha.length !== 4
                }
              >
                {carregando ? (
                  <span className="login-btn-loader" />
                ) : (
                  'Criar Conta'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
