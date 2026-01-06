type ConfirmModalProps = {
	open: boolean;
	title?: string;
	message: string;
	onConfirm: () => void;
	onCancel: () => void;
};

export function ConfirmModal({
	open,
	title = 'Confirm',
	message,
	onConfirm,
	onCancel,
}: ConfirmModalProps) {
	if (!open) return null;

	return (
		<div className='fixed inset-0 z-200 flex items-center justify-center bg-black/60'>
			<div className='bg-(--bg-surface) rounded-xl p-6 w-[320px]'>
				<h3 className='text-lg font-semibold text-(--text-primary)'>{title}</h3>

				<p className='text-(--text-secondary) mt-2'>{message}</p>

				<div className='flex justify-end gap-3 mt-6'>
					<button
						onClick={onCancel}
						className='text-(--text-muted) hover:text-(--text-primary)'
					>
						Cancel
					</button>

					<button
						onClick={onConfirm}
						className='
              bg-red-500/20
              text-red-400
              px-4 py-1.5
              rounded-lg
              hover:bg-red-500/30
              transition
            '
					>
						Remove
					</button>
				</div>
			</div>
		</div>
	);
}
