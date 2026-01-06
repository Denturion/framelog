import { IMovie } from '@/app/interfaces/IMovieInterface';

type MovieCardProps = {
	movie: IMovie;
	onRemoveRequest?: (movieId: string) => void;
	onSelect: (movie: IMovie) => void;
	variant?: 'grid' | 'list';
};

export default function MovieCard({
	movie,
	onRemoveRequest,
	onSelect,
	variant = 'grid',
}: MovieCardProps) {
	const { movie_id, title, year, poster_url, rating, note, date_added } = movie;

	// List variant: horizontal row with poster, metadata and an inline remove button
	if (variant === 'list') {
		return (
			<div
				onClick={() => onSelect(movie)}
				className='group bg-(--bg-surface) rounded-lg overflow-hidden relative flex flex-row items-start gap-4 p-3'
			>
				{/* Poster (left) */}
				<div className='w-20 h-28 shrink-0 overflow-hidden rounded-md'>
					<img
						src={poster_url}
						alt={title}
						className='w-full h-full object-cover'
					/>
				</div>

				{/* Details (center) */}
				<div className='flex-1 min-w-0'>
					<p className='text-sm font-medium text-(--text-primary) leading-tight line-clamp-2'>
						{title}
					</p>
					<p className='text-xs text-(--text-muted)'>
						{year}{' '}
						{date_added ? `• ${new Date(date_added).toLocaleDateString()}` : ''}
					</p>
					{rating ? (
						<p className='text-xs text-(--accent-primary) mt-1'>
							★ {rating}/10
						</p>
					) : (
						<p className='text-xs text-(--text-muted) mt-1'>Not yet rated</p>
					)}
					{note ? (
						<p className='text-sm text-(--text-primary) mt-2 line-clamp-3'>
							{note}
						</p>
					) : null}
				</div>

				{/* Remove: stopPropagation to avoid triggering the card onClick (which opens details) */}
				{onRemoveRequest && (
					<button
						onClick={(e) => {
							e.stopPropagation();
							onRemoveRequest(movie_id);
						}}
						className='w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white text-sm hover:bg-red-500 transition'
						aria-label='Remove movie'
					>
						✕
					</button>
				)}
			</div>
		);
	}

	// grid (default)
	return (
		<div
			onClick={() => onSelect(movie)}
			className='
    group
    bg-(--bg-surface)
    rounded-lg
    overflow-hidden
    relative
    flex flex-col
  '
		>
			{/* Poster */}
			<div className='w-full aspect-2/3 overflow-hidden'>
				<img
					src={poster_url}
					alt={title}
					className='w-full h-full object-cover'
				/>
			</div>

			{/* Delete */}
			{onRemoveRequest && (
				<button
					onClick={(e) => {
						e.stopPropagation();
						onRemoveRequest(movie_id);
					}}
					className='
          absolute top-2 right-2
          w-7 h-7
          flex items-center justify-center
          rounded-full
          bg-black/40
          text-white
          text-sm
          hover:bg-red-500
          transition
          opacity-0
          group-hover:opacity-100
        '
					aria-label='Remove movie'
				>
					✕
				</button>
			)}

			{/* Text */}
			<div className='flex-1 p-3 min-w-0'>
				<p className='text-sm font-medium text-(--text-primary) leading-tight line-clamp-2 min-h-[2.5em]'>
					{title}
				</p>
				<p className='text-xs text-(--text-muted)'>{year}</p>

				{rating ? (
					<p className='text-xs text-(--accent-primary) mt-1'>★ {rating}/10</p>
				) : (
					<p className='text-xs text-(--text-muted) mt-1'>Not yet rated</p>
				)}
			</div>
		</div>
	);
}
