import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { useAuth } from '../contexts/authContext'
import { getMovimentacoesByUsuario } from '../services/api'

export default function Extrato() {
  const { usuario } = useAuth()
  const [movimentacoes, setMovimentacoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('todas')

  useEffect(() => {
    getMovimentacoesByUsuario(usuario.id)
      .then(res => setMovimentacoes(res.data.reverse()))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtradas = filtro === 'todas'
    ? movimentacoes
    : movimentacoes.filter(m => m.tipo === filtro)

  const totalEntradas = movimentacoes
    .filter(m => m.valor > 0)
    .reduce((s, m) => s + m.valor, 0)

  const totalSaidas = movimentacoes
    .filter(m => m.valor < 0)
    .reduce((s, m) => s + Math.abs(m.valor), 0)

  const tipoConfig = {
    aposta: { label: 'Aposta', icon: '🎲', cls: 'red' },
    premio: { label: 'Prêmio', icon: '🏆', cls: 'green' },
    bonus: { label: 'Bônus', icon: '🎁', cls: 'gold' },
  }

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        <div className="section-header">
          <div>
            <h1 className="section-title">Extrato das Movimentações</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
              Histórico da sua carteira
            </p>
          </div>
        </div>

        <div className="stat-grid">
          <div className="stat-box">
            <span className="stat-label">Saldo Atual</span>
            <span className="stat-value green mono">R$ {Number(usuario?.saldo || 0).toFixed(2)}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Total Ganho </span>
            <span className="stat-value green mono">R$ {totalEntradas.toFixed(2)}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Total Apostado</span>
            <span className="stat-value red mono">R$ {totalSaidas.toFixed(2)}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Jogos</span>
            <span className="stat-value">{movimentacoes.length}</span>
          </div>
        </div>

        <div className="filter-tabs" style={{ marginBottom: '20px' }}>
          {[
            { value: 'todas', label: 'Todas' },
            { value: 'aposta', label: '🎲 Apostas' },
            { value: 'premio', label: '🏆 Prêmios' },
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
        ) : filtradas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '2rem' }}>📊</p>
            <p>Nenhuma movimentação encontrada.</p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0 }}>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Descrição</th>
                    <th style={{ textAlign: 'right' }}>Valor</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {filtradas.map(m => {
                    const cfg = tipoConfig[m.tipo] || { label: m.tipo, icon: '💱', cls: '' }
                    const isPositivo = m.valor > 0
                    return (
                      <tr key={m.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>{cfg.icon}</span>
                            <span className={`badge badge-${cfg.cls === 'green' ? 'green' : cfg.cls === 'red' ? 'red' : cfg.cls === 'gold' ? 'gold' : 'gray'}`}>
                              {cfg.label}
                            </span>
                          </div>
                        </td>
                        <td style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '300px' }}>
                          {m.descricao}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span className={`mono valor-mov ${isPositivo ? 'positivo' : 'negativo'}`}>
                            {isPositivo ? '+' : ''}R$ {Math.abs(m.valor).toFixed(2)}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {m.data ? new Date(m.data).toLocaleString('pt-BR', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          }) : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '16px', textAlign: 'center' }}>
          ⚠️ Todos os valores são kaozeiros. Este extrato tem a finalidade apenas para a apresentação para o professor.
        </p>
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
        .valor-mov { font-weight: 700; font-size: 0.92rem; }
        .positivo { color: var(--green); }
        .negativo { color: var(--red); }
      `}</style>
    </div>
  )
}
