import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Importação das páginas reais criadas na Etapa 3
import { Login } from './pages/Login';
import { DashboardAdmin } from './pages/DashboardAdmin';
import { DashboardUser } from './pages/DashboardUser';

// Mantemos apenas a rota de erro simples por enquanto
const NaoEncontrado = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h2>Página 404 - Não Encontrada</h2>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rota Pública */}
          <Route path="/login" element={<Login />} />

          {/* Rota Protegida - Perfil: Usuário/Jogador */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['usuario']}>
                <DashboardUser />
              </ProtectedRoute>
            } 
          />

          {/* Rota Protegida - Perfil: Administrador */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardAdmin />
              </ProtectedRoute>
            } 
          />

          {/* Redirecionamento Inicial (Se tentar acessar a raiz, manda para o login) */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Rota de Erro Genérica */}
          <Route path="*" element={<NaoEncontrado />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}