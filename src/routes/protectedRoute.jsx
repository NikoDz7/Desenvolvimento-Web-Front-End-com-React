import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ children, allowedRoles }) {
  const { user, signed } = useAuth();

  // Se não estiver logado, manda para o login
  if (!signed) {
    return <Navigate to="/login" replace />;
  }

  // Se a rota exigir um perfil específico (admin ou usuario) e o usuário não tiver, redireciona
  if (allowedRoles && !allowedRoles.includes(user.perfil)) {
    // Se for admin tentando ir para área de usuário, ou vice-versa, redireciona para a home correta
    return user.perfil === 'admin' 
      ? <Navigate to="/admin/dashboard" replace /> 
      : <Navigate to="/dashboard" replace />;
  }

  return children;
}