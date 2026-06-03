import { fr } from '@codegouvfr/react-dsfr';
import { useEffect, useState } from 'react';

type BreakpointKey = keyof ReturnType<typeof fr.breakpoints.getPxValues>;

export const useIsMobile = (breakpoint: BreakpointKey = 'md') => {
	const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

	useEffect(() => {
		const px = fr.breakpoints.getPxValues()[breakpoint];
		const mql = window.matchMedia(`(max-width: ${px}px)`);

		const onChange = () => setIsMobile(mql.matches);
		onChange();

		mql.addEventListener('change', onChange);
		return () => mql.removeEventListener('change', onChange);
	}, [breakpoint]);

	return {
		isMobile,
		isHydrated: isMobile !== undefined
	};
};
