interface StatusPanelProps {
	status: string;
	lastSeen: string;
	connected: boolean;
	location: { latitude: number; longitude: number; timestamp: number } | null;
	updateCount: number;
	distance: number;
	speed: number;
	deliveredAt: number;
}

const statusConfig: Record<string, { label: string; color: string }> = {
	online: { label: 'Online', color: '#22c55e' },
	offline: { label: 'Offline', color: '#ef4444' },
	busy: { label: 'Ocupado', color: '#f97316' },
	delivering: { label: 'Entregando', color: '#3b82f6' },
	delivered: { label: 'Entregue', color: '#a855f7' },
	paused: { label: 'Pausado', color: '#eab308' },
};

export default function StatusPanel({
	status,
	lastSeen,
	connected,
	location,
	updateCount,
	distance,
	speed,
	deliveredAt,
}: StatusPanelProps) {
	const config = statusConfig[status] || statusConfig.offline;

	return (
		<div
			style={{
				background: '#1e1e2e',
				borderRadius: '12px',
				padding: '20px',
				display: 'flex',
				flexDirection: 'column',
				gap: '16px',
			}}
		>
			<h2
				style={{
					color: '#cdd6f4',
					margin: 0,
					fontSize: '14px',
					textTransform: 'uppercase',
					letterSpacing: '1px',
				}}
			>
				Status do Entregador
			</h2>

			<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
				<div
					style={{
						width: '12px',
						height: '12px',
						borderRadius: '50%',
						background: config.color,
						boxShadow: `0 0 8px ${config.color}`,
					}}
				/>
				<span
					style={{
						color: config.color,
						fontWeight: 'bold',
						fontSize: '18px',
					}}
				>
					{config.label}
				</span>
			</div>

			<div
				style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
			>
				<InfoRow
					label="Servidor"
					value={connected ? '🟢 Conectado' : '🔴 Desconectado'}
				/>
				<InfoRow label="Pedido" value="pedido-123" />
				<InfoRow label="Entregador" value="Rhulys" />
				<InfoRow label="Último sinal" value={lastSeen} />
				<InfoRow label="Total de Atualizações" value={updateCount} />
				<InfoRow
					label="Velocidade"
					value={speed.toFixed(1) + ' KM/h'}
				/>
				<InfoRow label="Distancia" value={distance.toFixed(2) + ' M'} />
				{location && (
					<>
						<InfoRow
							label="Latitude"
							value={location.latitude.toFixed(5)}
						/>
						<InfoRow
							label="Longitude"
							value={location.longitude.toFixed(5)}
						/>
						<InfoRow
							label="Timestamp"
							value={new Date(
								location.timestamp
							).toLocaleTimeString('pt-BR')}
						/>
					</>
				)}
				{deliveredAt ? (
					<InfoRow label="Pedido entrega as:" value={deliveredAt} />
				) : (
					''
				)}
			</div>
		</div>
	);
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
	return (
		<div
			style={{
				display: 'flex',
				justifyContent: 'space-between',
				borderBottom: '1px solid #313244',
				paddingBottom: '6px',
			}}
		>
			<span style={{ color: '#6c7086', fontSize: '13px' }}>{label}</span>
			<span
				style={{
					color: '#cdd6f4',
					fontSize: '13px',
					fontWeight: '500',
				}}
			>
				{value}
			</span>
		</div>
	);
}
