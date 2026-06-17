import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../contexts/authContext'
import { getApostasByUsuario, getEventos } from '../services/api'

export default function DashboardUser() {
  const { usuario, refreshUsuario } = useAuth()
  const navigate = useNavigate()
  const [apostas, setApostas] = useState([])
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        await refreshUsuario()
        const [apRes, evRes] = await Promise.all([
          getApostasByUsuario(usuario.id),
          getEventos(),
        ])
        setApostas(apRes.data)
        setEventos(evRes.data.filter(e => e.status === 'aberto'))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const ganhas = apostas.filter(a => a.status === 'ganhou').length
  const perdidas = apostas.filter(a => a.status === 'perdeu').length
  const pendentes = apostas.filter(a => a.status === 'pendente').length
  const totalRetorno = apostas.filter(a => a.status === 'ganhou').reduce((s, a) => s + a.retorno, 0)
  const taxa = apostas.length > 0 ? Math.round((ganhas / apostas.filter(a => a.status !== 'pendente').length || 0) * 100) : 0

  const ultimasApostas = [...apostas].reverse().slice(0, 3)

  const statusConfig = {
    ganhou: { label: 'Ganhou', cls: 'badge-green' },
    perdeu: { label: 'Perdeu', cls: 'badge-red' },
    pendente: { label: 'Pendente', cls: 'badge-blue' },
  }

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        <div className="section-header">
          <div>
            <h1 className="section-title">Olá, {usuario?.nome?.split(' ')[0]} 👋</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
              Bem-vindo à sua área de apostas 
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/eventos')}>
            Ver eventos
          </button>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Carregando...</p>
        ) : (
          <>
            <div className="stat-grid">
              <div className="stat-box">
                <span className="stat-label">Saldo total</span>
                <span className="stat-value green mono">R$ {Number(usuario?.saldo || 0).toFixed(2)}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Bônus acumulado</span>
                <span className="stat-value gold mono">R$ {Number(usuario?.bonus || 0).toFixed(2)}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Total apostas</span>
                <span className="stat-value">{apostas.length}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Taxa de acerto</span>
                <span className={`stat-value ${taxa >= 50 ? 'green' : 'red'}`}>{taxa}%</span>
              </div>
            </div>

            <div className="dash-grid">
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Suas apostas</span>
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate('/historico')}>
                    Ver tudo
                  </button>
                </div>

                <div className="aposta-stats">
                  <div className="aposta-stat">
                    <span className="aposta-count green">{ganhas}</span>
                    <span className="aposta-label">Ganhas</span>
                  </div>
                  <div className="aposta-stat">
                    <span className="aposta-count red">{perdidas}</span>
                    <span className="aposta-label">Perdidas</span>
                  </div>
                  <div className="aposta-stat">
                    <span className="aposta-count blue">{pendentes}</span>
                    <span className="aposta-label">Pendentes</span>
                  </div>
                </div>

                {ultimasApostas.length > 0 && (
                  <div className="ultimas-apostas">
                    <p className="section-sub">Últimas apostas</p>
                    {ultimasApostas.map(a => {
                      const st = statusConfig[a.status] || { label: a.status, cls: 'badge-gray' }
                      return (
                        <div key={a.id} className="aposta-row">
                          <div>
                            <strong style={{ fontSize: '0.88rem' }}>Palpite: {a.palpite}</strong>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              R$ {Number(a.valor).toFixed(2)} • {Number(a.odd).toFixed(2)}x
                            </p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span className={`badge ${st.cls}`}>{st.label}</span>
                            {a.status === 'ganhou' && (
                              <p style={{ fontSize: '0.78rem', color: 'var(--green)', marginTop: '4px' }}>
                                +R$ {Number(a.retorno).toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="dash-right">
                <div className="card" style={{ marginBottom: '16px' }}>
                  <div className="card-header">
                    <span className="card-title">Eventos abertos</span>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate('/eventos')}>
                      Ver todos
                    </button>
                  </div>
                  {eventos.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>
                      Nenhum evento aberto no momento.
                    </p>
                  ) : (
                    <div>
                      {eventos.slice(0, 3).map(ev => (
                        <div key={ev.id} className="evento-mini" onClick={() => navigate(`/apostar/${ev.id}`)}>
                          <div>
                            <strong style={{ fontSize: '0.88rem' }}>{ev.timeA} vs {ev.timeB}</strong>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              {ev.esporte} • {ev.data}
                            </p>
                          </div>
                          <span className="badge badge-green">Apostar</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="card bonus-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span className="card-title">Bônus de fidelidade</span>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>
                        Bônus fictício acumulado por apostas
                      </p>
                    </div>
                    <span style={{ fontSize: '2rem' }}>🎁</span>
                  </div>
                  <div style={{ marginTop: '16px' }}>
                    <span className="stat-value gold mono" style={{ fontSize: '1.8rem' }}>
                      R$ {Number(usuario?.bonus || 0).toFixed(2)}
                    </span>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                      Você ganhou {ganhas} aposta(s). Continue apostando para acumular mais bônus!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <style>{`
        .dash-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .dash-right { display: flex; flex-direction: column; }
        .aposta-stats { display: flex; gap: 0; margin-bottom: 20px; }
        .aposta-stat {
          flex: 1;
          text-align: center;
          padding: 16px 8px;
          border-right: 1px solid var(--border);
        }
        .aposta-stat:last-child { border-right: none; }
        .aposta-count { display: block; font-family: var(--font-mono); font-size: 1.6rem; font-weight: 700; }
        .aposta-count.green { color: var(--green); }
        .aposta-count.red { color: var(--red); }
        .aposta-count.blue { color: var(--blue); }
        .aposta-label { font-size: 0.75rem; color: var(--text-muted); }
        .ultimas-apostas { margin-top: 8px; }
        .section-sub { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 12px; }
        .aposta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 0;
          border-top: 1px solid var(--border);
        }
        .evento-mini {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 0;
          border-top: 1px solid var(--border);
          cursor: pointer;
          transition: var(--transition);
        }
        .evento-mini:first-child { border-top: none; }
        .evento-mini:hover { opacity: 0.8; }
        .bonus-card { background: linear-gradient(135deg, var(--bg-card), var(--bg-700)); }
        @media (max-width: 768px) {
          .dash-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}
