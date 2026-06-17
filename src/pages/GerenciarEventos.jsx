import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import EventoCard from '../components/EventoCard'
import Modal from '../components/Modal'
import {
  getEventos, createEvento, updateEvento, deleteEvento,
  getApostasByEvento, updateAposta, getUsuario, updateUsuario,
  createMovimentacao
} from '../services/api'

const esportes = ['Futebol', 'Basquete', 'Tênis', 'Vôlei', 'MMA', 'Fórmula 1']

const eventoVazio = {
  timeA: '', timeB: '', esporte: 'Futebol', data: '', hora: '',
  oddA: '', oddB: '', oddEmpate: '', descricao: '', status: 'aberto', resultado: ''
}

export default function GerenciarEventos() {
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalCriar, setModalCriar] = useState(false)
  const [modalResultado, setModalResultado] = useState(null)
  const [form, setForm] = useState(eventoVazio)
  const [resultado, setResultado] = useState('')
  const [msg, setMsg] = useState(null)
  const [filtro, setFiltro] = useState('todos')

  const fetchEventos = async () => {
    try {
      const res = await getEventos()
      setEventos(res.data.reverse())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchEventos() }, [])

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type })
    setTimeout(() => setMsg(null), 3000)
  }

  const handleCriar = async (e) => {
    e.preventDefault()
    try {
      await createEvento({ ...form, oddA: Number(form.oddA), oddB: Number(form.oddB), oddEmpate: form.oddEmpate ? Number(form.oddEmpate) : null })
      setModalCriar(false)
      setForm(eventoVazio)
      fetchEventos()
      showMsg('Evento criado com sucesso!')
    } catch (err) {
      showMsg('Erro ao criar evento.', 'error')
    }
  }

  const handleEncerrar = async (evento) => {
    if (!confirm(`Encerrar apostas para "${evento.timeA} vs ${evento.timeB}"?`)) return
    try {
      await updateEvento(evento.id, { status: 'encerrado' })
      fetchEventos()
      showMsg('Apostas encerradas!')
    } catch (err) {
      showMsg('Erro ao encerrar.', 'error')
    }
  }

  const handleInformarResultado = async () => {
    if (!resultado) return
    try {
      await updateEvento(modalResultado.id, { resultado, status: 'encerrado' })

      // Process bets
      const apostasRes = await getApostasByEvento(modalResultado.id)
      const apostas = apostasRes.data

      for (const aposta of apostas) {
        const ganhou = aposta.palpite === resultado
        const retorno = ganhou ? aposta.valor * aposta.odd : 0
        await updateAposta(aposta.id, {
          status: ganhou ? 'ganhou' : 'perdeu',
          retorno,
        })
        if (ganhou) {
          const userRes = await getUsuario(aposta.usuarioId)
          const user = userRes.data
          await updateUsuario(aposta.usuarioId, {
            saldo: user.saldo + retorno,
            apostasGanhas: (user.apostasGanhas || 0) + 1,
          })
          await createMovimentacao({
            usuarioId: aposta.usuarioId,
            tipo: 'premio',
            valor: retorno,
            descricao: `Prêmio: ${modalResultado.timeA} vs ${modalResultado.timeB} — você acertou!`,
            data: new Date().toISOString(),
          })
        }
        // Update stats
        const userRes2 = await getUsuario(aposta.usuarioId)
        const user2 = userRes2.data
        await updateUsuario(aposta.usuarioId, {
          apostasTotais: (user2.apostasTotais || 0) + 1,
        })
      }

      setModalResultado(null)
      setResultado('')
      fetchEventos()
      showMsg(`Resultado "${resultado}" registrado! Apostas processadas.`)
    } catch (err) {
      console.error(err)
      showMsg('Erro ao informar resultado.', 'error')
    }
  }

  const eventosFiltrados = filtro === 'todos' ? eventos : eventos.filter(e => e.status === filtro)

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        <div className="section-header">
          <div>
            <h1 className="section-title">Gerenciar Eventos</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
              {eventos.length} eventos cadastrados
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setModalCriar(true)}>
            + Novo evento
          </button>
        </div>

        {msg && (
          <div className={`alert alert-${msg.type}`}>{msg.text}</div>
        )}

        <div className="filter-tabs">
          {['todos', 'aberto', 'encerrado'].map(f => (
            <button
              key={f}
              className={`filter-tab ${filtro === f ? 'active' : ''}`}
              onClick={() => setFiltro(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Carregando...</p>
        ) : eventosFiltrados.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum evento encontrado.</p>
            <button className="btn btn-primary btn-sm" onClick={() => setModalCriar(true)}>
              Criar primeiro evento
            </button>
          </div>
        ) : (
          <div className="eventos-grid">
            {eventosFiltrados.map(ev => (
              <EventoCard
                key={ev.id}
                evento={ev}
                showActions
                onEncerrar={handleEncerrar}
                onResultado={(ev) => { setModalResultado(ev); setResultado('') }}
              />
            ))}
          </div>
        )}

        {/* Modal criar evento */}
        <Modal isOpen={modalCriar} onClose={() => setModalCriar(false)} title="Novo Evento">
          <form onSubmit={handleCriar}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Time / Atleta A</label>
                <input className="form-input" required value={form.timeA}
                  onChange={e => setForm({ ...form, timeA: e.target.value })} placeholder="Ex: Brasil" />
              </div>
              <div className="form-group">
                <label className="form-label">Time / Atleta B</label>
                <input className="form-input" required value={form.timeB}
                  onChange={e => setForm({ ...form, timeB: e.target.value })} placeholder="Ex: Argentina" />
              </div>
              <div className="form-group">
                <label className="form-label">Esporte</label>
                <select className="form-select" value={form.esporte}
                  onChange={e => setForm({ ...form, esporte: e.target.value })}>
                  {esportes.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Data</label>
                <input type="date" className="form-input" required value={form.data}
                  onChange={e => setForm({ ...form, data: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Hora</label>
                <input type="time" className="form-input" value={form.hora}
                  onChange={e => setForm({ ...form, hora: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Odd A</label>
                <input type="number" step="0.01" min="1" className="form-input" required value={form.oddA}
                  onChange={e => setForm({ ...form, oddA: e.target.value })} placeholder="Ex: 2.10" />
              </div>
              <div className="form-group">
                <label className="form-label">Odd B</label>
                <input type="number" step="0.01" min="1" className="form-input" required value={form.oddB}
                  onChange={e => setForm({ ...form, oddB: e.target.value })} placeholder="Ex: 3.50" />
              </div>
              <div className="form-group">
                <label className="form-label">Odd Empate (opcional)</label>
                <input type="number" step="0.01" min="1" className="form-input" value={form.oddEmpate}
                  onChange={e => setForm({ ...form, oddEmpate: e.target.value })} placeholder="Ex: 2.80" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Descrição</label>
              <input className="form-input" value={form.descricao}
                onChange={e => setForm({ ...form, descricao: e.target.value })} placeholder="Ex: Copa do Mundo - Semifinal" />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setModalCriar(false)}>Cancelar</button>
              <button type="submit" className="btn btn-primary">Criar evento</button>
            </div>
          </form>
        </Modal>

        {/* Modal resultado */}
        <Modal
          isOpen={!!modalResultado}
          onClose={() => setModalResultado(null)}
          title="Informar Resultado"
        >
          {modalResultado && (
            <div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Evento: <strong style={{ color: 'var(--text-primary)' }}>
                  {modalResultado.timeA} vs {modalResultado.timeB}
                </strong>
              </p>
              <div className="form-group">
                <label className="form-label">Vencedor</label>
                <select className="form-select" value={resultado} onChange={e => setResultado(e.target.value)}>
                  <option value="">Selecione...</option>
                  <option value={modalResultado.timeA}>{modalResultado.timeA}</option>
                  <option value={modalResultado.timeB}>{modalResultado.timeB}</option>
                  {modalResultado.oddEmpate && <option value="Empate">Empate</option>}
                </select>
              </div>
              <div className="alert alert-info" style={{ fontSize: '0.82rem' }}>
                ⚠️ Após confirmar, as apostas serão processadas automaticamente e os prêmios creditados.
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button className="btn btn-secondary" onClick={() => setModalResultado(null)}>Cancelar</button>
                <button className="btn btn-gold" onClick={handleInformarResultado} disabled={!resultado}>
                  Confirmar resultado
                </button>
              </div>
            </div>
          )}
        </Modal>
      </main>

      <style>{`
        .eventos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; }
        .filter-tabs { display: flex; gap: 8px; margin-bottom: 24px; }
        .filter-tab {
          padding: 7px 18px;
          border-radius: 100px;
          border: 1px solid var(--border);
          background: none;
          color: var(--text-secondary);
          cursor: pointer;
          font-family: var(--font-display);
          font-size: 0.85rem;
          font-weight: 500;
          transition: var(--transition);
        }
        .filter-tab:hover { border-color: var(--green); color: var(--text-primary); }
        .filter-tab.active { background: var(--green-bg); border-color: var(--green); color: var(--green); }
        .empty-state {
          text-align: center;
          padding: 48px;
          color: var(--text-muted);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        @media (max-width: 768px) {
          .eventos-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}
