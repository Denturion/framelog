export interface IMovie {
	_id: string;
	movie_id: string;
	title: string;
	year: string;
	poster_url: string;
	rating: number | null;
	note: string;
	date_added: string;
}
