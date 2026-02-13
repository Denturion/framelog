type RegisterModalProps = {
	message: string;
	countdown: number;
};

export default function RegisterModal({
	message,
	countdown,
}: RegisterModalProps) {
	return (
		<div className='fixed inset-0 bg-black/70 flex items-center justify-center'>
			<div className='bg-(--bg-primary) p-6 rounded-xl text-center'>
				<h2 className='text-xl font-bold mb-2'>{message}</h2>
				<p className='text-(--text-muted)'>Redirecting in {countdown}...</p>
			</div>
		</div>
	);
}
