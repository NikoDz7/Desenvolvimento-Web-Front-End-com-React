import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/authContext'

export default function ProtectedRoute({ children, requiredPerfil }) {
  const { isLoggedIn, usuario, loading } = useAuth()

  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', color: 'var(--green)', fontFamily: 'var(--font-mono)'
    }}>
      Carregando...
    </div>
  )

  if (!isLoggedIn) return <Navigate to="/login" replace />

  if (requiredPerfil && usuario.perfil !== requiredPerfil) {
    const redirect = usuario.perfil === 'admin' ? '/admin' : '/dashboard'
    return <Navigate to={redirect} replace />
  }

  return children
}
