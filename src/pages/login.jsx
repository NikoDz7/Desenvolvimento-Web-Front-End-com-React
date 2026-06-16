import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

export function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Busca no JSON Server se existe um usuário com esse email
      const response = await api.get(`/usuarios?email=${email}`);
      const usuarioEncontrado = response.data[0];

      if (usuarioEncontrado && usuarioEncontrado.senha === senha) {
        login(usuarioEncontrado); // Salva no Contexto
        
        // Direciona para a rota correta conforme o perfil
        if (usuarioEncontrado.perfil === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setErro('E-mail ou senha inválidos.');
      }
    } catch (error) {
      setErro('Erro ao conectar com o servidor.');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Login Bet Acadêmica</h2>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input 
          type="email" 
          placeholder="E-mail" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Senha" 
          value={senha} 
          onChange={(e) => setSenha(e.target.value)} 
          required 
        />
        {erro && <p style={{ color: 'red' }}>{erro}</p>}
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}