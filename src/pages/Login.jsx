import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/authContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, isLoggedIn, isAdmin, usuario } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoggedIn) {
      navigate(isAdmin ? '/admin' : '/dashboard', { replace: true })
    }
  }, [isLoggedIn, isAdmin, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      const user = await login(email, senha)
      navigate(user.perfil === 'admin' ? '/admin' : '/dashboard', { replace: true })
    } catch (err) {
      setErro(err.message || 'Erro ao fazer login.')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (type) => {
    if (type === 'admin') { setEmail('admin@bet.com'); setSenha('123') }
    else { setEmail('joao@bet.com'); setSenha('123') }
  }

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-branding">
          <div className="login-logo">   🤑💸</div>
          <h1 className="login-brand-name">BetzinhaDa<span>Acad</span></h1>
          <p className="login-tagline">Plataforma acadêmica de apostas kaozeiras</p>

          <div className="login-features">
            <div className="login-feature">
              <span className="feature-icon">⚽</span>
              <div>
                <strong>Eventos ao vivo</strong>
                <p>Acompanhe eventos esportivos fakes</p>
              </div>
            </div>
            <div className="login-feature">
              <span className="feature-icon">💰</span>
              <div>
                <strong>Saldo simulado</strong>
                <p>Gerencie sua carteira virtual</p>
              </div>
            </div>
            <div className="login-feature">
              <span className="feature-icon">🏆</span>
              <div>
                <strong>Ranking global</strong>
                <p>Compita com outros jogadores</p>
              </div>
            </div>
          </div>

          <div className="login-disclaimer">
            ⚠️ Todos os valores são kaozeiros. Projeto acadêmico.
            Projeto executado por:
            Nicolas Guedes de Andrade  e   
            Alessandro Bazilio Henrique
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-box">
          <div className="login-box-header">
            <h2>Entrar na plataforma</h2>
            <p>Use suas credenciais de acesso</p>
          </div>

          {erro && <div className="alert alert-error">{erro}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">E-mail</label>
              <input
                type="email"
                className="form-input"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Senha</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="demo-accounts">
            <p className="demo-title">Contas de demonstração</p>
            <div className="demo-buttons">
              <button className="btn btn-secondary btn-sm" onClick={() => fillDemo('admin')}>
                👑 Admin
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => fillDemo('user')}>
                🎮 Jogador
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
        .login-left {
          background: linear-gradient(135deg, var(--bg-800) 0%, var(--bg-700) 100%);
          border-right: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px;
        }
        .login-branding { max-width: 380px; }
        .login-logo { font-size: 3rem; margin-bottom: 12px; }
        .login-brand-name {
          font-size: 2.4rem;
          font-weight: 800;
          margin-bottom: 8px;
        }
        .login-brand-name span { color: var(--green); }
        .login-tagline {
          color: var(--text-secondary);
          font-size: 1rem;
          margin-bottom: 40px;
        }
        .login-features { display: flex; flex-direction: column; gap: 20px; margin-bottom: 32px; }
        .login-feature { display: flex; align-items: flex-start; gap: 16px; }
        .feature-icon {
          font-size: 1.5rem;
          background: var(--bg-600);
          width: 44px;
          height: 44px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .login-feature strong { display: block; font-size: 0.95rem; margin-bottom: 2px; }
        .login-feature p { font-size: 0.82rem; color: var(--text-muted); }
        .login-disclaimer {
          font-size: 0.78rem;
          color: var(--text-muted);
          background: var(--bg-600);
          border: 1px solid var(--border);
          padding: 10px 14px;
          border-radius: var(--radius-sm);
        }
        .login-right {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 40px;
        }
        .login-box { width: 100%; max-width: 380px; }
        .login-box-header { margin-bottom: 28px; }
        .login-box-header h2 { font-size: 1.5rem; margin-bottom: 6px; }
        .login-box-header p { color: var(--text-secondary); font-size: 0.9rem; }
        .demo-accounts {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid var(--border);
        }
        .demo-title {
          font-size: 0.78rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 10px;
        }
        .demo-buttons { display: flex; gap: 8px; }
        @media (max-width: 768px) {
          .login-page { grid-template-columns: 1fr; }
          .login-left { display: none; }
          .login-right { padding: 32px 24px; }
        }
      `}</style>
    </div>
  )
}
