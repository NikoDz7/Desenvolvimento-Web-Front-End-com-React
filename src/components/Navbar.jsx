import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/authContext'

export default function Navbar() {
  const { usuario, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const userLinks = [
    { to: '/dashboard', label: 'Início' },
    { to: '/eventos', label: 'Eventos' },
    { to: '/historico', label: 'Histórico' },
    { to: '/extrato', label: 'Extrato' },
    { to: '/ranking', label: 'Ranking' },
  ]

  const adminLinks = [
    { to: '/admin', label: 'Painel' },
    { to: '/admin/eventos', label: 'Eventos' },
    { to: '/ranking', label: 'Ranking' },
  ]

  const links = isAdmin ? adminLinks : userLinks

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to={isAdmin ? '/admin' : '/dashboard'} className="navbar-logo">
          <span className="logo-icon">💸</span>
          <span className="logo-text">Bet<span className="logo-accent">Academia</span></span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`nav-link ${location.pathname === l.to ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="navbar-right">
          {!isAdmin && usuario && (
            <div className="nav-saldo">
              <span className="nav-saldo-label">Saldo</span>
              <span className="nav-saldo-value mono">
                R$ {Number(usuario.saldo).toFixed(2)}
              </span>
            </div>
          )}
          <div className="nav-user">
            <span className="nav-user-name">{usuario?.nome?.split(' ')[0]}</span>
            {isAdmin && <span className="badge badge-gold">Admin</span>}
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
            Sair
          </button>
          <button
            className="nav-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      <style>{`
        .navbar {
          background: var(--bg-800);
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(12px);
        }
        .navbar-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          height: 60px;
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .navbar-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1.15rem;
          font-weight: 700;
          flex-shrink: 0;
        }
        .logo-icon { font-size: 1.3rem; }
        .logo-accent { color: var(--green); }
        .navbar-links {
          display: flex;
          align-items: center;
          gap: 4px;
          flex: 1;
        }
        .nav-link {
          padding: 6px 14px;
          border-radius: var(--radius-sm);
          font-size: 0.88rem;
          font-weight: 500;
          color: var(--text-secondary);
          transition: var(--transition);
        }
        .nav-link:hover { color: var(--text-primary); background: var(--bg-700); }
        .nav-link.active { color: var(--green); background: var(--green-bg); }
        .navbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-left: auto;
        }
        .nav-saldo {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          line-height: 1.2;
        }
        .nav-saldo-label {
          font-size: 0.65rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .nav-saldo-value { font-size: 0.9rem; font-weight: 700; color: var(--green); }
        .nav-user { display: flex; align-items: center; gap: 8px; }
        .nav-user-name { font-size: 0.85rem; color: var(--text-secondary); }
        .nav-hamburger {
          display: none;
          flex-direction: column;
          gap: 4px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
        }
        .nav-hamburger span {
          display: block;
          width: 20px;
          height: 2px;
          background: var(--text-secondary);
          border-radius: 2px;
          transition: var(--transition);
        }
        @media (max-width: 768px) {
          .navbar-links {
            display: none;
            position: absolute;
            top: 60px;
            left: 0;
            right: 0;
            background: var(--bg-800);
            flex-direction: column;
            padding: 12px;
            border-bottom: 1px solid var(--border);
            gap: 4px;
          }
          .navbar-links.open { display: flex; }
          .nav-link { width: 100%; }
          .nav-hamburger { display: flex; }
          .nav-saldo { display: none; }
          .navbar-inner { position: relative; }
        }
      `}</style>
    </nav>
  )
}
