'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { LocationUpdate } from '../types';

const ORDER_ID = 'pedido-123';
const RIDER_ID = 'entregador-Rhulys';
const toRad = (graus: number) => graus * (Math.PI / 180);

function haversine(
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number
): number {
	const R = 6371000;

	const dLat = toRad(lat2 - lat1);
	const dLon = toRad(lon2 - lon1);

	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(toRad(lat1)) *
			Math.cos(toRad(lat2)) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	return R * c;
}

export function useSocket() {
	const [socket, setSocket] = useState<Socket | null>(null);
	const [location, setLocation] = useState<LocationUpdate | null>(null);
	const [history, setHistory] = useState<LocationUpdate[]>([]);
	const [status, setStatus] = useState<string>('offline');
	const [lastSeen, setLastSeen] = useState<string>('--');
	const [connected, setConnected] = useState(false);
	const [updateCount, setUpdateCount] = useState(0);
	const [distance, setDistance] = useState(0);
	const locationRef = useRef<LocationUpdate | null>(null);
	const [speed, setSpeed] = useState(0);
	const [loading, setLoading] = useState(true);
	const [deliveredAt, setDeliveredAt] = useState(null);

	useEffect(() => {
		const newSocket = io('http://localhost:3000');

		newSocket.on('connect', () => {
			setConnected(true);
			newSocket.emit('joinOrder', ORDER_ID);
		});

		newSocket.on('disconnect', () => {
			setConnected(false);
			setStatus('offline');
		});

		newSocket.on('locationUpdated', (data: LocationUpdate) => {
			if (locationRef.current) {
				const dist = haversine(
					locationRef.current.latitude,
					locationRef.current.longitude,
					data.latitude,
					data.longitude
				);
				setDistance((prev) => prev + dist);
				const timeDiff =
					(data.timestamp - locationRef.current.timestamp) / 1000;
				const speedKmh = (dist / timeDiff) * 3.6;
				setSpeed(speedKmh);
			}
			setLoading(false);
			setLocation(data);
			locationRef.current = data;
			setStatus(data.status || 'online');
			setLastSeen(new Date().toLocaleTimeString('pt-BR'));
			setHistory((prev) => [data, ...prev].slice(0, 20));
			setUpdateCount((prev) => prev + 1);
		});

		newSocket.on('DeliveryFinished', () => {
			setStatus('delivered');
			setDeliveredAt(new Date().toLocaleTimeString('pt-BR'));
		});

		setSocket(newSocket);

		return () => {
			newSocket.disconnect();
		};
	}, []);

	const confirmDelivery = () => {
		if (!socket || !location) return;
		socket.emit('confirmDelivery', {
			...location,
			orderId: ORDER_ID,
			riderId: RIDER_ID,
		});
	};

	const changeStatus = (newStatus: string) => {
		if (!socket) return;
		socket.emit('changeStatus', newStatus);
		setStatus(newStatus);
	};

	const clearHistory = () => {
		setHistory([]);
		setUpdateCount(0);
	};

	return {
		location,
		history,
		status,
		lastSeen,
		connected,
		confirmDelivery,
		changeStatus,
		updateCount,
		distance,
		speed,
		loading,
		clearHistory,
		deliveredAt,
	};
}
