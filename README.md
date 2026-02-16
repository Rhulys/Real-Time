# 📍 Real-Time Rider Tracker
Este é um microserviço de telemetria de baixa latência focado no rastreamento geográfico de frotas em tempo real, simulando a logística de last-mile de empresas como iFood e Uber Eats.

## 🚀 Tecnologias
 **- Runtime:** Node.js com TypeScript <br/>
 **- Comunicação:** WebSockets (Socket.io)<br/>
 **- Cache/Fast Storage:** Redis (Docker)<br/>
 **- Database:** AWS DynamoDB (Local com Docker)<br/>
 **- Frontend:** Leaflet.js (Mapas OpenSource)

## 🏗️ Arquitetura do Sistema
O projeto foi desenhado seguindo princípios de Sistemas Distribuídos, garantindo que a aplicação seja resiliente e performática:

 **1. Ingestão de Dados:** O simulador (Rider) envia coordenadas via WebSocket.<br/>
 **2. Camada de Cache (Redis):** Cada posição é salva no Redis com um TTL (Time-to-Live). Isso permite que novos clientes recebam a "Última Posição Conhecida" instantaneamente, sem onerar o banco de dados principal.<br/>
 **3. Broadcast:** O servidor gerencia "Salas" (Rooms) por Pedido (orderId), garantindo que apenas os interessados recebam as atualizações de um entregador específico.<br/>
 **4. Persistência (DynamoDB):** Os dados são persistidos para histórico de rotas e auditoria futura.

## 🧠 Decisões de Engenharia (A Visão Sênior)
 - Por que WebSockets? Diferente do HTTP Polling, o WebSocket mantém uma conexão persistente, reduzindo o overhead de headers e garantindo latência inferior a 200ms.<br/>
 - Por que Redis? Em um cenário de 100k+ entregadores, ler e escrever no banco de dados a cada 3 segundos é inviável financeiramente e tecnicamente. O Redis atua como uma memória volátil ultra-rápida.<br/>
 - Programação Defensiva: O sistema foi construído com blocos de try/catch ao redor das operações de banco de dados para garantir que, caso o Cache ou o DB falhem, o tempo real (Broadcast) continue funcionando.

## 🛠️ Como Executar
 - Clonar o repositório: `git clone https://github.com/seu-usuario/real-time-tracker`<br/>
 - Subir a infraestrutura (Docker): `docker-compose up -d`<br/>
 - Instalar dependências: `npm instal`<br/>
 - Rodar o Servidor: `npx ts-node-dev src/server.t`<br/>
 - Rodar o Simulador de Entregador: `npx ts-node-dev simulator.ts`<br/>
 - Abrir o Mapa: Abra o arquivo index.html no seu navegador.

## 👨‍💻 Autor
[Rhulyanderson Sander](https://www.linkedin.com/in/rhulys/)
