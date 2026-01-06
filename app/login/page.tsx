import LoginForm from '../../app/components/auth/LoginForm';

export default function LoginPage() {
	return (
		<main className='min-h-screen flex items-center justify-center bg-(--bg-primary) text-(--text-primary)'>
			<div className='w-full max-w-md p-6'>
				<LoginForm />
			</div>
		</main>
	);
}
