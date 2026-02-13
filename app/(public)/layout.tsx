import AuthGate from '../components/AuthGate';

export default function PublicLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<AuthGate redirectTo='/dashboard' blockWhenAuthenticated>
			<div className='flex flex-col min-h-screen'>
				<main className='flex-1'>{children}</main>
			</div>
		</AuthGate>
	);
}
