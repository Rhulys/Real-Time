import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { LocationUpdate } from './types';
import {
	saveLastLocation,
	getLastLocation,
	completedDelivery,
	saveRiderStatus,
	saveLastSeen,
} from './redis';
import { CreateTableCommand } from '@aws-sdk/client-dynamodb';
import { saveLocationHistory, client } from './repository';

const app = express();
const httpServer = createServer(app);

const updateCounters: Record<string, number> = {};

const io = new Server(httpServer, {
	cors: {
		origin: '*',
	},
});

io.on('connection', (socket) => {
	console.log(`Nova conexão: ${socket.id}`);

	socket.on('joinOrder', async (orderId: string) => {
		socket.join(orderId);

		const lastPos = await getLastLocation(orderId);
		if (lastPos) {
			socket.emit('locationUpdated', lastPos);
			console.log(
				`Enviado cache para novo cliente no pedido: ${orderId}`
			);
		}
	});

	socket.on('updateLocation', async (data: LocationUpdate) => {
		if (!data.orderId || !data.riderId) {
			console.log('Dados incompletos');
			return;
		} else {
			try {
				await saveLastLocation(data);

				updateCounters[data.riderId] ??= 0;
				updateCounters[data.riderId]++;
				if (updateCounters[data.riderId] >= 5) {
					await saveLocationHistory(data);
					updateCounters[data.riderId] = 0;
				}

				if (data.latitude > -23.26) {
					console.log('ALERTA: Entregador se distanciando da loja!');
				}
			} catch (error) {
				console.error('Erro ao salvar no Redis (Cache):', error);
			}

			io.to(data.orderId).emit('locationUpdated', data);
		}
	});

	socket.on('disconnect', async () => {
		try {
			await saveLastSeen('entregador-Rhulys');
			console.log(`Conexão encerrada: ${socket.id}`);
		} catch (error) {
			console.log(error);
		}
	});

	socket.on('confirmDelivery', async (data: LocationUpdate) => {
		try {
			await completedDelivery(data);
		} catch (err) {
			console.error('Erro');
		}

		io.to(data.orderId).emit(
			'DeliveryFinished',
			'O cliente confirmou que o pedido chegou!'
		);
	});

	socket.on('changeStatus', async (status: string) => {
		await saveRiderStatus('entregador-Rhulys', status);
	});

	socket.on('ping', async () => {
		try {
			await saveLastSeen('entregador-Rhulys');
		} catch (error) {
			console.log(error);
		}
	});

	socket.on('requestLocation', async (orderId: string) => {
		try {
			const posicao = await getLastLocation(orderId);
			socket.emit('locationResponse', posicao);
		} catch (error) {
			console.log(error);
		}
	});
});

const PORT = 3000;
httpServer.listen(PORT, () => {
	console.log(`Server de Telemetria rodando em http://localhost:${PORT}`);
});

async function setupDatabase() {
	try {
		await client.send(
			new CreateTableCommand({
				TableName: 'RiderHistory',
				KeySchema: [
					{ AttributeName: 'pk', KeyType: 'HASH' },
					{ AttributeName: 'sk', KeyType: 'RANGE' },
				],
				AttributeDefinitions: [
					{ AttributeName: 'pk', AttributeType: 'S' },
					{ AttributeName: 'sk', AttributeType: 'S' },
				],

				ProvisionedThroughput: {
					ReadCapacityUnits: 5,
					WriteCapacityUnits: 5,
				},
			})
		);
		console.log('Tabela RiderHistory criada com sucesso.');
	} catch (err) {}
}
setupDatabase();
