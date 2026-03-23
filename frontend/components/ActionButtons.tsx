interface ActionButtonsProps {
	onConfirmDelivery: () => void;
	onChangeStatus: (status: string) => void;
	currentStatus: string;
}

const statuses = ['online', 'busy', 'delivering', 'offline', 'paused'];

export default function ActionButtons({
	onConfirmDelivery,
	onChangeStatus,
	currentStatus,
}: ActionButtonsProps) {
	return (
		<div
			style={{
				background: '#1e1e2e',
				borderRadius: '12px',
				padding: '20px',
				display: 'flex',
				flexDirection: 'column',
				gap: '12px',
			}}
		>
			<h2
				style={{
					color: '#cdd6f4',
					margin: 0,
					fontSize: '14px',
					textTransform: 'uppercase',
					letterSpacing: 'px',
				}}
			>
				Ações
			</h2>

			<div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
				{statuses.map((s) => (
					<button
						key={s}
						onClick={() => onChangeStatus(s)}
						style={{
							padding: '8px 14px',
							borderRadius: '8px',
							border: 'none',
							cursor: 'pointer',
							fontSize: '13px',
							fontWeight: '600',
							background:
								currentStatus === s ? '#89b4fa' : '#313244',
							color: currentStatus === s ? '#1e1e2e' : '#cdd6f4',
							transition: 'all 0.2s',
						}}
					>
						{s.charAt(0).toUpperCase() + s.slice(1)}
					</button>
				))}
			</div>

			<button
				onClick={onConfirmDelivery}
				style={{
					padding: '12px',
					borderRadius: '8px',
					border: 'none',
					cursor: 'pointer',
					background: '#a6e3a1',
					color: '#1e1e2e',
					fontWeight: 'bold',
					fontSize: '14px',
					transition: 'all 0.2d',
				}}
			>
				✅ Confirmar Entrega
			</button>
		</div>
	);
}
