'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '../isAuthenticated';

export default function AuthGate({
	children,
	redirectTo,
	blockWhenAuthenticated = false,
}: {
	children: React.ReactNode;
	redirectTo: string;
	blockWhenAuthenticated?: boolean;
}) {
	const router = useRouter();
	const [ready, setReady] = useState(false);

	useEffect(() => {
		isAuthenticated().then((ok) => {
			if (blockWhenAuthenticated && ok) {
				router.replace(redirectTo);
			} else if (!blockWhenAuthenticated && !ok) {
				router.replace(redirectTo);
			} else {
				setReady(true);
			}
		});
	}, []);

	if (!ready) {
		return <div className='min-h-screen bg-(--bg-primary)' />;
	}

	return <>{children}</>;
}
