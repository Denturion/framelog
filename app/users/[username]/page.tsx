import Header from '@/app/components/Header';
import ProfileUser from '@/app/components/ProfileUser';

type Props = {
	params: Promise<{ username: string }>;
};

export default async function UserPage({ params }: Props) {
	const { username } = await params;

	return (
		<>
			<Header />
			<main className='w-full p-6'>
				<ProfileUser username={username} />
			</main>
		</>
	);
}
