import { useEffect, useRef, useState } from 'react';

interface UseProgressOptions {
	duration?: number;
}

/**
 * Returns a progress number (0..100) that animates from 0 to 100 over `duration` ms.
 */
export function useProgress({ duration = 2000 }: UseProgressOptions) {
	const [progress, setProgress] = useState(0);
	const rafRef = useRef<number | null>(null);

	useEffect(() => {
		const start = performance.now();

		const tick = (now: number) => {
			const t = Math.min(1, (now - start) / duration);
			setProgress(Math.round(t * 100));
			if (t < 1) rafRef.current = requestAnimationFrame(tick);
			else rafRef.current = null;
		};

		rafRef.current = requestAnimationFrame(tick);

		return () => {
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
		};
	}, [duration]);

	return progress;
}
