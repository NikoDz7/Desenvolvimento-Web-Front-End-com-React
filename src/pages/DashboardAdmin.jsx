import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

export function DashboardAdmin() {
  const { user, logout } = useAuth();
  const [timeA, setTimeA] = useState('');
  const [timeB, setTimeB] = useState('');

  const cadastrarEvento = async (e) => {
    e.preventDefault();
    const novoEvento = {
      timeA,
      timeB,
      esporte: 'Futebol',
      data: new Date().toISOString().split('T')[0],
      status: 'aberto',
      resultado: ''
    };

    await api.post('/eventos', novoEvento);
    alert('Evento cadastrado com sucesso!');
    setTimeA('');
    setTimeB('');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>Painel Admin - Olá, {user.nome}</h2>
        <button onClick={logout}>Sair</button>
      </header>
      
      <hr />

      <h3>Cadastrar Novo Evento</h3>
      <form onSubmit={cadastrarEvento} style={{ display: 'flex', gap: '1rem' }}>
        <input placeholder="Time A" value={timeA} onChange={(e)=> setTimeA(e.target.value)} required />
        <span>X</span>
        <input placeholder="Time B" value={timeB} onChange={(e)=> setTimeB(e.target.value)} required />
        <button type="submit">Criar Evento</button>
      </form>
    </div>
  );
}