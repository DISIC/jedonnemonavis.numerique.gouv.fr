import React from 'react';
import { fr } from '@codegouvfr/react-dsfr';
import { Button } from '@codegouvfr/react-dsfr/Button';

interface NavigationButtonsProps {
	previousSection?: { id: string; label: string } | null;
	nextSection?: { id: string; label: string } | null;
	onSectionChange: (sectionId: string) => void;
}

const NavigationButtons = ({
	previousSection,
	nextSection,
	onSectionChange
}: NavigationButtonsProps) => {
	return (
		<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-mt-6w')}>
			<div className={fr.cx('fr-col-6')}>
				{previousSection && (
					<Button
						priority="secondary"
						iconId="fr-icon-arrow-left-line"
						iconPosition="left"
						onClick={() => onSectionChange(previousSection.id)}
					>
						{previousSection.label}
					</Button>
				)}
			</div>
			<div className={fr.cx('fr-col-6')} style={{ textAlign: 'right' }}>
				{nextSection && (
					<Button
						priority="primary"
						iconId="fr-icon-arrow-right-line"
						iconPosition="right"
						onClick={() => onSectionChange(nextSection.id)}
					>
						{nextSection.label}
					</Button>
				)}
			</div>
		</div>
	);
};

export default NavigationButtons;
