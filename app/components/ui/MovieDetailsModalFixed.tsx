import { IMovie } from '@/app/interfaces/IMovieInterface';
import { useState } from 'react';

type MovieDetailsModalProps = {
	movie: IMovie;
	onClose: () => void;
	onSave?: (updated: Partial<IMovie>) => void; // optional for read-only views
};

export function MovieDetailsModal({
	movie,
	onClose,
	onSave,
}: MovieDetailsModalProps) {
	const [rating, setRating] = useState<number | ''>(movie.rating ?? '');
	const [note, setNote] = useState(movie.note ?? '');

	function handleSave() {
		if (!onSave) return;
		onSave({
			movie_id: movie.movie_id,
			rating: rating === '' ? undefined : rating,
			note,
		});
	}

	return (
		<div className='fixed inset-0 z-200 bg-black/60 flex items-center justify-center'>
			<div className='bg-(--bg-surface) rounded-xl w-[420px] p-6'>
				{/* Header */}
				<div className='flex justify-between items-start mb-4'>
					<h3 className='text-xl font-semibold text-(--text-primary)'>
						{movie.title}
						<span className='text-(--text-muted) text-sm ml-2'>
							({movie.year})
						</span>
					</h3>

					<button
						onClick={onClose}
						className='text-(--text-muted) hover:text-(--text-primary)'
						aria-label='Close'
					>
						✕
					</button>
				</div>

				{/* Content */}
				<div className='space-y-4'>
					{/* Rating */}
					<div>
						<label className='block text-sm text-(--text-muted) mb-1'>
							Rating (1–10)
						</label>
						<input
							type='number'
							min={1}
							max={10}
							value={rating}
							onChange={(e) =>
								setRating(e.target.value === '' ? '' : Number(e.target.value))
							}
							disabled={!onSave}
							className='w-full bg-(--bg-deep) text-(--text-primary) rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-(--accent-primary)'
						/>
					</div>

					{/* Note */}
					<div>
						<label className='block text-sm text-(--text-muted) mb-1'>
							Note
						</label>
						<textarea
							rows={4}
							value={note}
							onChange={(e) => setNote(e.target.value)}
							placeholder='What did you think?'
							disabled={!onSave}
							className='w-full bg-(--bg-deep) text-(--text-primary) rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-(--accent-primary)'
						/>
					</div>
				</div>

				{/* Actions */}
				<div className='flex justify-end gap-3 mt-6'>
					<button
						onClick={onClose}
						className='text-(--text-muted) hover:text-(--text-primary)'
					>
						{onSave ? 'Cancel' : 'Close'}
					</button>

					{onSave && (
						<button
							onClick={handleSave}
							className='bg-(--accent-primary) text-black px-4 py-1.5 rounded-lg hover:opacity-90 transition'
						>
							Save
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
