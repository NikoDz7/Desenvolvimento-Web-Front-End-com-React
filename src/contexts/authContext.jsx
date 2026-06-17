import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { login as loginApi, updateUsuario, getUsuario } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [loading, setLoading] = useState(true)

  // Rehydrate from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('betacademia_user')
    if (saved) {
      try { setUsuario(JSON.parse(saved)) } catch (_) { /* ignore */ }
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (email, senha) => {
    const user = await loginApi(email, senha)
    if (!user) throw new Error('E-mail ou senha inválidos.')
    setUsuario(user)
    sessionStorage.setItem('betacademia_user', JSON.stringify(user))
    return user
  }, [])

  const logout = useCallback(() => {
    setUsuario(null)
    sessionStorage.removeItem('betacademia_user')
  }, [])

  // Refresh local user data from server
  const refreshUsuario = useCallback(async () => {
    if (!usuario) return
    const res = await getUsuario(usuario.id)
    setUsuario(res.data)
    sessionStorage.setItem('betacademia_user', JSON.stringify(res.data))
    return res.data
  }, [usuario])

  // Update user balance helpers
  const debitarSaldo = useCallback(async (valor) => {
    if (!usuario) return
    const novoSaldo = usuario.saldo - valor
    await updateUsuario(usuario.id, { saldo: novoSaldo })
    const updated = { ...usuario, saldo: novoSaldo }
    setUsuario(updated)
    sessionStorage.setItem('betacademia_user', JSON.stringify(updated))
    return updated
  }, [usuario])

  const creditarSaldo = useCallback(async (valor) => {
    if (!usuario) return
    const novoSaldo = usuario.saldo + valor
    await updateUsuario(usuario.id, { saldo: novoSaldo })
    const updated = { ...usuario, saldo: novoSaldo }
    setUsuario(updated)
    sessionStorage.setItem('betacademia_user', JSON.stringify(updated))
    return updated
  }, [usuario])

  const isAdmin = usuario?.perfil === 'admin'
  const isLoggedIn = !!usuario

  return (
    <AuthContext.Provider value={{
      usuario,
      loading,
      login,
      logout,
      refreshUsuario,
      debitarSaldo,
      creditarSaldo,
      isAdmin,
      isLoggedIn,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
