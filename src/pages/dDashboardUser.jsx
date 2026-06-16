import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

export function DashboardUser() {
  const { user, logout } = useAuth();
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    // Busca apenas os eventos que estão abertos para apostas
    async function carregarEventos() {
      const response = await api.get('/eventos?status=aberto');
      setEventos(response.data);
    }
    carregarEventos();
  }, []);

  const realizarApostaMock = () => {
    alert('A lógica de apostar e descontar saldo virá na próxima etapa!');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>Área do Jogador - Olá, {user.nome}</h2>
        <div>
          <strong>Saldo Fictício: R$ {user.saldo}</strong>
          <button onClick={logout} style={{ marginLeft: '1rem' }}>Sair</button>
        </div>
      </header>

      <hr />

      <h3>Eventos Disponíveis para Aposta</h3>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {eventos.length === 0 ? <p>Nenhum evento aberto no momento.</p> : null}
        
        {eventos.map(evento => (
          <div key={evento.id} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
            <h4>{evento.timeA} x {evento.timeB}</h4>
            <p>Esporte: {evento.esporte}</p>
            <p>Data: {evento.data}</p>
            <button onClick={realizarApostaMock}>Apostar Fictício</button>
          </div>
        ))}
      </div>
    </div>
  );
}