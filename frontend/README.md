# 🗺️ Rider Tracking — Frontend

Dashboard de rastreamento em tempo real construída com Next.js, TypeScript e Leaflet. Conecta ao backend via WebSocket e exibe a posição do entregador ao vivo no mapa.

---

## 📋 Sobre o projeto

O frontend é uma dashboard profissional que consome o backend de telemetria em tempo real. Ela exibe a posição do entregador num mapa interativo, painel de status, histórico de posições e botões de ação — tudo atualizado automaticamente via WebSocket, sem precisar recarregar a página.

---

## 🚀 Tecnologias

| Tecnologia                | Papel                           |
| ------------------------- | ------------------------------- |
| Next.js 13+               | Framework React com App Router  |
| TypeScript                | Tipagem estática                |
| Socket.io Client          | Conexão WebSocket com o backend |
| Leaflet + React Leaflet   | Mapa interativo open source     |
| CSS in JS (inline styles) | Estilização por componente      |

---

## 📁 Estrutura de arquivos

```
frontend/
├── app/
│   ├── page.tsx              # Dashboard principal — integra todos os componentes
│   └── layout.tsx            # Layout global da aplicação
├── components/
│   ├── Map.tsx               # Mapa interativo com marcador do entregador
│   ├── StatusPanel.tsx       # Painel com status, coordenadas e métricas
│   ├── ActionButtons.tsx     # Botões de ação (mudar status, confirmar entrega)
│   ├── LocationHistory.tsx   # Histórico das últimas posições recebidas
│   └── ConnectionBadge.tsx   # Badge de status da conexão WebSocket
├── hooks/
│   └── useSocket.ts          # Custom hook — toda a lógica do WebSocket
└── types/
    └── index.ts              # Interfaces e tipos TypeScript
```

---

## ⚙️ Pré-requisitos

-   Node.js 18+
-   Backend do Rider Tracking rodando (ver README do backend)
-   npm ou yarn

---

## 🛠️ Como rodar localmente

### 1. Instale as dependências

```bash
npm install
```

### 2. Certifique-se que o backend está rodando

O frontend conecta em `http://localhost:3001` por padrão. Certifique-se que o backend está ativo antes de iniciar o frontend.

### 3. Inicie o frontend

```bash
npm run dev
```

Acesse `http://localhost:3000` no navegador.

---

## 🧩 Componentes

### `useSocket.ts` — Custom Hook

O coração do frontend. Centraliza toda a lógica de conexão WebSocket:

-   Abre e fecha a conexão automaticamente com o ciclo de vida do componente
-   Gerencia o estado de localização, histórico, status e presença
-   Expõe funções de ação (`confirmDelivery`, `changeStatus`, `clearHistory`)
-   Calcula distância percorrida e velocidade estimada em tempo real

```typescript
const {
	location, // Última posição recebida
	history, // Últimas 20 posições
	status, // Status atual do entregador
	lastSeen, // Horário do último sinal
	connected, // Estado da conexão WebSocket
	updateCount, // Total de atualizações recebidas
	distance, // Distância total percorrida (metros)
	speed, // Velocidade estimada (km/h)
	deliveredAt, // Horário de confirmação da entrega
	confirmDelivery,
	changeStatus,
	clearHistory,
} = useSocket();
```

### `Map.tsx` — Mapa interativo

-   Mapa OpenStreetMap via Leaflet (gratuito, sem API key)
-   Marcador que acompanha o entregador em tempo real
-   Importado com `dynamic` e `ssr: false` — compatível com Next.js

### `StatusPanel.tsx` — Painel de status

-   Status atual com cor e ícone indicativo
-   Coordenadas GPS em tempo real
-   Distância percorrida e velocidade estimada
-   Horário do último sinal e total de atualizações

### `ActionButtons.tsx` — Botões de ação

-   Mudar status: `Online`, `Ocupado`, `Entregando`, `Pausado`, `Offline`
-   Confirmar entrega
-   Botão ativo destacado visualmente

### `LocationHistory.tsx` — Histórico

-   Últimas 20 posições recebidas
-   Destaque visual na posição mais recente
-   Botão para limpar o histórico

### `ConnectionBadge.tsx` — Badge de conexão

-   Indicador visual em tempo real do estado do WebSocket
-   Verde: conectado ao servidor
-   Vermelho: desconectado

---

## 🔧 Decisões de arquitetura

### Por que um custom hook pra o WebSocket?

Vários componentes precisam dos mesmos dados (localização, status, histórico). Se cada componente abrisse sua própria conexão, seriam múltiplas conexões simultâneas desnecessárias. O hook centraliza tudo — uma conexão, múltiplos consumidores.

### Por que `dynamic` com `ssr: false` no mapa?

O Leaflet acessa APIs do browser (`window`, `document`) ao ser importado. O Next.js processa arquivos no servidor durante o build, onde essas APIs não existem. O `dynamic` com `ssr: false` garante que o Leaflet só carrega no navegador.

### Por que os tipos foram duplicados do backend?

Frontend e backend são projetos separados que rodam em ambientes diferentes. Um não importa diretamente do outro. Em projetos de escala maior isso é resolvido com um pacote `@empresa/types` compartilhado — aqui, duplicar é a solução correta e simples.

### Por que optimistic update no `changeStatus`?

Ao mudar o status, a interface atualiza imediatamente sem esperar confirmação do servidor. O usuário tem a percepção de resposta instantânea. Se o servidor rejeitar (o que não acontece nesse caso), você reverteria o estado. É um padrão comum em sistemas de tempo real.

---

## 🎨 Design

Design escuro (dark mode nativo), estilo dashboard profissional, paleta baseada no tema Catppuccin Mocha.

Cores principais:

-   Background: `#11111b`
-   Superfícies: `#1e1e2e`
-   Elementos: `#313244`
-   Texto principal: `#cdd6f4`
-   Destaque: `#89b4fa`
-   Sucesso: `#a6e3a1`

---

## 🔒 Variáveis de ambiente (produção)

```env
NEXT_PUBLIC_SERVER_URL=https://seu-backend.railway.app
```

Substitua a URL hardcoded no `useSocket.ts` por:

```typescript
const newSocket = io(process.env.NEXT_PUBLIC_SERVER_URL!);
```

---

## 📦 Scripts

```bash
npm run dev      # Inicia em modo desenvolvimento
npm run build    # Compila para produção
npm start        # Inicia o servidor de produção
npm run lint     # Verifica qualidade do código
```

---

## 👤 Autor

**Rhulys** — [GitHub](https://github.com/Rhulys) · [LinkedIn](https://linkedin.com/in/rhulys/)
