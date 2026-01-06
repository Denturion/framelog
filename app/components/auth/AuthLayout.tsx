export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<section className='min-h-screen flex items-center justify-center bg-(--bg-primary)'>
			<div className='w-full max-w-md rounded-xl bg-(--bg-deep) p-8 shadow-lg'>
				{children}
			</div>
		</section>
	);
}
