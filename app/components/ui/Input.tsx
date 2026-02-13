type InputProps = {
	type: string;
	placeholder: string;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function Input({
	type,
	placeholder,
	value,
	onChange,
}: InputProps) {
	return (
		<input
			type={type}
			placeholder={placeholder}
			value={value}
			onChange={onChange}
			className='w-full border border-gray-700 placeholder-(--text-muted) text-(--text-primary) focus:border-(--accent-primary) focus:outline-none rounded-xl p-3 transition-all duration-200'
		/>
	);
}
