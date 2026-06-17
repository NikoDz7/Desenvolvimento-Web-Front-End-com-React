import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { useAuth } from '../contexts/authContext'
import { getApostasByUsuario, getEventos } from '../services/api'

export default function HistoricoApostas() {
  const { usuario } = useAuth()
  const [apostas, setApostas] = useState([])
  const [eventos, setEventos] = useState({})
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('todas')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [apRes, evRes] = await Promise.all([
          getApostasByUsuario(usuario.id),
          getEventos(),
        ])
        setApostas(apRes.data.reverse())
        const evMap = {}
        evRes.data.forEach(ev => { evMap[ev.id] = ev })
        setEventos(evMap)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const apostasFlitradas = filtro === 'todas' ? apostas : apostas.filter(a => a.status === filtro)

  const ganhas = apostas.filter(a => a.status === 'ganhou').length
  const perdidas = apostas.filter(a => a.status === 'perdeu').length
  const pendentes = apostas.filter(a => a.status === 'pendente').length
  const totalInvestido = apostas.reduce((s, a) => s + Number(a.valor), 0)
  const totalRetorno = apostas.filter(a => a.status === 'ganhou').reduce((s, a) => s + Number(a.retorno), 0)
  const lucro = totalRetorno - apostas.filter(a => a.status !== 'pendente').reduce((s, a) => s + Number(a.valor), 0)

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
          <h1 className="section-title">Histórico de Apostas</h1>
        </div>

        <div className="stat-grid">
          <div className="stat-box">
            <span className="stat-label">Total apostado</span>
            <span className="stat-value mono">R$ {totalInvestido.toFixed(2)}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Retornos recebidos</span>
            <span className="stat-value green mono">R$ {totalRetorno.toFixed(2)}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Resultado fictício</span>
            <span className={`stat-value mono ${lucro >= 0 ? 'green' : 'red'}`}>
              {lucro >= 0 ? '+' : ''}R$ {lucro.toFixed(2)}
            </span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Apostas</span>
            <span className="stat-value">{ganhas}G / {perdidas}P / {pendentes}⏳</span>
          </div>
        </div>

        <div className="filter-tabs" style={{ marginBottom: '20px' }}>
          {[
            { value: 'todas', label: 'Todas' },
            { value: 'pendente', label: '⏳ Pendentes' },
            { value: 'ganhou', label: '✅ Ganhas' },
            { value: 'perdeu', label: '❌ Perdidas' },
          ].map(f => (
            <button
              key={f.value}
              className={`filter-tab ${filtro === f.value ? 'active' : ''}`}
              onClick={() => setFiltro(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Carregando...</p>
        ) : apostasFlitradas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '2rem' }}>📭</p>
            <p>Nenhuma aposta encontrada.</p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0 }}>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Evento</th>
                    <th>Palpite</th>
                    <th>Odd</th>
                    <th>Valor</th>
                    <th>Retorno</th>
                    <th>Status</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {apostasFlitradas.map(a => {
                    const ev = eventos[a.eventoId]
                    const st = statusConfig[a.status] || { label: a.status, cls: 'badge-gray' }
                    return (
                      <tr key={a.id}>
                        <td>
                          {ev ? (
                            <div>
                              <strong style={{ fontSize: '0.88rem' }}>{ev.timeA} vs {ev.timeB}</strong>
                              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ev.esporte}</p>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>Evento #{a.eventoId}</span>
                          )}
                        </td>
                        <td><strong>{a.palpite}</strong></td>
                        <td className="mono" style={{ color: 'var(--green)', fontSize: '0.85rem' }}>
                          {Number(a.odd).toFixed(2)}x
                        </td>
                        <td className="mono">R$ {Number(a.valor).toFixed(2)}</td>
                        <td className="mono" style={{ color: a.status === 'ganhou' ? 'var(--green)' : 'var(--text-muted)' }}>
                          {a.status === 'ganhou' ? `+R$ ${Number(a.retorno).toFixed(2)}` : '—'}
                        </td>
                        <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                        <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {a.dataCriacao ? new Date(a.dataCriacao).toLocaleDateString('pt-BR') : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <style>{`
        .filter-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
        .filter-tab {
          padding: 7px 16px; border-radius: 100px; border: 1px solid var(--border);
          background: none; color: var(--text-secondary); cursor: pointer;
          font-family: var(--font-display); font-size: 0.83rem; font-weight: 500;
          transition: var(--transition);
        }
        .filter-tab:hover { border-color: var(--green); color: var(--text-primary); }
        .filter-tab.active { background: var(--green-bg); border-color: var(--green); color: var(--green); }
      `}</style>
    </div>
  )
}
