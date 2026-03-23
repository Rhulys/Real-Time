'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { LocationUpdate } from '../types';
import L, { icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

const riderIcon = new L.Icon({
	iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
	iconSize: [40, 40],
	iconAnchor: [20, 40],
	popupAnchor: [0, -40],
});

function MapUpdater({ location }: { location: LocationUpdate }) {
	const map = useMap();
	useEffect(() => {
		map.setView([location.latitude, location.longitude], map.getZoom());
	}, [location, map]);
	return null;
}

interface MapProps {
	location: LocationUpdate | null;
}

export default function Map({ location }: MapProps) {
	const defaultPosition: [number, number] = [-23.56168, -46.65598];

	return (
		<MapContainer
			center={defaultPosition}
			zoom={15}
			style={{ height: '100%', width: '100%', borderRadius: '12px' }}
		>
			<TileLayer
				attribution="&copy; OpenStreetMap"
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>
			{location && (
				<>
					<Marker
						position={[location.latitude, location.longitude]}
						icon={riderIcon}
					>
						<Popup>
							🛵 {location.riderId} <br />
							Pedido: {location.orderId}
						</Popup>
					</Marker>
					<MapUpdater location={location} />
				</>
			)}
		</MapContainer>
	);
}
