import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '../contexts/authContext'
import ProtectedRoute from './protectedRoute'

import Login from '../pages/Login'
import DashboardAdmin from '../pages/DashboardAdmin'
import DashboardUser from '../pages/DashboardUser'
import Eventos from '../pages/Eventos'
import GerenciarEventos from '../pages/GerenciarEventos'
import Apostar from '../pages/Apostar'
import HistoricoApostas from '../pages/HistoricoApostas'
import Ranking from '../pages/Ranking'
import Extrato from '../pages/Extrato'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute requiredPerfil="admin">
              <DashboardAdmin />
            </ProtectedRoute>
          } />
          <Route path="/admin/eventos" element={
            <ProtectedRoute requiredPerfil="admin">
              <GerenciarEventos />
            </ProtectedRoute>
          } />

          {/* User routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute requiredPerfil="usuario">
              <DashboardUser />
            </ProtectedRoute>
          } />
          <Route path="/eventos" element={
            <ProtectedRoute requiredPerfil="usuario">
              <Eventos />
            </ProtectedRoute>
          } />
          <Route path="/apostar/:eventoId" element={
            <ProtectedRoute requiredPerfil="usuario">
              <Apostar />
            </ProtectedRoute>
          } />
          <Route path="/historico" element={
            <ProtectedRoute requiredPerfil="usuario">
              <HistoricoApostas />
            </ProtectedRoute>
          } />
          <Route path="/ranking" element={
            <ProtectedRoute>
              <Ranking />
            </ProtectedRoute>
          } />
          <Route path="/extrato" element={
            <ProtectedRoute requiredPerfil="usuario">
              <Extrato />
            </ProtectedRoute>
          } />

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
