import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../contexts/authContext'
import { getEvento, createAposta, getApostasByUsuario, createMovimentacao, updateUsuario, getUsuario } from '../services/api'

export default function Apostar() {
  const { eventoId } = useParams()
  const navigate = useNavigate()
  const { usuario, refreshUsuario } = useAuth()

  const [evento, setEvento] = useState(null)
  const [palpite, setPalpite] = useState('')
  const [valor, setValor] = useState('')
  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [jaApostou, setJaApostou] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        await refreshUsuario()
        const evRes = await getEvento(eventoId)
        setEvento(evRes.data)

        const apRes = await getApostasByUsuario(usuario.id)
        const jaExiste = apRes.data.some(a => String(a.eventoId) === String(eventoId))
        setJaApostou(jaExiste)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [eventoId])

  const oddSelecionada = () => {
    if (!evento || !palpite) return null
    if (palpite === evento.timeA) return evento.oddA
    if (palpite === evento.timeB) return evento.oddB
    if (palpite === 'Empate') return evento.oddEmpate
    return null
  }

  const retornoPotencial = () => {
    const odd = oddSelecionada()
    if (!odd || !valor) return 0
    return (parseFloat(valor) * parseFloat(odd)).toFixed(2)
  }

  const handleApostar = async (e) => {
    e.preventDefault()
    setErro('')
    const v = parseFloat(valor)
    if (!palpite) return setErro('Selecione um palpite.')
    if (!v || v <= 0) return setErro('Digite um valor válido.')
    if (v > usuario.saldo) return setErro('Saldo insuficiente.')
    if (v < 1) return setErro('Valor mínimo: R$ 1,00.')

    setEnviando(true)
    try {
      const odd = oddSelecionada()
      // Debitar saldo
      const novoSaldo = usuario.saldo - v
      await updateUsuario(usuario.id, { saldo: novoSaldo })

      // Criar aposta
      await createAposta({
        usuarioId: usuario.id,
        eventoId: parseInt(eventoId),
        palpite,
        valor: v,
        status: 'pendente',
        retorno: 0,
        odd: parseFloat(odd),
        dataCriacao: new Date().toISOString(),
      })

      // Registrar movimentação
      await createMovimentacao({
        usuarioId: usuario.id,
        tipo: 'aposta',
        valor: -v,
        descricao: `Aposta: ${evento.timeA} vs ${evento.timeB} — Palpite: ${palpite}`,
        data: new Date().toISOString(),
      })

      // Bônus fictício: 5% sobre o valor apostado
      const bonus = v * 0.05
      const userRes = await getUsuario(usuario.id)
      await updateUsuario(usuario.id, { bonus: (userRes.data.bonus || 0) + bonus })

      await refreshUsuario()
      setSucesso(true)
    } catch (err) {
      console.error(err)
      setErro('Erro ao registrar aposta. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  if (loading) return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        <p style={{ color: 'var(--text-secondary)' }}>Carregando...</p>
      </main>
    </div>
  )

  if (!evento) return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        <div className="alert alert-error">Evento não encontrado.</div>
      </main>
    </div>
  )

  if (sucesso) return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        <div className="sucesso-box">
          <div className="sucesso-icon">🎉</div>
          <h2>Aposta registrada!</h2>
          <p>Palpite em <strong>{palpite}</strong> por <strong>R$ {parseFloat(valor).toFixed(2)}</strong></p>
          <p className="retorno-info">Retorno potencial: <span className="mono green">R$ {retornoPotencial()}</span></p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '8px' }}>
            🎁 +R$ {(parseFloat(valor) * 0.05).toFixed(2)} de bônus fictício creditado!
          </p>
          <div className="sucesso-actions">
            <button className="btn btn-secondary" onClick={() => navigate('/eventos')}>Ver mais eventos</button>
            <button className="btn btn-primary" onClick={() => navigate('/historico')}>Meu histórico</button>
          </div>
        </div>
      </main>
      <style>{`
        .sucesso-box {
          max-width: 440px; margin: 40px auto; text-align: center;
          background: var(--bg-card); border: 1px solid var(--green-border);
          border-radius: var(--radius-lg); padding: 40px;
          box-shadow: var(--shadow-glow);
        }
        .sucesso-icon { font-size: 3rem; margin-bottom: 16px; }
        .sucesso-box h2 { font-size: 1.5rem; margin-bottom: 8px; }
        .sucesso-box p { color: var(--text-secondary); margin-bottom: 6px; }
        .retorno-info { font-size: 1.05rem; font-weight: 600; color: var(--text-primary) !important; }
        .green { color: var(--green); }
        .sucesso-actions { display: flex; gap: 12px; justify-content: center; margin-top: 24px; flex-wrap: wrap; }
      `}</style>
    </div>
  )

  const odd = oddSelecionada()

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        <button className="btn btn-secondary btn-sm" style={{ marginBottom: '20px' }} onClick={() => navigate(-1)}>
          ← Voltar
        </button>

        <div className="apostar-layout">
          {/* Info do evento */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Evento</span>
              <span className="badge badge-green">Aberto</span>
            </div>

            <div className="evento-destaque">
              <div className="time-destaque">
                <span className="time-nome">{evento.timeA}</span>
                <span className="odd-destaque mono">
                  {parseFloat(evento.oddA).toFixed(2)}x
                </span>
              </div>
              <div className="vs-center">
                <span>VS</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                  {evento.esporte}
                </span>
              </div>
              <div className="time-destaque" style={{ alignItems: 'flex-end' }}>
                <span className="time-nome">{evento.timeB}</span>
                <span className="odd-destaque mono">
                  {parseFloat(evento.oddB).toFixed(2)}x
                </span>
              </div>
            </div>

            {evento.descricao && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', marginTop: '12px' }}>
                {evento.descricao}
              </p>
            )}

            <div className="evento-info-row">
              <span>📅 {evento.data}{evento.hora && ` às ${evento.hora}`}</span>
              <span>🏆 {evento.esporte}</span>
            </div>
          </div>

          {/* Formulário */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Fazer aposta</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Saldo: <span className="mono" style={{ color: 'var(--green)' }}>R$ {Number(usuario?.saldo || 0).toFixed(2)}</span>
              </span>
            </div>

            {evento.status !== 'aberto' ? (
              <div className="alert alert-error">Evento encerrado. Apostas não são mais aceitas.</div>
            ) : jaApostou ? (
              <div className="alert alert-info">Sua aposta ja foi realizada</div>
            ) : (
              <form onSubmit={handleApostar}>
                {erro && <div className="alert alert-error">{erro}</div>}

                <div className="form-group">
                  <label className="form-label">Seu palpite</label>
                  <div className="palpites-grid">
                    {[
                      { label: evento.timeA, odd: evento.oddA, value: evento.timeA },
                      { label: evento.timeB, odd: evento.oddB, value: evento.timeB },
                      ...(evento.oddEmpate ? [{ label: 'Empate', odd: evento.oddEmpate, value: 'Empate' }] : []),
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`palpite-btn ${palpite === opt.value ? 'active' : ''}`}
                        onClick={() => setPalpite(opt.value)}
                      >
                        <span className="palpite-label">{opt.label}</span>
                        <span className="palpite-odd mono">{parseFloat(opt.odd).toFixed(2)}x</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Valor da aposta (R$)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Ex: 50.00"
                    min="1"
                    step="0.01"
                    max={usuario?.saldo}
                    value={valor}
                    onChange={e => setValor(e.target.value)}
                    required
                  />
                  <div className="valor-shortcuts">
                    {[10, 25, 50, 100].map(v => (
                      <button key={v} type="button" className="shortcut-btn" onClick={() => setValor(String(v))}>
                        R$ {v}
                      </button>
                    ))}
                  </div>
                </div>

                {palpite && valor && (
                  <div className="resumo-aposta">
                    <div className="resumo-row">
                      <span>Palpite</span>
                      <strong>{palpite}</strong>
                    </div>
                    <div className="resumo-row">
                      <span>Odd</span>
                      <strong className="mono">{odd ? parseFloat(odd).toFixed(2) : '—'}x</strong>
                    </div>
                    <div className="resumo-row resumo-total">
                      <span>Retorno potencial</span>
                      <strong className="mono green">R$ {retornoPotencial()}</strong>
                    </div>
                    <div className="resumo-row" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <span>🎁 Bônus</span>
                      <span>+R$ {(parseFloat(valor) * 0.05).toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}
                  disabled={enviando || !palpite || !valor}
                >
                  {enviando ? 'Registrando...' : 'Confirmar aposta'}
                </button>

                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '12px' }}>
                  ⚠️ Valores fictícios para fins acadêmicos.
                </p>
              </form>
            )}
          </div>
        </div>
      </main>

      <style>{`
        .apostar-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .evento-destaque {
          display: grid; grid-template-columns: 1fr auto 1fr;
          align-items: center; gap: 16px;
          background: var(--bg-700); border-radius: var(--radius-sm);
          padding: 20px; margin-bottom: 8px;
        }
        .time-destaque { display: flex; flex-direction: column; gap: 6px; }
        .time-destaque:last-child { align-items: flex-end; }
        .time-nome { font-size: 1.1rem; font-weight: 700; }
        .odd-destaque { font-size: 0.85rem; color: var(--green); }
        .vs-center { text-align: center; font-size: 0.8rem; font-weight: 700; color: var(--text-muted); }
        .evento-info-row {
          display: flex; justify-content: center; gap: 20px;
          font-size: 0.8rem; color: var(--text-muted); margin-top: 12px;
        }
        .palpites-grid { display: flex; flex-direction: column; gap: 8px; }
        .palpite-btn {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 16px; border-radius: var(--radius-sm);
          border: 1px solid var(--border); background: var(--bg-700);
          cursor: pointer; transition: var(--transition); color: var(--text-primary);
          font-family: var(--font-display); font-size: 0.92rem;
        }
        .palpite-btn:hover { border-color: var(--green); }
        .palpite-btn.active { border-color: var(--green); background: var(--green-bg); }
        .palpite-label { font-weight: 600; }
        .palpite-odd { font-size: 0.82rem; color: var(--green); }
        .valor-shortcuts { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
        .shortcut-btn {
          padding: 5px 12px; border-radius: var(--radius-sm);
          border: 1px solid var(--border); background: none;
          color: var(--text-secondary); cursor: pointer;
          font-family: var(--font-display); font-size: 0.8rem;
          transition: var(--transition);
        }
        .shortcut-btn:hover { border-color: var(--green); color: var(--green); }
        .resumo-aposta {
          background: var(--bg-700); border-radius: var(--radius-sm);
          padding: 16px; margin-top: 8px; display: flex; flex-direction: column; gap: 10px;
        }
        .resumo-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.88rem; color: var(--text-secondary); }
        .resumo-total { padding-top: 10px; border-top: 1px solid var(--border); color: var(--text-primary); }
        .green { color: var(--green); }
        @media (max-width: 768px) { .apostar-layout { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  )
}
