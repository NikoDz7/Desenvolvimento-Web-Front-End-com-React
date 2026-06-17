import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3001',
})

//Usuários 
export const getUsuarios = () => api.get('/usuarios')
export const getUsuario = (id) => api.get(`/usuarios/${id}`)
export const updateUsuario = (id, data) => api.patch(`/usuarios/${id}`, data)

export const login = async (email, senha) => {
  const res = await api.get(`/usuarios?email=${email}&senha=${senha}`)
  return res.data[0] || null
}

//Eventos 
export const getEventos = () => api.get('/eventos')
export const getEvento = (id) => api.get(`/eventos/${id}`)
export const createEvento = (data) => api.post('/eventos', data)
export const updateEvento = (id, data) => api.patch(`/eventos/${id}`, data)
export const deleteEvento = (id) => api.delete(`/eventos/${id}`)

//Apostas 
export const getApostas = () => api.get('/apostas')
export const getApostasByUsuario = (usuarioId) =>
  api.get(`/apostas?usuarioId=${usuarioId}`)
export const getApostasByEvento = (eventoId) =>
  api.get(`/apostas?eventoId=${eventoId}`)
export const createAposta = (data) => api.post('/apostas', data)
export const updateAposta = (id, data) => api.patch(`/apostas/${id}`, data)

//Movimentações 
export const getMovimentacoes = () => api.get('/movimentacoes')
export const getMovimentacoesByUsuario = (usuarioId) =>
  api.get(`/movimentacoes?usuarioId=${usuarioId}`)
export const createMovimentacao = (data) => api.post('/movimentacoes', data)

export default api
