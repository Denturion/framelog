'use client';

import { IMovie } from '../interfaces/IMovieInterface';
import MovieCard from './ui/MovieCard';

type Props = {
	movieList: IMovie[];
	onRemoveRequest?: (_id: string) => void;
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
					{[...movieList]
						.sort(
							(a, b) =>
								new Date(b.date_added ?? 0).getTime() -
								new Date(a.date_added ?? 0).getTime()
						)
						.map((m) => (
							<li key={`${m._id}-${m.date_added}`}>
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
