# 🛵 Rider Tracking — Backend

Sistema de rastreamento de entregadores em tempo real, construído com Node.js, TypeScript, WebSockets, Redis e DynamoDB.

---

## 📋 Sobre o projeto

O backend é o coração do sistema. Ele gerencia conexões em tempo real com entregadores e clientes, processa coordenadas GPS, mantém um cache de alta performance e persiste o histórico completo de cada entrega.

### Problema que resolve

Como garantir que o cliente veja o entregador se mover no mapa com latência mínima, sem sobrecarregar o banco de dados com milhares de escritas por minuto?

**Solução:** arquitetura em duas camadas — Redis para acesso instantâneo em memória e DynamoDB para persistência eficiente do histórico.

---

## 🏗️ Arquitetura

```
simulator.ts  →  simula o entregador (cliente WebSocket)
     ↓
server.ts     →  servidor WebSocket (orquestra tudo)
     ↓
redis.ts      →  cache em memória (posição atual, status, presença)
repository.ts →  histórico permanente (rota completa no DynamoDB)
types.ts      →  contrato de dados compartilhado
```

### Fluxo de uma atualização de posição

1. Entregador envia `updateLocation` via WebSocket
2. Servidor salva a posição no Redis (instantâneo)
3. A cada 5 atualizações, salva no DynamoDB (histórico)
4. Servidor faz broadcast pra todos os clientes na sala do pedido
5. Cliente recebe e atualiza o mapa em tempo real

---

## 🚀 Tecnologias

| Tecnologia              | Papel                         |
| ----------------------- | ----------------------------- |
| Node.js + TypeScript    | Runtime e tipagem estática    |
| Socket.io               | WebSockets e sistema de salas |
| Redis (ioredis)         | Cache em memória RAM          |
| DynamoDB (AWS SDK v3)   | Persistência de histórico     |
| Docker + Docker Compose | Infraestrutura local          |

---

## 📁 Estrutura de arquivos

```
src/
├── server.ts        # Servidor WebSocket — orquestra todos os eventos
├── redis.ts         # Funções de cache (posição, status, presença, entrega)
├── repository.ts    # Funções de persistência (histórico, logs de erro)
├── simulator.ts     # Simulador do entregador para desenvolvimento/testes
└── types.ts         # Interfaces e tipos TypeScript compartilhados
```

---

## ⚙️ Pré-requisitos

-   Node.js 18+
-   Docker e Docker Compose
-   npm ou yarn

---

## 🛠️ Como rodar localmente

### 1. Clone o repositório

```bash
git clone https://github.com/Rhulys/rider-tracking
cd rider-tracking
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Suba a infraestrutura com Docker

```bash
docker-compose up -d
```

Isso sobe três serviços:

-   **Redis** na porta `6379`
-   **DynamoDB Local** na porta `8000`
-   **Redis Insight** (interface visual) na porta `8001`

### 4. Inicie o servidor

```bash
npx ts-node src/server.ts
```

O servidor cria a tabela `RiderHistory` no DynamoDB automaticamente ao iniciar.

### 5. Rode o simulador (em outro terminal)

```bash
npx ts-node src/simulator.ts
```

O simulador conecta ao servidor, entra na sala `pedido-123` e começa a enviar coordenadas GPS a cada 3 segundos, simulando um entregador saindo da Av. Paulista, SP.

---

## 🗺️ Eventos WebSocket

### Cliente → Servidor

| Evento            | Payload           | Descrição                            |
| ----------------- | ----------------- | ------------------------------------ |
| `joinOrder`       | `orderId: string` | Entra na sala do pedido              |
| `updateLocation`  | `LocationUpdate`  | Envia nova posição GPS               |
| `confirmDelivery` | `LocationUpdate`  | Confirma que a entrega foi realizada |
| `changeStatus`    | `status: string`  | Atualiza status do entregador        |
| `requestLocation` | `orderId: string` | Solicita última posição conhecida    |
| `ping`            | —                 | Heartbeat de presença online         |

### Servidor → Cliente

| Evento             | Payload          | Descrição                                    |
| ------------------ | ---------------- | -------------------------------------------- |
| `locationUpdated`  | `LocationUpdate` | Nova posição do entregador                   |
| `locationResponse` | `LocationUpdate` | Resposta individual à solicitação de posição |
| `DeliveryFinished` | `string`         | Confirmação de entrega concluída             |

---

## 🗄️ Estrutura de dados

### Redis — Chaves e expirações

| Chave                       | Valor                   | Expiração |
| --------------------------- | ----------------------- | --------- |
| `rider:pos:{orderId}`       | `LocationUpdate` (JSON) | 1 hora    |
| `rider:status:{riderId}`    | `string`                | 2 horas   |
| `rider:completed:{riderId}` | `LocationUpdate` (JSON) | 2 horas   |
| `rider:last_seen:{riderId}` | timestamp (ms)          | 5 minutos |
| `order:status:{orderId}`    | `string`                | 2 horas   |

### DynamoDB — Tabelas

**RiderHistory**

| Campo | Tipo           | Descrição                           |
| ----- | -------------- | ----------------------------------- |
| `pk`  | String (HASH)  | `ORDER#{orderId}`                   |
| `sk`  | String (RANGE) | `TIME#{timestamp}`                  |
| `...` | —              | Todos os campos de `LocationUpdate` |

**SystemLogs**

| Campo | Tipo           | Descrição         |
| ----- | -------------- | ----------------- |
| `pk`  | String (HASH)  | `RIDER#{riderId}` |
| `sk`  | String (RANGE) | `LOG#{timestamp}` |

**DeliveryHistory**

| Campo | Tipo           | Descrição            |
| ----- | -------------- | -------------------- |
| `pk`  | String (HASH)  | `DELIVERY#{orderId}` |
| `sk`  | String (RANGE) | `DONE#{timestamp}`   |

---

## 🔧 Decisões de arquitetura

### Por que Redis + DynamoDB?

Dois bancos com responsabilidades distintas:

-   **Redis** responde "onde está o entregador agora?" — acesso em microsegundos, dados que expiram
-   **DynamoDB** responde "qual foi a rota completa?" — histórico permanente, consulta por pedido

Usar só o DynamoDB pra tudo seria caro (cobrança por escrita) e mais lento pra leituras frequentes.

### Por que salvar só a cada 5 atualizações no DynamoDB?

Custo e utilidade. A cada 3 segundos, 100 entregas simultâneas gerariam ~2000 escritas/minuto. Salvando 1 a cada 5, cai pra ~400. O mapa em tempo real continua suave (todas as atualizações via Redis) e o histórico ainda tem resolução suficiente.

### Por que WebSocket em vez de polling?

Com polling, 100 clientes fariam 100 requisições/segundo mesmo sem nada novo. Com WebSocket, o servidor fala só quando tem dado novo. Menor latência, menor custo computacional, melhor experiência.

### Resiliência por design

Cada operação de banco está envolta em `try/catch`. Se o Redis ou o DynamoDB caírem, o sistema de tempo real continua funcionando. Os erros são logados mas não derrubam o servidor nem as conexões WebSocket ativas.

---

## 🐳 Docker Compose

```yaml
services:
    redis: # Cache em memória — porta 6379
    dynamodb: # Banco de histórico local — porta 8000
    redis-insight: # Interface visual do Redis — porta 8001
```

Acesse o Redis Insight em `http://localhost:8001` para visualizar as chaves em tempo real durante o desenvolvimento.

---

## 🔒 Variáveis de ambiente (produção)

Em produção, substitua os valores hardcoded por variáveis de ambiente:

```env
PORT=3000
REDIS_HOST=seu-redis-host
REDIS_PORT=6379
DYNAMODB_REGION=us-east-1
AWS_ACCESS_KEY_ID=sua-key
AWS_SECRET_ACCESS_KEY=seu-secret
```

---

## 👤 Autor

**Rhulys** — [GitHub](https://github.com/Rhulys) · [LinkedIn](https://linkedin.com/in/rhulys/)
