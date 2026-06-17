import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getEventos, getApostas, getUsuarios } from '../services/api'

export default function DashboardAdmin() {
  const [stats, setStats] = useState({ eventos: 0, apostas: 0, usuarios: 0, movimentado: 0 })
  const [eventosRecentes, setEventosRecentes] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [evRes, apRes, usRes] = await Promise.all([
          getEventos(), getApostas(), getUsuarios()
        ])
        const eventos = evRes.data
        const apostas = apRes.data
        const usuarios = usRes.data.filter(u => u.perfil === 'usuario')
        const movimentado = apostas.reduce((acc, a) => acc + Number(a.valor), 0)

        setStats({
          eventos: eventos.length,
          apostas: apostas.length,
          usuarios: usuarios.length,
          movimentado,
        })
        setEventosRecentes(eventos.slice(-5).reverse())
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const statusConfig = {
    aberto: { label: 'Aberto', cls: 'badge-green' },
    encerrado: { label: 'Encerrado', cls: 'badge-red' },
  }

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        <div className="section-header">
          <div>
            <h1 className="section-title">Painel Administrativo</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
              Visão geral da plataforma
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/admin/eventos')}>
            + Novo evento
          </button>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Carregando...</p>
        ) : (
          <>
            <div className="stat-grid">
              <div className="stat-box">
                <span className="stat-label">Eventos cadastrados</span>
                <span className="stat-value green">{stats.eventos}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Apostas realizadas</span>
                <span className="stat-value">{stats.apostas}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Jogadores ativos</span>
                <span className="stat-value">{stats.usuarios}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Total apostado (R$)</span>
                <span className="stat-value gold mono">{stats.movimentado.toFixed(2)}</span>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <span className="card-title">Apostas recentes</span>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin/eventos')}>
                  Ver todos
                </button>
              </div>
              {eventosRecentes.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>
                  Nenhum evento cadastrado ainda.
                </p>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Evento</th>
                        <th>Esporte</th>
                        <th>Data</th>
                        <th>Status</th>
                        <th>Resultado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eventosRecentes.map(ev => {
                        const st = statusConfig[ev.status] || { label: ev.status, cls: 'badge-gray' }
                        return (
                          <tr key={ev.id}>
                            <td><strong>{ev.timeA} vs {ev.timeB}</strong></td>
                            <td style={{ color: 'var(--text-secondary)' }}>{ev.esporte}</td>
                            <td className="mono" style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                              {ev.data}
                            </td>
                            <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                            <td style={{ color: ev.resultado ? 'var(--gold)' : 'var(--text-muted)' }}>
                              {ev.resultado || '—'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="admin-quick-actions">
              <h3 style={{ marginBottom: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Ações rápidas
              </h3>
              <div className="quick-grid">
                <button className="quick-card" onClick={() => navigate('/admin/eventos')}>
                  <span className="quick-icon">📋</span>
                  <strong>Gerenciar Eventos</strong>
                  <p>Criar, encerrar e informar resultados</p>
                </button>
                <button className="quick-card" onClick={() => navigate('/ranking')}>
                  <span className="quick-icon">🏆</span>
                  <strong>Ver Ranking</strong>
                  <p>Classificação dos jogadores</p>
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      <style>{`
        .admin-quick-actions { margin-top: 24px; }
        .quick-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
        .quick-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 20px;
          text-align: left;
          cursor: pointer;
          transition: var(--transition);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .quick-card:hover { border-color: var(--green); box-shadow: var(--shadow-glow); }
        .quick-icon { font-size: 1.8rem; }
        .quick-card strong { font-size: 0.95rem; color: var(--text-primary); }
        .quick-card p { font-size: 0.8rem; color: var(--text-muted); }
      `}</style>
    </div>
  )
}
