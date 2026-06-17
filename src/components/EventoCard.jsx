import React from 'react'
import { useNavigate } from 'react-router-dom'

const esporteEmoji = {
  'Futebol': '⚽',
  'Basquete': '🏀',
  'Tênis': '🎾',
  'Vôlei': '🏐',
  'MMA': '🥊',
  'Fórmula 1': '🏎️',
}

export default function EventoCard({ evento, showActions = false, onEncerrar, onResultado }) {
  const navigate = useNavigate()

  const statusConfig = {
    aberto: { label: 'Aberto', cls: 'badge-green' },
    encerrado: { label: 'Encerrado', cls: 'badge-red' },
    aguardando: { label: 'Aguardando', cls: 'badge-blue' },
  }

  const st = statusConfig[evento.status] || { label: evento.status, cls: 'badge-gray' }
  const emoji = esporteEmoji[evento.esporte] || '🏆'

  return (
    <div className="evento-card card">
      <div className="evento-card-header">
        <div className="evento-meta">
          <span className="evento-esporte">{emoji} {evento.esporte}</span>
          <span className={`badge ${st.cls}`}>{st.label}</span>
        </div>
        <span className="evento-data">
          {new Date(evento.data + 'T' + (evento.hora || '00:00')).toLocaleDateString('pt-BR', {
            day: '2-digit', month: 'short', year: 'numeric'
          })}
          {evento.hora && ` • ${evento.hora}`}
        </span>
      </div>

      <div className="evento-times">
        <div className="time-box">
          <span className="time-name">{evento.timeA}</span>
          {evento.oddA && (
            <span className="time-odd mono">{Number(evento.oddA).toFixed(2)}x</span>
          )}
        </div>
        <div className="vs-box">
          {evento.resultado
            ? <span className="resultado-label">Resultado: <strong>{evento.resultado}</strong></span>
            : <span className="vs">VS</span>}
        </div>
        <div className="time-box time-box-right">
          <span className="time-name">{evento.timeB}</span>
          {evento.oddB && (
            <span className="time-odd mono">{Number(evento.oddB).toFixed(2)}x</span>
          )}
        </div>
      </div>

      {evento.descricao && (
        <p className="evento-desc">{evento.descricao}</p>
      )}

      <div className="evento-actions">
        {!showActions && evento.status === 'aberto' && (
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/apostar/${evento.id}`)}
          >
            Apostar agora
          </button>
        )}

        {showActions && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {evento.status === 'aberto' && onEncerrar && (
              <button className="btn btn-danger btn-sm" onClick={() => onEncerrar(evento)}>
                Encerrar apostas
              </button>
            )}
            {evento.status === 'encerrado' && !evento.resultado && onResultado && (
              <button className="btn btn-gold btn-sm" onClick={() => onResultado(evento)}>
                Informar resultado
              </button>
            )}
            {evento.resultado && (
              <span className="badge badge-gold">✓ Resultado definido</span>
            )}
          </div>
        )}
      </div>

      <style>{`
        .evento-card { transition: var(--transition); }
        .evento-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 16px;
          gap: 8px;
          flex-wrap: wrap;
        }
        .evento-meta { display: flex; align-items: center; gap: 10px; }
        .evento-esporte { font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); }
        .evento-data { font-size: 0.8rem; color: var(--text-muted); flex-shrink: 0; }
        .evento-times {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 16px;
          margin-bottom: 14px;
          background: var(--bg-700);
          border-radius: var(--radius-sm);
          padding: 16px;
        }
        .time-box { display: flex; flex-direction: column; gap: 4px; }
        .time-box-right { align-items: flex-end; text-align: right; }
        .time-name { font-size: 1.05rem; font-weight: 700; }
        .time-odd { font-size: 0.8rem; color: var(--green); }
        .vs-box { text-align: center; }
        .vs { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); }
        .resultado-label { font-size: 0.75rem; color: var(--gold); text-align: center; }
        .resultado-label strong { display: block; font-size: 0.9rem; }
        .evento-desc {
          font-size: 0.82rem;
          color: var(--text-muted);
          margin-bottom: 16px;
        }
        .evento-actions { display: flex; justify-content: flex-end; }
      `}</style>
    </div>
  )
}
