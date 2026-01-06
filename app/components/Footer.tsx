export default function Footer() {
	return (
		<footer className='mt-auto border-t border-(--bg-deep) bg-(--bg-primary)'>
			<div className='max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-(--text-muted)'>
				<span>© {new Date().getFullYear()} FrameLog</span>

				<div className='flex items-center gap-4'>
					<a href='/' className='hover:text-(--text-primary)'>
						Home
					</a>
					<a
						href='https://github.com/denturion'
						target='_blank'
						rel='noopener noreferrer'
						className='hover:text-(--text-primary)'
					>
						GitHub
					</a>
				</div>
			</div>
		</footer>
	);
}
