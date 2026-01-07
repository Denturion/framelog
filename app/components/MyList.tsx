'use client';

import { IMovie } from '../interfaces/IMovieInterface';
import MovieCard from './ui/MovieCard';

type Props = {
	movieList: IMovie[];
	onRemoveRequest?: (movie_id: string) => void;
	onSelect: (movie: IMovie) => void;
};

export default function MyList({
	movieList,
	onRemoveRequest,
	onSelect,
}: Props) {
	return (
		<div className='p-4 text-(--text-primary)'>
			{movieList.length === 0 ? (
				<p className='text-(--text-muted) text-sm '>Your list is empty.</p>
			) : (
				<ul className='space-y-3'>
					{movieList.map((m) => (
						<li key={m.movie_id}>
							<MovieCard
								movie={m}
								onRemoveRequest={onRemoveRequest}
								onSelect={onSelect}
								variant='dashboard'
							/>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
