import { LocationUpdate } from '../types';

interface LocationHistoryProps {
	history: LocationUpdate[];
	onClearHistory: () => void;
}

export default function LocationHistory({
	history,
	onClearHistory,
}: LocationHistoryProps) {
	return (
		<div
			style={{
				background: '#1e1e2e',
				borderRadius: '12px',
				padding: '20px',
				display: 'flex',
				flexDirection: 'column',
				gap: '10px',
			}}
		>
			<div
				style={{
					display: 'flex',
					flexDirection: 'row',
					justifyContent: 'space-between',
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
					Últimas Posições
				</h2>
				<button
					onClick={onClearHistory}
					style={{
						padding: '5px 12px',
						borderRadius: '8px',
						border: 'none',
						cursor: 'pointer',
						background: '#fff',
						color: '#1e1e2e',
						fontWeight: 'bold',
						fontSize: '14px',
						transition: 'all 0.2d',
					}}
				>
					Limpar
				</button>
			</div>

			{history.length === 0 && (
				<p
					style={{
						color: '#6c7086',
						fontSize: '13px',
						textAlign: 'center',
						padding: '20px 0',
					}}
				>
					Aguardando dados do entregador...
				</p>
			)}

			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					gap: '6px',
					maxHeight: '140px',
					overflow: 'auto',
				}}
			>
				{history.map((item, index) => (
					<div
						key={index}
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							padding: '8px 10px',
							background: index === 0 ? '#313244' : 'transparent',
							borderRadius: '6px',
							borderLeft:
								index === 0
									? '3px solid #89b4fa'
									: '3px solid transparend',
						}}
					>
						<span style={{ color: '#6c7086', fontSize: '12px' }}>
							{new Date(item.timestamp).toLocaleString('pt-BR')}
						</span>
						<span
							style={{
								color: '#cdd6f4',
								fontSize: '12px',
								fontFamily: 'monospace',
							}}
						>
							{item.latitude.toFixed(5)},{' '}
							{item.longitude.toFixed(5)}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
