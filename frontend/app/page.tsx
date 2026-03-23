'use client';

import dynamic from 'next/dynamic';
import { useSocket } from '../hooks/useSocket';
import StatusPanel from '../components/StatusPanel';
import ActionButtons from '../components/ActionButtons';
import LocationHistory from '../components/LocationHistory';
import ConnectionBadge from '../components/ConnectionBadge';

const Map = dynamic(() => import('../components/Map'), { ssr: false });

export default function Home() {
	const {
		location,
		history,
		status,
		distance,
		lastSeen,
		connected,
		updateCount,
		speed,
		confirmDelivery,
		changeStatus,
		loading,
		clearHistory,
		deliveredAt,
	} = useSocket();

	return (
		<main
			style={{
				minHeight: '100vh',
				background: '#11111b',
				padding: '10px 24px',
				fontFamily: 'Inter, system-ui, sans-serif',
			}}
		>
			<div style={{ marginBottom: '24px' }}>
				<h1
					style={{
						color: '#cddd6f4',
						margin: 0,
						fontSize: '24px',
						fontWeight: '700',
					}}
				>
					🛵 Rider Tracking
				</h1>
				<ConnectionBadge connected={connected} />
			</div>
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: '1fr 340px',
					gap: '20px',
					height: 'calc(100vh - 120px)',
				}}
			>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						gap: '20px',
					}}
				>
					<div
						style={{
							flex: 1,
							minHeight: '400px',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						{loading ? (
							<p>Aguardando posição do entregador...</p>
						) : (
							<Map location={location} />
						)}
					</div>
					<LocationHistory
						history={history}
						onClearHistory={clearHistory}
					/>
				</div>

				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						gap: '20px',
					}}
				>
					<StatusPanel
						status={status}
						lastSeen={lastSeen}
						connected={connected}
						location={location}
						distance={distance}
						updateCount={updateCount}
						speed={speed}
						deliveredAt={deliveredAt}
					/>
					<ActionButtons
						onConfirmDelivery={confirmDelivery}
						onChangeStatus={changeStatus}
						currentStatus={status}
					/>
				</div>
			</div>
		</main>
	);
}
