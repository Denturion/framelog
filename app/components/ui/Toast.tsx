'use client';

import { useEffect } from 'react';

type Props = { message: string };

export default function Toast({ message }: Props) {
	useEffect(() => {
		// Could add enter/exit animations here
	}, [message]);

	return (
		<div className='fixed right-4 top-4 z-50'>
			<div className='bg-(--bg-surface) text-(--text-primary) border border-gray-700 px-4 py-2 rounded shadow'>
				{message}
			</div>
		</div>
	);
}
