import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import EventoCard from '../components/EventoCard'
import { getEventos } from '../services/api'

const esportes = ['Todos', 'Futebol', 'Basquete', 'Tênis', 'Vôlei', 'MMA', 'Fórmula 1']

export default function Eventos() {
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroEsporte, setFiltroEsporte] = useState('Todos')
  const [filtroStatus, setFiltroStatus] = useState('aberto')
  const [busca, setBusca] = useState('')

  useEffect(() => {
    getEventos()
      .then(res => setEventos(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const eventosFiltrados = eventos.filter(ev => {
    const matchEsporte = filtroEsporte === 'Todos' || ev.esporte === filtroEsporte
    const matchStatus = filtroStatus === 'todos' || ev.status === filtroStatus
    const matchBusca =
      busca === '' ||
      ev.timeA.toLowerCase().includes(busca.toLowerCase()) ||
      ev.timeB.toLowerCase().includes(busca.toLowerCase())
    return matchEsporte && matchStatus && matchBusca
  })

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        <div className="section-header">
          <div>
            <h1 className="section-title">Eventos</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
              {eventosFiltrados.length} evento(s) encontrado(s)
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="eventos-filtros">
          <input
            className="form-input busca-input"
            placeholder="🔍 Buscar time ou atleta..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
          <div className="filter-row">
            <div className="filter-tabs">
              {['aberto', 'encerrado', 'todos'].map(s => (
                <button
                  key={s}
                  className={`filter-tab ${filtroStatus === s ? 'active' : ''}`}
                  onClick={() => setFiltroStatus(s)}
                >
                  {s === 'aberto' ? '🟢 Abertos' : s === 'encerrado' ? '🔴 Encerrados' : 'Todos'}
                </button>
              ))}
            </div>
            <select
              className="form-select esporte-select"
              value={filtroEsporte}
              onChange={e => setFiltroEsporte(e.target.value)}
            >
              {esportes.map(e => <option key={e}>{e}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Carregando eventos...</p>
        ) : eventosFiltrados.length === 0 ? (
          <div className="empty-state">
            <span style={{ fontSize: '3rem' }}>🏟️</span>
            <p>Nenhum evento encontrado com esses filtros.</p>
          </div>
        ) : (
          <div className="eventos-grid">
            {eventosFiltrados.map(ev => (
              <EventoCard key={ev.id} evento={ev} />
            ))}
          </div>
        )}
      </main>

      <style>{`
        .eventos-filtros { margin-bottom: 24px; display: flex; flex-direction: column; gap: 12px; }
        .busca-input { max-width: 400px; }
        .filter-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .filter-tabs { display: flex; gap: 6px; }
        .filter-tab {
          padding: 7px 16px; border-radius: 100px; border: 1px solid var(--border);
          background: none; color: var(--text-secondary); cursor: pointer;
          font-family: var(--font-display); font-size: 0.83rem; font-weight: 500;
          transition: var(--transition);
        }
        .filter-tab:hover { border-color: var(--green); color: var(--text-primary); }
        .filter-tab.active { background: var(--green-bg); border-color: var(--green); color: var(--green); }
        .esporte-select { width: auto; min-width: 160px; }
        .eventos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; }
        .empty-state {
          text-align: center; padding: 64px; color: var(--text-muted);
          display: flex; flex-direction: column; align-items: center; gap: 12px;
        }
        @media (max-width: 768px) { .eventos-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  )
}
