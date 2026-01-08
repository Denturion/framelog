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
		isAuthenticated()
			.then((ok) => {
				if (blockWhenAuthenticated && ok) {
					router.replace(redirectTo);
				} else if (!blockWhenAuthenticated && !ok) {
					router.replace(redirectTo);
				} else {
					setReady(true);
				}
			})
			.catch(() => {
				// ❗ viktig: låt gate avslutas även vid fetch-fel
				if (!blockWhenAuthenticated) {
					router.replace(redirectTo);
				}
				setReady(true);
			});
	}, [router, redirectTo, blockWhenAuthenticated]);

	if (!ready) {
		return <div className='min-h-screen bg-(--bg-primary)' />;
	}

	return <>{children}</>;
}
