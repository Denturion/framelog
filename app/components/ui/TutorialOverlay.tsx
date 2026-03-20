'use client';

import { useEffect, useState, useCallback, RefObject } from 'react';

export interface TutorialStep {
	targetRef: RefObject<HTMLElement | null>;
	title: string;
	description: string;
	position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface TutorialOverlayProps {
	steps: TutorialStep[];
	storageKey?: string;
	onComplete: () => void;
}

export function TutorialOverlay({
	steps,
	storageKey = 'framelog-tutorial-done',
	onComplete,
}: TutorialOverlayProps) {
	const [currentStep, setCurrentStep] = useState(0);
	const [rect, setRect] = useState<DOMRect | null>(null);

	const step = steps[currentStep];

	const updateRect = useCallback(() => {
		if (!step?.targetRef.current) return;
		setRect(step.targetRef.current.getBoundingClientRect());
	}, [step]);

	useEffect(() => {
		updateRect();
		window.addEventListener('resize', updateRect);
		return () => window.removeEventListener('resize', updateRect);
	}, [updateRect]);

	const handleNext = () => {
		if (currentStep < steps.length - 1) {
			setCurrentStep((s) => s + 1);
		} else {
			handleFinish();
		}
	};

	const handleFinish = () => {
		localStorage.setItem(storageKey, 'true');
		onComplete();
	};

	if (!rect) return null;

	const padding = 8;
	const cutout = {
		top: rect.top - padding,
		left: rect.left - padding,
		width: rect.width + padding * 2,
		height: rect.height + padding * 2,
	};

	// Determine tooltip position
	const tooltip = getTooltipStyle(cutout, step.position);

	return (
		<div className='fixed inset-0 z-[300]'>
			{/* Dark overlay with cutout using clip-path */}
			<div
				className='absolute inset-0 bg-black/70 transition-all duration-300'
				style={{
					clipPath: `polygon(
						0% 0%, 100% 0%, 100% 100%, 0% 100%,
						0% ${cutout.top}px,
						${cutout.left}px ${cutout.top}px,
						${cutout.left}px ${cutout.top + cutout.height}px,
						${cutout.left + cutout.width}px ${cutout.top + cutout.height}px,
						${cutout.left + cutout.width}px ${cutout.top}px,
						0% ${cutout.top}px
					)`,
				}}
			/>

			{/* Highlight border */}
			<div
				className='absolute rounded-lg border-2 border-(--accent-primary) transition-all duration-300 pointer-events-none'
				style={{
					top: cutout.top,
					left: cutout.left,
					width: cutout.width,
					height: cutout.height,
				}}
			/>

			{/* Tooltip card */}
			<div
				className='absolute bg-(--bg-surface) rounded-xl p-5 shadow-2xl max-w-xs transition-all duration-300'
				style={tooltip}
			>
				<p className='text-xs text-(--accent-primary) font-semibold mb-1'>
					Step {currentStep + 1} of {steps.length}
				</p>
				<h3 className='text-base font-semibold text-(--text-primary) mb-2'>
					{step.title}
				</h3>
				<p className='text-sm text-(--text-muted) mb-4'>
					{step.description}
				</p>
				<div className='flex items-center justify-between'>
					<button
						onClick={handleFinish}
						className='text-xs text-(--text-muted) hover:text-(--text-primary) transition cursor-pointer'
					>
						Skip tutorial
					</button>
					<button
						onClick={handleNext}
						className='px-4 py-1.5 bg-(--accent-primary) text-black rounded-lg text-sm font-medium hover:opacity-90 transition cursor-pointer'
					>
						{currentStep < steps.length - 1 ? 'Next' : 'Get started'}
					</button>
				</div>
			</div>
		</div>
	);
}

function getTooltipStyle(
	cutout: { top: number; left: number; width: number; height: number },
	position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
): React.CSSProperties {
	const gap = 16;

	// Auto-detect best position if not specified
	if (!position) {
		const spaceBelow = window.innerHeight - (cutout.top + cutout.height);
		const spaceAbove = cutout.top;
		const spaceRight = window.innerWidth - (cutout.left + cutout.width);

		if (spaceBelow > 200) position = 'bottom';
		else if (spaceAbove > 200) position = 'top';
		else if (spaceRight > 340) position = 'right';
		else if (cutout.left > 340) position = 'left';
		else position = 'center';
	}

	switch (position) {
		case 'bottom':
			return {
				top: Math.min(cutout.top + cutout.height + gap, window.innerHeight - 200),
				left: Math.max(16, cutout.left + cutout.width / 2 - 150),
			};
		case 'top':
			return {
				bottom: window.innerHeight - cutout.top + gap,
				left: Math.max(16, cutout.left + cutout.width / 2 - 150),
			};
		case 'right':
			return {
				top: Math.max(16, Math.min(cutout.top + cutout.height / 2 - 60, window.innerHeight - 200)),
				left: cutout.left + cutout.width + gap,
			};
		case 'left':
			return {
				top: Math.max(16, Math.min(cutout.top + cutout.height / 2 - 60, window.innerHeight - 200)),
				right: window.innerWidth - cutout.left + gap,
			};
		case 'center':
			return {
				top: Math.max(16, cutout.top + cutout.height / 2 - 80),
				left: Math.max(16, cutout.left + cutout.width / 2 - 150),
			};
	}
}

export function useTutorial(storageKey = 'framelog-tutorial-done') {
	const [showTutorial, setShowTutorial] = useState(false);

	useEffect(() => {
		const done = localStorage.getItem(storageKey);
		if (!done) {
			// Small delay so refs are mounted and layout is settled
			const timer = setTimeout(() => setShowTutorial(true), 500);
			return () => clearTimeout(timer);
		}
	}, [storageKey]);

	return {
		showTutorial,
		dismissTutorial: () => setShowTutorial(false),
	};
}
