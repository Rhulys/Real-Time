import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { LocationUpdate } from './types'
import { saveLastLocation, getLastLocation} from './redis'
import { CreateTableCommand } from '@aws-sdk/client-dynamodb';
import { saveLocationHistory, client } from './repository';

const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
    cors: {
        origin: "*"
    }
})

io.on("connection", (socket) => {
    console.log(`Nova conexão: ${socket.id}`);

    socket.on("joinOrder", async (orderId: string) => {
        socket.join(orderId);

        const lastPos = await getLastLocation(orderId);
        if (lastPos) {
            socket.emit("locationUpdate", lastPos);
            console.log(`Enviado cache para novo cliente no pedido: ${orderId}`)
        }
    })

    socket.on("updateLocation", async (data: LocationUpdate) => {
        try {
            await saveLastLocation(data)
        } catch (error) {
            console.error("Erro ao salvar no Redis (Cache):", error);
        }
        
        io.to(data.orderId).emit("locationUpdated", data);
    })

    socket.on("disconnect", () => {
        console.log(`Conexão encerrada: ${socket.id}`);
    })
})

const PORT = 3000;
httpServer.listen(PORT, () => {
    console.log(`Server de Telemetria rodando em http://localhost:${PORT}`);
})

async function setupDatabase() {
    try {
        await client.send(new CreateTableCommand({
            TableName: "RiderHistory",
            KeySchema: [
                {AttributeName: "pk", KeyType: "HASH"},
                {AttributeName: "sk", KeyType: "RANGE"},
            ],
            AttributeDefinitions: [
                {AttributeName: "pk", AttributeType: "S"},
                {AttributeName: "sk", AttributeType: "N"},
            ],
            ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5}
        }));
        console.log("Tabela RiderHistory crada com sucesso.")
    } catch (err) {

    }
}
setupDatabase()