import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { useAuth } from '../contexts/authContext'
import { getUsuarios } from '../services/api'

export default function Ranking() {
  const { usuario } = useAuth()
  const [jogadores, setJogadores] = useState([])
  const [loading, setLoading] = useState(true)
  const [criterio, setCriterio] = useState('saldo')

  useEffect(() => {
    getUsuarios()
      .then(res => {
        const users = res.data.filter(u => u.perfil === 'usuario')
        setJogadores(users)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const jogadoresOrdenados = [...jogadores].sort((a, b) => {
    if (criterio === 'saldo') return b.saldo - a.saldo
    if (criterio === 'ganhas') return b.apostasGanhas - a.apostasGanhas
    if (criterio === 'taxa') {
      const taxaA = a.apostasTotais > 0 ? a.apostasGanhas / a.apostasTotais : 0
      const taxaB = b.apostasTotais > 0 ? b.apostasGanhas / b.apostasTotais : 0
      return taxaB - taxaA
    }
    if (criterio === 'bonus') return b.bonus - a.bonus
    return 0
  })

  const medalhas = ['🥇', '🥈', '🥉']

  const posicaoAtual = jogadoresOrdenados.findIndex(j => j.id === usuario?.id) + 1

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        <div className="section-header">
          <div>
            <h1 className="section-title">🏆 Ranking de Jogadores</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
              Classificação dos Jogadores 
            </p>
          </div>
          {posicaoAtual > 0 && (
            <div className="minha-posicao">
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Sua posição
              </span>
              <span className="posicao-numero">#{posicaoAtual}</span>
            </div>
          )}
        </div>

        <div className="criterio-tabs">
          {[
            { value: 'saldo', label: '💰 Saldo' },
            { value: 'ganhas', label: '✅ Apostas ganhas' },
            { value: 'taxa', label: '🎯 Taxa de acerto' },
            { value: 'bonus', label: '🎁 Bônus' },
          ].map(c => (
            <button
              key={c.value}
              className={`filter-tab ${criterio === c.value ? 'active' : ''}`}
              onClick={() => setCriterio(c.value)}
            >
              {c.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Carregando ranking...</p>
        ) : (
          <>
            {/* Top 3 destaque */}
            {jogadoresOrdenados.length >= 3 && (
              <div className="podio">
                {[1, 0, 2].map(idx => {
                  const j = jogadoresOrdenados[idx]
                  if (!j) return null
                  const isEu = j.id === usuario?.id
                  const taxa = j.apostasTotais > 0
                    ? Math.round((j.apostasGanhas / j.apostasTotais) * 100)
                    : 0
                  return (
                    <div key={j.id} className={`podio-card ${idx === 0 ? 'primeiro' : ''} ${isEu ? 'eu' : ''}`}>
                      <div className="podio-medalha">{medalhas[idx]}</div>
                      <div className="podio-pos">#{idx + 1}</div>
                      <div className="podio-avatar">{j.nome.charAt(0)}</div>
                      <div className="podio-nome">{j.nome.split(' ')[0]}</div>
                      <div className="podio-valor mono">
                        {criterio === 'saldo' && `R$ ${Number(j.saldo).toFixed(0)}`}
                        {criterio === 'ganhas' && `${j.apostasGanhas} ganhas`}
                        {criterio === 'taxa' && `${taxa}% acerto`}
                        {criterio === 'bonus' && `R$ ${Number(j.bonus || 0).toFixed(0)}`}
                      </div>
                      {isEu && <span className="eu-label">Você</span>}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Tabela completa */}
            <div className="card" style={{ padding: 0 }}>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Jogador</th>
                      <th>Saldo (R$)</th>
                      <th>Ganhas</th>
                      <th>Total</th>
                      <th>Taxa</th>
                      <th>Bônus (R$)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jogadoresOrdenados.map((j, i) => {
                      const isEu = j.id === usuario?.id
                      const taxa = j.apostasTotais > 0
                        ? Math.round((j.apostasGanhas / j.apostasTotais) * 100)
                        : 0
                      return (
                        <tr key={j.id} className={isEu ? 'linha-eu' : ''}>
                          <td>
                            <span className={`posicao ${i < 3 ? 'top3' : ''}`}>
                              {i < 3 ? medalhas[i] : `#${i + 1}`}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div className="avatar-mini">{j.nome.charAt(0)}</div>
                              <div>
                                <strong style={{ fontSize: '0.9rem' }}>{j.nome}</strong>
                                {isEu && <span className="badge badge-green" style={{ marginLeft: '8px', fontSize: '0.65rem' }}>Você</span>}
                              </div>
                            </div>
                          </td>
                          <td className="mono" style={{ color: 'var(--green)', fontWeight: 700 }}>
                            {Number(j.saldo).toFixed(2)}
                          </td>
                          <td className="mono" style={{ color: 'var(--green)' }}>{j.apostasGanhas || 0}</td>
                          <td className="mono">{j.apostasTotais || 0}</td>
                          <td>
                            <span className={`badge ${taxa >= 50 ? 'badge-green' : taxa > 0 ? 'badge-blue' : 'badge-gray'}`}>
                              {taxa}%
                            </span>
                          </td>
                          <td className="mono" style={{ color: 'var(--gold)' }}>
                            {Number(j.bonus || 0).toFixed(2)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      <style>{`
        .criterio-tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 24px; }
        .filter-tab {
          padding: 7px 16px; border-radius: 100px; border: 1px solid var(--border);
          background: none; color: var(--text-secondary); cursor: pointer;
          font-family: var(--font-display); font-size: 0.83rem; font-weight: 500;
          transition: var(--transition);
        }
        .filter-tab:hover { border-color: var(--green); color: var(--text-primary); }
        .filter-tab.active { background: var(--green-bg); border-color: var(--green); color: var(--green); }

        .minha-posicao { text-align: center; }
        .posicao-numero { display: block; font-family: var(--font-mono); font-size: 1.8rem; font-weight: 700; color: var(--green); }

        .podio {
          display: flex; justify-content: center; align-items: flex-end;
          gap: 12px; margin-bottom: 28px;
        }
        .podio-card {
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: var(--radius); padding: 20px 16px;
          text-align: center; flex: 1; max-width: 200px;
          transition: var(--transition);
        }
        .podio-card.primeiro {
          border-color: var(--gold); box-shadow: 0 0 20px rgba(255,215,0,0.15);
          transform: translateY(-8px);
        }
        .podio-card.eu { border-color: var(--green); }
        .podio-medalha { font-size: 1.8rem; margin-bottom: 4px; }
        .podio-pos { font-size: 0.75rem; color: var(--text-muted); margin-bottom: 10px; }
        .podio-avatar {
          width: 44px; height: 44px; border-radius: 50%;
          background: var(--bg-600); display: flex; align-items: center;
          justify-content: center; font-size: 1.1rem; font-weight: 700;
          margin: 0 auto 8px;
        }
        .podio-nome { font-size: 0.88rem; font-weight: 700; margin-bottom: 4px; }
        .podio-valor { font-size: 0.8rem; color: var(--green); }
        .eu-label {
          display: inline-block; margin-top: 6px; font-size: 0.7rem;
          background: var(--green-bg); color: var(--green);
          padding: 2px 8px; border-radius: 100px;
        }

        .linha-eu { background: var(--green-bg) !important; }
        .linha-eu td { border-top-color: var(--green-border) !important; }
        .avatar-mini {
          width: 32px; height: 32px; border-radius: 50%;
          background: var(--bg-600); display: flex; align-items: center;
          justify-content: center; font-size: 0.85rem; font-weight: 700;
          flex-shrink: 0;
        }
        .posicao { font-size: 0.9rem; }
        .top3 { font-size: 1.1rem; }

        @media (max-width: 600px) {
          .podio { gap: 8px; }
          .podio-card { padding: 14px 10px; }
        }
      `}</style>
    </div>
  )
}
