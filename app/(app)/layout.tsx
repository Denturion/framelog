import AuthGate from '../components/AuthGate';

export default function AppLayout({ children }: { children: React.ReactNode }) {
	return <AuthGate redirectTo='/'>{children}</AuthGate>;
}
