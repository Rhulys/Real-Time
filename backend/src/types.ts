export interface LocationUpdate {
	riderId: string;
	orderId: string;
	latitude: number;
	longitude: number;
	timestamp: number;
	status: RiderStatus;
	completed: string;
}

export type RiderStatus = 'online' | 'offline' | 'busy' | 'delivering';

export interface OrderStatus {
	orderId: string;
	status: 'pending' | 'in_progress' | 'delivered' | 'cancelled';
	updatedAt: number;
}
