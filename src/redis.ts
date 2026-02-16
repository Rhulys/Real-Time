import Redis from "ioredis";
import { LocationUpdate } from './types'

const redis = new Redis({
    host: 'localhost',
    port: 6379
});

export const saveLastLocation = async (data: LocationUpdate) => {
    const key = `rider:pos:${data.orderId}`;
    await redis.set(key, JSON.stringify(data), 'EX', 3600)
};

export const getLastLocation = async (orderId: string): Promise<LocationUpdate | null> => {
    const key = `rider:pos:${orderId}`;
    const data = await redis.get(key);

    return data ? JSON.parse(data) : null
}

export default redis;