'use client';

import AuthLayout from '../AuthLayout';
import RegisterForm from '../../components/auth/RegisterForm';
import Footer from '@/app/components/Footer';

export default function RegisterPage() {
	return (
		<>
			<div className='min-h-screen flex flex-col bg-(--bg-primary) text-(--text-primary)'>
				{/* CENTER CONTENT */}
				<div className='flex-1 flex items-center justify-center'>
					<div className='w-full max-w-md '>
						<AuthLayout>
							<RegisterForm />
						</AuthLayout>
					</div>
				</div>
				<Footer />
			</div>
		</>
	);
}
