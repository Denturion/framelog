import { IMovie } from '@/app/interfaces/IMovieInterface';

type MovieCardProps = {
	movie: IMovie;
	onRemoveRequest?: (_id: string) => void;
	onSelect: (movie: IMovie) => void;
	variant?: 'grid' | 'list' | 'dashboard';
};

export default function MovieCard({
	movie,
	onRemoveRequest,
	onSelect,
	variant = 'grid',
}: MovieCardProps) {
	const { _id, title, year, poster_url, rating, note, date_added } = movie;

	// List variant: horizontal row with poster, metadata and an inline remove button
	if (variant === 'list') {
		return (
			<div
				onClick={() => onSelect(movie)}
				className='group bg-(--bg-primary) hover:bg-(--bg-surface) rounded-lg overflow-hidden cursor-pointer relative flex flex-row items-start gap-4 p-3'
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
							onRemoveRequest(movie._id);
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

	// Dashboard: compact horizontal card
	if (variant === 'dashboard') {
		return (
			<div
				onClick={() => onSelect(movie)}
				className='
				group
				relative
				bg-(--bg-primary)
				rounded-lg
				p-3
				flex
				items-center
				gap-3
				cursor-pointer
				hover:bg-(--bg-surface)
				transition
				
			'
			>
				{/* Medium poster */}
				<div className='w-30  aspect-2/3 shrink-0 overflow-hidden rounded'>
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
							onRemoveRequest(movie._id);
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
				<div className='flex-1 min-w-0'>
					<p className='text-sm font-medium text-(--text-primary) truncate'>
						{title}
					</p>
					<p className='text-xs text-(--text-muted)'>{year}</p>

					{rating ? (
						<p className='text-xs text-(--accent-primary) mt-0.5'>
							★ {rating}/10
						</p>
					) : (
						<p className='text-xs text-(--text-muted) mt-0.5'>Not yet rated</p>
					)}
				</div>
			</div>
		);
	}

	// grid (default)
	return (
		<div
			onClick={() => onSelect(movie)}
			className='
    group
    bg-(--bg-deep)
	hover:bg-(--bg-surface)
    rounded-lg
    overflow-hidden
    relative
	cursor-pointer
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
						onRemoveRequest(movie._id);
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
