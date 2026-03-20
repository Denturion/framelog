'use client';

import { useRouter } from 'next/navigation';
import { FollowUser } from '@/app/services/users';

type FollowListModalProps = {
	title: string;
	users: FollowUser[];
	onClose: () => void;
};

export function FollowListModal({ title, users, onClose }: FollowListModalProps) {
	const router = useRouter();

	return (
		<div
			className='fixed inset-0 z-200 bg-black/60 flex items-center justify-center p-4'
			onClick={onClose}
		>
			<div
				className='bg-(--bg-surface) rounded-xl w-full max-w-sm max-h-[70vh] flex flex-col'
				onClick={(e) => e.stopPropagation()}
			>
				<div className='flex items-center justify-between p-4 border-b border-gray-800'>
					<h3 className='text-lg font-semibold text-(--text-primary)'>
						{title}
					</h3>
					<button
						onClick={onClose}
						className='text-(--text-muted) hover:text-(--text-primary)'
						aria-label='Close'
					>
						✕
					</button>
				</div>

				<div className='flex-1 overflow-y-auto no-scrollbar'>
					{users.length === 0 ? (
						<p className='p-4 text-sm text-(--text-muted) text-center'>
							No users yet
						</p>
					) : (
						<ul>
							{users.map((user) => (
								<li key={user._id}>
									<button
										onClick={() => {
											onClose();
											router.push(`/users/${encodeURIComponent(user.username)}`);
										}}
										className='w-full flex items-center gap-3 p-3 hover:bg-(--bg-deep) transition text-left'
									>
										<div className='w-9 h-9 rounded-full bg-(--accent-primary) text-white flex items-center justify-center font-semibold text-sm shrink-0'>
											{user.username.charAt(0).toUpperCase()}
										</div>
										<span className='text-(--text-primary) text-sm font-medium'>
											{user.username}
										</span>
									</button>
								</li>
							))}
						</ul>
					)}
				</div>
			</div>
		</div>
	);
}
