import Redis from 'ioredis';

import { LocationUpdate, RiderStatus, OrderStatus } from './types';

const redis = new Redis({
	host: 'localhost',
	port: 6379,
});

export const saveLastLocation = async (data: LocationUpdate) => {
	const key = `rider:pos:${data.orderId}`;
	await redis.set(key, JSON.stringify(data), 'EX', 1800);
};

export const saveRiderStatus = async (riderId: string, status: string) => {
	const key = `rider:pos:${riderId}`;
	await redis.set(key, status, 'EX', 7200);
};

export const completedDelivery = async (data: LocationUpdate) => {
	const completed = `rider:completed:${data.riderId}`;

	await redis.set(completed, JSON.stringify(data), 'EX', 7200);
};

export const saveLastSeen = async (riderId: string) => {
	const key = `rider:pos:${riderId}`;
	await redis.set(key, Date.now().toString(), 'EX', 3600);
};

export const saveOrderStatus = async (data: OrderStatus) => {
	const key = `order:status:${data.orderId}`;
	await redis.set(key, data.status, 'EX', 7200);
};

export const getLastLocation = async (
	orderId: string
): Promise<LocationUpdate | null> => {
	const key = `rider:pos:${orderId}`;

	const data = await redis.get(key);

	return data ? JSON.parse(data) : null;
};

export default redis;
