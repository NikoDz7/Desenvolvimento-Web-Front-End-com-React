import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Tenta recuperar o usuário já logado para não perder o acesso ao dar F5
    const storedUser = localStorage.getItem('@BetAcademica:user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('@BetAcademica:user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('@BetAcademica:user');
  };

  const atualizarSaldo = (novoSaldo) => {
    if (user && user.perfil === 'usuario') {
      const usuarioAtualizado = { ...user, saldo: novoSaldo };
      setUser(usuarioAtualizado);
      localStorage.setItem('@BetAcademica:user', JSON.stringify(usuarioAtualizado));
    }
  };

  return (
    <AuthContext.Provider value={{ user, signed: !!user, login, logout, atualizarSaldo }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para facilitar o uso do contexto nos componentes
export function useAuth() {
  return useContext(AuthContext);
}