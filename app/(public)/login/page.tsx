import Footer from '@/app/components/Footer';
import LoginForm from '../../components/auth/LoginForm';

export default function LoginPage() {
	return (
		<div className='min-h-screen flex flex-col bg-(--bg-primary) text-(--text-primary)'>
			{/* CENTER CONTENT */}
			<div className='flex-1 flex items-center justify-center'>
				<div className='w-full max-w-md rounded-xl bg-(--bg-deep) p-8 shadow-lg'>
					<LoginForm />
				</div>
			</div>
			<Footer />
		</div>
	);
}
