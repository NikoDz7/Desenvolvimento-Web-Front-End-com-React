# 🤑💸 BetzinhaDaAcad

> Plataforma acadêmica de apostas kaozeiras

---

## Integrantes

- Nicolas Guedes de Andrade
- Alessandro Bazilio Henrique

---

## Descrição Geral

**BetzinhaDaAcad** é uma plataforma web acadêmica que simula um sistema de apostas esportivas fictícias. O sistema possui dois perfis de usuário: **Administrador** e **Jogador**.

>  **Todos os valores, saldos, apostas e prêmios são 100% inventados. Este projeto tem finalidade exclusivamente acadêmica.**

---

## Funcionalidade Extra Escolhida

### Extrato de Movimentações da Carteira

Tela exclusiva (`/extrato`) que exibe um histórico detalhado de todas as movimentações fictícias do jogador: apostas realizadas, prêmios recebidos e bônus acumulados. Cada entrada/saída é registrada no JSON Server com tipo, descrição, valor e data/hora.

**Como funciona:**
- Ao realizar uma aposta, uma movimentação de **saída** é registrada automaticamente.
- Ao ganhar uma aposta, uma movimentação de **entrada** (prêmio) é registrada.
- O extrato exibe saldo atual, total de entradas, total de saídas e número de movimentações.
- Filtros por tipo (apostas / prêmios / todas).

---

## 📐 Regras de Negócio

| Regra | Descrição |
|---|---|
| Saldo inicial | Cada jogador começa com R$ 1.000,00 fictícios |
| Aposta mínima | R$ 1,00 |
| Aposta máxima | Limitada ao saldo disponível |
| Aposta única | Um jogador pode apostar apenas uma vez por evento |
| Cálculo de retorno | `valor × odd` |
| Bônus de fidelidade | 5% do valor apostado é creditado como bônus fictício |
| Processamento | Ao informar o resultado, todas as apostas do evento são processadas automaticamente |
| Admin sem saldo | O perfil admin não possui saldo, apenas gerencia a plataforma |

---

## 🛠️ Tecnologias Utilizadas

- **React 18** — biblioteca principal
- **React Router DOM v6** — roteamento SPA
- **React Hooks** — `useState`, `useEffect`, `useCallback`, `useContext`
- **Context API** — gerenciamento de autenticação global
- **JSON Server** — API REST simulada
- **Axios** — cliente HTTP
- **Vite** — bundler e servidor de desenvolvimento
- **CSS puro** — estilização com variáveis CSS (design system próprio)
- **GitHub** — controle de versão

---

## Como Executar

### Pré-requisitos
- Node.js 18+
- npm 9+

### 1. Instalar dependências
```bash
npm install
```

### 2. Iniciar o JSON Server (em um terminal)
```bash
npm run server
```
> A API ficará disponível em `http://localhost:3001`

### 3. Iniciar o React (em outro terminal)
```bash
npm run dev
```
> A aplicação ficará disponível em `http://localhost:5173`

---

##  Usuários de Teste

| Perfil | E-mail | Senha |
|---|---|---|
| Administrador | admin@bet.com | 123 |
| Jogador | nicolas@bet.com | 123 |
| Jogador | ana@bet.com | 123 |
| Jogador | alessandro@bet.com | 123 |

---

## Principais Rotas

| Rota | Perfil | Descrição |
|---|---|---|
| `/login` | Público | Tela de login |
| `/admin` | Admin | Dashboard administrativo |
| `/admin/eventos` | Admin | Gerenciar eventos (criar, encerrar, resultado) |
| `/dashboard` | Usuário | Dashboard do jogador |
| `/eventos` | Usuário | Listagem de eventos com filtros |
| `/apostar/:id` | Usuário | Tela de aposta em um evento |
| `/historico` | Usuário | Histórico de apostas |
| `/extrato` | Usuário | Extrato de movimentações (funcionalidade extra) |
| `/ranking` | Ambos | Ranking de jogadores |

---

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── EventoCard.jsx     # Card reutilizável de evento
│   ├── Modal.jsx          # Componente de modal genérico
│   └── Navbar.jsx         # Barra de navegação
├── contexts/
│   └── authContext.jsx    # Context API de autenticação
├── pages/
│   ├── Login.jsx
│   ├── DashboardAdmin.jsx
│   ├── DashboardUser.jsx
│   ├── GerenciarEventos.jsx
│   ├── Eventos.jsx
│   ├── Apostar.jsx
│   ├── HistoricoApostas.jsx
│   ├── Ranking.jsx
│   └── Extrato.jsx        # Funcionalidade extra
├── routes/
│   ├── index.jsx          # Definição de todas as rotas
│   └── protectedRoute.jsx # Proteção de rotas por perfil
├── services/
│   └── api.js             # Todas as chamadas ao JSON Server
├── styles/
│   └── global.css         # Design system global
├── App.jsx
└── main.jsx
```

---

## Principais Telas

### Login
Tela de acesso com credenciais simuladas e atalhos de demonstração.

### Dashboard Administrador
Visão geral da plataforma: total de eventos, apostas, jogadores e valor movimentado.

### Gerenciar Eventos (Admin)
Criação de eventos com odds, esporte, data/hora e descrição. Controle de status (aberto/encerrado) e informação de resultado com processamento automático das apostas.

### Dashboard do Jogador
Resumo de saldo fictício, bônus acumulado, apostas (ganhas/perdidas/pendentes) e taxa de acerto.

### Eventos
Listagem com filtros por status e esporte, busca por time/atleta.

### Tela de Aposta
Seleção de palpite com odds visuais, entrada de valor com atalhos rápidos, cálculo de retorno potencial em tempo real.

### Histórico de Apostas
Tabela completa com filtros por status, estatísticas de resultado e lucro/prejuízo fictício.

### Ranking 
Pódio visual (top 3) e tabela completa com ordenação por saldo, apostas ganhas, taxa de acerto ou bônus.

### Extrato (Funcionalidade Extra) 📊
Histórico de movimentações com filtros por tipo, totais de entradas/saídas e saldo atual.

---

##  Divisão de Tarefas

| Integrante | Responsabilidades |
|---|---|
| (Integrante 1) | Estrutura do projeto, Context API, rotas, Login, Navbar, DashboardAdmin, GerenciarEventos |
| (Integrante 2) | DashboardUser, Eventos, Apostar, HistoricoApostas, Ranking, Extrato, db.json |

---

##  Dificuldades Encontradas

- Processamento em cascata das apostas ao informar resultado (múltiplas chamadas assíncronas à API)
- Sincronização do saldo do usuário entre contexto global e dados do servidor
- Layout responsivo do pódio de ranking em telas pequenas
-Com certeza a parte mais difícil foi fazer as partes de conta saldo extrato

---

##  Melhorias Futuras

- Upload de avatar do usuário
