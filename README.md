# 🛵 Rider Tracking

Sistema completo de rastreamento de entregadores em tempo real — da posição GPS no celular do entregador até o mapa na tela do cliente, com latência abaixo de 200ms.

Inspirado nos sistemas de telemetria de plataformas como iFood e Rappi.

---

## 🎯 O problema

Imagine gerenciar centenas de entregadores enviando coordenadas GPS a cada 3 segundos. Como garantir que:

-   O cliente veja o entregador se mover no mapa com latência mínima?
-   O banco de dados não seja sobrecarregado com milhares de escritas por minuto?
-   Se o cache cair, o sistema de tempo real continue funcionando?
-   O histórico completo da rota seja preservado para auditoria?

Esse projeto responde essas perguntas com uma arquitetura de dois bancos, WebSockets e design defensivo.

---

## 🏗️ Arquitetura geral

```
┌─────────────────┐     WebSocket      ┌──────────────────────┐
│   Frontend      │ ◄────────────────► │   Backend (Node.js)  │
│   (Next.js)     │                    │   (Socket.io)         │
└─────────────────┘                    └──────────┬───────────┘
                                                  │
                                    ┌─────────────┴─────────────┐
                                    │                           │
                               ┌────▼─────┐             ┌──────▼──────┐
                               │  Redis   │             │  DynamoDB   │
                               │  Cache   │             │  Histórico  │
                               │  ~1ms    │             │  ~10ms      │
                               └──────────┘             └─────────────┘
```

### Por que dois bancos?

|                | Redis                  | DynamoDB           |
| -------------- | ---------------------- | ------------------ |
| **Tipo**       | Cache em memória       | Banco NoSQL        |
| **Velocidade** | Microsegundos          | Milissegundos      |
| **Dados**      | Posição atual, status  | Histórico de rotas |
| **Duração**    | Expira automaticamente | Permanente         |
| **Responde**   | "Onde está agora?"     | "Onde esteve?"     |

---

## 📦 Estrutura do repositório

```
rider-tracking/
├── src/                    # Backend — Node.js + TypeScript
│   ├── server.ts           # Servidor WebSocket
│   ├── redis.ts            # Cache em memória
│   ├── repository.ts       # Persistência no DynamoDB
│   ├── simulator.ts        # Simulador do entregador
│   └── types.ts            # Contrato de dados
│
├── frontend/               # Frontend — Next.js + TypeScript
│   ├── app/
│   │   └── page.tsx        # Dashboard principal
│   ├── components/         # Componentes React
│   ├── hooks/
│   │   └── useSocket.ts    # Custom hook WebSocket
│   └── types/
│       └── index.ts        # Tipos do frontend
│
└── docker-compose.yml      # Infraestrutura local (Redis + DynamoDB)
```

---

## 🚀 Stack tecnológica

### Backend

-   **Node.js + TypeScript** — runtime e tipagem
-   **Socket.io** — WebSockets e sistema de salas por pedido
-   **Redis (ioredis)** — cache de posição atual e presença
-   **DynamoDB (AWS SDK v3)** — histórico permanente de rotas
-   **Docker Compose** — infraestrutura local reproduzível

### Frontend

-   **Next.js 13+** — framework React com App Router
-   **TypeScript** — tipagem estática
-   **Socket.io Client** — conexão WebSocket com o backend
-   **Leaflet + React Leaflet** — mapa interativo open source

---

## ⚙️ Como rodar o projeto completo

### Pré-requisitos

-   Node.js 18+
-   Docker e Docker Compose

### 1. Clone o repositório

```bash
git clone https://github.com/Rhulys/rider-tracking
cd rider-tracking
```

### 2. Suba a infraestrutura

```bash
docker-compose up -d
```

### 3. Inicie o backend

```bash
npm install
npx ts-node src/server.ts
```

### 4. Inicie o frontend (outro terminal)

```bash
cd frontend
npm install
npm run dev
```

### 5. Rode o simulador (outro terminal)

```bash
npx ts-node src/simulator.ts
```

### 6. Acesse

-   **Dashboard:** `http://localhost:3000`
-   **Redis Insight:** `http://localhost:8001`

---

## 🔄 Fluxo completo

```
1. Simulador conecta ao servidor via WebSocket
2. Simulador entra na sala "pedido-123"
3. A cada 3s, simulador envia updateLocation com coordenadas GPS
4. Servidor recebe e salva no Redis (posição atual)
5. A cada 5 atualizações, servidor salva no DynamoDB (histórico)
6. Servidor faz broadcast pra todos na sala "pedido-123"
7. Frontend recebe locationUpdated e atualiza o mapa
8. Badge de conexão, painel de status e histórico atualizam em tempo real
```

---

## 🧩 Funcionalidades

### Backend

-   [x] Rastreamento GPS em tempo real via WebSocket
-   [x] Sistema de salas por pedido (isolamento entre entregas)
-   [x] Cache de última posição conhecida no Redis
-   [x] Persistência de histórico de rota no DynamoDB
-   [x] Log de erros de GPS em tabela separada
-   [x] Persistência de entrega concluída
-   [x] Heartbeat de presença (ping a cada 10s)
-   [x] Gerenciamento de status do entregador
-   [x] Resposta individual de localização por solicitação
-   [x] Resiliência: falha no banco não derruba o WebSocket
-   [x] Setup automático de tabelas no DynamoDB ao iniciar

### Frontend

-   [x] Mapa interativo com marcador do entregador em tempo real
-   [x] Painel de status com cor e ícone por estado
-   [x] Coordenadas GPS, distância percorrida e velocidade estimada
-   [x] Histórico das últimas 20 posições com destaque na mais recente
-   [x] Botões de ação: mudar status e confirmar entrega
-   [x] Badge de conexão WebSocket (conectado/desconectado)
-   [x] Loading state enquanto aguarda primeira posição
-   [x] Horário de confirmação de entrega
-   [x] Limpar histórico
-   [x] Contador de atualizações recebidas

---

## 📚 Documentação detalhada

-   [README do Backend](./backend/README.md) — arquitetura, eventos WebSocket, estrutura de dados
-   [README do Frontend](./frontend/README.md) — componentes, hooks, decisões de design

---

## 🔑 Conceitos aplicados

-   **WebSockets** — comunicação bidirecional persistente
-   **Pub/Sub com salas** — isolamento de eventos por pedido
-   **Cache aside pattern** — Redis como cache na frente do DynamoDB
-   **TTL (Time to Live)** — expiração automática de dados no Redis
-   **Single-table design** — PK/SK otimizados pra consulta por pedido
-   **Custom hooks** — abstração de lógica de efeitos colaterais no React
-   **Optimistic updates** — atualização imediata da UI sem esperar confirmação
-   **Programação defensiva** — try/catch isolando falhas sem derrubar o sistema
-   **Separação de responsabilidades** — cada arquivo com uma única função clara

---

## 👤 Autor

**Rhulys** — [GitHub](https://github.com/Rhulys) · [LinkedIn](https://linkedin.com/in/rhulys/)
