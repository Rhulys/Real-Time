interface Connected {
	connected: boolean;
}

export default function ConnectionBadge({ connected }: Connected) {
	return (
		<>
			<span>Rastreamento em Tempo Real: </span>
			{connected ? (
				<span style={{ backgroundColor: 'green', padding: '2px 8px' }}>
					Conectado
				</span>
			) : (
				<span style={{ backgroundColor: 'red', padding: '2px 8px' }}>
					Desconectado
				</span>
			)}
		</>
	);
}
