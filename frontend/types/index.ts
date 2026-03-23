export interface LocationUpdate {
	riderId: string;
	orderId: string;
	latitude: number;
	longitude: number;
	timestamp: number;
	status: RiderStatus;
	completed: string;
}

export type RiderStatus =
	| 'online'
	| 'offline'
	| 'busy'
	| 'delivering'
	| 'paused';
